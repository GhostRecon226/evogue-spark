-- Add registration_number column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS registration_number text UNIQUE;

-- Generator function: EVG- + 6 uppercase alphanumeric chars, retry on collision
CREATE OR REPLACE FUNCTION public.generate_registration_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  candidate text;
  exists_already boolean;
BEGIN
  LOOP
    candidate := 'EVG-' || upper(substr(replace(encode(gen_random_bytes(6), 'base64'), '/', ''), 1, 6));
    candidate := regexp_replace(candidate, '[^A-Z0-9\-]', 'X', 'g');
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE registration_number = candidate) INTO exists_already;
    EXIT WHEN NOT exists_already;
  END LOOP;
  RETURN candidate;
END;
$$;

-- Backfill existing profiles
UPDATE public.profiles
SET registration_number = public.generate_registration_number()
WHERE registration_number IS NULL;

-- Update handle_new_user trigger to assign one on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, whatsapp_number, avatar_url, registration_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'whatsapp_number', NEW.raw_user_meta_data ->> 'whatsapp', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    public.generate_registration_number()
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;