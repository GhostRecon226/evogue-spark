import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Loader2, GraduationCap } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { PublicShell } from "@/components/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COURSE_NAMES } from "@/lib/courses-data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/scholarship")({
  head: () => ({
    meta: [
      { title: "Scholarship — Evogue Academy" },
      { name: "description", content: "Apply for an Evogue Academy scholarship to launch your tech career." },
      { property: "og:title", content: "Scholarship — Evogue Academy" },
      { property: "og:description", content: "Full and partial scholarships available for ambitious African learners." },
    ],
  }),
  component: ScholarshipPage,
});

const eligibility = [
  "African resident, 18 years or older",
  "Strong commitment to a 6–14 week cohort",
  "Reliable laptop and internet access",
  "Clear motivation to launch a tech career",
  "Willing to share progress publicly",
];

const schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  whatsapp: z.string().trim().min(7).max(30),
  course: z.string().min(1, "Select a course"),
  motivation: z.string().trim().min(20, "Tell us a bit more (20+ chars)").max(2000),
});

function ScholarshipPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", whatsapp: "", course: "", motivation: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("inquiries").insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      whatsapp_number: parsed.data.whatsapp,
      course_interest: parsed.data.course,
      message: parsed.data.motivation,
      source: "scholarship",
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
      <section className="bg-mint-tint py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-mint/40 text-secondary mx-auto">
            <GraduationCap className="h-7 w-7" />
          </span>
          <h1 className="mt-5 font-display text-4xl sm:text-5xl font-extrabold text-forest leading-tight">
            Evogue <span className="text-secondary">Scholarship</span>
          </h1>
          <p className="mt-5 text-foreground/75 text-base sm:text-lg">
            We award full and partial scholarships every cohort to learners with strong
            potential who can't pay full tuition. Apply below — we review every application.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-forest">Eligibility</h2>
            <ul className="mt-5 space-y-3">
              {eligibility.map((it) => (
                <li key={it} className="flex items-start gap-3 text-foreground/80">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>

          {done ? (
            <div className="rounded-3xl border border-border bg-mint-tint p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-secondary mx-auto" />
              <h3 className="mt-4 font-display text-2xl font-bold text-forest">Application received</h3>
              <p className="mt-2 text-foreground/70">We review applications within 7 days. Watch your inbox.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="rounded-3xl border border-border bg-background p-6 sm:p-8 shadow-soft space-y-4">
              <div className="space-y-1.5"><Label>Full name</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required maxLength={100} /></div>
              <div className="space-y-1.5"><Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} /></div>
              <div className="space-y-1.5"><Label>WhatsApp number</Label>
                <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} required maxLength={30} /></div>
              <div className="space-y-1.5"><Label>Course interest</Label>
                <Select value={form.course} onValueChange={(v) => setForm({ ...form, course: v })}>
                  <SelectTrigger><SelectValue placeholder="Pick a course" /></SelectTrigger>
                  <SelectContent>{COURSE_NAMES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Why do you deserve this scholarship?</Label>
                <Textarea rows={5} value={form.motivation} onChange={(e) => setForm({ ...form, motivation: e.target.value })} required maxLength={2000} /></div>
              <Button type="submit" disabled={loading} className="w-full h-12 rounded-full bg-forest text-mint hover:bg-forest/90 font-bold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Application"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </PublicShell>
  );
}
