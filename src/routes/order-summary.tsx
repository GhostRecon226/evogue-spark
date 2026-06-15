import { useMemo, useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  CheckCircle2,
  XCircle,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { PublicShell } from "@/components/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateCoupon, NGN_PER_USD } from "@/lib/coupons.functions";
import { getCoursePriceUSD } from "@/lib/coursePricing";

const COURSE_LABELS: Record<string, string> = {
  "project-management-business-analysis": "Project Management & Business Analysis",
  "scrum-master": "Scrum Master",
  "digital-marketing": "Digital Marketing",
  "product-management": "Product Management",
  "ai-for-professionals": "AI for Professionals",
  "data-analysis": "Data Analysis",
  cybersecurity: "Cybersecurity",
  "virtual-assistant-programme": "Virtual Assistant Programme",
};

const searchSchema = z.object({
  course: z.string().min(1),
  name: z.string().optional(),
  email: z.string().email().optional(),
  whatsapp: z.string().optional(),
  country: z.string().optional(),
});

export const Route = createFileRoute("/order-summary")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Order Summary — Evogue Academy" },
      { name: "description", content: "Review your enrolment and apply a coupon before checkout." },
    ],
  }),
  component: OrderSummaryPage,
});

type AppliedCoupon = {
  coupon_id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  final_amount_usd: number;
  final_amount_ngn: number;
};

