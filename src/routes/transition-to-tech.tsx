import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Clock, Check, Loader2, MessageCircle, Sparkles } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { PublicShell } from "@/components/PublicShell";
import { supabase } from "@/integrations/supabase/client";

const WEBINAR_SLUG = "transition-to-tech";
const WEBINAR_TITLE = "Switch to Tech: The Practical Roadmap to Landing Your First IT Role";
const WEBINAR_DATE_LABEL = "Saturday, 31 October 2026";
const WEBINAR_TIME_LABEL = "2:00 PM (WAT) · 90 minutes";
const WHATSAPP_LINK = "https://wa.me/447404331835";

// 31 Oct 2026, 14:00 WAT (UTC+1) => 13:00 UTC
const GOOGLE_CALENDAR_LINK =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  `&text=${encodeURIComponent(WEBINAR_TITLE)}` +
  "&dates=20261031T130000Z/20261031T143000Z" +
  `&details=${encodeURIComponent(
    "A free live masterclass by Evogue Academy for anyone switching into tech. Joining link will be sent to your email and WhatsApp before the session.",
  )}` +
  "&location=Online";

export const Route = createFileRoute("/transition-to-tech")({
  head: () => ({
    meta: [
      { title: "Switch to Tech: Free Live Masterclass — Evogue Academy" },
      {
        name: "description",
        content:
          "A free live masterclass on 31 October 2026 for anyone struggling to transition into tech. Save your seat.",
      },
      { property: "og:title", content: "Switch to Tech — Free Live Masterclass" },
      {
        property: "og:description",
        content:
          "Join Evogue Academy on 31 October 2026 for a practical roadmap to landing your first IT role.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WebinarPage,
});

const formSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(255),
  whatsapp: z.string().trim().min(7, "Please enter a valid WhatsApp number").max(40),
  background: z.string().trim().min(3, "Tell us a little about where you are now").max(1000),
});

const DOT_TEXTURE = {
  backgroundColor: "#E8F7EE",
  backgroundImage: "radial-gradient(rgba(26,140,78,0.18) 1.2px, transparent 1.2px)",
  backgroundSize: "18px 18px",
};

const TAKEAWAYS = [
  "The tech roles you can realistically move into using the skills you already have",
  "How to choose a path that matches your background instead of starting from zero",
  "A 90-day plan to go from deciding to applying with confidence",
  "How to talk about your experience so employers take you seriously",
];

function WebinarPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    whatsapp: "",
    background: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
    const { error } = await supabase.from("webinar_registrations").insert({
      webinar_slug: WEBINAR_SLUG,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp,
      background: parsed.data.background,
    });
    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        setSubmitted(true);
        toast.success("You're already registered with this email.");
        return;
      }
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <PublicShell>
      <div className="grid min-h-[calc(100vh-61px)] grid-cols-1 md:grid-cols-2 lg:[grid-template-columns:1fr_520px]">
        {/* LEFT */}
        <div
          className="flex flex-col justify-center px-6 py-10 md:px-9 md:py-12 lg:px-16 lg:py-[72px]"
          style={DOT_TEXTURE}
        >
          <div
            className="inline-flex items-center self-start"
            style={{
              gap: 7,
              background: "#0A2E1A",
              color: "#00F5A0",
              borderRadius: 50,
              padding: "7px 15px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            <Sparkles size={13} strokeWidth={2.5} />
            Free Live Masterclass
          </div>

          <h1
            className="font-display"
            style={{
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 900,
              color: "#0A2E1A",
              lineHeight: 1.1,
              marginBottom: 16,
              maxWidth: 560,
            }}
          >
            Switch to Tech: The Practical Roadmap to Landing Your First IT Role
          </h1>

          <p
            style={{
              fontSize: 15,
              color: "#3d6b4f",
              lineHeight: 1.7,
              maxWidth: 440,
              marginBottom: 28,
            }}
          >
            If you want to move into tech but keep getting stuck on where to start, which path to
            pick, or how to stand out without experience, this session is built for you.
          </p>

          <div className="flex flex-col sm:flex-row" style={{ gap: 12, marginBottom: 36 }}>
            <DetailPill icon={<CalendarDays size={16} color="#1A8C4E" strokeWidth={2.25} />}>
              {WEBINAR_DATE_LABEL}
            </DetailPill>
            <DetailPill icon={<Clock size={16} color="#1A8C4E" strokeWidth={2.25} />}>
              {WEBINAR_TIME_LABEL}
            </DetailPill>
          </div>

          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "#1A8C4E",
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            What you&apos;ll walk away with
          </div>
          <ul className="flex flex-col" style={{ gap: 14, listStyle: "none", padding: 0 }}>
            {TAKEAWAYS.map((item) => (
              <li key={item} className="flex items-start" style={{ gap: 12 }}>
                <span
                  className="shrink-0 grid place-items-center"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "rgba(26,140,78,0.12)",
                    marginTop: 1,
                  }}
                >
                  <Check size={13} color="#1A8C4E" strokeWidth={3} />
                </span>
                <span
                  style={{ fontSize: 14, color: "#3d6b4f", lineHeight: 1.6, maxWidth: 420 }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT */}
        <div
          className="flex flex-col justify-center px-6 py-8 md:px-9 md:py-12 lg:px-[52px] lg:py-[72px]"
          style={{ background: "#fff", borderLeft: "1px solid rgba(10,46,26,0.06)" }}
        >
          {submitted ? (
            <SuccessState />
          ) : (
            <form onSubmit={handleSubmit}>
              <h2
                className="font-display"
                style={{ fontSize: 24, fontWeight: 700, color: "#0A2E1A", marginBottom: 6 }}
              >
                Save your seat
              </h2>
              <p style={{ fontSize: 14, color: "#4a7a5a", marginBottom: 32 }}>
                It&apos;s free. Takes less than a minute.
              </p>

              <div style={{ marginBottom: 16 }}>
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
              </div>

              <div style={{ marginBottom: 16 }}>
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

              <div style={{ marginBottom: 16 }}>
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
              </div>

              <div style={{ marginBottom: 16 }}>
                <FormField label="What do you do now, and what's holding you back?">
                  <textarea
                    name="background"
                    value={form.background}
                    onChange={handleChange}
                    placeholder="e.g. I work in banking and want to move into data, but I don't know which skills matter."
                    maxLength={1000}
                    required
                    style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
                    onFocus={focusOn}
                    onBlur={focusOff}
                  />
                </FormField>
              </div>

              <button
                type="submit"
                disabled={loading}
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
                  minHeight: 48,
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
                {loading ? "Registering..." : "Register Free"}
              </button>

              <p
                style={{
                  fontSize: 12,
                  color: "rgba(10,46,26,0.4)",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                We never share your details. The joining link is sent by email and WhatsApp.
              </p>
            </form>
          )}
        </div>
      </div>
    </PublicShell>
  );
}

function DetailPill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
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
      }}
    >
      {icon}
      {children}
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
  minHeight: 48,
  border: "1.5px solid rgba(10,46,26,0.12)",
  borderRadius: 9,
  fontSize: 16,
  fontFamily: "inherit",
  color: "#0A2E1A",
  background: "#fff",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function focusOn(e: React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = "#1A8C4E";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,140,78,0.08)";
}
function focusOff(e: React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = "rgba(10,46,26,0.12)";
  e.currentTarget.style.boxShadow = "none";
}

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />;
}

