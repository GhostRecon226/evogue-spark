import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { COURSE_NAMES } from "./Courses";

const schema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(255),
  whatsapp: z.string().trim().min(7, "Please enter a valid number").max(40),
  course: z.string().min(1, "Please pick a course"),
});

export function EnrollCta() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    whatsapp: "",
    course: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("enrollment_inquiries").insert(parsed.data);
    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    toast.success("Inquiry received! We'll be in touch shortly.");
    setForm({ full_name: "", email: "", whatsapp: "", course: "" });
  };

  return (
    <section
      id="enroll"
      className="py-20 sm:py-28 text-mint relative overflow-hidden"
      style={{ background: "var(--gradient-forest)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-mint/20 blur-3xl"
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-mint/20 text-mint">
          <Sparkles className="h-7 w-7" strokeWidth={2.25} />
        </span>
        <h2 className="mt-6 font-display text-3xl sm:text-5xl font-extrabold leading-tight text-mint">
          Join the next cohort
        </h2>
        <p className="mt-4 text-mint/80 text-base sm:text-lg">
          Seats are limited per cohort. Drop your details and our team will reach out within 24 hours to walk you through everything.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 mx-auto rounded-3xl bg-background text-foreground p-6 sm:p-8 shadow-[var(--shadow-mint)] text-left space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Ada Okafor"
                maxLength={120}
                required
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                maxLength={255}
                required
              />
            </Field>
            <Field label="WhatsApp number">
              <Input
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="+234 ..."
                maxLength={40}
                required
              />
            </Field>
            <Field label="Course interest">
              <Select
                value={form.course}
                onValueChange={(v) => setForm({ ...form, course: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_NAMES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-mint text-forest hover:bg-mint/90 font-bold text-base"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Inquiry"}
          </Button>
          <p className="text-xs text-foreground/60 text-center">
            By submitting, you agree to be contacted about cohort details. We'll never spam you.
          </p>
        </form>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground/80">{label}</Label>
      {children}
    </div>
  );
}
