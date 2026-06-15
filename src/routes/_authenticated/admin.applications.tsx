import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/applications")({
  component: ApplicationsPage,
});

type Status = "new" | "contacted" | "enrolled" | "rejected";

type AppRow = {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string | null;
  country: string | null;
  course_slug: string | null;
  message: string | null;
  status: Status;
  created_at: string;
};

const STATUS_STYLE: Record<Status, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  enrolled: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

function truncate(s: string | null, n = 60) {
  if (!s) return "—";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function ApplicationsPage() {
  const [rows, setRows] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("applications")
      .select("id, full_name, email, whatsapp, country, course_slug, message, status, created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as AppRow[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    const ch = supabase
      .channel("admin-applications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, []);

  const updateStatus = async (id: string, status: Status) => {
    const prev = rows;
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) {
      setRows(prev);
      toast.error(error.message);
    } else {
      toast.success(`Marked as ${status}`);
    }
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!s) return true;
      return (
        r.full_name.toLowerCase().includes(s) ||
        r.email.toLowerCase().includes(s) ||
        (r.country ?? "").toLowerCase().includes(s) ||
        (r.course_slug ?? "").toLowerCase().includes(s)
      );
    });
  }, [rows, q, statusFilter]);

  const columns: Column<AppRow>[] = [
    { key: "full_name", header: "Full Name", accessor: (r) => r.full_name },
    { key: "email", header: "Email", accessor: (r) => r.email },
    { key: "whatsapp", header: "WhatsApp", accessor: (r) => r.whatsapp ?? "—" },
    { key: "country", header: "Country", accessor: (r) => r.country ?? "—" },
    {
      key: "course_slug",
      header: "Course Interest",
      accessor: (r) => r.course_slug ?? "—",
      cell: (r) => <span className="capitalize">{(r.course_slug ?? "—").replace(/-/g, " ")}</span>,
    },
    {
      key: "message",
      header: "Message",
      accessor: (r) => r.message ?? "",
      cell: (r) => (
        <button
          type="button"
          className="text-left text-foreground/75 hover:text-forest"
          onClick={() => setExpanded(expanded === r.id ? null : r.id)}
        >
          {expanded === r.id ? r.message || "—" : truncate(r.message)}
        </button>
      ),
    },
    {
      key: "created_at",
      header: "Date Applied",
      accessor: (r) => r.created_at,
      cell: (r) => new Date(r.created_at).toLocaleDateString(),
    },
    {
      key: "status",
      header: "Status",
      accessor: (r) => r.status,
      cell: (r) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${STATUS_STYLE[r.status]}`}
        >
          {r.status}
        </span>
      ),
    },
  ];

  return (
    <AdminGuard>
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-6 w-6 text-secondary" />
        <h1 className="font-display text-3xl font-extrabold text-forest">Applications</h1>
      </div>
      <p className="mt-1 text-foreground/65">Course enquiries submitted from the website.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, country, course…"
          className="max-w-md rounded-full"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-44 rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="enrolled">Enrolled</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
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
            emptyMessage="No applications yet. Share your course pages to get started."
            actions={(r) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="rounded-full">
                    Actions <ChevronDown className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => updateStatus(r.id, "contacted")}>
                    Mark as Contacted
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateStatus(r.id, "enrolled")}>
                    Mark as Enrolled
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateStatus(r.id, "rejected")}
                    className="text-destructive"
                  >
                    Mark as Rejected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        )}
      </div>
    </AdminGuard>
  );
}
