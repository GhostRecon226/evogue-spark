CREATE TABLE public.webinar_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webinar_slug text NOT NULL DEFAULT 'transition-to-tech',
  full_name text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  background text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT webinar_registrations_unique_email UNIQUE (webinar_slug, email)
);

GRANT INSERT ON public.webinar_registrations TO anon;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.webinar_registrations TO authenticated;
GRANT ALL ON public.webinar_registrations TO service_role;

ALTER TABLE public.webinar_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register for a webinar"
ON public.webinar_registrations FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view webinar registrations"
ON public.webinar_registrations FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update webinar registrations"
ON public.webinar_registrations FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete webinar registrations"
ON public.webinar_registrations FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_webinar_registrations_updated_at
BEFORE UPDATE ON public.webinar_registrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();