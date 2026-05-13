import { useState } from "react";
import { Mail, MessageCircle, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(255),
  message: z.string().trim().min(5, "Please write a message").max(2000),
});

const info = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@evogueacademy.com",
    href: "mailto:hello@evogueacademy.com",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+234 800 000 0000",
    href: "https://wa.me/2348000000000",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Lagos, Nigeria",
    href: "#",
  },
];

export function Contact() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

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
      message: parsed.data.message,
      source: "contact",
      type: "contact",
    });
    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    toast.success("Message sent! We'll respond shortly.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-secondary">
            Contact
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-extrabold text-forest leading-tight">
            Let's start your <span className="text-secondary">tech journey</span>
          </h2>
          <p className="mt-4 text-foreground/70 text-base sm:text-lg">
            Questions about courses, scholarships, or partnerships? Reach out — we usually reply within a day.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            {info.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-start gap-4 rounded-2xl border border-border bg-background p-5 hover:border-secondary/40 hover:shadow-soft transition"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-mint/30 text-secondary shrink-0">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground/55">
                    {item.label}
                  </p>
                  <p className="mt-1 font-display font-bold text-forest break-all">{item.value}</p>
                </div>
              </a>
            ))}
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-3xl border border-border bg-background p-6 sm:p-8 shadow-soft space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                maxLength={120}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                maxLength={255}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="How can we help?"
                rows={5}
                maxLength={2000}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto h-12 rounded-full bg-forest text-mint hover:bg-forest/90 px-8 font-semibold"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
