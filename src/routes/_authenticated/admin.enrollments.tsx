import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ClipboardCheck, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { PaymentBadge } from "./admin.index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { adminCreateEnrollment } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/enrollments")({
  component: EnrollmentsPage,
});

type Row = {
  id: string;
  registration_number: string | null;
  student: string;
  course_id: string;
  course: string;
  cohort: string | null;
  enrolled_at: string;
  payment_status: string;
  payment_reference: string | null;
  enrolled_by_name: string | null;
};

function EnrollmentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const createFn = useServerFn(adminCreateEnrollment);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("enrollments")
      .select("id, enrolled_at, payment_status, payment_reference, course_id, enrolled_by, profiles:student_id(full_name, email, registration_number), courses:course_id(title), cohorts:cohort_id(name)")
      .order("enrolled_at", { ascending: false });
    const enrolledByIds = Array.from(new Set((data ?? []).map((r) => r.enrolled_by).filter(Boolean) as string[]));
    const adminMap = new Map<string, string>();
    if (enrolledByIds.length) {
      const { data: admins } = await supabase.from("profiles").select("id, full_name, email").in("id", enrolledByIds);
      for (const a of admins ?? []) adminMap.set(a.id, a.full_name || a.email || "—");
    }
    setRows((data ?? []).map((r: any) => ({
      id: r.id,
      registration_number: r.profiles?.registration_number ?? null,
      student: r.profiles?.full_name || r.profiles?.email || "—",
      course_id: r.course_id,
      course: r.courses?.title || "—",
      cohort: r.cohorts?.name ?? null,
      enrolled_at: r.enrolled_at,
      payment_status: r.payment_status,
      payment_reference: r.payment_reference,
      enrolled_by_name: r.enrolled_by ? (adminMap.get(r.enrolled_by) ?? "—") : null,
    })));
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const courses = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of rows) seen.set(r.course_id, r.course);
    return Array.from(seen.entries());
  }, [rows]);

  const filtered = useMemo(() => rows.filter((r) =>
    (courseFilter === "all" || r.course_id === courseFilter) &&
    (statusFilter === "all" || r.payment_status === statusFilter)
  ), [rows, courseFilter, statusFilter]);

  const columns: Column<Row>[] = [
    { key: "registration_number", header: "Reg. No", accessor: (r) => r.registration_number ?? "—",
      cell: (r) => <span className="font-mono text-xs">{r.registration_number ?? "—"}</span> },
    { key: "student", header: "Student", accessor: (r) => r.student },
    { key: "course", header: "Course", accessor: (r) => r.course },
    { key: "cohort", header: "Cohort", accessor: (r) => r.cohort ?? "—" },
    { key: "enrolled_at", header: "Date", accessor: (r) => r.enrolled_at,
      cell: (r) => new Date(r.enrolled_at).toLocaleDateString() },
    { key: "payment_status", header: "Payment", accessor: (r) => r.payment_status,
      cell: (r) => <PaymentBadge status={r.payment_status} /> },
    { key: "payment_reference", header: "Reference", accessor: (r) => r.payment_reference ?? "—" },
    { key: "enrolled_by_name", header: "Enrolled by", accessor: (r) => r.enrolled_by_name ?? "—" },
  ];

  return (
    <AdminGuard>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-6 w-6 text-secondary" />
          <h1 className="font-display text-3xl font-extrabold text-forest">Enrollments</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-forest text-mint hover:bg-forest/90">
              <Plus className="h-4 w-4 mr-1" /> Create enrollment
            </Button>
          </DialogTrigger>
          <NewEnrollmentDialog createFn={createFn} onCreated={() => { setOpen(false); void load(); }} />
        </Dialog>
      </div>
      <p className="mt-1 text-foreground/65">All course enrollments across the academy.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-56 rounded-full"><SelectValue placeholder="Course" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {courses.map(([id, title]) => <SelectItem key={id} value={id}>{title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 rounded-full"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid place-items-center py-20 text-foreground/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <DataTable rows={filtered} columns={columns} rowKey={(r) => r.id} pageSize={10}
            emptyMessage="No enrollments match." />
        )}
      </div>
    </AdminGuard>
  );
}

function NewEnrollmentDialog({
  createFn, onCreated,
}: { createFn: ReturnType<typeof useServerFn<typeof adminCreateEnrollment>>; onCreated: () => void }) {
  const [students, setStudents] = useState<{ id: string; label: string }[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [cohorts, setCohorts] = useState<{ id: string; name: string; course_id: string }[]>([]);
  const [form, setForm] = useState({
    student_id: "", course_id: "", cohort_id: "",
    payment_status: "paid" as "paid" | "pending",
    payment_reference: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const [s, c, co] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, registration_number").order("created_at", { ascending: false }),
        supabase.from("courses").select("id, title").order("title"),
        supabase.from("cohorts").select("id, name, course_id").order("start_date", { ascending: false }),
      ]);
      setStudents((s.data ?? []).map((p) => ({ id: p.id, label: `${p.registration_number ?? ""} · ${p.full_name || p.email || ""}` })));
      setCourses(c.data ?? []);
      setCohorts(co.data ?? []);
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id || !form.course_id) return toast.error("Student and course required");
    setBusy(true);
    try {
      await createFn({ data: {
        student_id: form.student_id,
        course_id: form.course_id,
        cohort_id: form.cohort_id || null,
        payment_status: form.payment_status,
        payment_reference: form.payment_reference || null,
      } });
      toast.success("Enrollment created");
      onCreated();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  };

  const courseCohorts = cohorts.filter((c) => c.course_id === form.course_id);

  return (
    <DialogContent>
      <DialogHeader><DialogTitle className="font-display text-forest">Create enrollment</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="grid gap-3 mt-2">
        <div>
          <Label>Student</Label>
          <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
            <SelectTrigger><SelectValue placeholder="Select student…" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Course</Label>
          <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v, cohort_id: "" })}>
            <SelectTrigger><SelectValue placeholder="Select course…" /></SelectTrigger>
            <SelectContent>
              {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Cohort (optional)</Label>
          <Select value={form.cohort_id} onValueChange={(v) => setForm({ ...form, cohort_id: v })}>
            <SelectTrigger><SelectValue placeholder={form.course_id ? "Select cohort…" : "Choose course first"} /></SelectTrigger>
            <SelectContent>
              {courseCohorts.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Payment status</Label>
          <Select value={form.payment_status} onValueChange={(v: "paid" | "pending") => setForm({ ...form, payment_status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Payment reference (optional)</Label>
          <Input value={form.payment_reference} onChange={(e) => setForm({ ...form, payment_reference: e.target.value })} />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={busy} className="rounded-full bg-forest text-mint hover:bg-forest/90">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