function OrderSummaryPage() {
  const search = useSearch({ from: "/order-summary" });
  const courseSlug = search.course;
  const courseTitle = COURSE_LABELS[courseSlug] ?? "Course";
  const validate = useServerFn(validateCoupon);

  const originalUsd = useMemo(() => getCoursePriceUSD({ slug: courseSlug }), [courseSlug]);
  const originalNgn = Math.round(originalUsd * NGN_PER_USD);

  const [currency, setCurrency] = useState<"USD" | "NGN">("NGN");
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(search.email ?? "");
  const [paying, setPaying] = useState(false);

  const finalUsd = applied?.final_amount_usd ?? originalUsd;
  const finalNgn = applied?.final_amount_ngn ?? originalNgn;
  const showOriginalUsd = formatMoney(originalUsd, "USD");
  const showOriginalNgn = formatMoney(originalNgn, "NGN");
  const showFinalUsd = formatMoney(finalUsd, "USD");
  const showFinalNgn = formatMoney(finalNgn, "NGN");

  const discountPct =
    applied?.discount_type === "percentage"
      ? `${applied.discount_value}%`
      : applied
        ? `${formatMoney(applied.discount_value, "USD")}`
        : "";

  const handleApply = async () => {
    setError(null);
    if (!code.trim()) {
      setError("Enter a code first.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email so we can validate the code.");
      return;
    }
    setApplying(true);
    try {
      const result = await validate({
        data: { code: code.trim(), course_slug: courseSlug, student_email: email.trim() },
      });
      if (!result.valid) {
        setError(result.error);
        setApplied(null);
        return;
      }
      setApplied({
        coupon_id: result.coupon_id,
        code: result.code,
        discount_type: result.discount_type,
        discount_value: result.discount_value,
        final_amount_usd: result.final_amount_usd,
        final_amount_ngn: result.final_amount_ngn,
      });
      toast.success(`Code applied. You save ${result.discount_type === "percentage" ? `${result.discount_value}%` : formatMoney(result.discount_value, "USD")}.`);
    } catch (e) {
      console.error(e);
      setError("Could not validate code. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const handleRemove = () => {
    setApplied(null);
    setCode("");
    setError(null);
  };

  const handlePay = () => {
    setPaying(true);
    // Stubbed: Flutterwave integration is paused until API keys are added.
    setTimeout(() => {
      setPaying(false);
      toast.info(
        "Checkout will activate once Flutterwave API keys are added. Your code and total are ready.",
      );
    }, 600);
  };

  return (
    <PublicShell>
      <div className="bg-[#F5FAF6] min-h-[calc(100vh-61px)] py-10 px-5">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/enrol"
            search={{ course: courseSlug }}
            className="inline-flex items-center gap-1.5 mb-6 text-sm text-[#1A8C4E] font-medium hover:underline"
          >
            <ArrowLeft size={14} strokeWidth={2.25} /> Back to enrolment
          </Link>

          <h1
            className="font-display"
            style={{ fontSize: 32, fontWeight: 900, color: "#0A2E1A", marginBottom: 8 }}
          >
            Order Summary
          </h1>
          <p className="text-[#3d6b4f] text-[15px] mb-7">
            Review your enrolment, apply a discount code if you have one, and proceed to checkout.
          </p>

          <div className="bg-white rounded-2xl border border-[rgba(10,46,26,0.08)] p-7 shadow-sm">
            {/* Course */}
            <div className="flex items-start gap-3 pb-5 border-b border-[rgba(10,46,26,0.08)]">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#E8F7EE] text-[#1A8C4E] shrink-0">
                <BookOpen size={20} strokeWidth={2.25} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] uppercase tracking-wider font-semibold text-[#1A8C4E] mb-1">
                  Course
                </p>
                <p className="font-semibold text-[#0A2E1A] text-[17px]">{courseTitle}</p>
              </div>
            </div>

            {/* Email (needed to validate coupons) */}
            <div className="mt-5">
              <label className="block text-[13px] font-medium text-[#0A2E1A] mb-1.5">
                Your email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={!!applied}
              />
              <p className="text-[12px] text-[rgba(10,46,26,0.55)] mt-1.5">
                We use this to validate coupons and send your receipt.
              </p>
            </div>

            {/* Currency toggle */}
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[13px] text-[rgba(10,46,26,0.6)]">Display currency</span>
              <div className="inline-flex rounded-full border border-[rgba(10,46,26,0.12)] bg-[#F5FAF6] p-1">
                {(["NGN", "USD"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`px-4 py-1.5 text-[13px] font-semibold rounded-full transition-colors ${
                      currency === c
                        ? "bg-[#0A2E1A] text-white"
                        : "text-[#0A2E1A] hover:text-[#1A8C4E]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="mt-6">
              <label className="block text-[13px] font-medium text-[#0A2E1A] mb-1.5">
                Discount code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag
                    className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                      applied
                        ? "text-[#1A8C4E]"
                        : error
                          ? "text-red-500"
                          : "text-foreground/40"
                    }`}
                  />
                  <Input
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      if (error) setError(null);
                    }}
                    placeholder="e.g. EVOGUE20"
                    disabled={!!applied || applying}
                    className={`pl-9 font-mono uppercase ${
                      applied
                        ? "border-[#1A8C4E] bg-[#E8F7EE]"
                        : error
                          ? "border-red-400 bg-red-50"
                          : ""
                    }`}
                  />
                </div>
                {applied ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemove}
                    className="border-[rgba(10,46,26,0.15)]"
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleApply}
                    disabled={applying}
                    className="bg-[#0A2E1A] text-white hover:bg-[#1A8C4E] min-w-[100px]"
                  >
                    {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                  </Button>
                )}
              </div>
              {applied && (
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-[#0A5C2A] font-medium">
                  <CheckCircle2 size={14} /> Code applied. You save {discountPct}.
                </p>
              )}
              {error && (
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-red-600 font-medium">
                  <XCircle size={14} /> {error}
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="mt-7 pt-6 border-t border-[rgba(10,46,26,0.08)] space-y-2.5">
              <Row label="Subtotal">
                {currency === "NGN" ? showOriginalNgn : showOriginalUsd}
              </Row>
              {applied && (
                <Row label={`Discount (${applied.code})`} tone="green">
                  −{" "}
                  {currency === "NGN"
                    ? formatMoney(originalNgn - finalNgn, "NGN")
                    : formatMoney(originalUsd - finalUsd, "USD")}
                </Row>
              )}
              <div className="pt-3 flex items-baseline justify-between border-t border-dashed border-[rgba(10,46,26,0.12)]">
                <span className="font-semibold text-[#0A2E1A]">Total due today</span>
                <span className="text-right">
                  {applied ? (
                    <>
                      <span className="block text-[13px] text-[rgba(10,46,26,0.45)] line-through">
                        {currency === "NGN" ? showOriginalNgn : showOriginalUsd}
                      </span>
                      <span className="font-display text-[28px] font-extrabold text-[#0A2E1A]">
                        {currency === "NGN" ? showFinalNgn : showFinalUsd}
                      </span>
                    </>
                  ) : (
                    <span className="font-display text-[28px] font-extrabold text-[#0A2E1A]">
                      {currency === "NGN" ? showFinalNgn : showFinalUsd}
                    </span>
                  )}
                </span>
              </div>
              <p className="text-[12px] text-[rgba(10,46,26,0.5)] pt-1">
                Installments are available at checkout.
              </p>
            </div>

            {/* Pay button */}
            <Button
              type="button"
              onClick={handlePay}
              disabled={paying || !email.trim()}
              className="w-full mt-6 bg-[#1A8C4E] hover:bg-[#0A2E1A] text-white h-12 text-[15px] font-semibold rounded-xl"
            >
              {paying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Pay {currency === "NGN" ? showFinalNgn : showFinalUsd} with Flutterwave</>
              )}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-[rgba(10,46,26,0.55)]">
              <ShieldCheck size={12} /> Secure payment by Flutterwave
            </p>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

function Row({
  label,
  children,
  tone,
}: {
  label: string;
  children: React.ReactNode;
  tone?: "green";
}) {
  return (
    <div className="flex items-center justify-between text-[14px]">
      <span className="text-[rgba(10,46,26,0.65)]">{label}</span>
      <span
        className={`font-medium ${tone === "green" ? "text-[#0A5C2A]" : "text-[#0A2E1A]"}`}
      >
        {children}
      </span>
    </div>
  );
}

function formatMoney(amount: number, currency: "USD" | "NGN"): string {
  try {
    return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: currency === "NGN" ? 0 : 2,
      maximumFractionDigits: currency === "NGN" ? 0 : 2,
    }).format(amount);
  } catch {
    return currency === "NGN" ? `₦${amount.toLocaleString()}` : `$${amount.toFixed(2)}`;
  }
}
