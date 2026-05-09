import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Download, Video, CheckCircle2, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/courses/$slug")({
  component: ClassroomPage,
});

type Lesson = {
  id: string;
  title: string;
  lesson_number: number;
  zoom_link: string | null;
  pdf_url: string | null;
};
type Course = { id: string; slug: string; title: string };

function ClassroomPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: courseRow } = await supabase
      .from("courses").select("id, slug, title")
      .eq("slug", slug).eq("is_published", true).maybeSingle();
    if (!courseRow) { setCourse(null); setLoading(false); throw notFound(); }
    setCourse(courseRow);

    const [{ data: enr }, { data: lessonRows }, { data: progressRows }] = await Promise.all([
      supabase.from("enrollments").select("id").eq("student_id", user.id).eq("course_id", courseRow.id).maybeSingle(),
      supabase.from("lessons").select("id, title, lesson_number, zoom_link, pdf_url")
        .eq("course_id", courseRow.id).eq("is_published", true).order("lesson_number"),
      supabase.from("lesson_progress").select("lesson_id, completed").eq("student_id", user.id).eq("course_id", courseRow.id),
    ]);

    setEnrolled(Boolean(enr));
    setLessons(lessonRows ?? []);
    const map: Record<string, boolean> = {};
    for (const p of progressRows ?? []) map[p.lesson_id] = p.completed;
    setDone(map);
    setActiveId((lessonRows && lessonRows[0]?.id) ?? null);
    setLoading(false);
  }, [slug, user]);

  useEffect(() => { void load(); }, [load]);

  const toggleComplete = async (lessonId: string) => {
    if (!user || !course || !enrolled) return;
    const next = !done[lessonId];
    // Optimistic update
    setDone((d) => ({ ...d, [lessonId]: next }));
    setSaving(true);
    const { error } = await supabase
      .from("lesson_progress")
      .upsert(
        {
          student_id: user.id,
          course_id: course.id,
          lesson_id: lessonId,
          completed: next,
          completed_at: next ? new Date().toISOString() : null,
        },
        { onConflict: "student_id,lesson_id" },
      );
    setSaving(false);
    if (error) {
      setDone((d) => ({ ...d, [lessonId]: !next })); // rollback
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="grid place-items-center py-20 text-foreground/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
      </DashboardLayout>
    );
  }

  if (!course) return null;

  if (!enrolled) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto mt-10 rounded-3xl border border-dashed border-border bg-background p-10 text-center">
          <Lock className="h-10 w-10 text-secondary mx-auto" />
          <h1 className="mt-4 font-display text-2xl font-extrabold text-forest">You're not enrolled in {course.title}</h1>
          <p className="mt-2 text-sm text-foreground/65">Enroll to access the classroom, lessons, and live sessions.</p>
          <Button asChild className="mt-6 rounded-full bg-forest text-mint hover:bg-forest/90">
            <Link to="/courses/$slug" params={{ slug: course.slug }}>View course</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const active = lessons.find((l) => l.id === activeId) ?? lessons[0] ?? null;
  const completedCount = Object.values(done).filter(Boolean).length;
  const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl bg-background border border-border p-4 h-fit">
          <h2 className="font-display font-bold text-forest">{course.title}</h2>
          <div className="mt-2"><Progress value={progress} /><p className="mt-1 text-xs text-foreground/60">{progress}% complete</p></div>
          <ul className="mt-4 space-y-1 max-h-[60vh] overflow-y-auto pr-1">
            {lessons.length === 0 && <li className="text-sm text-foreground/55 px-3 py-2">Lessons coming soon.</li>}
            {lessons.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => setActiveId(l.id)}
                  className={`w-full flex items-start gap-2 text-left rounded-lg px-3 py-2 text-sm transition ${
                    active?.id === l.id ? "bg-mint/30 text-forest" : "hover:bg-mint-tint text-foreground/80"
                  }`}
                >
                  <Checkbox
                    checked={!!done[l.id]}
                    onCheckedChange={() => toggleComplete(l.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5"
                  />
                  <span className="flex-1"><span className="text-foreground/50 mr-1">{l.lesson_number}.</span>{l.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {active ? (
          <main>
            <p className="text-xs uppercase tracking-wide text-secondary font-bold">Lesson {active.lesson_number}</p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-forest">{active.title}</h1>
            <div className="mt-5 aspect-video rounded-2xl bg-forest/90 grid place-items-center text-mint border border-border overflow-hidden">
              <div className="text-center">
                <Video className="h-12 w-12 mx-auto opacity-70" />
                <p className="mt-2 text-sm text-mint/70">Video lesson placeholder</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild variant="outline" className="rounded-full" disabled={!active.pdf_url}>
                <a href={active.pdf_url ?? "#"} target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4 mr-1" /> {active.pdf_url ? "Download PDF" : "PDF coming soon"}
                </a>
              </Button>
              <Button asChild className="rounded-full bg-mint text-forest hover:bg-mint/90 font-bold" disabled={!active.zoom_link}>
                <a href={active.zoom_link ?? "#"} target="_blank" rel="noreferrer">
                  <Video className="h-4 w-4 mr-1" /> {active.zoom_link ? "Join Zoom Live" : "Zoom link coming soon"}
                </a>
              </Button>
            </div>
            <div className="mt-8">
              <Button onClick={() => toggleComplete(active.id)} disabled={saving}
                className="rounded-full bg-forest text-mint hover:bg-forest/90">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                {done[active.id] ? "Marked Complete" : "Mark as Complete"}
              </Button>
            </div>
          </main>
        ) : (
          <main className="rounded-2xl bg-background border border-dashed border-border p-12 text-center text-foreground/60">
            Lessons for this course are being prepared.
          </main>
        )}
      </div>
    </DashboardLayout>
  );
}
