import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Users, Loader2, Search, Plus, Power, PowerOff, Eye } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { createStudent, setStudentActive, markEnrollmentPaid } from "@/lib/admin.functions";
import { formatUSD, getCoursePriceUSD } from "@/lib/coursePricing";

export const Route = createFileRoute("/_authenticated/admin/students")({
  component: StudentsPage,
});

type PaymentState = "paid" | "pending" | "unpaid";

type Student = {
  id: string;
  full_name: string;
  email: string;
  whatsapp_number: string | null;
  registration_number: string | null;
  is_active: boolean;
  created_at: string;
  enrolled_count: number;
  payment_state: PaymentState;
};

function StudentsPage() {
  const [rows, setRows] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [payFilter, setPayFilter] = useState<"all" | PaymentState>("all");
  const [open, setOpen] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const createFn = useServerFn(createStudent);
  const toggleActive = useServerFn(setStudentActive);

  const load = async () => {
    setLoading(true);
    const [profilesRes, enrolRes, rolesRes] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, full_name, email, whatsapp_number, registration_number, is_active, created_at, role",
        )
        .eq("role", "student")
        .order("created_at", { ascending: false }),
      supabase.from("enrollments").select("student_id, payment_status"),
      supabase.from("user_roles").select("user_id, role").in("role", ["admin", "instructor"]),
    ]);
    const excluded = new Set<string>();
    for (const r of rolesRes.data ?? []) excluded.add(r.user_id);
    const counts = new Map<string, number>();
    const pay = new Map<string, PaymentState>();
    for (const e of enrolRes.data ?? []) {
      counts.set(e.student_id, (counts.get(e.student_id) ?? 0) + 1);
      const prev = pay.get(e.student_id);
      if (e.payment_status === "paid") pay.set(e.student_id, "paid");
      else if (prev !== "paid") pay.set(e.student_id, "pending");
    }
    setRows(
      (profilesRes.data ?? [])
        .filter((p) => p.role === "student" && !excluded.has(p.id))
        .map((p) => ({
          id: p.id,
          full_name: p.full_name ?? "",
          email: p.email ?? "",
          whatsapp_number: p.whatsapp_number,
          registration_number: p.registration_number,
          is_active: p.is_active,
          created_at: p.created_at,
          enrolled_count: counts.get(p.id) ?? 0,
          payment_state: pay.get(p.id) ?? "unpaid",
        })),
    );
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let out = rows;
    if (payFilter !== "all") out = out.filter((r) => r.payment_state === payFilter);
    if (s)
      out = out.filter(
        (r) =>
          r.full_name.toLowerCase().includes(s) ||
          r.email.toLowerCase().includes(s) ||
          (r.registration_number ?? "").toLowerCase().includes(s),
      );
    return out;
  }, [rows, q, payFilter]);

  const onSuspend = async (id: string, next: boolean) => {
    try {
      await toggleActive({ data: { student_id: id, is_active: next } });
      toast.success(next ? "Account reactivated" : "Account suspended");
      void load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  const columns: Column<Student>[] = [
    {
      key: "registration_number",
      header: "Reg. No",
      accessor: (r) => r.registration_number ?? "—",
      cell: (r) => <span className="font-mono text-xs">{r.registration_number ?? "—"}</span>,
    },
    { key: "full_name", header: "Name", accessor: (r) => r.full_name || "—" },
    { key: "email", header: "Email", accessor: (r) => r.email },
    { key: "whatsapp_number", header: "WhatsApp", accessor: (r) => r.whatsapp_number ?? "—" },
    { key: "enrolled_count", header: "Courses", accessor: (r) => r.enrolled_count },
    {
      key: "created_at",
      header: "Joined",
      accessor: (r) => r.created_at,
      cell: (r) => new Date(r.created_at).toLocaleDateString(),
    },
    {
      key: "is_active",
      header: "Status",
      accessor: (r) => (r.is_active ? "active" : "suspended"),
      cell: (r) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${r.is_active ? "bg-secondary/15 text-secondary" : "bg-destructive/15 text-destructive"}`}
        >
          {r.is_active ? "Active" : "Suspended"}
        </span>
      ),
    },
    {
      key: "payment_state",
      header: "Payment Status",
      accessor: (r) => r.payment_state,
      cell: (r) => <PaymentPill state={r.payment_state} />,
    },
  ];

  return (
    <AdminGuard>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-secondary" />
          <h1 className="font-display text-3xl font-extrabold text-forest">Students</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-forest text-mint hover:bg-forest/90">
              <Plus className="h-4 w-4 mr-1" /> Add new student
            </Button>
          </DialogTrigger>
          <NewStudentDialog
            onCreated={() => {
              setOpen(false);
              void load();
            }}
            createFn={createFn}
          />
        </Dialog>
      </div>
      <p className="mt-1 text-foreground/65">All registered students.</p>

      <div className="mt-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/45" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, or Student ID…"
          className="pl-9 rounded-full"
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid place-items-center py-20 text-foreground/50">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <DataTable
            rows={filtered}
            columns={columns}
            rowKey={(r) => r.id}
            pageSize={10}
            emptyMessage="No students match."
            actions={(r) => (
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setProfileId(r.id)}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" /> View
                </Button>
                {r.is_active ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full text-destructive border-destructive/30"
                    onClick={() => onSuspend(r.id, false)}
                  >
                    <PowerOff className="h-3.5 w-3.5 mr-1" /> Suspend
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full text-secondary border-secondary/30"
                    onClick={() => onSuspend(r.id, true)}
                  >
                    <Power className="h-3.5 w-3.5 mr-1" /> Reactivate
                  </Button>
                )}
              </div>
            )}
          />
        )}
      </div>

      <StudentProfileDialog studentId={profileId} onClose={() => setProfileId(null)} onChanged={() => void load()} />
    </AdminGuard>
  );
}

function PaymentPill({ state }: { state: PaymentState }) {
  const styles =
    state === "paid"
      ? { background: "#e8f5ee", color: "#1A8C4E" }
      : state === "pending"
        ? { background: "#fef9e7", color: "#b7860b" }
        : { background: "#fdecea", color: "#c0392b" };
  const label = state === "paid" ? "Paid" : state === "pending" ? "Pending" : "Unpaid";
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold"
      style={styles}
    >
      {label}
    </span>
  );
}

function NewStudentDialog({
  onCreated,
  createFn,
}: {
  onCreated: () => void;
  createFn: ReturnType<typeof useServerFn<typeof createStudent>>;
}) {
  const [form, setForm] = useState({ full_name: "", email: "", whatsapp_number: "", password: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createFn({ data: form });
      toast.success("Student created");
      setForm({ full_name: "", email: "", whatsapp_number: "", password: "" });
      onCreated();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="font-display text-forest">Add new student</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="grid gap-3 mt-2">
        <div>
          <Label>Full name</Label>
          <Input
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <Label>WhatsApp number</Label>
          <Input
            required
            value={form.whatsapp_number}
            onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
          />
        </div>
        <div>
          <Label>Temporary password</Label>
          <Input
            required
            type="text"
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Min 8 characters"
          />
        </div>
        <p className="text-xs text-foreground/55">
          A Student ID is generated automatically. Share these credentials with the student.
        </p>
        <DialogFooter>
          <Button
            type="submit"
            disabled={busy}
            className="rounded-full bg-forest text-mint hover:bg-forest/90"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create student"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function StudentProfileDialog({
  studentId,
  onClose,
  onChanged,
}: {
  studentId: string | null;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const markPaidFn = useServerFn(markEnrollmentPaid);

  const fetchData = async (id: string) => {
    setLoading(true);
    const [p, e, c] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("enrollments")
        .select(
          "id, payment_status, enrolled_at, paid_at, courses:course_id(title, slug), cohorts:cohort_id(name)",
        )
        .eq("student_id", id),
      supabase
        .from("certificates")
        .select("id, issued_at, courses:course_id(title)")
        .eq("student_id", id),
    ]);
    setData({ profile: p.data, enrollments: e.data ?? [], certificates: c.data ?? [] });
    setLoading(false);
  };

  useEffect(() => {
    if (!studentId) {
      setData(null);
      return;
    }
    void fetchData(studentId);
  }, [studentId]);

  const handleMarkPaid = async (enrollmentId: string) => {
    setBusyId(enrollmentId);
    try {
      await markPaidFn({ data: { enrollment_id: enrollmentId } });
      toast.success("Marked as paid");
      if (studentId) await fetchData(studentId);
      onChanged?.();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Dialog open={!!studentId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-forest">Student profile</DialogTitle>
        </DialogHeader>
        {loading || !data ? (
          <div className="grid place-items-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-foreground/40" />
          </div>
        ) : (
          <div className="space-y-5 mt-2 text-sm">
            <div className="grid sm:grid-cols-2 gap-3 rounded-2xl border border-border bg-mint-tint/40 p-4">
              <Field label="Full name" value={data.profile?.full_name} />
              <Field label="Student ID" value={data.profile?.registration_number} mono />
              <Field label="Email" value={data.profile?.email} />
              <Field label="WhatsApp" value={data.profile?.whatsapp_number} />
              <Field label="Status" value={data.profile?.is_active ? "Active" : "Suspended"} />
              <Field
                label="Joined"
                value={new Date(data.profile?.created_at).toLocaleDateString()}
              />
            </div>

            <div>
              <h3 className="font-display font-bold text-forest mb-2">
                Payment Details ({data.enrollments.length})
              </h3>
              <ul className="divide-y divide-border rounded-xl border border-border">
                {data.enrollments.length === 0 && (
                  <li className="p-3 text-foreground/55">No enrollments.</li>
                )}
                {data.enrollments.map((en: any) => {
                  const fee = getCoursePriceUSD({
                    slug: en.courses?.slug ?? null,
                    title: en.courses?.title ?? null,
                  });
                  const state: PaymentState =
                    en.payment_status === "paid"
                      ? "paid"
                      : en.payment_status === "pending"
                        ? "pending"
                        : "unpaid";
                  return (
                    <li key={en.id} className="p-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div className="grid sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-forest/60">Course</p>
                          <p className="font-bold text-forest text-sm">
                            {en.courses?.title ?? "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-forest/60">Fee</p>
                          <p className="font-bold text-forest text-sm">{formatUSD(fee)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-forest/60">Status</p>
                          <PaymentPill state={state} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-forest/60">Paid on</p>
                          <p className="text-foreground/80">
                            {en.paid_at ? new Date(en.paid_at).toLocaleDateString() : "—"}
                          </p>
                        </div>
                      </div>
                      {state !== "paid" && (
                        <button
                          onClick={() => handleMarkPaid(en.id)}
                          disabled={busyId === en.id}
                          style={{
                            background: "#1A8C4E",
                            color: "#ffffff",
                            padding: "10px 20px",
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                          className="inline-flex items-center justify-center disabled:opacity-60"
                        >
                          {busyId === en.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Mark as Paid"
                          )}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h3 className="font-display font-bold text-forest mb-2">
                Certificates ({data.certificates.length})
              </h3>
              <ul className="divide-y divide-border rounded-xl border border-border">
                {data.certificates.length === 0 && (
                  <li className="p-3 text-foreground/55">None earned yet.</li>
                )}
                {data.certificates.map((cert: any) => (
                  <li key={cert.id} className="p-3 flex justify-between">
                    <span className="font-bold text-forest">{cert.courses?.title ?? "—"}</span>
                    <span className="text-xs text-foreground/55">
                      {new Date(cert.issued_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide font-bold text-forest/60">{label}</p>
      <p className={`mt-0.5 text-foreground/85 ${mono ? "font-mono text-xs" : ""}`}>
        {value || "—"}
      </p>
    </div>
  );
}
