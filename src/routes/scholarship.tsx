import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  GraduationCap,
  Sparkles,
  Calendar,
  Users,
  Briefcase,
  Award,
  Target,
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { PublicShell } from "@/components/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COURSE_NAMES } from "@/lib/courses-data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/scholarship")({
  head: () => ({
    meta: [
      { title: "Scholarship — Evogue Academy" },
      { name: "description", content: "Apply for an Evogue Academy scholarship to launch your tech career." },
      { property: "og:title", content: "Scholarship — Evogue Academy" },
      { property: "og:description", content: "Full and partial scholarships available for ambitious learners worldwide." },
    ],
  }),
  component: ScholarshipPage,
});

const benefits = [
  {
    icon: GraduationCap,
    title: "Full or Partial Tuition",
    text: "Selected scholars receive up to 100% tuition coverage. Nothing held back, nothing watered down.",
  },
  {
    icon: Users,
    title: "The Full Cohort Experience",
    text: "Same live classes. Same mentors. Same real-world projects. Scholars sit at the same table as everyone else.",
  },
  {
    icon: Briefcase,
    title: "Career Support That Ships",
    text: "Portfolio reviews, mock interviews, and direct introductions to our global hiring network. We don't stop at the certificate.",
  },
  {
    icon: Award,
    title: "A Certificate That Means Something",
    text: "The same Evogue Academy certificate issued to every graduate. Earned the same way. Worth the same weight.",
  },
];

const details: { label: string; value: string; highlight?: boolean }[] = [
  { label: "Award type", value: "Full and partial scholarships available" },
  { label: "Eligible courses", value: "All Evogue Academy tracks" },
  { label: "Who can apply", value: "Anyone, 18 or older, based anywhere in the world" },
  { label: "Cohort", value: "Currently open" },
  { label: "Available spots", value: "Limited per cohort" },
  { label: "Tuition coverage", value: "Up to 100%", highlight: true },
];

const eligibility = [
  "You are 18 or older, based anywhere in the world",
  "You can commit fully to a 6 to 14 week cohort",
  "You have a reliable laptop and internet connection",
  "You have a clear reason for wanting a career in tech",
  "You are willing to share your journey publicly",
];

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  whatsapp: z.string().trim().min(7, "Enter a valid WhatsApp number").max(30),
  country: z.string().trim().min(2, "Where are you based?").max(100),
  occupation: z.string().trim().min(2, "Tell us your occupation").max(150),
  course: z.string().min(1, "Select a course"),
  background: z.string().trim().max(2000).optional().or(z.literal("")),
  story: z
    .string()
    .trim()
    .min(100, "Your story should be at least 100 characters")
    .max(3000),
});

function ScholarshipPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    whatsapp: "",
    country: "",
    occupation: "",
    course: "",
    background: "",
    story: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setLoading(true);
    const message = [
      `Country: ${parsed.data.country}`,
      `Occupation: ${parsed.data.occupation}`,
      parsed.data.background ? `Background: ${parsed.data.background}` : null,
      "",
      "Story:",
      parsed.data.story,
    ]
      .filter(Boolean)
      .join("\n");

    const { error } = await supabase.from("inquiries").insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      whatsapp_number: parsed.data.whatsapp,
      course_interest: parsed.data.course,
      message,
      source: "scholarship",
      type: "scholarship",
    });
    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Try again.");
      return;
    }
    setDone(true);
    toast.success("Application received!");
  };

  return (
    <PublicShell>
      {/* Section 1: Hero */}
      <section style={{ backgroundColor: "#F0FDF6" }} className="py-20 px-4 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="max-w-[520px] text-left">
            <span
              className="inline-flex items-center gap-2 rounded-full border-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wide"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#0A2E1A", color: "#0A2E1A" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Limited Scholarship Opportunity
            </span>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-forest">
              Wherever You Are,{" "}
              <span style={{ color: "#1A8C4E" }}>You Belong Here.</span>
            </h1>
            <p className="mt-6 text-foreground/75 text-base sm:text-lg leading-relaxed">
              Every cohort we set aside full and partial scholarships for learners who have the drive but not the funds. From Lagos to London, Nairobi to New York. If that is you, we want to hear from you.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-semibold text-forest shadow-soft">
                <Calendar className="h-4 w-4" style={{ color: "#1A8C4E" }} />
                Applications open now
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-semibold text-forest shadow-soft">
                <Users className="h-4 w-4" style={{ color: "#1A8C4E" }} />
                Limited spots per cohort
              </span>
            </div>
          </div>
          <div className="w-full">
            <svg width="100%" viewBox="0 0 680 480" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <filter id="soft" x="-5%" y="-5%" width="110%" height="115%">
                  <feDropShadow dx="0" dy="12" stdDeviation="20" floodColor="#020e06" floodOpacity="0.45" />
                </filter>
                <linearGradient id="card-surface" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d3a1f" /><stop offset="100%" stopColor="#081a0e" />
                </linearGradient>
                <linearGradient id="card-mid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f4424" /><stop offset="100%" stopColor="#0a2413" />
                </linearGradient>
                <linearGradient id="card-front" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#11512a" /><stop offset="100%" stopColor="#0c3018" />
                </linearGradient>
                <linearGradient id="mint-glow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00F5A0" stopOpacity="0" />
                  <stop offset="30%" stopColor="#00F5A0" stopOpacity="1" />
                  <stop offset="70%" stopColor="#00F5A0" stopOpacity="1" />
                  <stop offset="100%" stopColor="#00F5A0" stopOpacity="0" />
                </linearGradient>
                <radialGradient id="orb-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#00F5A0" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00F5A0" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="420" cy="240" rx="220" ry="180" fill="url(#orb-glow)" />
              <g filter="url(#soft)" transform="rotate(-14, 340, 240) translate(-30, 20)">
                <rect x="200" y="80" width="320" height="230" rx="14" fill="url(#card-surface)" />
                <rect x="214" y="110" width="292" height="170" rx="8" fill="#071510" />
                <circle cx="228" cy="98" r="4" fill="#1A8C4E" opacity="0.5" />
                <circle cx="242" cy="98" r="4" fill="#1A8C4E" opacity="0.3" />
                <circle cx="256" cy="98" r="4" fill="#1A8C4E" opacity="0.2" />
                <rect x="228" y="128" width="100" height="7" rx="3.5" fill="#1A8C4E" opacity="0.4" />
                <rect x="228" y="143" width="180" height="5" rx="2.5" fill="#1A8C4E" opacity="0.2" />
                <rect x="228" y="156" width="150" height="5" rx="2.5" fill="#1A8C4E" opacity="0.2" />
                <rect x="228" y="169" width="165" height="5" rx="2.5" fill="#1A8C4E" opacity="0.15" />
                <circle cx="460" cy="158" r="34" fill="#0A2E1A" opacity="0.7" />
                <circle cx="460" cy="158" r="22" fill="#1A8C4E" opacity="0.25" />
                <rect x="228" y="254" width="90" height="5" rx="2.5" fill="url(#mint-glow)" opacity="0.5" />
              </g>
              <g filter="url(#soft)" transform="rotate(-5, 340, 240) translate(10, 10)">
                <rect x="200" y="70" width="320" height="240" rx="14" fill="url(#card-mid)" />
                <rect x="214" y="102" width="292" height="176" rx="8" fill="#071510" />
                <rect x="200" y="70" width="320" height="14" rx="14" fill="#0a2010" />
                <rect x="200" y="84" width="320" height="18" rx="0" fill="#0a2010" />
                <circle cx="228" cy="87" r="4" fill="#1A8C4E" opacity="0.6" />
                <circle cx="242" cy="87" r="4" fill="#1A8C4E" opacity="0.35" />
                <circle cx="256" cy="87" r="4" fill="#1A8C4E" opacity="0.2" />
                <rect x="290" y="83" width="120" height="6" rx="3" fill="#1A8C4E" opacity="0.25" />
                <rect x="228" y="118" width="264" height="136" rx="8" fill="#0A2E1A" opacity="0.6" />
                <polygon points="310,138 313,148 324,148 315,154 318,164 310,158 302,164 305,154 296,148 307,148" fill="#00F5A0" opacity="0.85" />
                <rect x="332" y="136" width="110" height="7" rx="3.5" fill="#EDF7F0" opacity="0.5" />
                <rect x="332" y="150" width="80" height="5" rx="2.5" fill="#EDF7F0" opacity="0.25" />
                <rect x="228" y="178" width="264" height="1" fill="#1A8C4E" opacity="0.2" />
                <rect x="240" y="188" width="70" height="5" rx="2.5" fill="#1A8C4E" opacity="0.3" />
                <rect x="380" y="188" width="90" height="5" rx="2.5" fill="#EDF7F0" opacity="0.3" />
                <rect x="240" y="200" width="70" height="5" rx="2.5" fill="#1A8C4E" opacity="0.3" />
                <rect x="380" y="200" width="70" height="5" rx="2.5" fill="#EDF7F0" opacity="0.3" />
                <rect x="240" y="212" width="70" height="5" rx="2.5" fill="#1A8C4E" opacity="0.3" />
                <rect x="380" y="212" width="100" height="5" rx="2.5" fill="#00F5A0" opacity="0.7" />
                <rect x="228" y="272" width="140" height="6" rx="3" fill="url(#mint-glow)" opacity="0.8" />
              </g>
              <g filter="url(#soft)" transform="rotate(5, 340, 240) translate(44, -4)">
                <rect x="200" y="60" width="320" height="250" rx="14" fill="url(#card-front)" />
                <rect x="200" y="60" width="320" height="42" rx="14" fill="#0A2E1A" />
                <rect x="200" y="88" width="320" height="14" rx="0" fill="#0A2E1A" />
                <circle cx="218" cy="81" r="4.5" fill="#1A8C4E" opacity="0.7" />
                <circle cx="233" cy="81" r="4.5" fill="#1A8C4E" opacity="0.4" />
                <circle cx="248" cy="81" r="4.5" fill="#1A8C4E" opacity="0.25" />
                <rect x="278" y="77" width="90" height="6" rx="3" fill="#EDF7F0" opacity="0.2" />
                <rect x="214" y="102" width="292" height="176" rx="8" fill="#07180d" />
                <circle cx="246" cy="132" r="18" fill="#0A2E1A" opacity="0.8" />
                <circle cx="246" cy="132" r="11" fill="#1A8C4E" opacity="0.4" />
                <polygon points="246,123 254,127 246,131 238,127" fill="#00F5A0" opacity="0.9" />
                <rect x="272" y="124" width="90" height="7" rx="3.5" fill="#EDF7F0" opacity="0.55" />
                <rect x="272" y="137" width="60" height="5" rx="2.5" fill="#1A8C4E" opacity="0.4" />
                <rect x="214" y="158" width="292" height="1" fill="#1A8C4E" opacity="0.2" />
                <rect x="228" y="168" width="264" height="90" rx="8" fill="#0A2E1A" opacity="0.5" />
                <rect x="234" y="174" width="252" height="78" rx="5" fill="none" stroke="#1A8C4E" strokeWidth="0.75" strokeOpacity="0.3" />
                <rect x="300" y="182" width="120" height="7" rx="3.5" fill="#EDF7F0" opacity="0.4" />
                <rect x="316" y="194" width="88" height="5" rx="2.5" fill="#EDF7F0" opacity="0.2" />
                <circle cx="263" cy="210" r="16" fill="#0A2E1A" opacity="0.8" />
                <circle cx="263" cy="210" r="10" fill="#00F5A0" opacity="0.15" />
                <circle cx="263" cy="210" r="6" fill="#00F5A0" opacity="0.4" />
                <rect x="295" y="208" width="130" height="5" rx="2.5" fill="#EDF7F0" opacity="0.18" />
                <rect x="295" y="220" width="100" height="4" rx="2" fill="#EDF7F0" opacity="0.12" />
                <rect x="234" y="238" width="60" height="4" rx="2" fill="#00F5A0" opacity="0.6" />
                <rect x="300" y="239" width="40" height="3" rx="1.5" fill="#1A8C4E" opacity="0.3" />
                <rect x="346" y="239" width="50" height="3" rx="1.5" fill="#1A8C4E" opacity="0.3" />
                <rect x="214" y="266" width="200" height="7" rx="3.5" fill="url(#mint-glow)" />
              </g>
              <g>
                <rect x="76" y="188" width="108" height="36" rx="18" fill="#0A2E1A" />
                <rect x="78" y="190" width="104" height="32" rx="16" fill="#0d3320" stroke="#1A8C4E" strokeWidth="0.75" strokeOpacity="0.4" />
                <circle cx="99" cy="206" r="5" fill="#00F5A0" opacity="0.9" />
                <rect x="112" y="201" width="52" height="6" rx="3" fill="#EDF7F0" opacity="0.6" />
                <rect x="112" y="212" width="38" height="4" rx="2" fill="#EDF7F0" opacity="0.3" />
              </g>
              <g>
                <rect x="490" y="120" width="128" height="36" rx="18" fill="#0A2E1A" />
                <rect x="492" y="122" width="124" height="32" rx="16" fill="#0d3320" stroke="#00F5A0" strokeWidth="0.75" strokeOpacity="0.5" />
                <circle cx="510" cy="138" r="5" fill="#00F5A0" opacity="0.9" />
                <rect x="522" y="133" width="68" height="6" rx="3" fill="#EDF7F0" opacity="0.55" />
                <rect x="522" y="144" width="50" height="4" rx="2" fill="#1A8C4E" opacity="0.4" />
              </g>
              <g>
                <rect x="500" y="300" width="100" height="36" rx="18" fill="#0A2E1A" />
                <rect x="502" y="302" width="96" height="32" rx="16" fill="#0d3320" stroke="#1A8C4E" strokeWidth="0.75" strokeOpacity="0.35" />
                <polygon points="520,316 522.5,323 530,323 524,327 526.5,334 520,330 513.5,334 516,327 510,323 517.5,323" fill="#00F5A0" opacity="0.8" />
                <rect x="535" y="315" width="48" height="5" rx="2.5" fill="#EDF7F0" opacity="0.5" />
                <rect x="535" y="325" width="36" height="4" rx="2" fill="#EDF7F0" opacity="0.25" />
              </g>
              <circle cx="168" cy="140" r="4" fill="#00F5A0" opacity="0.4" />
              <circle cx="148" cy="280" r="2.5" fill="#1A8C4E" opacity="0.5" />
              <circle cx="620" cy="200" r="3.5" fill="#00F5A0" opacity="0.35" />
              <circle cx="600" cy="360" r="2.5" fill="#1A8C4E" opacity="0.4" />
            </svg>
          </div>
        </div>
      </section>

      {/* Section 2: What You'll Get */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-forest leading-tight">
              This isn't just a discount. It's a full ride.
            </h2>
            <p className="mt-4 text-foreground/60 text-base sm:text-lg">
              Scholars get everything full-paying students get. No compromise.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                style={{ backgroundColor: "#F0FDF6", borderRadius: "12px" }}
                className="p-6 border border-mint/40"
              >
                <span
                  className="inline-grid h-12 w-12 place-items-center rounded-xl"
                  style={{ backgroundColor: "#00F5A0", color: "#0A2E1A" }}
                >
                  <b.icon className="h-6 w-6" strokeWidth={2.25} />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-forest">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
                  {b.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Scholarship Details Card */}
      <section className="bg-background pb-16 sm:pb-20">
        <div className="mx-auto max-w-2xl px-4">
          <div
            style={{ backgroundColor: "#F0FDF6", borderRadius: "20px" }}
            className="p-8 sm:p-10 border border-mint/40"
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-grid h-10 w-10 place-items-center rounded-lg"
                style={{ backgroundColor: "#00F5A0", color: "#0A2E1A" }}
              >
                <Target className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <h3 className="font-display text-2xl font-extrabold text-forest">
                Scholarship Details
              </h3>
            </div>
            <dl className="mt-6 divide-y divide-mint/40">
              {details.map((d) => (
                <div
                  key={d.label}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-3.5"
                >
                  <dt className="text-sm text-foreground/60">{d.label}</dt>
                  <dd
                    className={
                      d.highlight
                        ? "font-display text-lg font-extrabold text-right"
                        : "font-bold text-forest text-right"
                    }
                    style={d.highlight ? { color: "#1A8C4E" } : undefined}
                  >
                    {d.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Section 4: Eligibility + Form */}
      <section className="bg-background pb-16 sm:pb-20">
        <div className="mx-auto max-w-6xl px-4 grid gap-10 lg:grid-cols-2 lg:gap-12 items-start">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-forest leading-tight">
              Before you apply
            </h2>
            <p className="mt-4 text-foreground/65 text-base sm:text-lg">
              We keep the bar clear. If you can say yes to all of the following, we want your application.
            </p>
            <ul className="mt-7 space-y-4">
              {eligibility.map((it) => (
                <li key={it} className="flex items-start gap-3 text-foreground/85">
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 mt-0.5"
                    style={{ color: "#1A8C4E" }}
                  />
                  <span className="text-base">{it}</span>
                </li>
              ))}
            </ul>
          </div>

          {done ? (
            <div className="rounded-3xl bg-background p-8 sm:p-10 text-center shadow-soft border border-border">
              <span
                className="inline-grid h-16 w-16 place-items-center rounded-full mx-auto"
                style={{ backgroundColor: "#00F5A0", color: "#0A2E1A" }}
              >
                <CheckCircle2 className="h-9 w-9" strokeWidth={2.5} />
              </span>
              <h3 className="mt-5 font-display text-2xl sm:text-3xl font-extrabold text-forest">
                We've got your application.
              </h3>
              <p className="mt-3 text-foreground/70 leading-relaxed">
                Thank you for applying. Every application is read by a real person. If you are selected or shortlisted we will reach out within 5 working days on WhatsApp or email. Either way, we wish you the best.
              </p>
              <Button
                asChild
                className="mt-6 h-12 rounded-full px-7 font-bold"
                style={{ backgroundColor: "#0A2E1A", color: "#00F5A0" }}
              >
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="rounded-3xl bg-background p-6 sm:p-8 shadow-soft border border-border space-y-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className="inline-grid h-10 w-10 place-items-center rounded-lg"
                  style={{ backgroundColor: "#00F5A0", color: "#0A2E1A" }}
                >
                  <GraduationCap className="h-5 w-5" />
                </span>
                <h3 className="font-display text-2xl font-extrabold text-forest">
                  Apply Now
                </h3>
              </div>
              <p className="text-sm text-foreground/60 -mt-1">
                Takes less than 5 minutes. We read every single application.
              </p>

              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                  maxLength={100}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  maxLength={255}
                />
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp Number</Label>
                <Input
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="+234..."
                  required
                  maxLength={30}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="Where are you based?"
                  required
                  maxLength={100}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Current Occupation</Label>
                <Input
                  value={form.occupation}
                  onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                  placeholder="e.g. Student, Nurse, Graphic Designer, Unemployed"
                  required
                  maxLength={150}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Course you want to study</Label>
                <Select value={form.course} onValueChange={(v) => setForm({ ...form, course: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_NAMES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Any relevant background <span className="text-foreground/50 font-normal">(optional)</span></Label>
                <Textarea
                  rows={3}
                  value={form.background}
                  onChange={(e) => setForm({ ...form, background: e.target.value })}
                  placeholder="Prior experience in tech, design, art, or anything creative. None required."
                  maxLength={2000}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tell us who you are and why this scholarship matters to you.</Label>
                <Textarea
                  rows={6}
                  value={form.story}
                  onChange={(e) => setForm({ ...form, story: e.target.value })}
                  placeholder="Be honest. Tell us where you are, where you want to go, and what this opportunity would change for you. Minimum 100 characters."
                  required
                  maxLength={3000}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full font-bold"
                style={{ backgroundColor: "#0A2E1A", color: "#00F5A0" }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit My Application"}
              </Button>
              <p className="text-xs text-foreground/55 text-center leading-relaxed">
                We will never share your information. Expect a response within 5 working days via WhatsApp or email.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Section 5: Closing CTA */}
      <section style={{ backgroundColor: "#00F5A0" }} className="py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight" style={{ color: "#0A2E1A" }}>
            Scholarship not the right fit?
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed" style={{ color: "rgba(10, 46, 26, 0.8)" }}>
            We get it. Finances are complicated wherever you are in the world. We offer flexible payment plans designed to be accessible no matter where you are based. Talk to us and we will figure something out together.
          </p>
          <Button
            asChild
            className="mt-6 h-12 rounded-full px-8 font-bold hover:opacity-90"
            style={{ backgroundColor: "#0A2E1A", color: "#FFFFFF" }}
          >
            <Link to="/contact">Let's talk</Link>
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}
