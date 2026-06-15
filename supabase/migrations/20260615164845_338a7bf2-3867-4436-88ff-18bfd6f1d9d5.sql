
-- 1. notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_student_unread ON public.notifications (student_id, is_read, created_at DESC);

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view their own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Students mark their own notifications read"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins create notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 3. Trigger: enrollment confirmed -> welcome notification
CREATE OR REPLACE FUNCTION public.notify_enrollment_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course_title text;
BEGIN
  SELECT title INTO v_course_title FROM public.courses WHERE id = NEW.course_id;
  INSERT INTO public.notifications (student_id, title, message, link)
  VALUES (
    NEW.student_id,
    'Welcome to Evogue Academy',
    'Your place on ' || COALESCE(v_course_title, 'your course') || ' is confirmed.',
    '/dashboard'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_enrollment_created
AFTER INSERT ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.notify_enrollment_created();

-- 4. Trigger: capstone status -> approved/rejected notification
CREATE OR REPLACE FUNCTION public.notify_capstone_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    INSERT INTO public.notifications (student_id, title, message, link)
    VALUES (
      NEW.student_id,
      'Capstone approved',
      'Congratulations. Your capstone project has been approved.',
      '/dashboard'
    );
  ELSIF NEW.status = 'rejected' AND (OLD.status IS DISTINCT FROM 'rejected') THEN
    INSERT INTO public.notifications (student_id, title, message, link)
    VALUES (
      NEW.student_id,
      'Capstone needs attention',
      'Your capstone submission needs attention. Please check your dashboard.',
      '/dashboard'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_capstone_review
AFTER UPDATE ON public.capstone_submissions
FOR EACH ROW EXECUTE FUNCTION public.notify_capstone_review();
