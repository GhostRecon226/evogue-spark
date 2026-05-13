-- 1) is_active flag
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- 2) Yearly counter table for reg numbers
CREATE TABLE IF NOT EXISTS public.registration_counters (
  year integer PRIMARY KEY,
  last_seq integer NOT NULL DEFAULT 0
);

ALTER TABLE public.registration_counters ENABLE ROW LEVEL SECURITY;
-- No policies = inaccessible to clients; only SECURITY DEFINER functions touch it.

-- 3) Replace generator with EVG-YYYY-XXXX (atomic, race-safe)
CREATE OR REPLACE FUNCTION public.generate_registration_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year integer := EXTRACT(YEAR FROM now())::int;
  next_seq integer;
BEGIN
  INSERT INTO public.registration_counters (year, last_seq)
  VALUES (current_year, 1)
  ON CONFLICT (year) DO UPDATE
    SET last_seq = public.registration_counters.last_seq + 1
  RETURNING last_seq INTO next_seq;

  RETURN 'EVG-' || current_year::text || '-' || lpad(next_seq::text, 4, '0');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.generate_registration_number() FROM PUBLIC, anon, authenticated;

-- 4) Re-backfill existing profiles with the new format
--    Reset counters first so backfill is sequential per year.
DELETE FROM public.registration_counters;

UPDATE public.profiles SET registration_number = NULL;

WITH ordered AS (
  SELECT id,
         EXTRACT(YEAR FROM created_at)::int AS yr,
         ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM created_at) ORDER BY created_at, id) AS seq
  FROM public.profiles
)
UPDATE public.profiles p
SET registration_number = 'EVG-' || o.yr::text || '-' || lpad(o.seq::text, 4, '0')
FROM ordered o
WHERE p.id = o.id;

INSERT INTO public.registration_counters (year, last_seq)
SELECT EXTRACT(YEAR FROM created_at)::int AS yr, COUNT(*) AS last_seq
FROM public.profiles
GROUP BY EXTRACT(YEAR FROM created_at);

-- 5) Trigger: prevent client edits to registration_number after creation
CREATE OR REPLACE FUNCTION public.lock_registration_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.registration_number IS DISTINCT FROM OLD.registration_number THEN
    RAISE EXCEPTION 'registration_number is read-only';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_lock_registration_number ON public.profiles;
CREATE TRIGGER profiles_lock_registration_number
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.lock_registration_number();

-- 6) Ensure handle_new_user uses the new generator (already wired but re-affirmed)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, whatsapp_number, avatar_url, registration_number, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'whatsapp_number', NEW.raw_user_meta_data ->> 'whatsapp', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    public.generate_registration_number(),
    true
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;