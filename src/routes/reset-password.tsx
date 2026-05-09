import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
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

type LinkStatus = "checking" | "ready" | "invalid" | "expired";

function parseHashParams(): URLSearchParams {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  return new URLSearchParams(hash);
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState<LinkStatus>("checking");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [pw, setPw] = useState({ password: "", confirm: "" });

  // Supabase recovery flow:
  //   1. The email link redirects here with `#access_token=...&type=recovery`
  //      (or `?error=...&error_description=...` on failure).
  //   2. supabase-js parses the hash and emits a PASSWORD_RECOVERY event,
  //      establishing a short-lived recovery session.
  //   3. We then call updateUser({ password }).
  useEffect(() => {
    const hashParams = parseHashParams();
    const queryParams = new URLSearchParams(window.location.search);
    const errCode = hashParams.get("error_code") || queryParams.get("error_code");
    const errDesc =
      hashParams.get("error_description") ||
      queryParams.get("error_description") ||
      hashParams.get("error") ||
      queryParams.get("error");

    if (errCode || errDesc) {
      const friendly = decodeURIComponent((errDesc ?? "").replace(/\+/g, " "));
      const expired = /expired|otp_expired|invalid/i.test(`${errCode} ${errDesc}`);
      setStatus(expired ? "expired" : "invalid");
      setLinkError(friendly || "This password reset link is no longer valid.");
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && sess)) {
        setStatus("ready");
      }
    });

    // Fallback: if the hash already created a session, getSession returns it.
    supabase.auth.getSession().then(({ data }) => {
      const hasRecoveryHash = hashParams.get("type") === "recovery" || hashParams.has("access_token");
      if (data.session && hasRecoveryHash) {
        setStatus("ready");
      } else if (!hasRecoveryHash && !data.session) {
        setStatus("invalid");
        setLinkError("This page can only be opened from a password reset email.");
      }
    });

    // Safety net: if neither the event nor the session arrive within 6s,
    // assume the link is malformed.
    const timer = setTimeout(() => {
      setStatus((prev) => {
        if (prev === "checking") {
          setLinkError("We couldn't validate this reset link. Please request a new one.");
          return "invalid";
        }
        return prev;
      });
    }, 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (pw.password !== pw.confirm) { toast.error("Passwords don't match"); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password: pw.password });
    setLoading(false);
    if (err) {
      // Common case: recovery session expired between page load and submit.
      if (/session|expired|jwt/i.test(err.message)) {
        setStatus("expired");
        setLinkError("Your reset session expired. Please request a new link.");
      } else {
        toast.error(err.message);
      }
      return;
    }
    setDone(true);
    toast.success("Password updated — signing you in…");
    // The recovery session is still active; send the user straight to the dashboard.
    setTimeout(() => navigate({ to: "/dashboard" }), 1200);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-mint-tint px-4 py-10">
      <Link to="/" className="mb-8"><Logo /></Link>
      <div className="w-full max-w-md rounded-3xl bg-background p-8 shadow-soft border border-border">
        {done ? (
          <div className="text-center">
            <CheckCircle2 className="h-12 w-12 text-secondary mx-auto" />
            <h1 className="mt-4 font-display text-2xl font-extrabold text-forest">Password updated</h1>
            <p className="mt-2 text-sm text-foreground/70">Taking you to your dashboard…</p>
          </div>
        ) : status === "expired" || status === "invalid" ? (
          <div className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-extrabold text-forest">
              {status === "expired" ? "This link has expired" : "Invalid reset link"}
            </h1>
            <p className="mt-2 text-sm text-foreground/70">
              {linkError ?? "Please request a new password reset email to continue."}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild className="w-full rounded-full bg-forest text-mint hover:bg-forest/90">
                <Link to="/forgot-password">Request a new link</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full rounded-full">
                <Link to="/login">Back to login</Link>
              </Button>
            </div>
          </div>
        ) : status === "checking" ? (
          <div className="py-10 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-forest" />
            <p className="mt-3 text-sm text-foreground/60">Validating your reset link…</p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-extrabold text-forest">Set a new password</h1>
            <p className="mt-1 text-sm text-foreground/60">
              Choose a strong password you haven't used before.
            </p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label>New password</Label>
                <div className="relative">
                  <Input
                    type={show ? "text" : "password"}
                    value={pw.password}
                    onChange={(e) => setPw({ ...pw, password: e.target.value })}
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-foreground/55">Minimum 8 characters.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Confirm password</Label>
                <Input
                  type={show ? "text" : "password"}
                  value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-forest text-mint hover:bg-forest/90 font-bold"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
              </Button>
            </form>
          </>
        )}
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}
