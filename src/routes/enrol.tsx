import { useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Clock, ShieldCheck, Award, Check, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { PublicShell } from "@/components/PublicShell";
import { supabase } from "@/integrations/supabase/client";

const COURSE_OPTIONS: { slug: string; name: string }[] = [
  { slug: "project-management-business-analysis", name: "Project Management & Business Analysis" },
  { slug: "scrum-master", name: "Scrum Master" },
  { slug: "digital-marketing", name: "Digital Marketing" },
  { slug: "product-management", name: "Product Management" },
  { slug: "ai-for-professionals", name: "AI for Professionals" },
  { slug: "data-analysis", name: "Data Analysis" },
  { slug: "project-planner", name: "Project Planner" },
  { slug: "cybersecurity", name: "Cybersecurity" },
  { slug: "virtual-assistant-programme", name: "Virtual Assistant Programme" },
];

const searchSchema = z.object({
  course: z.string().optional(),
});

export const Route = createFileRoute("/enrol")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Enrol — Evogue Academy" },
      {
        name: "description",
        content:
          "Reserve your spot in the next Evogue Academy cohort. Our team will reach out within 24 hours.",
      },
    ],
  }),
  component: EnrolPage,
});

const formSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(255),
  whatsapp: z.string().trim().min(7, "Please enter a valid WhatsApp number").max(40),
  country: z.string().trim().min(2, "Please enter your country").max(80),
  course: z.string().trim().min(1, "Please select a course").max(120),
  message: z.string().trim().max(1000).optional(),
});

const DOT_TEXTURE = {
  backgroundColor: "#E8F7EE",
  backgroundImage: "radial-gradient(rgba(26,140,78,0.18) 1.2px, transparent 1.2px)",
  backgroundSize: "18px 18px",
};

