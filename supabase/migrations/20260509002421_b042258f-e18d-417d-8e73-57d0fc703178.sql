-- Drop the broad public SELECT policy; public bucket URLs still work without it
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;

-- Lock down SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;