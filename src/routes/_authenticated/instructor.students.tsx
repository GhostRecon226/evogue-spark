import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Users, Loader2, Search } from "lucide-react";
import { InstructorGuard } from "@/components/instructor/InstructorGuard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/instructor/students")({
  component: InstructorStudents,
});

type Row = {
  key: string;
  student_id: string;
  course_id: string;
  registration_number: string;
  full_name: string;
  email: string;
  course: string;
  cohort: string;
  progress: number;
  last_active: string | null;
};

type LessonBreakdown = { id: string; title: string; lesson_number: number; completed: boolean; completed_at: string | null };

function InstructorStudents() {
  const { instructorCourseIds } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Row | null>(null);
  const [breakdown, setBreakdown] = useState<LessonBreakdown[]>([]);
  const [bLoading, setBLoading] = useState(false);

  useEffect(() => {
    if (instructorCourseIds.length === 0) { setLoading(false); return; }
    (async () => {
      const [{ data: enrol }, { data: lessons }, { data: progress }, { data: courses }, { data: cohorts }] = await Promise.all([
        supabase.from("enrollments")
          .select("student_id, course_id, cohort_id, profiles:student_id(full_name, email, registration_number)")
          .in("course_id", instructorCourseIds),
        supabase.from("lessons").select("id, course_id").in("course_id", instructorCourseIds),
        supabase.from("lesson_progress").select("student_id, course_id, completed, completed_at, created_at").in("course_id", instructorCourseIds),
        supabase.from("courses").select("id, title").in("id", instructorCourseIds),
        supabase.from("cohorts").select("id, name").in("course_id", instructorCourseIds),
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
      const cohortName = new Map((cohorts ?? []).map((c) => [c.id, c.name]));

      setRows((enrol ?? []).map((e) => {
        const key = `${e.student_id}:${e.course_id}`;
        const total = lessonsByCourse.get(e.course_id) ?? 0;
        const done = completedByPair.get(key) ?? 0;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const prof = e.profiles as unknown as { full_name?: string; email?: string; registration_number?: string } | null;
        return {
          key,
          student_id: e.student_id,
          course_id: e.course_id,
          registration_number: prof?.registration_number || "—",
          full_name: prof?.full_name || "—",
          email: prof?.email || "—",
          course: courseTitle.get(e.course_id) ?? "—",
          cohort: e.cohort_id ? (cohortName.get(e.cohort_id) ?? "—") : "—",
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
    return rows.filter((r) =>
      r.full_name.toLowerCase().includes(s) ||
      r.email.toLowerCase().includes(s) ||
      r.registration_number.toLowerCase().includes(s),
    );
  }, [rows, q]);

  const openBreakdown = async (r: Row) => {
    setOpen(r);
    setBLoading(true);
    const [{ data: lessons }, { data: progress }] = await Promise.all([
      supabase.from("lessons").select("id, title, lesson_number").eq("course_id", r.course_id).order("lesson_number"),
      supabase.from("lesson_progress").select("lesson_id, completed, completed_at").eq("course_id", r.course_id).eq("student_id", r.student_id),
    ]);
    const pmap = new Map((progress ?? []).map((p) => [p.lesson_id, p]));
    setBreakdown((lessons ?? []).map((l) => {
      const p = pmap.get(l.id);
      return {
        id: l.id, title: l.title, lesson_number: l.lesson_number,
        completed: !!p?.completed,
        completed_at: p?.completed_at ?? null,
      };
    }));
    setBLoading(false);
  };

  const columns: Column<Row>[] = [
    { key: "registration_number", header: "Student ID", accessor: (r) => r.registration_number, sortable: true },
    { key: "full_name", header: "Name", accessor: (r) => r.full_name, sortable: true,
      cell: (r) => <button className="text-left text-forest font-semibold hover:text-secondary" onClick={() => openBreakdown(r)}>{r.full_name}</button> },
    { key: "email", header: "Email", accessor: (r) => r.email },
    { key: "course", header: "Course", accessor: (r) => r.course, sortable: true },
    { key: "cohort", header: "Cohort", accessor: (r) => r.cohort, sortable: true },
    { key: "progress", header: "Progress", accessor: (r) => r.progress, sortable: true,
      cell: (r) => (
        <div className="min-w-[120px]">
          <div className="h-1.5 rounded-full bg-mint-tint overflow-hidden">
            <div className="h-full bg-secondary" style={{ width: `${r.progress}%` }} />
          </div>
          <p className="mt-1 text-xs text-foreground/60">{r.progress}%</p>
        </div>
      ) },
    { key: "last_active", header: "Last active", accessor: (r) => r.last_active, sortable: true,
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
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email or Student ID…" className="pl-9 rounded-full" />
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid place-items-center py-20 text-foreground/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <DataTable rows={filtered} columns={columns} rowKey={(r) => r.key} pageSize={10}
            emptyMessage="No students found." />
        )}
      </div>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-forest">{open?.full_name}</SheetTitle>
            <SheetDescription>
              {open?.registration_number} · {open?.course} · {open?.cohort}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide font-bold text-foreground/55 mb-2">Lesson completion</p>
            {bLoading ? (
              <div className="grid place-items-center py-10 text-foreground/50"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : breakdown.length === 0 ? (
              <p className="text-sm text-foreground/60">No lessons in this course yet.</p>
            ) : (
              <ul className="space-y-2">
                {breakdown.map((l) => (
                  <li key={l.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-forest truncate">{l.lesson_number}. {l.title}</p>
                      {l.completed_at && <p className="text-xs text-foreground/55">Completed {new Date(l.completed_at).toLocaleDateString()}</p>}
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${l.completed ? "bg-secondary/20 text-forest" : "bg-mint-tint text-foreground/60"}`}>
                      {l.completed ? "Done" : "Pending"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </InstructorGuard>
  );
}
