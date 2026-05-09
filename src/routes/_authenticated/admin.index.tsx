import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, BookOpen, ClipboardCheck, Wallet, Loader2 } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DataTable, formatNaira, parsePrice, type Column } from "@/components/admin/DataTable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

type RecentRow = {
  id: string;
  student: string;
  course: string;
  enrolled_at: string;
  payment_status: string;
};

function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ students: 0, enrollments: 0, revenue: 0, activeCourses: 0 });
  const [recent, setRecent] = useState<RecentRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [studentsRes, enrolRes, coursesRes, recentRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("id, payment_status, course_id", { count: "exact" }),
        supabase.from("courses").select("id, price, is_published"),
        supabase.from("enrollments")
          .select("id, enrolled_at, payment_status, profiles:student_id(full_name, email), courses:course_id(title, price)")
          .order("enrolled_at", { ascending: false }).limit(50),
      ]);
      if (cancelled) return;

      const courseRows = coursesRes.data ?? [];
      const courseMap = new Map(courseRows.map((c) => [c.id, c]));
      const enrolRows = enrolRes.data ?? [];
      const revenue = enrolRows
        .filter((e) => e.payment_status === "paid")
        .reduce((sum, e) => sum + parsePrice(courseMap.get(e.course_id)?.price ?? null), 0);

      setStats({
        students: studentsRes.count ?? 0,
        enrollments: enrolRes.count ?? enrolRows.length,
        revenue,
        activeCourses: courseRows.filter((c) => c.is_published).length,
      });

      setRecent((recentRes.data ?? []).slice(0, 10).map((r) => ({
        id: r.id,
        student: r.profiles?.full_name || r.profiles?.email || "—",
        course: r.courses?.title || "—",
        enrolled_at: r.enrolled_at,
        payment_status: r.payment_status,
      })));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const cards = [
    { label: "Total Students", value: stats.students.toLocaleString(), icon: Users },
    { label: "Total Enrollments", value: stats.enrollments.toLocaleString(), icon: ClipboardCheck },
    { label: "Total Revenue", value: formatNaira(stats.revenue), icon: Wallet },
    { label: "Active Courses", value: stats.activeCourses.toLocaleString(), icon: BookOpen },
  ];

  const columns: Column<RecentRow>[] = [
    { key: "student", header: "Student", accessor: (r) => r.student },
    { key: "course", header: "Course", accessor: (r) => r.course },
    {
      key: "enrolled_at", header: "Date",
      accessor: (r) => r.enrolled_at,
      cell: (r) => new Date(r.enrolled_at).toLocaleDateString(),
    },
    {
      key: "payment_status", header: "Payment",
      accessor: (r) => r.payment_status,
      cell: (r) => <PaymentBadge status={r.payment_status} />,
    },
  ];

  return (
    <AdminGuard>
      <h1 className="font-display text-3xl font-extrabold text-forest">Admin Overview</h1>
      <p className="mt-1 text-foreground/65">A snapshot of activity across the academy.</p>

      {loading ? (
        <div className="grid place-items-center py-20 text-foreground/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <div key={c.label} className="rounded-2xl border border-border bg-background p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-foreground/55">{c.label}</p>
                  <c.icon className="h-5 w-5 text-secondary" />
                </div>
                <p className="mt-3 font-display text-3xl font-extrabold text-forest">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-end justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-forest">Recent Enrollments</h2>
            <Link to="/admin/enrollments" className="text-sm font-bold text-secondary">View all →</Link>
          </div>
          <div className="mt-4">
            <DataTable rows={recent} columns={columns} rowKey={(r) => r.id} pageSize={10}
              emptyMessage="No enrollments yet." />
          </div>
        </>
      )}
    </AdminGuard>
  );
}

export function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-secondary/15 text-secondary",
    pending: "bg-star/15 text-star",
    failed: "bg-destructive/15 text-destructive",
    refunded: "bg-foreground/10 text-foreground/70",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${map[status] ?? "bg-muted"}`}>
      {status}
    </span>
  );
}
