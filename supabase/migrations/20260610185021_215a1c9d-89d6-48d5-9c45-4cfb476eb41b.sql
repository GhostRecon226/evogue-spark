
CREATE TABLE public.enrolment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  country TEXT NOT NULL,
  course TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.enrolment_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.enrolment_requests TO authenticated;
GRANT ALL ON public.enrolment_requests TO service_role;

ALTER TABLE public.enrolment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an enrolment request"
  ON public.enrolment_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view enrolment requests"
  ON public.enrolment_requests
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update enrolment requests"
  ON public.enrolment_requests
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete enrolment requests"
  ON public.enrolment_requests
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
