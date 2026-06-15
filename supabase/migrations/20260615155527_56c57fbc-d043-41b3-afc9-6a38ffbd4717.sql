
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS price_usd numeric,
  ADD COLUMN IF NOT EXISTS price_ngn numeric,
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

ALTER TABLE public.coupon_codes
  ADD COLUMN IF NOT EXISTS applicable_courses text[];

ALTER TABLE public.coupon_redemptions
  ADD COLUMN IF NOT EXISTS coupon_id uuid REFERENCES public.coupon_codes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS student_email text,
  ADD COLUMN IF NOT EXISTS course_slug text,
  ADD COLUMN IF NOT EXISTS discount_applied integer,
  ADD COLUMN IF NOT EXISTS original_amount numeric,
  ADD COLUMN IF NOT EXISTS final_amount numeric;

ALTER TABLE public.capstone_submissions
  ADD COLUMN IF NOT EXISTS submission_url text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text NOT NULL CHECK (currency IN ('NGN', 'USD')),
  payment_status text NOT NULL DEFAULT 'unpaid',
  payment_method text,
  flutterwave_tx_id text,
  coupon_id uuid REFERENCES public.coupon_codes(id) ON DELETE SET NULL,
  original_amount numeric,
  discount_applied numeric NOT NULL DEFAULT 0,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students read own payments" ON public.payments;
CREATE POLICY "Students read own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins insert payments" ON public.payments;
CREATE POLICY "Admins insert payments"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update payments" ON public.payments;
CREATE POLICY "Admins update payments"
  ON public.payments FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete payments" ON public.payments;
CREATE POLICY "Admins delete payments"
  ON public.payments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  whatsapp text,
  country text,
  course_slug text,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT INSERT ON public.applications TO anon;
GRANT ALL ON public.applications TO service_role;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit applications" ON public.applications;
CREATE POLICY "Anyone can submit applications"
  ON public.applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read applications" ON public.applications;
CREATE POLICY "Admins read applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update applications" ON public.applications;
CREATE POLICY "Admins update applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete applications" ON public.applications;
CREATE POLICY "Admins delete applications"
  ON public.applications FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'coupon_codes'
      AND policyname = 'Authenticated read active coupons'
  ) THEN
    CREATE POLICY "Authenticated read active coupons"
      ON public.coupon_codes FOR SELECT
      TO authenticated
      USING (active = true);
  END IF;
END $$;

INSERT INTO public.coupon_codes (code, discount_type, discount_value, usage_limit, active, applicable_courses, description)
VALUES
  ('EVOGUE10', 'percentage', 10, NULL, true, NULL, '10% off all courses'),
  ('EVOGUE20', 'percentage', 20, 50, true, NULL, '20% off all courses, limited to 50 uses'),
  ('LAUNCH50', 'percentage', 50, 20, true, ARRAY['project-management-business-analysis'], '50% off Project Management & Business Analysis launch promo')
ON CONFLICT (code) DO NOTHING;
