
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS cert_id text;

UPDATE public.certificates
SET cert_id = 'CERT-' || upper(substr(id::text, 1, 8))
WHERE cert_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS certificates_cert_id_key ON public.certificates (cert_id);

-- Storage policies for the private 'certificates' bucket
DROP POLICY IF EXISTS "Students read own certificate files" ON storage.objects;
CREATE POLICY "Students read own certificate files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'certificates'
  AND EXISTS (
    SELECT 1 FROM public.certificates c
    WHERE c.certificate_url LIKE '%' || storage.objects.name
      AND (c.student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role))
  )
);

DROP POLICY IF EXISTS "Admins write certificate files" ON storage.objects;
CREATE POLICY "Admins write certificate files"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'certificates' AND public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'certificates' AND public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Service role write certificate files" ON storage.objects;
-- service_role already bypasses RLS; no extra policy needed.
