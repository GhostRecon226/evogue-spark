
DROP POLICY "Anyone can submit an inquiry" ON public.inquiries;

CREATE POLICY "Anyone can submit an inquiry"
  ON public.inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(full_name) BETWEEN 1 AND 120
    AND char_length(email) BETWEEN 3 AND 255
    AND char_length(message) BETWEEN 1 AND 2000
    AND (whatsapp_number IS NULL OR char_length(whatsapp_number) BETWEEN 3 AND 30)
    AND (course_interest IS NULL OR char_length(course_interest) <= 120)
    AND source IN ('contact', 'scholarship')
  );
