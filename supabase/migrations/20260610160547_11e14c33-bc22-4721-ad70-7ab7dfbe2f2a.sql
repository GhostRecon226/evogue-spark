
-- Expand coupon_codes schema
ALTER TABLE public.coupon_codes
  ADD COLUMN IF NOT EXISTS discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage','fixed')),
  ADD COLUMN IF NOT EXISTS discount_value numeric,
  ADD COLUMN IF NOT EXISTS usage_limit integer,
  ADD COLUMN IF NOT EXISTS times_used integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expiry_date date,
  ADD COLUMN IF NOT EXISTS description text;

-- Backfill discount_value from legacy discount_percentage
UPDATE public.coupon_codes
  SET discount_value = discount_percentage
  WHERE discount_value IS NULL;

ALTER TABLE public.coupon_codes
  ALTER COLUMN discount_value SET NOT NULL;

ALTER TABLE public.coupon_codes
  ALTER COLUMN discount_percentage DROP NOT NULL;

-- Set LAUNCH50 usage limit per spec
UPDATE public.coupon_codes SET usage_limit = 50 WHERE code = 'LAUNCH50';

-- Allow admins to manage coupons (already done) — also need INSERT/UPDATE/DELETE grants
GRANT INSERT, UPDATE, DELETE ON public.coupon_codes TO authenticated;

-- Coupon redemptions log
CREATE TABLE public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coupon_code text NOT NULL,
  discount_type text NOT NULL,
  discount_value numeric NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX coupon_redemptions_student_idx ON public.coupon_redemptions(student_id);
CREATE INDEX coupon_redemptions_code_idx ON public.coupon_redemptions(coupon_code);

GRANT SELECT ON public.coupon_redemptions TO authenticated;
GRANT ALL ON public.coupon_redemptions TO service_role;

ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own redemptions"
  ON public.coupon_redemptions FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all redemptions"
  ON public.coupon_redemptions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete redemptions"
  ON public.coupon_redemptions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Secure function: redeem a coupon for the current user
CREATE OR REPLACE FUNCTION public.redeem_coupon(_code text)
RETURNS TABLE (code text, discount_type text, discount_value numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_coupon public.coupon_codes;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO v_coupon
  FROM public.coupon_codes
  WHERE coupon_codes.code = upper(trim(_code))
  FOR UPDATE;

  IF NOT FOUND OR v_coupon.active = false THEN
    RAISE EXCEPTION 'Invalid or inactive code' USING ERRCODE = 'P0002';
  END IF;

  IF v_coupon.expiry_date IS NOT NULL AND v_coupon.expiry_date < current_date THEN
    RAISE EXCEPTION 'Code has expired' USING ERRCODE = 'P0002';
  END IF;

  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.times_used >= v_coupon.usage_limit THEN
    RAISE EXCEPTION 'Code usage limit reached' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.coupon_codes
    SET times_used = times_used + 1
    WHERE id = v_coupon.id;

  INSERT INTO public.coupon_redemptions (student_id, coupon_code, discount_type, discount_value)
  VALUES (v_user, v_coupon.code, v_coupon.discount_type, v_coupon.discount_value);

  UPDATE public.profiles
    SET applied_coupon_code = v_coupon.code,
        applied_coupon_at = now()
    WHERE id = v_user;

  RETURN QUERY SELECT v_coupon.code, v_coupon.discount_type, v_coupon.discount_value;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_coupon(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_coupon(text) TO authenticated;
