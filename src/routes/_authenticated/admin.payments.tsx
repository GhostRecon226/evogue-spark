import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Wallet, Loader2, Download } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DataTable, parsePrice, formatNaira, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  component: PaymentsPage,
});

type Row = {
  id: string;
  registration_number: string | null;
  student: string;
  course_id: string;
  course: string;
  cohort: string | null;
  amount: number;
  payment_reference: string | null;
  enrolled_at: string;
};

function PaymentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("all");
  const [cohortFilter, setCohortFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("enrollments")
        .select("id, enrolled_at, payment_reference, course_id, profiles:student_id(full_name, email, registration_number), courses:course_id(title, price), cohorts:cohort_id(name)")
        .eq("payment_status", "paid")
        .order("enrolled_at", { ascending: false });
      setRows((data ?? []).map((r: any) => ({
        id: r.id,
        registration_number: r.profiles?.registration_number ?? null,
        student: r.profiles?.full_name || r.profiles?.email || "—",
        course_id: r.course_id,
        course: r.courses?.title || "—",
        cohort: r.cohorts?.name ?? null,
        amount: parsePrice(r.courses?.price ?? null),
        payment_reference: r.payment_reference,
        enrolled_at: r.enrolled_at,
      })));
      setLoading(false);
    })();
  }, []);

  const courses = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rows) m.set(r.course_id, r.course);
    return Array.from(m.entries());
  }, [rows]);
  const cohorts = useMemo(() => Array.from(new Set(rows.map((r) => r.cohort).filter(Boolean) as string[])), [rows]);

  const filtered = useMemo(() => rows.filter((r) => {
    if (courseFilter !== "all" && r.course_id !== courseFilter) return false;
    if (cohortFilter !== "all" && r.cohort !== cohortFilter) return false;
    if (from && new Date(r.enrolled_at) < new Date(from)) return false;
    if (to && new Date(r.enrolled_at) > new Date(to + "T23:59:59")) return false;
    return true;
  }), [rows, courseFilter, cohortFilter, from, to]);

  const total = filtered.reduce((s, r) => s + r.amount, 0);

  const exportCsv = () => {
    const head = ["Student ID", "Student", "Course", "Cohort", "Amount (NGN)", "Reference", "Date"];
    const lines = [head.join(",")];
    for (const r of filtered) {
      const cells = [
        r.registration_number ?? "",
        r.student, r.course, r.cohort ?? "",
        String(r.amount), r.payment_reference ?? "",
        new Date(r.enrolled_at).toISOString(),
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
      lines.push(cells.join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const columns: Column<Row>[] = [
    { key: "registration_number", header: "Reg. No", accessor: (r) => r.registration_number ?? "—",
      cell: (r) => <span className="font-mono text-xs">{r.registration_number ?? "—"}</span> },
    { key: "student", header: "Student", accessor: (r) => r.student },
    { key: "course", header: "Course", accessor: (r) => r.course },
    { key: "cohort", header: "Cohort", accessor: (r) => r.cohort ?? "—" },
    { key: "amount", header: "Amount", accessor: (r) => r.amount,
      cell: (r) => <span className="font-bold">{formatNaira(r.amount)}</span> },
    { key: "payment_reference", header: "Reference", accessor: (r) => r.payment_reference ?? "—" },
    { key: "enrolled_at", header: "Date", accessor: (r) => r.enrolled_at,
      cell: (r) => new Date(r.enrolled_at).toLocaleDateString() },
  ];

  return (
    <AdminGuard>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Wallet className="h-6 w-6 text-secondary" />
          <h1 className="font-display text-3xl font-extrabold text-forest">Payments</h1>
        </div>
        <Button onClick={exportCsv} variant="outline" className="rounded-full">
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
      </div>
      <p className="mt-1 text-foreground/65">All paid enrollments.</p>

      <div className="mt-6 rounded-2xl border border-border bg-[#ECFDF5] p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[#1A8C4E]">Total Revenue (filtered)</p>
        <p className="mt-2 font-display text-3xl font-extrabold text-[#0A2E1A]">{formatNaira(total)}</p>
        <p className="mt-1 text-sm text-[#0A2E1A]/65">{filtered.length} payment{filtered.length === 1 ? "" : "s"}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 items-end">
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-52 rounded-full"><SelectValue placeholder="Course" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {courses.map(([id, title]) => <SelectItem key={id} value={id}>{title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={cohortFilter} onValueChange={setCohortFilter}>
          <SelectTrigger className="w-44 rounded-full"><SelectValue placeholder="Cohort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cohorts</SelectItem>
            {cohorts.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div>
          <p className="text-xs font-bold text-foreground/60 mb-1">From</p>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-full" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground/60 mb-1">To</p>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-full" />
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid place-items-center py-20 text-foreground/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <DataTable rows={filtered} columns={columns} rowKey={(r) => r.id} pageSize={10}
            emptyMessage="No payments match." />
        )}
      </div>
    </AdminGuard>
  );
}
