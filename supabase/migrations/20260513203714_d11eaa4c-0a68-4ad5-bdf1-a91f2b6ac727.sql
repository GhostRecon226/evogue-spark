-- ============================================================
-- 1) COHORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','active','completed')),
  capstone_released boolean NOT NULL DEFAULT false,
  capstone_brief_text text,
  capstone_brief_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cohorts of published courses"
  ON public.cohorts FOR SELECT TO public
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.courses c WHERE c.id = cohorts.course_id AND c.is_published = true)
  );

CREATE POLICY "Admins manage cohorts"
  ON public.cohorts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_cohorts_course_id ON public.cohorts(course_id);

-- ============================================================
-- 2) ADD COLUMNS TO EXISTING TABLES (additive, nullable)
-- ============================================================

-- courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS instructor_id uuid;

-- lessons
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS cohort_id uuid REFERENCES public.cohorts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS zoom_live_link text,
  ADD COLUMN IF NOT EXISTS zoom_recording_link text,
  ADD COLUMN IF NOT EXISTS lesson_date timestamptz;

CREATE INDEX IF NOT EXISTS idx_lessons_cohort_id ON public.lessons(cohort_id);

-- enrollments
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS cohort_id uuid REFERENCES public.cohorts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS enrolled_by uuid;

CREATE INDEX IF NOT EXISTS idx_enrollments_cohort_id ON public.enrollments(cohort_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);

-- capstone_submissions
ALTER TABLE public.capstone_submissions
  ADD COLUMN IF NOT EXISTS cohort_id uuid REFERENCES public.cohorts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS admin_feedback text;

-- certificates
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS cohort_id uuid REFERENCES public.cohorts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS registration_number text;

-- inquiries: add `type`, backfill from existing `source`
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS type text;
UPDATE public.inquiries SET type = source WHERE type IS NULL;
ALTER TABLE public.inquiries
  ALTER COLUMN type SET DEFAULT 'contact',
  ALTER COLUMN type SET NOT NULL,
  ADD CONSTRAINT inquiries_type_check CHECK (type IN ('contact','scholarship'));

-- ============================================================
-- 3) UNIQUE CONSTRAINT for lesson_progress upsert(student_id, lesson_id)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lesson_progress_student_lesson_unique'
  ) THEN
    ALTER TABLE public.lesson_progress
      ADD CONSTRAINT lesson_progress_student_lesson_unique UNIQUE (student_id, lesson_id);
  END IF;
END$$;

-- ============================================================
-- 4) STUDENT NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.student_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  note_text text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, lesson_id)
);

ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own notes"
  ON public.student_notes FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students insert own notes"
  ON public.student_notes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students update own notes"
  ON public.student_notes FOR UPDATE TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students delete own notes"
  ON public.student_notes FOR DELETE TO authenticated
  USING (auth.uid() = student_id);

CREATE TRIGGER student_notes_updated_at
  BEFORE UPDATE ON public.student_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 5) ANNOUNCEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cohort members view announcements"
  ON public.announcements FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.student_id = auth.uid() AND e.cohort_id = announcements.cohort_id
    )
    OR EXISTS (
      SELECT 1
      FROM public.cohorts c
      JOIN public.course_instructors ci ON ci.course_id = c.course_id
      WHERE c.id = announcements.cohort_id AND ci.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage announcements"
  ON public.announcements FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_announcements_cohort_id ON public.announcements(cohort_id);

-- ============================================================
-- 6) Snapshot registration_number onto certificates when issued
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_certificate_registration_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.registration_number IS NULL THEN
    SELECT registration_number INTO NEW.registration_number
    FROM public.profiles WHERE id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS certificates_set_registration_number ON public.certificates;
CREATE TRIGGER certificates_set_registration_number
  BEFORE INSERT ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.set_certificate_registration_number();