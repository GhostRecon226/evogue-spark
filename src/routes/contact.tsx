import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, MapPin, ArrowRight, Instagram, Twitter, Linkedin, Youtube, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { PublicShell } from "@/components/PublicShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Evogue Academy" },
      { name: "description", content: "Get in touch with the Evogue Academy team in Lagos, Nigeria. No bots, no ticket queues — just us." },
      { property: "og:title", content: "Contact — Evogue Academy" },
      { property: "og:description", content: "No bots. No ticket queues. Just us." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(255),
  topic: z.string().trim().min(1, "Please choose a topic").max(120),
  message: z.string().trim().min(5, "Please write a message").max(2000),
});

const FOREST = "#0A2E1A";
const MINT = "#00F5A0";
const MINT_BG = "#EDF7F0";
const FOREST_MID = "#1A8C4E";
const CREAM = "#EDF7F0";

function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("inquiries").insert({
      full_name: parsed.data.name,
      email: parsed.data.email,
      message: `[${parsed.data.topic}] ${parsed.data.message}`,
      source: "contact",
      type: "contact",
    });
    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    toast.success("Message sent! We'll respond shortly.");
    setForm({ name: "", email: "", topic: "", message: "" });
  };

  const inputCls =
    "w-full rounded-[9px] border-[1.5px] border-[rgba(10,46,26,0.12)] bg-white px-4 py-3 text-sm text-[#0A2E1A] outline-none transition focus:border-[#1A8C4E] focus:shadow-[0_0_0_3px_rgba(26,140,78,0.08)] placeholder:text-[#0A2E1A]/40";

  return (
    <PublicShell>
      <div className="flex flex-col md:flex-row md:min-h-[calc(100vh-5rem)]">
        {/* LEFT PANEL */}
        <aside
          className="relative overflow-hidden w-full md:w-[360px] lg:w-[480px] md:flex-shrink-0 px-6 pt-12 pb-10 md:px-9 md:py-12 lg:px-12 lg:py-[52px] flex flex-col justify-between gap-8"
          style={{
            backgroundColor: FOREST,
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(0,245,160,0.07) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(26,140,78,0.10) 0%, transparent 50%)",
            color: CREAM,
          }}
        >
          {/* decorative circles, hidden on mobile */}
          <span
            aria-hidden
            className="hidden md:block absolute pointer-events-none rounded-full"
            style={{ width: 240, height: 240, right: -60, bottom: -60, border: "1px solid rgba(0,245,160,0.08)" }}
          />
          <span
            aria-hidden
            className="hidden md:block absolute pointer-events-none rounded-full"
            style={{ width: 160, height: 160, right: -30, bottom: -30, border: "1px solid rgba(0,245,160,0.12)" }}
          />

          <div className="relative">
            <p className="text-[11px] font-semibold uppercase" style={{ letterSpacing: "0.18em", color: MINT }}>
              Get in touch
            </p>
            <h1
              className="contact-headline mt-5 font-display font-black leading-[1.1]"
              style={{ color: CREAM }}
            >
              No bots.<br />
              No ticket queues.<br />
              <span className="italic" style={{ color: MINT }}>Just us.</span>
            </h1>
            <p className="mt-5 text-sm" style={{ color: "rgba(237,247,240,0.6)", maxWidth: "100%" }}>
              Got a question about a course, a scholarship, or just not sure where to start? We read every message and we reply to every one.
            </p>
          </div>

          <ul className="relative">
            {[
              { Icon: Mail, label: "Email", value: "hello@evogueacademy.com", href: "mailto:hello@evogueacademy.com" },
              { Icon: MessageCircle, label: "WhatsApp", value: "+234 800 000 0000", href: "https://wa.me/2348000000000" },
              { Icon: MapPin, label: "Location", value: "Lagos, Nigeria", href: "#" },
            ].map(({ Icon, label, value, href }, i) => (
              <li
                key={label}
                style={{
                  borderTop: i === 0 ? "1px solid rgba(255,255,255,0.06)" : undefined,
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <a href={href} className="flex items-start gap-4 py-[14px] md:py-5 group">
                  <span
                    className="grid place-items-center shrink-0"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: "rgba(0,245,160,0.10)",
                      border: "1px solid rgba(0,245,160,0.15)",
                      color: MINT,
                    }}
                  >
                    <Icon size={16} />
                  </span>
                  <span className="flex flex-col">
                    <span
                      className="text-[11px] uppercase font-semibold"
                      style={{ letterSpacing: "0.12em", color: "rgba(237,247,240,0.4)" }}
                    >
                      {label}
                    </span>
                    <span className="mt-1 text-sm font-medium transition-colors group-hover:text-[#00F5A0]" style={{ color: CREAM }}>
                      {value}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="relative">
            <div
              className="flex items-center gap-3 w-full"
              style={{
                background: "rgba(0,245,160,0.07)",
                border: "1px solid rgba(0,245,160,0.15)",
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              <span className="shrink-0 rounded-full" style={{ width: 8, height: 8, background: MINT }} />
              <p className="text-[13px]">
                <span style={{ color: CREAM, fontWeight: 500 }}>We usually reply within 24 hours</span>
                <span style={{ color: "rgba(237,247,240,0.65)" }}> — weekdays via email or WhatsApp</span>
              </p>
            </div>

            <div className="flex items-center gap-2 mt-6">
              {[
                { Icon: Instagram, label: "Instagram" },
                { Icon: Twitter, label: "X" },
                { Icon: Linkedin, label: "LinkedIn" },
                { Icon: Youtube, label: "YouTube" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid place-items-center transition-colors"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 9,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: CREAM,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0,245,160,0.10)";
                    e.currentTarget.style.borderColor = "rgba(0,245,160,0.20)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <section
          className="flex-1 px-6 py-10 md:px-10 md:py-12 lg:px-[60px] lg:py-16 flex flex-col justify-center"
          style={{
            backgroundColor: MINT_BG,
            backgroundImage: "radial-gradient(rgba(10,46,26,0.06) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        >
          <div className="w-full md:max-w-full lg:max-w-[580px] mx-auto">
            <p
              className="text-[12px] font-semibold uppercase"
              style={{ letterSpacing: "0.14em", color: FOREST_MID }}
            >
              Send a message
            </p>
            <h2 className="mt-3 font-display font-bold" style={{ fontSize: 28, color: FOREST }}>
              Tell us what you need.
            </h2>
            <p className="mt-3 text-sm leading-[1.6]" style={{ color: "#4a7a5a" }}>
              No lengthy intake forms. No automated responses. Just tell us what's going on and we'll take it from there.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div>
                  <label className="block text-[12px] font-semibold mb-1.5" style={{ color: FOREST }}>Full name</label>
                  <input
                    className={inputCls}
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    maxLength={120}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1.5" style={{ color: FOREST }}>Email address</label>
                  <input
                    type="email"
                    className={inputCls}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    maxLength={255}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: FOREST }}>What's this about?</label>
                <select
                  className={`${inputCls} contact-select`}
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  required
                >
                  <option value="">Select a topic</option>
                  <option>Course enquiry</option>
                  <option>Scholarship question</option>
                  <option>Payment or pricing</option>
                  <option>Technical issue</option>
                  <option>Partnership</option>
                  <option>Something else</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: FOREST }}>Your message</label>
                <textarea
                  className={inputCls}
                  style={{ minHeight: 120, resize: "vertical" }}
                  placeholder="Be as specific as you like. The more context you give us, the better we can help."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  maxLength={2000}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3 sm:gap-4 mt-2">
                <p className="text-[12px] leading-snug" style={{ color: "rgba(10,46,26,0.4)" }}>
                  We never share your details.<br />
                  No marketing emails. No spam.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 transition-all disabled:opacity-60 w-full sm:w-auto"
                  style={{
                    background: FOREST,
                    color: "#fff",
                    padding: "14px 32px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = FOREST_MID;
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = FOREST;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<>Send message <ArrowRight size={16} /></>)}
                </button>
              </div>

            </form>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
