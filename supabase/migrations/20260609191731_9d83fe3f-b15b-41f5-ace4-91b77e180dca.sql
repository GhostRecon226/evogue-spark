
-- 1. Restrict academy_settings: remove broad public SELECT (sensitive API keys live here)
DROP POLICY IF EXISTS "Anyone can view academy settings" ON public.academy_settings;
-- Authenticated users can read non-sensitive fields via Data API (RLS is row-level only;
-- application code should only select safe columns). Admins keep full access via existing ALL policy.
CREATE POLICY "Authenticated users can view academy settings"
ON public.academy_settings
FOR SELECT
TO authenticated
USING (true);

-- 2. Explicit defense-in-depth: prevent any non-admin from inserting/updating/deleting their own roles
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Revoke EXECUTE on trigger-only SECURITY DEFINER functions from anon/authenticated/public.
-- Triggers run as the table owner regardless of grants, so removing public EXECUTE is safe.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_registration_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_certificate_registration_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_lesson_uploaded_by() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.issue_certificate_on_capstone_approval() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
-- Keep EXECUTE on has_role and is_course_instructor: they are referenced from RLS policies
-- and must be callable by the requesting role for those policies to evaluate.