function SuccessState() {
  return (
    <div style={{ textAlign: "center", padding: "24px 0" }}>
      <div
        className="mx-auto grid place-items-center"
        style={{ width: 80, height: 80, background: "rgba(0,245,160,0.12)", borderRadius: "50%" }}
      >
        <Check size={36} color="#00F5A0" strokeWidth={2.5} />
      </div>
      <h2
        className="font-display"
        style={{ fontSize: 28, fontWeight: 700, color: "#0A2E1A", margin: "20px 0 10px" }}
      >
        You&apos;re registered!
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "#4a7a5a",
          lineHeight: 1.7,
          maxWidth: 380,
          margin: "0 auto 24px",
        }}
      >
        Your seat is saved for <strong style={{ color: "#0A2E1A" }}>{WEBINAR_DATE_LABEL}</strong> at{" "}
        <strong style={{ color: "#0A2E1A" }}>2:00 PM WAT</strong>. We&apos;ll send the joining link
        by email and WhatsApp before the session.
      </p>

      <div className="flex flex-col" style={{ gap: 12, maxWidth: 380, margin: "0 auto" }}>
        <a
          href={GOOGLE_CALENDAR_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center"
          style={{
            gap: 8,
            background: "#0A2E1A",
            color: "#fff",
            padding: "14px 24px",
            minHeight: 48,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <CalendarDays size={16} strokeWidth={2.25} />
          Add to calendar
        </a>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center"
          style={{
            gap: 8,
            background: "#fff",
            color: "#0A2E1A",
            border: "1.5px solid rgba(10,46,26,0.12)",
            padding: "14px 24px",
            minHeight: 48,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <MessageCircle size={16} color="#1A8C4E" strokeWidth={2.25} />
          Message us on WhatsApp
        </a>
      </div>
    </div>
  );
}
