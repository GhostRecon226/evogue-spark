import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Loader2,
  Users,
  TrendingUp,
  CalendarDays,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { InstructorGuard } from "@/components/instructor/InstructorGuard";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/instructor/courses")({
  component: InstructorCourses,
});

type CourseStat = {
  id: string;
  title: string;
  slug: string;
  level: string | null;
  capstone_released: boolean;
  activeCohort: string | null;
  students: number;
  completionRate: number;
};

function InstructorCourses() {
  const { instructorCourseIds } = useAuth();
  const [rows, setRows] = useState<CourseStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (instructorCourseIds.length === 0) {
      setLoading(false);
      return;
    }
    (async () => {
      const [
        { data: courses },
        { data: enrol },
        { data: lessons },
        { data: progress },
        { data: cohorts },
      ] = await Promise.all([
        supabase
          .from("courses")
          .select("id, title, slug, level, capstone_released")
          .in("id", instructorCourseIds),
        supabase
          .from("enrollments")
          .select("student_id, course_id")
          .in("course_id", instructorCourseIds),
        supabase.from("lessons").select("id, course_id").in("course_id", instructorCourseIds),
        supabase
          .from("lesson_progress")
          .select("student_id, course_id, completed")
          .in("course_id", instructorCourseIds),
        supabase
          .from("cohorts")
          .select("id, course_id, name, status, start_date")
          .in("course_id", instructorCourseIds),
      ]);

      const lessonsByCourse = new Map<string, number>();
      for (const l of lessons ?? [])
        lessonsByCourse.set(l.course_id, (lessonsByCourse.get(l.course_id) ?? 0) + 1);

      const completedByPair = new Map<string, number>();
      for (const p of progress ?? []) {
        if (!p.completed) continue;
        completedByPair.set(
          `${p.student_id}:${p.course_id}`,
          (completedByPair.get(`${p.student_id}:${p.course_id}`) ?? 0) + 1,
        );
      }

      const enrolByCourse = new Map<string, string[]>();
      for (const e of enrol ?? []) {
        const arr = enrolByCourse.get(e.course_id) ?? [];
        arr.push(e.student_id);
        enrolByCourse.set(e.course_id, arr);
      }

      const activeByCourse = new Map<string, string>();
      for (const c of cohorts ?? []) {
        if (c.status === "active" && !activeByCourse.has(c.course_id)) {
          activeByCourse.set(c.course_id, c.name);
        }
      }
      // fallback to upcoming if no active
      for (const c of cohorts ?? []) {
        if (!activeByCourse.has(c.course_id) && c.status === "upcoming") {
          activeByCourse.set(c.course_id, c.name);
        }
      }

      setRows(
        (courses ?? []).map((c) => {
          const studentIds = enrolByCourse.get(c.id) ?? [];
          const total = lessonsByCourse.get(c.id) ?? 0;
          let pct = 0;
          if (total > 0 && studentIds.length > 0) {
            const sum = studentIds.reduce(
              (s, sid) => s + ((completedByPair.get(`${sid}:${c.id}`) ?? 0) / total) * 100,
              0,
            );
            pct = Math.round(sum / studentIds.length);
          }
          return {
            id: c.id,
            title: c.title,
            slug: c.slug,
            level: c.level,
            capstone_released: c.capstone_released,
            activeCohort: activeByCourse.get(c.id) ?? null,
            students: studentIds.length,
            completionRate: pct,
          };
        }),
      );
      setLoading(false);
    })();
  }, [instructorCourseIds.join(",")]);

  return (
    <InstructorGuard>
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-secondary" />
        <h1 className="font-display text-3xl font-extrabold text-forest">My Courses</h1>
      </div>
      <p className="mt-1 text-foreground/65">Courses assigned to you.</p>

      {loading ? (
        <div className="grid place-items-center py-20 text-foreground/50">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-background p-12 text-center text-foreground/60">
          No courses assigned yet.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {rows.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-background p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-forest">{c.title}</h3>
                  <p className="text-xs text-foreground/55">
                    /{c.slug} · {c.level ?? "—"}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${c.capstone_released ? "bg-secondary/15 text-forest" : "bg-mint-tint text-forest/60"}`}
                >
                  {c.capstone_released ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  Capstone {c.capstone_released ? "released" : "not released"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/70">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-4 w-4 text-secondary" />{" "}
                  {c.activeCohort ?? "No active cohort"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-4 w-4 text-secondary" /> {c.students} students
                </span>
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-secondary" /> {c.completionRate}% complete
                </span>
              </div>
              <div className="mt-3">
                <Progress value={c.completionRate} />
              </div>
            </div>
          ))}
        </div>
      )}
    </InstructorGuard>
  );
}
