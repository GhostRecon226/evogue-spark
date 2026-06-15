import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Wallet, Loader2, Download, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  component: PaymentsPage,
});

type Row = {
  id: string;
  student_id: string;
  student: string;
  registration_number: string | null;
  course_id: string;
  course: string;
  amount: number;
  currency: string;
  payment_status: string;
  coupon_code: string | null;
  flutterwave_tx_id: string | null;
  paid_at: string | null;
  created_at: string;
};

function statusPillStyle(status: string) {
  if (status === "paid") return "bg-emerald-100 text-emerald-700";
  if (status === "pending") return "bg-amber-100 text-amber-700";
  if (status === "failed") return "bg-red-100 text-red-700";
  return "bg-foreground/10 text-foreground/70";
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function PaymentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("payments")
      .select(
        "id, amount, currency, payment_status, flutterwave_tx_id, paid_at, created_at, student_id, course_id, profiles:student_id(full_name, email, registration_number), courses:course_id(title), coupon_codes:coupon_id(code)",
      )
      .order("created_at", { ascending: false });
    setRows(
      (data ?? []).map((r: any) => ({
        id: r.id,
        student_id: r.student_id,
        student: r.profiles?.full_name || r.profiles?.email || "—",
        registration_number: r.profiles?.registration_number ?? null,
        course_id: r.course_id,
        course: r.courses?.title || "—",
        amount: Number(r.amount) || 0,
        currency: r.currency || "USD",
        payment_status: r.payment_status,
        coupon_code: r.coupon_codes?.code ?? null,
        flutterwave_tx_id: r.flutterwave_tx_id,
        paid_at: r.paid_at,
        created_at: r.created_at,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    void load();
    const ch = supabase
      .channel("admin-payments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, []);

  const markPaid = async (id: string) => {
    const prev = rows;
    const nowIso = new Date().toISOString();
    setRows((rs) =>
      rs.map((x) => (x.id === id ? { ...x, payment_status: "paid", paid_at: nowIso } : x)),
    );
    const { error } = await supabase
      .from("payments")
      .update({ payment_status: "paid", paid_at: nowIso })
      .eq("id", id);
    if (error) {
      setRows(prev);
      toast.error(error.message);
    } else {
      toast.success("Payment marked as paid");
    }
  };

  const courses = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rows) m.set(r.course_id, r.course);
    return Array.from(m.entries());
  }, [rows]);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (courseFilter !== "all" && r.course_id !== courseFilter) return false;
        if (statusFilter !== "all" && r.payment_status !== statusFilter) return false;
        const ref = r.paid_at ?? r.created_at;
        if (from && new Date(ref) < new Date(from)) return false;
        if (to && new Date(ref) > new Date(to + "T23:59:59")) return false;
        return true;
      }),
    [rows, courseFilter, statusFilter, from, to],
  );

  const totals = useMemo(() => {
    let usd = 0;
    let ngn = 0;
    for (const r of filtered) {
      if (r.payment_status !== "paid") continue;
      if (r.currency === "USD") usd += r.amount;
      else if (r.currency === "NGN") ngn += r.amount;
    }
    return { usd, ngn };
  }, [filtered]);

  const exportCsv = () => {
    const head = [
      "Student",
      "Student ID",
      "Course",
      "Amount",
      "Currency",
      "Status",
      "Coupon",
      "Reference",
      "Paid At",
    ];
    const lines = [head.join(",")];
    for (const r of filtered) {
      const cells = [
        r.student,
        r.registration_number ?? "",
        r.course,
        String(r.amount),
        r.currency,
        r.payment_status,
        r.coupon_code ?? "None",
        r.flutterwave_tx_id ?? "",
        r.paid_at ? new Date(r.paid_at).toISOString() : "",
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
      lines.push(cells.join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<Row>[] = [
    { key: "student", header: "Student Name", accessor: (r) => r.student },
    {
      key: "registration_number",
      header: "Student ID",
      accessor: (r) => r.registration_number ?? "—",
      cell: (r) => <span className="font-mono text-xs">{r.registration_number ?? "—"}</span>,
    },
    { key: "course", header: "Course", accessor: (r) => r.course },
    {
      key: "amount",
      header: "Amount",
      accessor: (r) => r.amount,
      cell: (r) => <span className="font-bold">{formatMoney(r.amount, r.currency)}</span>,
    },
    { key: "currency", header: "Currency", accessor: (r) => r.currency },
    {
      key: "payment_status",
      header: "Status",
      accessor: (r) => r.payment_status,
      cell: (r) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusPillStyle(r.payment_status)}`}
        >
          {r.payment_status}
        </span>
      ),
    },
    {
      key: "coupon_code",
      header: "Coupon Used",
      accessor: (r) => r.coupon_code ?? "None",
      cell: (r) =>
        r.coupon_code ? (
          <span className="font-mono text-xs">{r.coupon_code}</span>
        ) : (
          <span className="text-foreground/50">None</span>
        ),
    },
    {
      key: "flutterwave_tx_id",
      header: "Reference",
      accessor: (r) => r.flutterwave_tx_id ?? "—",
      cell: (r) => (
        <span className="font-mono text-xs">{r.flutterwave_tx_id ?? "—"}</span>
      ),
    },
    {
      key: "paid_at",
      header: "Date Paid",
      accessor: (r) => r.paid_at ?? "",
      cell: (r) => (r.paid_at ? new Date(r.paid_at).toLocaleDateString() : "—"),
    },
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
      <p className="mt-1 text-foreground/65">All recorded payments.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-[#ECFDF5] p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[#1A8C4E]">
            Paid (USD)
          </p>
          <p className="mt-2 font-display text-2xl font-extrabold text-[#0A2E1A]">
            {formatMoney(totals.usd, "USD")}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-[#ECFDF5] p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[#1A8C4E]">
            Paid (NGN)
          </p>
          <p className="mt-2 font-display text-2xl font-extrabold text-[#0A2E1A]">
            {formatMoney(totals.ngn, "NGN")}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 items-end">
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-52 rounded-full">
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {courses.map(([id, title]) => (
              <SelectItem key={id} value={id}>
                {title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 rounded-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <div>
          <p className="text-xs font-bold text-foreground/60 mb-1">From</p>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-full"
          />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground/60 mb-1">To</p>
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-full"
          />
        </div>
        {(courseFilter !== "all" || statusFilter !== "all" || from || to) && (
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => {
              setCourseFilter("all");
              setStatusFilter("all");
              setFrom("");
              setTo("");
            }}
          >
            Clear filters
          </Button>
        )}
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
            emptyMessage="No payments recorded yet."
            actions={(r) =>
              r.payment_status !== "paid" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="rounded-full">
                      Actions <ChevronDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => markPaid(r.id)}>
                      Mark as Paid
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span className="text-xs text-foreground/40">—</span>
              )
            }
          />
        )}
      </div>
    </AdminGuard>
  );
}
