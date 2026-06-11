
-- 1. academy_settings: drop broad authenticated SELECT (sensitive keys exposure)
DROP POLICY IF EXISTS "Authenticated read non-sensitive academy settings" ON public.academy_settings;

-- 2. coupon_codes: drop broad SELECT, add safe lookup function
DROP POLICY IF EXISTS "Authenticated can read active coupons" ON public.coupon_codes;

CREATE OR REPLACE FUNCTION public.get_coupon_preview(_code text)
RETURNS TABLE (code text, discount_type text, discount_value numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.code, c.discount_type, c.discount_value
  FROM public.coupon_codes c
  WHERE c.active = true
    AND upper(c.code) = upper(_code)
    AND (c.expiry_date IS NULL OR c.expiry_date >= CURRENT_DATE)
    AND (c.usage_limit IS NULL OR c.times_used < c.usage_limit)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_coupon_preview(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_coupon_preview(text) TO authenticated;

-- 3. Storage lesson-pdfs: restrict SELECT to PDFs from courses the student is enrolled in
DROP POLICY IF EXISTS "Enrolled students read lesson pdfs" ON storage.objects;

CREATE POLICY "Enrolled students read lesson pdfs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'lesson-pdfs'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'instructor'::app_role)
    OR EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.enrollments e
        ON e.course_id = l.course_id
       AND e.student_id = auth.uid()
      WHERE l.pdf_url = name
         OR l.pdf_url LIKE '%/lesson-pdfs/' || name
         OR l.pdf_url LIKE '%/lesson-pdfs/' || name || '?%'
    )
  )
);

-- 4. registration_counters: document intent and lock down direct API access
REVOKE ALL ON public.registration_counters FROM anon, authenticated;
COMMENT ON TABLE public.registration_counters IS
  'Internal counter table. Direct API access is intentionally blocked; mutate only via SECURITY DEFINER functions.';
