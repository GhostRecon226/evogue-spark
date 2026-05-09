import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet, Loader2 } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DataTable, parsePrice, formatNaira, type Column } from "@/components/admin/DataTable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  component: PaymentsPage,
});

type Row = {
  id: string;
  student: string;
  course: string;
  amount: number;
  payment_reference: string | null;
  enrolled_at: string;
};

function PaymentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("enrollments")
        .select("id, enrolled_at, payment_reference, profiles:student_id(full_name, email), courses:course_id(title, price)")
        .eq("payment_status", "paid")
        .order("enrolled_at", { ascending: false });
      setRows((data ?? []).map((r) => ({
        id: r.id,
        student: r.profiles?.full_name || r.profiles?.email || "—",
        course: r.courses?.title || "—",
        amount: parsePrice(r.courses?.price ?? null),
        payment_reference: r.payment_reference,
        enrolled_at: r.enrolled_at,
      })));
      setLoading(false);
    })();
  }, []);

  const total = rows.reduce((s, r) => s + r.amount, 0);

  const columns: Column<Row>[] = [
    { key: "student", header: "Student", accessor: (r) => r.student },
    { key: "course", header: "Course", accessor: (r) => r.course },
    { key: "amount", header: "Amount", accessor: (r) => r.amount,
      cell: (r) => <span className="font-bold">{formatNaira(r.amount)}</span> },
    { key: "payment_reference", header: "Reference", accessor: (r) => r.payment_reference ?? "—" },
    { key: "enrolled_at", header: "Date", accessor: (r) => r.enrolled_at,
      cell: (r) => new Date(r.enrolled_at).toLocaleDateString() },
  ];

  return (
    <AdminGuard>
      <div className="flex items-center gap-3">
        <Wallet className="h-6 w-6 text-secondary" />
        <h1 className="font-display text-3xl font-extrabold text-forest">Payments</h1>
      </div>
      <p className="mt-1 text-foreground/65">All paid enrollments.</p>

      <div className="mt-6 rounded-2xl border border-border bg-gradient-to-br from-mint to-mint-tint p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-forest/70">Total Revenue</p>
        <p className="mt-2 font-display text-4xl font-extrabold text-forest">{formatNaira(total)}</p>
        <p className="mt-1 text-sm text-forest/70">{rows.length} successful payment{rows.length === 1 ? "" : "s"}</p>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid place-items-center py-20 text-foreground/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} pageSize={10}
            emptyMessage="No payments yet." />
        )}
      </div>
    </AdminGuard>
  );
}
