import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, BookOpen, TrendingUp, Loader2, FileText } from "lucide-react";
import { InstructorGuard } from "@/components/instructor/InstructorGuard";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/instructor/")({
  component: InstructorOverview,
});

function InstructorOverview() {
  const { instructorCourseIds } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ students: 0, lessons: 0, completionRate: 0 });

  useEffect(() => {
    if (instructorCourseIds.length === 0) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const [{ data: enrol }, { data: lessons }, { data: progress }] = await Promise.all([
        supabase.from("enrollments").select("student_id, course_id").in("course_id", instructorCourseIds),
        supabase.from("lessons").select("id, course_id").in("course_id", instructorCourseIds),
        supabase.from("lesson_progress").select("student_id, course_id, completed").in("course_id", instructorCourseIds),
      ]);
      if (cancelled) return;

      const lessonsByCourse = new Map<string, number>();
      for (const l of lessons ?? []) lessonsByCourse.set(l.course_id, (lessonsByCourse.get(l.course_id) ?? 0) + 1);

      const completedByPair = new Map<string, number>();
      for (const p of progress ?? []) {
        if (!p.completed) continue;
        const key = `${p.student_id}:${p.course_id}`;
        completedByPair.set(key, (completedByPair.get(key) ?? 0) + 1);
      }

      let pctSum = 0;
      let pctCount = 0;
      const uniqueStudents = new Set<string>();
      for (const e of enrol ?? []) {
        uniqueStudents.add(e.student_id);
        const total = lessonsByCourse.get(e.course_id) ?? 0;
        if (total === 0) continue;
        const done = completedByPair.get(`${e.student_id}:${e.course_id}`) ?? 0;
        pctSum += (done / total) * 100;
        pctCount += 1;
      }

      setStats({
        students: uniqueStudents.size,
        lessons: (lessons ?? []).length,
        completionRate: pctCount > 0 ? Math.round(pctSum / pctCount) : 0,
      });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [instructorCourseIds.join(",")]);

  const cards = [
    { label: "Total Students", value: stats.students.toLocaleString(), icon: Users },
    { label: "Lessons Uploaded", value: stats.lessons.toLocaleString(), icon: FileText },
    { label: "Avg Completion Rate", value: `${stats.completionRate}%`, icon: TrendingUp },
  ];

  return (
    <InstructorGuard>
      <h1 className="font-display text-3xl font-extrabold text-forest">Instructor Overview</h1>
      <p className="mt-1 text-foreground/65">Activity across the courses you teach.</p>

      {loading ? (
        <div className="grid place-items-center py-20 text-foreground/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : instructorCourseIds.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-background p-12 text-center text-foreground/60">
          You haven't been assigned to any courses yet. Ask an admin to assign you.
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link to="/instructor/courses" className="rounded-2xl border border-border bg-background p-5 hover:bg-mint-tint/30 transition">
              <BookOpen className="h-6 w-6 text-secondary" />
              <p className="mt-3 font-display font-bold text-forest">View My Courses</p>
              <p className="text-sm text-foreground/60">Per-course enrollment and progress.</p>
            </Link>
            <Link to="/instructor/upload" className="rounded-2xl border border-border bg-background p-5 hover:bg-mint-tint/30 transition">
              <FileText className="h-6 w-6 text-secondary" />
              <p className="mt-3 font-display font-bold text-forest">Upload New Lesson</p>
              <p className="text-sm text-foreground/60">Add a lesson with PDF and Zoom link.</p>
            </Link>
          </div>
        </>
      )}
    </InstructorGuard>
  );
}
