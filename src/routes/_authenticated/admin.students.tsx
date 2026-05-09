import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Users, Loader2, Search } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/students")({
  component: StudentsPage,
});

type Student = {
  id: string;
  full_name: string;
  email: string;
  whatsapp_number: string | null;
  created_at: string;
  enrolled_count: number;
};

function StudentsPage() {
  const [rows, setRows] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const [profilesRes, enrolRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, whatsapp_number, created_at").order("created_at", { ascending: false }),
        supabase.from("enrollments").select("student_id"),
      ]);
      const counts = new Map<string, number>();
      for (const e of enrolRes.data ?? []) counts.set(e.student_id, (counts.get(e.student_id) ?? 0) + 1);
      setRows((profilesRes.data ?? []).map((p) => ({
        id: p.id,
        full_name: p.full_name ?? "",
        email: p.email ?? "",
        whatsapp_number: p.whatsapp_number,
        created_at: p.created_at,
        enrolled_count: counts.get(p.id) ?? 0,
      })));
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => r.full_name.toLowerCase().includes(s) || r.email.toLowerCase().includes(s));
  }, [rows, q]);

  const columns: Column<Student>[] = [
    { key: "full_name", header: "Name", accessor: (r) => r.full_name || "—" },
    { key: "email", header: "Email", accessor: (r) => r.email },
    { key: "whatsapp_number", header: "WhatsApp", accessor: (r) => r.whatsapp_number ?? "—" },
    { key: "enrolled_count", header: "Courses", accessor: (r) => r.enrolled_count },
    { key: "created_at", header: "Joined", accessor: (r) => r.created_at,
      cell: (r) => new Date(r.created_at).toLocaleDateString() },
  ];

  return (
    <AdminGuard>
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-secondary" />
        <h1 className="font-display text-3xl font-extrabold text-forest">Students</h1>
      </div>
      <p className="mt-1 text-foreground/65">All registered students.</p>

      <div className="mt-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/45" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email…" className="pl-9 rounded-full" />
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid place-items-center py-20 text-foreground/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <DataTable rows={filtered} columns={columns} rowKey={(r) => r.id} pageSize={10}
            emptyMessage="No students match." />
        )}
      </div>
    </AdminGuard>
  );
}
