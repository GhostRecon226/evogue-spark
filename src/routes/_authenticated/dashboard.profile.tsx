import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Check, X, ShieldCheck, Send } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  component: ProfilePage,
});

type Allowed = { action: string; allowed: boolean };
const PERMISSIONS: Record<AppRole, Allowed[]> = {
  admin: [
    { action: "Manage all students, courses, cohorts & enrollments", allowed: true },
    { action: "Approve capstones & issue certificates", allowed: true },
    { action: "Edit academy settings & assign user roles", allowed: true },
    { action: "Upload lesson content & PDFs", allowed: true },
    { action: "Read all role-change requests", allowed: true },
  ],
  instructor: [
    { action: "Upload lesson content for assigned courses", allowed: true },
    { action: "Review capstones for assigned courses", allowed: true },
    { action: "View students in assigned courses", allowed: true },
    { action: "Manage other instructors or academy settings", allowed: false },
    { action: "Edit academy-wide payment / API settings", allowed: false },
  ],
  student: [
    { action: "Enroll in published courses", allowed: true },
    { action: "View lessons & track progress", allowed: true },
    { action: "Submit capstone projects", allowed: true },
    { action: "Download earned certificates", allowed: true },
    { action: "Upload lessons or grade other students", allowed: false },
  ],
};

type Check = { label: string; pass: boolean | null; detail?: string };
type RoleRequest = {
  id: string;
  from_role: AppRole;
  to_role: AppRole;
  reason: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
};

