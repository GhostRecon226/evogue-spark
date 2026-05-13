
-- Academy settings (singleton row)
CREATE TABLE IF NOT EXISTS public.academy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_name text NOT NULL DEFAULT 'Evogue Academy',
  contact_email text,
  whatsapp_number text,
  location text,
  logo_url text,
  paystack_public_key text,
  resend_api_key text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.academy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view academy settings"
  ON public.academy_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins manage academy settings"
  ON public.academy_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.academy_settings (academy_name)
SELECT 'Evogue Academy'
WHERE NOT EXISTS (SELECT 1 FROM public.academy_settings);

-- Admins can update profiles (suspend/reactivate, edit details)
DROP POLICY IF EXISTS "Admins update profiles" ON public.profiles;
CREATE POLICY "Admins update profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins insert profiles" ON public.profiles;
CREATE POLICY "Admins insert profiles"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins manage user_roles
DROP POLICY IF EXISTS "Admins manage user roles" ON public.user_roles;
CREATE POLICY "Admins manage user roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
