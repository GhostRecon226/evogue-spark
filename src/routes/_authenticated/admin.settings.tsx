import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Settings as SettingsIcon, Loader2, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { promoteToAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettingsPage,
});

type Settings = {
  id: string;
  academy_name: string;
  contact_email: string | null;
  whatsapp_number: string | null;
  location: string | null;
  logo_url: string | null;
  paystack_public_key: string | null;
  resend_api_key: string | null;
};

function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [admins, setAdmins] = useState<{ id: string; full_name: string | null; email: string | null }[]>([]);
  const promote = useServerFn(promoteToAdmin);

  const load = async () => {
    setLoading(true);
    const [settingsRes, rolesRes] = await Promise.all([
      supabase.from("academy_settings").select("*").limit(1).maybeSingle(),
      supabase.from("user_roles").select("user_id, profiles:user_id(full_name, email)").eq("role", "admin"),
    ]);
    setSettings(settingsRes.data as Settings | null);
    setAdmins((rolesRes.data ?? []).map((r: any) => ({
      id: r.user_id, full_name: r.profiles?.full_name, email: r.profiles?.email,
    })));
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const update = (k: keyof Settings, v: string) => {
    setSettings((s) => s ? { ...s, [k]: v } : s);
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase.from("academy_settings").update({
      academy_name: settings.academy_name,
      contact_email: settings.contact_email,
      whatsapp_number: settings.whatsapp_number,
      location: settings.location,
      logo_url: settings.logo_url,
      paystack_public_key: settings.paystack_public_key,
      resend_api_key: settings.resend_api_key,
    }).eq("id", settings.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Settings saved");
  };

  const addAdmin = async () => {
    if (!adminEmail.trim()) return;
    setPromoting(true);
    try {
      await promote({ data: { email: adminEmail.trim() } });
      toast.success("Admin role granted");
      setAdminEmail("");
      void load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setPromoting(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    const path = `logo-${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return; }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    update("logo_url", pub.publicUrl);
  };

  if (loading || !settings) {
    return <AdminGuard><div className="grid place-items-center py-20 text-foreground/50"><Loader2 className="h-6 w-6 animate-spin" /></div></AdminGuard>;
  }

  return (
    <AdminGuard>
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-6 w-6 text-secondary" />
        <h1 className="font-display text-3xl font-extrabold text-forest">Settings</h1>
      </div>
      <p className="mt-1 text-foreground/65">Academy details, payment keys, and admin accounts.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-5 shadow-soft">
          <h2 className="font-display text-lg font-extrabold text-forest">Academy</h2>
          <div className="mt-4 grid gap-3">
            <div>
              <Label>Academy name</Label>
              <Input value={settings.academy_name} onChange={(e) => update("academy_name", e.target.value)} />
            </div>
            <div>
              <Label>Contact email</Label>
              <Input type="email" value={settings.contact_email ?? ""} onChange={(e) => update("contact_email", e.target.value)} />
            </div>
            <div>
              <Label>WhatsApp number</Label>
              <Input value={settings.whatsapp_number ?? ""} onChange={(e) => update("whatsapp_number", e.target.value)} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={settings.location ?? ""} onChange={(e) => update("location", e.target.value)} />
            </div>
            <div>
              <Label>Logo</Label>
              <div className="flex items-center gap-3">
                {settings.logo_url && <img src={settings.logo_url} alt="Logo" className="h-12 w-12 rounded-lg object-cover" />}
                <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5 shadow-soft">
          <h2 className="font-display text-lg font-extrabold text-forest">API keys</h2>
          <div className="mt-4 grid gap-3">
            <div>
              <Label>Paystack public key</Label>
              <Input value={settings.paystack_public_key ?? ""} onChange={(e) => update("paystack_public_key", e.target.value)} placeholder="pk_live_…" />
            </div>
            <div>
              <Label>Resend API key</Label>
              <Input type="password" value={settings.resend_api_key ?? ""} onChange={(e) => update("resend_api_key", e.target.value)} placeholder="re_…" />
              <p className="mt-1 text-xs text-foreground/55">Stored in the database. Production secrets should be set as environment variables.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={save} disabled={saving} className="rounded-full bg-forest text-mint hover:bg-forest/90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save settings"}
        </Button>
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-background p-5 shadow-soft">
        <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-secondary" /><h2 className="font-display text-lg font-extrabold text-forest">Admin accounts</h2></div>
        <p className="mt-1 text-sm text-foreground/65">Promote an existing user to admin by email.</p>
        <div className="mt-4 flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[240px]">
            <Label>Email</Label>
            <Input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="user@example.com" />
          </div>
          <Button onClick={addAdmin} disabled={promoting} className="rounded-full bg-forest text-mint hover:bg-forest/90">
            {promoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" /> Add admin</>}
          </Button>
        </div>
        <ul className="mt-5 divide-y divide-border">
          {admins.map((a) => (
            <li key={a.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-forest">{a.full_name || "—"}</p>
                <p className="text-xs text-foreground/55">{a.email}</p>
              </div>
              <span className="text-xs font-bold text-secondary">ADMIN</span>
            </li>
          ))}
        </ul>
      </div>
    </AdminGuard>
  );
}
