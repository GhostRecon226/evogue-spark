
-- 1. academy_settings: remove the broad authenticated SELECT (admins still have full access via "Admins manage academy settings")
DROP POLICY IF EXISTS "Authenticated users can view academy settings" ON public.academy_settings;

-- Expose only non-sensitive columns via a view for authenticated users
CREATE OR REPLACE VIEW public.academy_settings_public
WITH (security_invoker = true) AS
SELECT id, academy_name, contact_email, whatsapp_number, location, logo_url, updated_at
FROM public.academy_settings;

GRANT SELECT ON public.academy_settings_public TO authenticated, anon;

-- Re-add a SELECT policy on the base table that returns only the safe columns when accessed via the view
CREATE POLICY "Authenticated read non-sensitive academy settings"
ON public.academy_settings FOR SELECT
TO authenticated
USING (true);

-- Revoke direct column access to sensitive fields from authenticated
REVOKE SELECT ON public.academy_settings FROM authenticated;
GRANT SELECT (id, academy_name, contact_email, whatsapp_number, location, logo_url, updated_at)
  ON public.academy_settings TO authenticated;

-- 2. contact_messages: add admin SELECT
CREATE POLICY "Admins can view contact messages"
ON public.contact_messages FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. enrollment_inquiries: add admin SELECT
CREATE POLICY "Admins can view enrollment inquiries"
ON public.enrollment_inquiries FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. profiles.role: prevent users from updating their own role column
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, email, whatsapp_number, avatar_url, is_active, updated_at)
  ON public.profiles TO authenticated;
-- Admins keep full update via service_role and policies; grant admin updates explicitly
GRANT UPDATE ON public.profiles TO service_role;

-- 5. Set search_path on functions missing it
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
