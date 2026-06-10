import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2, GraduationCap, Sparkles, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { Logo } from "@/components/landing/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Login — Evogue Academy" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword(form);
    if (signInError || !signIn.user) {
      setLoading(false);
      const msg = "Invalid email or password. Please try again.";
      setError(msg);
      toast.error(msg);
      return;
    }

    const [{ data: profile }, { data: roleRows }] = await Promise.all([
      supabase
        .from("profiles")
        .select("is_active, full_name")
        .eq("id", signIn.user.id)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", signIn.user.id),
    ]);

    if (profile && profile.is_active === false) {
      await supabase.auth.signOut();
      setLoading(false);
      const msg = "Your account has been suspended. Contact hello@evogueacademy.com for support.";
      setError(msg);
      toast.error(msg);
      return;
    }

    const roles = (roleRows ?? []).map((r) => r.role as string);
    setLoading(false);
    toast.success(`Welcome back${profile?.full_name ? `, ${profile.full_name}` : ""}!`);

    if (roles.includes("admin")) navigate({ to: "/admin" });
    else if (roles.includes("instructor")) navigate({ to: "/instructor" });
    else navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen w-full bg-mint-tint flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-background rounded-3xl shadow-soft overflow-hidden border border-border min-h-[600px]">
        {/* Left Panel — hidden on mobile */}
        <div className="hidden lg:flex relative flex-col justify-between p-10 xl:p-12 bg-forest text-white overflow-hidden">
          {/* Hexagon pattern overlay */}
          <svg
            className="absolute inset-0 h-full w-full opacity-[0.07] pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="hex"
                width="56"
                height="49"
                patternUnits="userSpaceOnUse"
                patternTransform="scale(1.2)"
              >
                <polygon
                  points="28,2 54,16 54,42 28,56 2,42 2,16"
                  fill="none"
                  stroke="#00F5A0"
                  strokeWidth="1.2"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex)" />
          </svg>

          {/* Glow accents */}
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-mint/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-secondary/30 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <Link to="/" className="inline-block">
              <Logo variant="light" />
            </Link>
          </div>

          <div className="relative z-10 space-y-6 my-8">
            <h2 className="font-display text-4xl xl:text-5xl font-extrabold leading-[1.05] text-white">
              Train. Build.
              <br />
              Launch Your Career.
            </h2>
            <p className="text-mint text-lg font-medium">Built in Africa. Open to the world.</p>

            {/* Abstract illustration */}
            <div className="pt-8">
              <svg
                viewBox="0 0 400 260"
                className="w-full max-w-md"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Floating dashboard card */}
                <rect
                  x="60"
                  y="60"
                  width="280"
                  height="160"
                  rx="16"
                  fill="#1A8C4E"
                  opacity="0.25"
                />
                <rect
                  x="80"
                  y="80"
                  width="240"
                  height="140"
                  rx="12"
                  fill="#0A2E1A"
                  stroke="#00F5A0"
                  strokeWidth="1.5"
                />

                {/* Header bar */}
                <rect x="96" y="96" width="80" height="10" rx="5" fill="#00F5A0" />
                <rect x="96" y="114" width="140" height="6" rx="3" fill="#1A8C4E" />

                {/* Bar chart */}
                <rect x="96" y="170" width="18" height="32" rx="3" fill="#1A8C4E" />
                <rect x="120" y="156" width="18" height="46" rx="3" fill="#00F5A0" />
                <rect x="144" y="144" width="18" height="58" rx="3" fill="#1A8C4E" />
                <rect x="168" y="160" width="18" height="42" rx="3" fill="#00F5A0" />
                <rect x="192" y="138" width="18" height="64" rx="3" fill="#1A8C4E" />

                {/* Stat circle */}
                <circle cx="270" cy="160" r="32" fill="none" stroke="#1A8C4E" strokeWidth="6" />
                <circle
                  cx="270"
                  cy="160"
                  r="32"
                  fill="none"
                  stroke="#00F5A0"
                  strokeWidth="6"
                  strokeDasharray="150 200"
                  strokeLinecap="round"
                  transform="rotate(-90 270 160)"
                />
                <text
                  x="270"
                  y="166"
                  textAnchor="middle"
                  fill="#00F5A0"
                  fontSize="14"
                  fontWeight="700"
                >
                  87%
                </text>

                {/* Floating chips */}
                <g>
                  <rect x="20" y="40" width="86" height="32" rx="16" fill="#00F5A0" />
                  <text
                    x="63"
                    y="60"
                    textAnchor="middle"
                    fill="#0A2E1A"
                    fontSize="11"
                    fontWeight="700"
                  >
                    LIVE CLASS
                  </text>
                </g>
                <g>
                  <rect
                    x="300"
                    y="30"
                    width="80"
                    height="30"
                    rx="15"
                    fill="#1A8C4E"
                    stroke="#00F5A0"
                    strokeWidth="1.5"
                  />
                  <text
                    x="340"
                    y="50"
                    textAnchor="middle"
                    fill="#00F5A0"
                    fontSize="11"
                    fontWeight="700"
                  >
                    +12 XP
                  </text>
                </g>
                <g>
                  <rect
                    x="290"
                    y="210"
                    width="100"
                    height="34"
                    rx="17"
                    fill="#0A2E1A"
                    stroke="#00F5A0"
                    strokeWidth="1.5"
                  />
                  <circle cx="307" cy="227" r="6" fill="#00F5A0" />
                  <text x="320" y="232" fill="#ffffff" fontSize="11" fontWeight="600">
                    Certified
                  </text>
                </g>
              </svg>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-10 xl:gap-14 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-mint" /> 1.2k+ Students
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-mint" /> 500+ Hours Live instruction
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-mint" /> 87% Job Outcome
            </div>
          </div>
        </div>

        {/* Right Panel — form */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-16">
          <div className="lg:hidden mb-6 flex justify-center">
            <Link to="/">
              <Logo />
            </Link>
          </div>

          <div className="max-w-md w-full mx-auto">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-forest">
              Welcome back
            </h1>
            <p className="mt-2 text-foreground/60">Log in to access your dashboard.</p>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="h-12 rounded-xl focus-visible:ring-secondary focus-visible:border-secondary"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={show ? "text" : "password"}
                    placeholder="Your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="h-12 rounded-xl pr-11 focus-visible:ring-secondary focus-visible:border-secondary"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-secondary"
                    aria-label={show ? "Hide password" : "Show password"}
                    data-tap-exempt
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {error ? <p className="text-sm text-destructive pt-1">{error}</p> : null}
                <div className="text-right pt-1">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-secondary font-semibold hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-forest text-mint hover:bg-secondary hover:text-mint font-bold transition-colors"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log In"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-wider text-foreground/40">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="text-sm text-center text-foreground/70">
              Don't have an account?{" "}
              <Link to="/contact" className="text-secondary font-semibold hover:underline">
                Contact us to enroll
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}
