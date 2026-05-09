-- 1. Capstone fields on courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS capstone_released boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS capstone_brief text,
  ADD COLUMN IF NOT EXISTS capstone_brief_url text;

-- 2. Capstone status enum
DO $$ BEGIN
  CREATE TYPE public.capstone_status AS ENUM ('pending', 'recommended', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. capstone_submissions
CREATE TABLE IF NOT EXISTS public.capstone_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  course_id uuid NOT NULL,
  submission_text text NOT NULL,
  file_url text,
  status public.capstone_status NOT NULL DEFAULT 'pending',
  instructor_recommendation boolean NOT NULL DEFAULT false,
  instructor_note text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  UNIQUE (student_id, course_id)
);
ALTER TABLE public.capstone_submissions ENABLE ROW LEVEL SECURITY;

-- 4. course_instructors
CREATE TABLE IF NOT EXISTS public.course_instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  instructor_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, instructor_id)
);
ALTER TABLE public.course_instructors ENABLE ROW LEVEL SECURITY;

-- 5. Helper: is_course_instructor
CREATE OR REPLACE FUNCTION public.is_course_instructor(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.course_instructors
    WHERE instructor_id = _user_id AND course_id = _course_id
  );
$$;
REVOKE EXECUTE ON FUNCTION public.is_course_instructor(uuid, uuid) FROM anon;

-- 6. Storage bucket for capstone files (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('capstones', 'capstones', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Students can upload own capstone files" ON storage.objects;
CREATE POLICY "Students can upload own capstone files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'capstones' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Students view own capstone files" ON storage.objects;
CREATE POLICY "Students view own capstone files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'capstones'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'instructor'::app_role)
  )
);

DROP POLICY IF EXISTS "Students update own capstone files" ON storage.objects;
CREATE POLICY "Students update own capstone files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'capstones' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 7. RLS for capstone_submissions
DROP POLICY IF EXISTS "Students insert own capstone" ON public.capstone_submissions;
CREATE POLICY "Students insert own capstone"
ON public.capstone_submissions FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = student_id
  AND EXISTS (
    SELECT 1 FROM public.enrollments e
    JOIN public.courses c ON c.id = e.course_id
    WHERE e.student_id = auth.uid()
      AND e.course_id = capstone_submissions.course_id
      AND c.capstone_released = true
  )
);

DROP POLICY IF EXISTS "Students view own capstone" ON public.capstone_submissions;
CREATE POLICY "Students view own capstone"
ON public.capstone_submissions FOR SELECT TO authenticated
USING (
  auth.uid() = student_id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR is_course_instructor(auth.uid(), course_id)
);

DROP POLICY IF EXISTS "Admins update capstone" ON public.capstone_submissions;
CREATE POLICY "Admins update capstone"
ON public.capstone_submissions FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Instructors recommend capstone" ON public.capstone_submissions;
CREATE POLICY "Instructors recommend capstone"
ON public.capstone_submissions FOR UPDATE TO authenticated
USING (is_course_instructor(auth.uid(), course_id))
WITH CHECK (is_course_instructor(auth.uid(), course_id));

DROP POLICY IF EXISTS "Admins delete capstone" ON public.capstone_submissions;
CREATE POLICY "Admins delete capstone"
ON public.capstone_submissions FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 8. RLS for course_instructors
DROP POLICY IF EXISTS "Admins manage course instructors" ON public.course_instructors;
CREATE POLICY "Admins manage course instructors"
ON public.course_instructors FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Instructors view own course assignments" ON public.course_instructors;
CREATE POLICY "Instructors view own course assignments"
ON public.course_instructors FOR SELECT TO authenticated
USING (auth.uid() = instructor_id OR has_role(auth.uid(), 'admin'::app_role));

-- 9. Profiles: allow admins and instructors to view profiles for the table joins
DROP POLICY IF EXISTS "Admins view profiles" ON public.profiles;
CREATE POLICY "Admins view profiles"
ON public.profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'instructor'::app_role));

-- 10. Trigger: auto-issue certificate when capstone approved
CREATE OR REPLACE FUNCTION public.issue_certificate_on_capstone_approval()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    INSERT INTO public.certificates (student_id, course_id)
    VALUES (NEW.student_id, NEW.course_id)
    ON CONFLICT (student_id, course_id) DO NOTHING;
    NEW.reviewed_at := COALESCE(NEW.reviewed_at, now());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_capstone_approval ON public.capstone_submissions;
CREATE TRIGGER trg_capstone_approval
BEFORE UPDATE ON public.capstone_submissions
FOR EACH ROW EXECUTE FUNCTION public.issue_certificate_on_capstone_approval();

-- 11. Remove old self-issue certificate policy (now admin-only via trigger)
DROP POLICY IF EXISTS "Students can self-issue certificate when course complete" ON public.certificates;