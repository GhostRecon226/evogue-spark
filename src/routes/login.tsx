import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: signIn, error } = await supabase.auth.signInWithPassword(form);
    if (error || !signIn.user) {
      setLoading(false);
      toast.error(error?.message ?? "Unable to sign in");
      return;
    }

    // Fetch profile to verify the account is active and decide where to land.
    const [{ data: profile }, { data: roleRows }] = await Promise.all([
      supabase.from("profiles").select("is_active, full_name").eq("id", signIn.user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", signIn.user.id),
    ]);

    if (profile && profile.is_active === false) {
      await supabase.auth.signOut();
      setLoading(false);
      toast.error("Your account has been suspended. Please contact Evogue Academy for support.");
      return;
    }

    const roles = (roleRows ?? []).map((r) => r.role as string);
    setLoading(false);
    toast.success(`Welcome back${profile?.full_name ? `, ${profile.full_name}` : ""}!`);

    if (roles.includes("admin")) {
      navigate({ to: "/admin" });
    } else if (roles.includes("instructor")) {
      navigate({ to: "/instructor" });
    } else {
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-mint-tint px-4 py-10">
      <Link to="/" className="mb-8"><Logo /></Link>
      <div className="w-full max-w-md rounded-3xl bg-background p-8 shadow-soft border border-border">
        <h1 className="font-display text-2xl font-extrabold text-forest">Welcome back</h1>
        <p className="mt-1 text-sm text-foreground/60">Login to continue learning.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5"><Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Password</Label>
            <div className="relative">
              <Input type={show ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-secondary font-semibold hover:underline">Forgot password?</Link>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-full bg-forest text-mint hover:bg-forest/90 font-bold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-center text-foreground/70">
          Don't have an account? <Link to="/contact" className="text-secondary font-semibold hover:underline">Contact us to enroll</Link>.
        </p>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}
