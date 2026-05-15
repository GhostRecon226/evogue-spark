import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", whatsapp_number: "", avatar_url: "" });
  const [newPw, setNewPw] = useState("");
  const [enrolledCount, setEnrolledCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    setForm({
      full_name: profile?.full_name ?? user.user_metadata?.full_name ?? "",
      email: profile?.email ?? user.email ?? "",
      whatsapp_number: profile?.whatsapp_number ?? "",
      avatar_url: profile?.avatar_url ?? "",
    });
    supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("student_id", user.id)
      .then(({ count }) => setEnrolledCount(count ?? 0));
  }, [user, profile]);

  const accountCreated = profile?.created_at ?? user?.created_at;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      email: form.email,
      whatsapp_number: form.whatsapp_number,
      avatar_url: form.avatar_url,
    }).eq("id", user.id);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success("Profile saved");
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setForm((f) => ({ ...f, avatar_url: data.publicUrl }));
    toast.success("Photo uploaded — click Save to apply");
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 8) { toast.error("Min 8 characters"); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) { toast.error(error.message); return; }
    setNewPw("");
    toast.success("Password updated");
  };

  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl font-extrabold text-forest">Profile</h1>
      <p className="mt-1 text-foreground/65">Manage your personal details and account security.</p>

      {/* Registration number — prominent read-only highlight */}
      <div className="mt-6 max-w-2xl rounded-2xl border-2 border-mint bg-mint/15 p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-secondary">Registration Number</p>
          <p className="mt-1 font-mono text-2xl font-extrabold tracking-widest text-forest">
            {profile?.registration_number ?? "—"}
          </p>
        </div>
        {accountCreated && (
          <p className="text-xs text-foreground/60">
            Member since{" "}
            <span className="font-semibold text-forest">
              {new Date(accountCreated).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </p>
        )}
      </div>

      {/* Section 1 — Personal Details */}
      <form onSubmit={save} className="mt-6 max-w-2xl rounded-2xl bg-background border border-border p-6 space-y-5">
        <div>
          <h2 className="font-display text-lg font-bold text-forest">Personal Details</h2>
          <p className="text-xs text-foreground/55 mt-0.5">Your name, contact info, and profile photo.</p>
        </div>
        <div className="flex items-center gap-5">
          <Avatar className="h-20 w-20 ring-2 ring-mint/40">
            <AvatarImage src={form.avatar_url} />
            <AvatarFallback className="bg-mint text-forest font-bold">{form.full_name[0] ?? "U"}</AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="photo" className="cursor-pointer text-sm font-semibold text-secondary hover:underline">Upload new photo</Label>
            <input id="photo" type="file" accept="image/*" className="hidden" onChange={upload} />
            <p className="text-[11px] text-foreground/50 mt-1">PNG or JPG, square works best.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>WhatsApp number</Label><Input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} /></div>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
          <p className="text-xs text-foreground/55">Enrolled in <span className="font-semibold text-forest">{enrolledCount ?? "…"}</span> course{enrolledCount === 1 ? "" : "s"}</p>
          <Button type="submit" disabled={loading} className="rounded-full bg-[#0A2E1A] text-mint hover:bg-[#0A2E1A]/90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Section 2 — Security */}
      <form onSubmit={changePw} className="mt-6 max-w-2xl rounded-2xl bg-background border border-border p-6 space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold text-forest">Security</h2>
          <p className="text-xs text-foreground/55 mt-0.5">Change your password. Use at least 8 characters.</p>
        </div>
        <div className="space-y-1.5"><Label>New password</Label><Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} /></div>
        <Button type="submit" disabled={pwLoading} className="rounded-full bg-[#0A2E1A] text-mint hover:bg-[#0A2E1A]/90">
          {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
        </Button>
      </form>
    </DashboardLayout>
  );
}
