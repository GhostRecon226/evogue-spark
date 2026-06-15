
DROP POLICY IF EXISTS "Students insert own capstone" ON public.capstone_submissions;

CREATE POLICY "Students insert own capstone"
ON public.capstone_submissions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = student_id
  AND EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.student_id = auth.uid()
      AND e.course_id = capstone_submissions.course_id
  )
);

DROP POLICY IF EXISTS "Students update own capstone" ON public.capstone_submissions;

CREATE POLICY "Students update own capstone"
ON public.capstone_submissions
FOR UPDATE
TO authenticated
USING (
  auth.uid() = student_id AND status <> 'approved'::public.capstone_status
)
WITH CHECK (
  auth.uid() = student_id AND status = 'pending'::public.capstone_status
);
