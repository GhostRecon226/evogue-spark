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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", whatsapp: "", avatar_url: "" });
  const [newPw, setNewPw] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      setForm({
        full_name: data?.full_name ?? user.user_metadata?.full_name ?? "",
        email: data?.email ?? user.email ?? "",
        whatsapp: data?.whatsapp ?? "",
        avatar_url: data?.avatar_url ?? "",
      });
    });
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id, full_name: form.full_name, email: form.email, whatsapp: form.whatsapp, avatar_url: form.avatar_url,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
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
      <p className="mt-1 text-foreground/65">Update your details and photo.</p>

      <form onSubmit={save} className="mt-8 max-w-xl rounded-2xl bg-background border border-border p-6 space-y-5">
        <div className="flex items-center gap-5">
          <Avatar className="h-20 w-20"><AvatarImage src={form.avatar_url} /><AvatarFallback>{form.full_name[0] ?? "U"}</AvatarFallback></Avatar>
          <div>
            <Label htmlFor="photo" className="cursor-pointer text-sm font-semibold text-secondary hover:underline">Upload new photo</Label>
            <input id="photo" type="file" accept="image/*" className="hidden" onChange={upload} />
          </div>
        </div>
        <div className="space-y-1.5"><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
        <Button type="submit" disabled={loading} className="rounded-full bg-forest text-mint hover:bg-forest/90">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
        </Button>
      </form>

      <form onSubmit={changePw} className="mt-6 max-w-xl rounded-2xl bg-background border border-border p-6 space-y-4">
        <h2 className="font-display font-bold text-forest">Change password</h2>
        <div className="space-y-1.5"><Label>New password</Label><Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} /></div>
        <Button type="submit" disabled={pwLoading} variant="outline" className="rounded-full">
          {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
        </Button>
      </form>
    </DashboardLayout>
  );
}
