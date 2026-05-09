ALTER TABLE public.certificates ADD CONSTRAINT certificates_student_course_unique UNIQUE (student_id, course_id);

DROP POLICY IF EXISTS "Students can self-issue certificate when course complete" ON public.certificates;
CREATE POLICY "Students can self-issue certificate when course complete"
ON public.certificates
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = student_id
  AND (
    SELECT COUNT(*) FROM public.lessons l
    WHERE l.course_id = certificates.course_id AND l.is_published = true
  ) > 0
  AND (
    SELECT COUNT(*) FROM public.lessons l
    WHERE l.course_id = certificates.course_id AND l.is_published = true
  ) = (
    SELECT COUNT(*) FROM public.lesson_progress lp
    WHERE lp.course_id = certificates.course_id
      AND lp.student_id = auth.uid()
      AND lp.completed = true
  )
);