function EnrolPage() {
  const { course: courseSlug } = useSearch({ from: "/enrol" });
  const matched = COURSE_OPTIONS.find((c) => c.slug === courseSlug);
  const courseLabel = matched?.name ?? "General Enquiry";

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    whatsapp: "",
    country: "",
    course: matched?.name ?? "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("enrolment_requests").insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp,
      country: parsed.data.country,
      course: parsed.data.course,
      message: parsed.data.message || null,
    });
    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <PublicShell>
      <div
        className="grid min-h-[calc(100vh-61px)] grid-cols-1 md:grid-cols-2 lg:[grid-template-columns:1fr_520px]"
        style={{ gap: 0 }}
      >
        {/* LEFT */}
        <div
          className="flex flex-col justify-center px-6 py-10 md:px-9 md:py-12 lg:px-16 lg:py-[72px]"
          style={DOT_TEXTURE}
        >
          <Link
            to={courseSlug ? "/courses/$slug" : "/courses"}
            {...(courseSlug ? { params: { slug: courseSlug } } : {})}
            className="inline-flex items-center gap-1.5 mb-10"
            style={{
              fontSize: 13,
              color: "#1A8C4E",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={14} strokeWidth={2.25} />
            Back to course
          </Link>

          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "#1A8C4E",
              fontWeight: 600,
              marginBottom: 14,
            }}
          >
            Reserve Your Spot
          </div>

          <h1
            className="font-display"
            style={{
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 900,
              color: "#0A2E1A",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            You&apos;re one step away.
          </h1>

          <p
            style={{
              fontSize: 15,
              color: "#3d6b4f",
              lineHeight: 1.7,
              maxWidth: 400,
              marginBottom: 40,
            }}
          >
            Fill in your details and our team will reach out within 24 hours to confirm your place
            and walk you through payment.
          </p>

          <div
            className="inline-flex items-center self-start"
            style={{
              gap: 8,
              background: "#fff",
              border: "1.5px solid rgba(10,46,26,0.12)",
              borderRadius: 50,
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: 600,
              color: "#0A2E1A",
              marginBottom: 48,
            }}
          >
            <BookOpen size={16} color="#1A8C4E" strokeWidth={2.25} />
            {courseLabel}
          </div>

          <div className="hidden md:flex flex-col" style={{ gap: 20 }}>
            <Reassurance
              icon={<Clock size={18} color="#1A8C4E" strokeWidth={2.25} />}
              title="We reply within 24 hours"
              text="Our team personally reviews every application and gets back to you fast."
            />
            <Reassurance
              icon={<ShieldCheck size={18} color="#1A8C4E" strokeWidth={2.25} />}
              title="No payment yet"
              text="Submitting this form does not commit you to payment. We'll walk you through everything first."
            />
            <Reassurance
              icon={<Award size={18} color="#1A8C4E" strokeWidth={2.25} />}
              title="Scholarship available"
              text="Not sure about the fee? Ask us about our scholarship programme when we reach out."
            />
          </div>
        </div>

        {/* RIGHT */}
        <div
          className="flex flex-col justify-center px-6 py-8 md:px-9 md:py-12 lg:px-[52px] lg:py-[72px]"
          style={{
            background: "#fff",
            borderLeft: "1px solid rgba(10,46,26,0.06)",
          }}
        >
          {submitted ? (
            <SuccessState />
          ) : (
            <form onSubmit={handleSubmit}>
              <h2
                className="font-display"
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#0A2E1A",
                  marginBottom: 6,
                }}
              >
                Tell us about yourself
              </h2>
              <p style={{ fontSize: 14, color: "#4a7a5a", marginBottom: 32 }}>
                Takes less than 2 minutes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16, marginBottom: 16 }}>
                <FormField label="Full name">
                  <StyledInput
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    maxLength={120}
                    required
                  />
                </FormField>
                <FormField label="Email address">
                  <StyledInput
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    maxLength={255}
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16, marginBottom: 16 }}>
                <FormField label="WhatsApp number">
                  <StyledInput
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="+234 or +44..."
                    maxLength={40}
                    required
                  />
                </FormField>
                <FormField label="Country">
                  <StyledInput
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="Where are you based?"
                    maxLength={80}
                    required
                  />
                </FormField>
              </div>

              <div style={{ marginBottom: 16 }}>
                <FormField label="Course interested in">
                  <select
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                    onFocus={focusOn}
                    onBlur={focusOff}
                  >
                    <option value="" disabled>
                      Select a course
                    </option>
                    {COURSE_OPTIONS.map((c) => (
                      <option key={c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div style={{ marginBottom: 16 }}>
                <FormField label="Anything you'd like us to know? (optional)">
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Any questions, scheduling preferences, or context that might help us."
                    maxLength={1000}
                    style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                    onFocus={focusOn}
                    onBlur={focusOff}
                  />
                </FormField>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="enrol-submit"
                style={{
                  background: "#0A2E1A",
                  color: "#fff",
                  padding: "14px 32px",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  width: "100%",
                  marginTop: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = "#1A8C4E";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#0A2E1A";
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? "Submitting..." : "Reserve My Spot"}
              </button>

              <p
                style={{
                  fontSize: 12,
                  color: "rgba(10,46,26,0.4)",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                We never share your details. Expect a response within 24 hours via WhatsApp or
                email.
              </p>
            </form>
          )}
        </div>
      </div>
    </PublicShell>
  );
}

function Reassurance({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start" style={{ gap: 14 }}>
      <div
        className="shrink-0 grid place-items-center"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(26,140,78,0.08)",
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0A2E1A" }}>{title}</div>
        <div style={{ fontSize: 13, color: "#4a7a5a", lineHeight: 1.6, marginTop: 2 }}>{text}</div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 500,
          color: "#0A2E1A",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  border: "1.5px solid rgba(10,46,26,0.12)",
  borderRadius: 9,
  fontSize: 14,
  fontFamily: "inherit",
  color: "#0A2E1A",
  background: "#fff",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function focusOn(e: React.FocusEvent<HTMLElement>) {
  (e.currentTarget as HTMLElement).style.borderColor = "#1A8C4E";
  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(26,140,78,0.08)";
}
function focusOff(e: React.FocusEvent<HTMLElement>) {
  (e.currentTarget as HTMLElement).style.borderColor = "rgba(10,46,26,0.12)";
  (e.currentTarget as HTMLElement).style.boxShadow = "none";
}

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />;
}

function SuccessState() {
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div
        className="mx-auto grid place-items-center"
        style={{
          width: 80,
          height: 80,
          background: "rgba(0,245,160,0.12)",
          borderRadius: "50%",
        }}
      >
        <Check size={36} color="#00F5A0" strokeWidth={2.5} />
      </div>
      <h2
        className="font-display"
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#0A2E1A",
          margin: "20px 0 10px",
        }}
      >
        You&apos;re on the list!
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "#4a7a5a",
          lineHeight: 1.7,
          maxWidth: 360,
          margin: "0 auto 28px",
        }}
      >
        We&apos;ve received your details. Our team will reach out within 24 hours via WhatsApp or
        email to confirm your spot and walk you through next steps.
      </p>
      <Link
        to="/courses"
        style={{
          display: "inline-block",
          background: "#0A2E1A",
          color: "#fff",
          padding: "12px 28px",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Browse other courses
      </Link>
    </div>
  );
}
