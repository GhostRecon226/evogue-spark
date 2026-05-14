import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Mail, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/inquiries")({
  component: InquiriesPage,
});

type Inquiry = {
  id: string;
  full_name: string;
  email: string;
  whatsapp_number: string | null;
  course_interest: string | null;
  message: string;
  source: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

function InquiriesPage() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      setRows((data ?? []) as Inquiry[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() =>
    typeFilter === "all" ? rows : rows.filter((r) => (r.type || r.source) === typeFilter),
    [rows, typeFilter]
  );

  const toggleRead = async (id: string, next: boolean) => {
    const prev = rows;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, is_read: next } : r)));
    const { error } = await supabase.from("inquiries").update({ is_read: next }).eq("id", id);
    if (error) { setRows(prev); toast.error(error.message); }
  };

  const columns: Column<Inquiry>[] = [
    { key: "full_name", header: "Name",
      accessor: (r) => r.full_name,
      cell: (r) => (
        <span className={r.is_read ? "" : "font-bold text-forest"}>
          {r.full_name}
        </span>
      ) },
    { key: "email", header: "Email", accessor: (r) => r.email },
    { key: "whatsapp_number", header: "WhatsApp", accessor: (r) => r.whatsapp_number ?? "—" },
    { key: "course_interest", header: "Course", accessor: (r) => r.course_interest ?? "—" },
    { key: "message", header: "Message", accessor: (r) => r.message,
      cell: (r) => <span className="line-clamp-2 max-w-md inline-block">{r.message}</span>,
      sortable: false },
    { key: "type", header: "Type", accessor: (r) => r.type || r.source,
      cell: (r) => <span className="capitalize">{r.type || r.source}</span> },
    { key: "created_at", header: "Date", accessor: (r) => r.created_at,
      cell: (r) => new Date(r.created_at).toLocaleDateString() },
  ];

  return (
    <AdminGuard>
      <div className="flex items-center gap-3">
        <Mail className="h-6 w-6 text-secondary" />
        <h1 className="font-display text-3xl font-extrabold text-forest">Inquiries</h1>
      </div>
      <p className="mt-1 text-foreground/65">Contact and scholarship form submissions.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44 rounded-full"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="contact">Contact</SelectItem>
            <SelectItem value="scholarship">Scholarship</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid place-items-center py-20 text-foreground/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <DataTable
            rows={filtered} columns={columns} rowKey={(r) => r.id} pageSize={10}
            emptyMessage="No inquiries match."
            actions={(r) => (
              <Button size="sm" variant="outline" className="rounded-full"
                onClick={() => toggleRead(r.id, !r.is_read)}>
                {r.is_read ? <><EyeOff className="h-3.5 w-3.5 mr-1" /> Mark unread</> : <><Eye className="h-3.5 w-3.5 mr-1" /> Mark read</>}
              </Button>
            )}
          />
        )}
      </div>
    </AdminGuard>
  );
}
