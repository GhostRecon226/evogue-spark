
-- 1. Track uploader on lessons
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS uploaded_by uuid;

-- 2. Auto-set uploaded_by on insert when not provided
CREATE OR REPLACE FUNCTION public.set_lesson_uploaded_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.uploaded_by IS NULL THEN
    NEW.uploaded_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lessons_set_uploaded_by ON public.lessons;
CREATE TRIGGER lessons_set_uploaded_by
BEFORE INSERT ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.set_lesson_uploaded_by();

-- 3. Tighten instructor update/delete to ownership-scoped
DROP POLICY IF EXISTS "Instructors update lessons in their courses" ON public.lessons;
DROP POLICY IF EXISTS "Instructors delete lessons in their courses" ON public.lessons;

CREATE POLICY "Instructors update own lessons"
ON public.lessons
FOR UPDATE
TO authenticated
USING (
  public.is_course_instructor(auth.uid(), course_id)
  AND uploaded_by = auth.uid()
)
WITH CHECK (
  public.is_course_instructor(auth.uid(), course_id)
  AND uploaded_by = auth.uid()
);

CREATE POLICY "Instructors delete own lessons"
ON public.lessons
FOR DELETE
TO authenticated
USING (
  public.is_course_instructor(auth.uid(), course_id)
  AND uploaded_by = auth.uid()
);
