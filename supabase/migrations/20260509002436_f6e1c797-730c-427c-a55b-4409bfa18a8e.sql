DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(email) BETWEEN 3 AND 255
    AND char_length(message) BETWEEN 1 AND 2000
  );

DROP POLICY IF EXISTS "Anyone can submit enrollment" ON public.enrollment_inquiries;
CREATE POLICY "Anyone can submit enrollment" ON public.enrollment_inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(full_name) BETWEEN 1 AND 100
    AND char_length(email) BETWEEN 3 AND 255
    AND char_length(whatsapp) BETWEEN 3 AND 30
    AND char_length(course) BETWEEN 1 AND 100
  );