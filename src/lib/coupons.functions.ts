import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCoursePriceUSD } from "./coursePricing";

export const NGN_PER_USD = 1500;

const inputSchema = z.object({
  code: z.string().trim().min(1).max(64),
  course_slug: z.string().trim().min(1).max(120),
  student_email: z.string().trim().email().max(255),
});

type ValidateResult =
  | { valid: false; error: string }
  | {
      valid: true;
      coupon_id: string;
      code: string;
      discount_type: "percentage" | "fixed";
      discount_value: number;
      original_amount_usd: number;
      original_amount_ngn: number;
      final_amount_usd: number;
      final_amount_ngn: number;
    };

const invalid = (error: string): ValidateResult => ({ valid: false, error });

export const validateCoupon = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<ValidateResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const codeUpper = data.code.toUpperCase();
    const emailLower = data.student_email.toLowerCase();

    // Base price for this course
    const originalUsd = getCoursePriceUSD({ slug: data.course_slug });
    if (originalUsd <= 0) return invalid("This code is not valid for this course.");

    // 1. Code exists
    const { data: coupon, error } = await supabaseAdmin
      .from("coupon_codes")
      .select(
        "id, code, active, usage_limit, times_used, expiry_date, applicable_courses, discount_type, discount_value",
      )
      .eq("code", codeUpper)
      .maybeSingle();
    if (error) return invalid("Could not validate code. Please try again.");
    if (!coupon) return invalid("This code is invalid or does not exist.");

    // 2. Active
    if (!coupon.active) return invalid("This code is no longer available.");

    // 3. Usage cap
    if (
      coupon.usage_limit != null &&
      (coupon.times_used ?? 0) >= coupon.usage_limit
    ) {
      return invalid("This offer is no longer available.");
    }

    // 4. Not expired
    if (coupon.expiry_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(coupon.expiry_date) < today) {
        return invalid("This code has expired.");
      }
    }

    // 5. Course match
    const applicable = (coupon.applicable_courses ?? []) as string[];
    if (applicable.length > 0 && !applicable.includes(data.course_slug)) {
      return invalid("This code is not valid for this course.");
    }

    // 6. One per enrollment (email + course)
    const { data: existing, error: redErr } = await supabaseAdmin
      .from("coupon_redemptions")
      .select("id")
      .eq("course_slug", data.course_slug)
      .ilike("student_email", emailLower)
      .limit(1);
    if (redErr) return invalid("Could not validate code. Please try again.");
    if (existing && existing.length > 0) {
      return invalid("A discount code has already been applied to this enrollment.");
    }

    // Compute discounted amounts
    const value = Number(coupon.discount_value);
    let finalUsd =
      coupon.discount_type === "percentage"
        ? originalUsd * (1 - value / 100)
        : originalUsd - value;
    if (finalUsd < 0) finalUsd = 0;
    finalUsd = Math.round(finalUsd * 100) / 100;
    const originalNgn = Math.round(originalUsd * NGN_PER_USD);
    const finalNgn = Math.round(finalUsd * NGN_PER_USD);

    return {
      valid: true,
      coupon_id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type as "percentage" | "fixed",
      discount_value: value,
      original_amount_usd: originalUsd,
      original_amount_ngn: originalNgn,
      final_amount_usd: finalUsd,
      final_amount_ngn: finalNgn,
    };
  });
