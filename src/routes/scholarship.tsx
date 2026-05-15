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
      <section style={{ backgroundColor: "#F0FDF6" }} className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
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
          <p className="mt-6 text-foreground/75 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
            Every cohort we set aside full and partial scholarships for learners who have the drive but not the funds. From Lagos to London, Nairobi to New York. If that is you, we want to hear from you.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
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
      <section style={{ backgroundColor: "#0A2E1A" }} className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center text-white">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight">
            Scholarship not the right fit?
          </h2>
          <p className="mt-5 text-white/75 text-base sm:text-lg leading-relaxed">
            We get it. Finances are complicated wherever you are in the world. We offer flexible payment plans designed to be accessible no matter where you are based. Talk to us and we will figure something out together.
          </p>
          <Button
            asChild
            variant="outline"
            className="mt-8 h-12 rounded-full px-8 font-bold border-2 bg-transparent hover:bg-mint hover:text-forest"
            style={{ borderColor: "#00F5A0", color: "#00F5A0" }}
          >
            <Link to="/contact">Let's talk</Link>
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}