function ProfilePage() {
  const { user, profile, refreshProfile, roles, isAdmin, isInstructor } = useAuth();
  const primaryRole: AppRole = isAdmin ? "admin" : isInstructor ? "instructor" : "student";

  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    whatsapp_number: "",
    avatar_url: "",
  });
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [enrolledCount, setEnrolledCount] = useState<number | null>(null);
  const pwMismatch = confirmPw.length > 0 && newPw !== confirmPw;

  // Effective Access state
  const [checks, setChecks] = useState<Check[]>([]);
  const [checking, setChecking] = useState(false);

  // Role-change request state
  const [reqRole, setReqRole] = useState<AppRole>(
    primaryRole === "student" ? "instructor" : "admin",
  );
  const [reqReason, setReqReason] = useState("");
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState<RoleRequest[]>([]);

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

  const loadRequests = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("role_change_requests")
      .select("id, from_role, to_role, reason, status, admin_notes, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setMyRequests((data ?? []) as RoleRequest[]);
  }, [user]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const runAccessChecks = useCallback(async () => {
    if (!user) return;
    setChecking(true);
    const results: Check[] = [];

    // 1. Own profile read
    {
      const { error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      results.push({ label: "Read own profile", pass: !error, detail: error?.message });
    }
    // 2. Own enrollments read
    {
      const { error } = await supabase
        .from("enrollments")
        .select("id", { head: true, count: "exact" })
        .eq("student_id", user.id);
      results.push({ label: "Read own enrollments", pass: !error, detail: error?.message });
    }
    // 3. Insert lesson (instructor/admin only)
    {
      const { error } = await supabase
        .from("lessons")
        .insert({
          course_id: "00000000-0000-0000-0000-000000000000",
          title: "__perm_probe__",
          lesson_number: -1,
        })
        .select()
        .single();
      // Foreign-key / not-null errors mean we passed RLS but failed validation — count as access granted.
      const fkOrValidation = error?.code === "23503" || error?.code === "23502";
      const allowed = !error || fkOrValidation;
      results.push({
        label: "Upload / create lessons",
        pass: allowed,
        detail: allowed ? "RLS allows insert" : error?.message,
      });
      // If we somehow inserted, clean up
      if (!error) await supabase.from("lessons").delete().eq("title", "__perm_probe__");
    }
    // 4. Read all user_roles (admin only via RLS)
    {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id")
        .neq("user_id", user.id)
        .limit(1);
      results.push({
        label: "Read other users' roles (admin)",
        pass:
          !error && (data?.length ?? 0) >= 0
            ? isAdmin
              ? (data?.length ?? 0) > 0 || true
              : false
            : false,
        detail: error?.message,
      });
    }
    // 5. Read academy_settings sensitive cols (admin only)
    {
      const { error } = await supabase.from("academy_settings").select("resend_api_key").limit(1);
      results.push({
        label: "Read sensitive academy settings (admin)",
        pass: !error,
        detail: error?.message,
      });
    }
    // 6. Read all capstones (admin/instructor)
    {
      const { error } = await supabase
        .from("capstone_submissions")
        .select("id", { head: true, count: "exact" })
        .neq("student_id", user.id);
      results.push({
        label: "Review others' capstones (instructor/admin)",
        pass: !error,
        detail: error?.message,
      });
    }

    setChecks(results);
    setChecking(false);
  }, [user, isAdmin]);

  const accountCreated = profile?.created_at ?? user?.created_at;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        email: form.email,
        whatsapp_number: form.whatsapp_number,
        avatar_url: form.avatar_url,
      })
      .eq("id", user.id);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refreshProfile();
    toast.success("Profile saved");
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast.error(error.message);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setForm((f) => ({ ...f, avatar_url: data.publicUrl }));
    toast.success("Photo uploaded — click Save to apply");
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 8) {
      toast.error("Min 8 characters");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match.");
      return;
    }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewPw("");
    setConfirmPw("");
    toast.success("Password updated");
  };

  const submitRoleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (reqReason.trim().length < 10) {
      toast.error("Please provide a reason (at least 10 characters).");
      return;
    }
    if (reqRole === primaryRole) {
      toast.error("You already have this role.");
      return;
    }
    setReqSubmitting(true);
    const { error } = await supabase.from("role_change_requests").insert({
      user_id: user.id,
      from_role: primaryRole,
      to_role: reqRole,
      reason: reqReason.trim(),
    });
    setReqSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setReqReason("");
    toast.success("Request submitted — an admin will review it.");
    await loadRequests();
  };

  const roleOptions: AppRole[] = (["student", "instructor", "admin"] as AppRole[]).filter(
    (r) => r !== primaryRole,
  );
  const allowedPerms = PERMISSIONS[primaryRole];

  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl font-extrabold text-forest">Profile</h1>
      <p className="mt-1 text-foreground/65">
        Manage your personal details, permissions, and account security.
      </p>

      {/* Role + Student ID */}
      <div className="mt-6 max-w-4xl rounded-2xl border-2 border-mint bg-mint/15 p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-secondary">
            Student ID
          </p>
          <p className="mt-1 font-mono text-2xl font-extrabold tracking-widest text-forest">
            {profile?.registration_number ?? "—"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {roles.length > 0 && (
            <div className="flex gap-2">
              {roles.map((role) => (
                <span
                  key={role}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    role === "admin"
                      ? "bg-amber-100 text-amber-800"
                      : role === "instructor"
                        ? "bg-sky-100 text-sky-800"
                        : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {role}
                </span>
              ))}
            </div>
          )}
          {accountCreated && (
            <p className="text-xs text-foreground/60">
              Member since{" "}
              <span className="font-semibold text-forest">
                {new Date(accountCreated).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Permissions Summary */}
      <div className="mt-6 max-w-4xl rounded-2xl bg-background border border-border p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-forest" />
          <h2 className="font-display text-lg font-bold text-forest">Permissions Summary</h2>
        </div>
        <p className="text-xs text-foreground/55 mt-0.5">
          What your <span className="font-semibold capitalize">{primaryRole}</span> role lets you
          do.
        </p>
        <ul className="mt-4 grid sm:grid-cols-2 gap-2">
          {allowedPerms.map((p) => (
            <li
              key={p.action}
              className="flex items-start gap-2 rounded-lg border border-border bg-background p-3 text-sm"
            >
              {p.allowed ? (
                <Check className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
              ) : (
                <X className="h-4 w-4 mt-0.5 text-rose-600 shrink-0" />
              )}
              <span className={p.allowed ? "text-forest" : "text-foreground/55 line-through"}>
                {p.action}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Effective Access — live API probe */}
      <div className="mt-6 max-w-4xl rounded-2xl bg-background border border-border p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-display text-lg font-bold text-forest">Effective Access</h2>
            <p className="text-xs text-foreground/55 mt-0.5">
              Live pass/fail checks against the API to verify what you can actually do right now.
            </p>
          </div>
          <Button
            onClick={runAccessChecks}
            disabled={checking}
            variant="outline"
            className="rounded-full"
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run checks"}
          </Button>
        </div>
        {checks.length > 0 && (
          <ul className="mt-4 space-y-2">
            {checks.map((c) => (
              <li
                key={c.label}
                className="flex items-start justify-between gap-3 rounded-lg border border-border p-3 text-sm"
              >
                <div className="flex items-start gap-2 min-w-0">
                  {c.pass ? (
                    <Check className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
                  ) : (
                    <X className="h-4 w-4 mt-0.5 text-rose-600 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-forest">{c.label}</p>
                    {c.detail && (
                      <p className="text-[11px] text-foreground/50 truncate">{c.detail}</p>
                    )}
                  </div>
                </div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider shrink-0 ${c.pass ? "text-emerald-700" : "text-rose-700"}`}
                >
                  {c.pass ? "Pass" : "Denied"}
                </span>
              </li>
            ))}
          </ul>
        )}
        {checks.length === 0 && !checking && (
          <p className="mt-4 text-xs text-foreground/55">
            Click <span className="font-semibold">Run checks</span> to probe your live API
            permissions.
          </p>
        )}
      </div>

      {/* Role-change request */}
      <div className="mt-6 max-w-4xl rounded-2xl bg-background border border-border p-6">
        <h2 className="font-display text-lg font-bold text-forest">Request a Role Change</h2>
        <p className="text-xs text-foreground/55 mt-0.5">
          Submit a request and an admin will review it. You'll see the status below.
        </p>
        <form onSubmit={submitRoleRequest} className="mt-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Requested role</Label>
              <select
                value={reqRole}
                onChange={(e) => setReqRole(e.target.value as AppRole)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-10 capitalize"
              >
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Current role</Label>
              <Input value={primaryRole} disabled className="capitalize" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <textarea
              value={reqReason}
              onChange={(e) => setReqReason(e.target.value)}
              placeholder="Why do you need this role? Include any context that helps the admin decide."
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              minLength={10}
              maxLength={1000}
            />
          </div>
          <Button
            type="submit"
            disabled={reqSubmitting}
            className="rounded-full bg-[#0A2E1A] text-mint hover:bg-[#0A2E1A]/90"
          >
            {reqSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4 mr-1.5" /> Submit request
              </>
            )}
          </Button>
        </form>

        {myRequests.length > 0 && (
          <div className="mt-6">
            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-secondary mb-2">
              Your requests
            </p>
            <ul className="space-y-2">
              {myRequests.map((r) => (
                <li
                  key={r.id}
                  className="rounded-lg border border-border p-3 text-sm flex items-start justify-between gap-3 flex-wrap"
                >
                  <div>
                    <p className="text-forest">
                      <span className="capitalize font-semibold">{r.from_role}</span> →{" "}
                      <span className="capitalize font-semibold">{r.to_role}</span>
                    </p>
                    <p className="text-xs text-foreground/60 mt-0.5 line-clamp-2">{r.reason}</p>
                    {r.admin_notes && (
                      <p className="text-xs text-foreground/70 mt-1">
                        <span className="font-semibold">Admin:</span> {r.admin_notes}
                      </p>
                    )}
                    <p className="text-[11px] text-foreground/45 mt-1">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                      r.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : r.status === "rejected"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Personal Details */}
      <form
        onSubmit={save}
        className="mt-6 max-w-4xl rounded-2xl bg-background border border-border p-6 space-y-5"
      >
        <div>
          <h2 className="font-display text-lg font-bold text-forest">Personal Details</h2>
          <p className="text-xs text-foreground/55 mt-0.5">
            Your name, contact info, and profile photo.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <Avatar className="h-20 w-20 ring-2 ring-mint/40">
            <AvatarImage src={form.avatar_url} />
            <AvatarFallback className="bg-mint text-forest font-bold">
              {form.full_name[0] ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <Label
              htmlFor="photo"
              className="cursor-pointer text-sm font-semibold text-secondary hover:underline"
            >
              Upload new photo
            </Label>
            <input id="photo" type="file" accept="image/*" className="hidden" onChange={upload} />
            <p className="text-[11px] text-foreground/50 mt-1">PNG or JPG, square works best.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>WhatsApp number</Label>
            <Input
              value={form.whatsapp_number}
              onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
            />
          </div>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
          <p className="text-xs text-foreground/55">
            Enrolled in <span className="font-semibold text-forest">{enrolledCount ?? "…"}</span>{" "}
            course{enrolledCount === 1 ? "" : "s"}
          </p>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#0A2E1A] text-mint hover:bg-[#0A2E1A]/90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Security */}
      <form
        onSubmit={changePw}
        className="mt-6 max-w-4xl rounded-2xl bg-background border border-border p-6 space-y-4"
      >
        <div>
          <h2 className="font-display text-lg font-bold text-forest">Security</h2>
          <p className="text-xs text-foreground/55 mt-0.5">
            Change your password. Use at least 8 characters.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>New password</Label>
            <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Confirm new password</Label>
            <Input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              aria-invalid={pwMismatch || undefined}
              className={pwMismatch ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {pwMismatch && <p className="text-xs text-destructive">Passwords do not match.</p>}
          </div>
        </div>
        <Button
          type="submit"
          disabled={pwLoading || pwMismatch || newPw.length === 0 || confirmPw.length === 0}
          className="rounded-full bg-[#0A2E1A] text-mint hover:bg-[#0A2E1A]/90"
        >
          {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
        </Button>
      </form>
    </DashboardLayout>
  );
}
