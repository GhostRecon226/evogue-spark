
-- Drop the public read policy
DROP POLICY IF EXISTS "Public read lesson pdfs" ON storage.objects;

-- Enrolled students (any course), admins, and instructors can read
CREATE POLICY "Enrolled students read lesson pdfs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'lesson-pdfs'
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'instructor')
    OR EXISTS (SELECT 1 FROM public.enrollments WHERE student_id = auth.uid())
  )
);
