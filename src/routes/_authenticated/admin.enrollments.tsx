import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Loader2 } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { PaymentBadge } from "./admin.index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/enrollments")({
  component: EnrollmentsPage,
});

type Row = {
  id: string;
  student: string;
  course_id: string;
  course: string;
  enrolled_at: string;
  payment_status: string;
  payment_reference: string | null;
};

function EnrollmentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("enrollments")
        .select("id, enrolled_at, payment_status, payment_reference, course_id, profiles:student_id(full_name, email), courses:course_id(title)")
        .order("enrolled_at", { ascending: false });
      setRows((data ?? []).map((r) => ({
        id: r.id,
        student: r.profiles?.full_name || r.profiles?.email || "—",
        course_id: r.course_id,
        course: r.courses?.title || "—",
        enrolled_at: r.enrolled_at,
        payment_status: r.payment_status,
        payment_reference: r.payment_reference,
      })));
      setLoading(false);
    })();
  }, []);

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
    { key: "student", header: "Student", accessor: (r) => r.student },
    { key: "course", header: "Course", accessor: (r) => r.course },
    { key: "enrolled_at", header: "Date", accessor: (r) => r.enrolled_at,
      cell: (r) => new Date(r.enrolled_at).toLocaleDateString() },
    { key: "payment_status", header: "Payment", accessor: (r) => r.payment_status,
      cell: (r) => <PaymentBadge status={r.payment_status} /> },
    { key: "payment_reference", header: "Reference", accessor: (r) => r.payment_reference ?? "—" },
  ];

  return (
    <AdminGuard>
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-6 w-6 text-secondary" />
        <h1 className="font-display text-3xl font-extrabold text-forest">Enrollments</h1>
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
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
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
