import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Users, Loader2, Search } from "lucide-react";
import { InstructorGuard } from "@/components/instructor/InstructorGuard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/instructor/students")({
  component: InstructorStudents,
});

type Row = {
  key: string;
  student_id: string;
  course_id: string;
  full_name: string;
  email: string;
  course: string;
  progress: number;
  last_active: string | null;
};

function InstructorStudents() {
  const { instructorCourseIds } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (instructorCourseIds.length === 0) { setLoading(false); return; }
    (async () => {
      const [{ data: enrol }, { data: lessons }, { data: progress }, { data: courses }] = await Promise.all([
        supabase.from("enrollments")
          .select("student_id, course_id, profiles:student_id(full_name, email)")
          .in("course_id", instructorCourseIds),
        supabase.from("lessons").select("id, course_id").in("course_id", instructorCourseIds),
        supabase.from("lesson_progress").select("student_id, course_id, completed, completed_at, created_at").in("course_id", instructorCourseIds),
        supabase.from("courses").select("id, title").in("id", instructorCourseIds),
      ]);

      const lessonsByCourse = new Map<string, number>();
      for (const l of lessons ?? []) lessonsByCourse.set(l.course_id, (lessonsByCourse.get(l.course_id) ?? 0) + 1);

      const completedByPair = new Map<string, number>();
      const lastByPair = new Map<string, string>();
      for (const p of progress ?? []) {
        const key = `${p.student_id}:${p.course_id}`;
        if (p.completed) completedByPair.set(key, (completedByPair.get(key) ?? 0) + 1);
        const ts = p.completed_at ?? p.created_at;
        if (ts && (!lastByPair.get(key) || ts > lastByPair.get(key)!)) lastByPair.set(key, ts);
      }

      const courseTitle = new Map((courses ?? []).map((c) => [c.id, c.title]));

      setRows((enrol ?? []).map((e) => {
        const key = `${e.student_id}:${e.course_id}`;
        const total = lessonsByCourse.get(e.course_id) ?? 0;
        const done = completedByPair.get(key) ?? 0;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return {
          key,
          student_id: e.student_id,
          course_id: e.course_id,
          full_name: e.profiles?.full_name || "—",
          email: e.profiles?.email || "—",
          course: courseTitle.get(e.course_id) ?? "—",
          progress: pct,
          last_active: lastByPair.get(key) ?? null,
        };
      }));
      setLoading(false);
    })();
  }, [instructorCourseIds.join(",")]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => r.full_name.toLowerCase().includes(s) || r.email.toLowerCase().includes(s));
  }, [rows, q]);

  const columns: Column<Row>[] = [
    { key: "full_name", header: "Name", accessor: (r) => r.full_name },
    { key: "email", header: "Email", accessor: (r) => r.email },
    { key: "course", header: "Course", accessor: (r) => r.course },
    { key: "progress", header: "Progress", accessor: (r) => r.progress,
      cell: (r) => (
        <div className="min-w-[120px]">
          <div className="h-1.5 rounded-full bg-mint-tint overflow-hidden">
            <div className="h-full bg-secondary" style={{ width: `${r.progress}%` }} />
          </div>
          <p className="mt-1 text-xs text-foreground/60">{r.progress}%</p>
        </div>
      ) },
    { key: "last_active", header: "Last active", accessor: (r) => r.last_active,
      cell: (r) => r.last_active ? new Date(r.last_active).toLocaleDateString() : "—" },
  ];

  return (
    <InstructorGuard>
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-secondary" />
        <h1 className="font-display text-3xl font-extrabold text-forest">Students</h1>
      </div>
      <p className="mt-1 text-foreground/65">Students enrolled in your courses.</p>

      <div className="mt-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/45" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email…" className="pl-9 rounded-full" />
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid place-items-center py-20 text-foreground/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <DataTable rows={filtered} columns={columns} rowKey={(r) => r.key} pageSize={10}
            emptyMessage="No students found." />
        )}
      </div>
    </InstructorGuard>
  );
}
