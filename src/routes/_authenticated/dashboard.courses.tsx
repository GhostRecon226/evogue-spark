import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, BookOpen } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/courses")({
  component: MyCourses,
});

type EnrolledCourse = {
  enrollment_id: string;
  course_id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  payment_status: "pending" | "paid";
  progress: number;
};

function MyCourses() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: enrollments, error } = await supabase
        .from("enrollments")
        .select("id, course_id, payment_status, courses(slug, title, description, cover_image_url)")
        .eq("student_id", user.id)
        .order("enrolled_at", { ascending: false });

      if (error || !enrollments) {
        if (!cancelled) {
          setCourses([]);
          setLoading(false);
        }
        return;
      }

      const courseIds = enrollments.map((e) => e.course_id);
      const lessonCounts: Record<string, number> = {};
      const completedCounts: Record<string, number> = {};

      if (courseIds.length) {
        const [{ data: lessons }, { data: progress }] = await Promise.all([
          supabase
            .from("lessons")
            .select("course_id")
            .in("course_id", courseIds)
            .eq("is_published", true),
          supabase
            .from("lesson_progress")
            .select("course_id, completed")
            .eq("student_id", user.id)
            .in("course_id", courseIds),
        ]);
        for (const l of lessons ?? [])
          lessonCounts[l.course_id] = (lessonCounts[l.course_id] ?? 0) + 1;
        for (const p of progress ?? [])
          if (p.completed) completedCounts[p.course_id] = (completedCounts[p.course_id] ?? 0) + 1;
      }

      const mapped: EnrolledCourse[] = enrollments
        .filter((e) => e.courses)
        .map((e) => {
          const total = lessonCounts[e.course_id] ?? 0;
          const done = completedCounts[e.course_id] ?? 0;
          return {
            enrollment_id: e.id,
            course_id: e.course_id,
            slug: e.courses!.slug,
            title: e.courses!.title,
            description: e.courses!.description,
            cover_image_url: e.courses!.cover_image_url,
            payment_status: e.payment_status as "pending" | "paid",
            progress: total > 0 ? Math.round((done / total) * 100) : 0,
          };
        });

      if (!cancelled) {
        setCourses(mapped);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl font-extrabold text-forest">My Courses</h1>
      <p className="mt-1 text-foreground/65">Pick up where you left off.</p>

      {loading ? (
        <div className="mt-12 grid place-items-center text-foreground/50">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-background p-12 text-center">
          <BookOpen className="h-12 w-12 text-secondary mx-auto" />
          <p className="mt-4 font-display text-lg font-bold text-forest">No enrollments yet</p>
          <p className="mt-1 text-sm text-foreground/60">
            Browse the catalog and join the next cohort.
          </p>
          <Button asChild className="mt-6 rounded-full bg-forest text-mint hover:bg-forest/90">
            <Link to="/courses">Explore Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {courses.map((c) => (
            <div
              key={c.enrollment_id}
              className="rounded-2xl bg-background border border-border overflow-hidden shadow-soft"
            >
              {c.cover_image_url && (
                <img src={c.cover_image_url} alt={c.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display font-bold text-forest text-lg">{c.title}</h3>
                  {c.payment_status === "pending" && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-star bg-star/15 px-2 py-1 rounded-full">
                      Payment pending
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-xs text-foreground/55 mb-1">{c.progress}% complete</p>
                  <Progress value={c.progress} />
                </div>
                <Button
                  asChild
                  className="mt-5 w-full rounded-full bg-forest text-mint hover:bg-forest/90"
                >
                  <Link to="/dashboard/courses/$slug" params={{ slug: c.slug }}>
                    Continue
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
