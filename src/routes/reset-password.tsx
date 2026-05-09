import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { Logo } from "@/components/landing/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — Evogue Academy" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pw, setPw] = useState({ password: "", confirm: "" });

  // Recovery links from Supabase put `type=recovery` in the URL hash and
  // create a temporary session via onAuthStateChange("PASSWORD_RECOVERY").
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else if (!window.location.hash.includes("type=recovery")) {
        setError("This reset link is invalid or has expired.");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.password.length < 8) { toast.error("Min 8 characters"); return; }
    if (pw.password !== pw.confirm) { toast.error("Passwords don't match"); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password: pw.password });
    setLoading(false);
    if (err) { toast.error(err.message); return; }
    setDone(true);
    await supabase.auth.signOut();
    setTimeout(() => navigate({ to: "/login" }), 1800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-mint-tint px-4 py-10">
      <Link to="/" className="mb-8"><Logo /></Link>
      <div className="w-full max-w-md rounded-3xl bg-background p-8 shadow-soft border border-border">
        {done ? (
          <div className="text-center">
            <CheckCircle2 className="h-12 w-12 text-secondary mx-auto" />
            <h1 className="mt-4 font-display text-2xl font-extrabold text-forest">Password updated</h1>
            <p className="mt-2 text-sm text-foreground/70">Redirecting you to login…</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <h1 className="font-display text-2xl font-extrabold text-forest">Link expired</h1>
            <p className="mt-2 text-sm text-foreground/70">{error}</p>
            <Button asChild className="mt-6 w-full rounded-full"><Link to="/forgot-password">Request a new link</Link></Button>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-extrabold text-forest">Set a new password</h1>
            <p className="mt-1 text-sm text-foreground/60">Choose a strong password you haven't used before.</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-1.5"><Label>New password</Label>
                <div className="relative">
                  <Input type={show ? "text" : "password"} value={pw.password}
                    onChange={(e) => setPw({ ...pw, password: e.target.value })} required />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5"><Label>Confirm password</Label>
                <Input type={show ? "text" : "password"} value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required /></div>
              <Button type="submit" disabled={loading || !ready}
                className="w-full h-12 rounded-full bg-forest text-mint hover:bg-forest/90 font-bold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : ready ? "Update Password" : "Validating link…"}
              </Button>
            </form>
          </>
        )}
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}
