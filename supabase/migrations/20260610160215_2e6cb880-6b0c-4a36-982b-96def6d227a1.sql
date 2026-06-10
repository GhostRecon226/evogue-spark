
-- Coupon codes catalog
CREATE TABLE public.coupon_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_percentage integer NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.coupon_codes TO authenticated;
GRANT ALL ON public.coupon_codes TO service_role;

ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read active coupons"
  ON public.coupon_codes FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Admins manage coupons"
  ON public.coupon_codes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_coupon_codes_updated_at
  BEFORE UPDATE ON public.coupon_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add applied coupon column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS applied_coupon_code text,
  ADD COLUMN IF NOT EXISTS applied_coupon_at timestamptz;

-- Seed starter coupons
INSERT INTO public.coupon_codes (code, discount_percentage, active) VALUES
  ('EVOGUE10', 10, true),
  ('EVOGUE20', 20, true),
  ('LAUNCH50', 50, true)
ON CONFLICT (code) DO NOTHING;
