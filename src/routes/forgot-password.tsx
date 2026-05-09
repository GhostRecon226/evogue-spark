import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { Logo } from "@/components/landing/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — Evogue Academy" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/login",
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-mint-tint px-4 py-10">
      <Link to="/" className="mb-8"><Logo /></Link>
      <div className="w-full max-w-md rounded-3xl bg-background p-8 shadow-soft border border-border">
        {sent ? (
          <div className="text-center">
            <CheckCircle2 className="h-12 w-12 text-secondary mx-auto" />
            <h1 className="mt-4 font-display text-2xl font-extrabold text-forest">Check your inbox</h1>
            <p className="mt-2 text-sm text-foreground/70">We've sent a password reset link to <span className="font-semibold">{email}</span>.</p>
            <Button asChild className="mt-6 w-full rounded-full"><Link to="/login">Back to login</Link></Button>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-extrabold text-forest">Forgot password?</h1>
            <p className="mt-1 text-sm text-foreground/60">Enter your email and we'll send a reset link.</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-1.5"><Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <Button type="submit" disabled={loading} className="w-full h-12 rounded-full bg-forest text-mint hover:bg-forest/90 font-bold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
              </Button>
            </form>
            <p className="mt-6 text-sm text-center text-foreground/70">
              Remembered? <Link to="/login" className="text-secondary font-semibold hover:underline">Back to login</Link>
            </p>
          </>
        )}
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}
