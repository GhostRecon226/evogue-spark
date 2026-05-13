import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Award, ArrowRight, Loader2, CheckCircle2, ClipboardCheck, Megaphone, Video } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardHome,
});

type Continue = {
  slug: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  category: string | null;
  progress: number;
};
type Announcement = { id: string; title: string; message: string; created_at: string };
type UpcomingLesson = { id: string; title: string; lesson_date: string; zoom_live_link: string | null; courseSlug: string };

function DashboardHome() {
  const { user, profile } = useAuth();
  const name = profile?.full_name?.trim() || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ enrolled: 0, completedLessons: 0, pendingCapstone: 0, certificates: 0 });
  const [next, setNext] = useState<Continue | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingLesson | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: enrollments }, { count: certCount }, { count: completedLessons }, { count: pendingCapstone }] = await Promise.all([
        supabase
          .from("enrollments")
          .select("course_id, enrolled_at, courses(slug, title, description, cover_image_url, category)")
          .eq("student_id", user.id)
          .order("enrolled_at", { ascending: false }),
        supabase.from("certificates").select("id", { count: "exact", head: true }).eq("student_id", user.id),
        supabase.from("lesson_progress").select("id", { count: "exact", head: true }).eq("student_id", user.id).eq("completed", true),
        supabase.from("capstone_submissions").select("id", { count: "exact", head: true }).eq("student_id", user.id).eq("status", "pending"),
      ]);

      const enrolled = enrollments ?? [];
      let nextCourse: Continue | null = null;
      if (enrolled[0]?.courses) {
        const c = enrolled[0];
        const [{ count: lessonsTotal }, { count: lessonsDone }] = await Promise.all([
          supabase.from("lessons").select("id", { count: "exact", head: true })
            .eq("course_id", c.course_id).eq("is_published", true),
          supabase.from("lesson_progress").select("id", { count: "exact", head: true })
            .eq("student_id", user.id).eq("course_id", c.course_id).eq("completed", true),
        ]);
        const total = lessonsTotal ?? 0;
        const dn = lessonsDone ?? 0;
        nextCourse = {
          slug: c.courses!.slug,
          title: c.courses!.title,
          description: c.courses!.description,
          cover_image_url: c.courses!.cover_image_url,
          category: c.courses!.category,
          progress: total > 0 ? Math.round((dn / total) * 100) : 0,
        };
      }

      if (!cancelled) {
        setStats({
          enrolled: enrolled.length,
          completedLessons: completedLessons ?? 0,
          pendingCapstone: pendingCapstone ?? 0,
          certificates: certCount ?? 0,
        });
        setNext(nextCourse);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl font-extrabold text-forest">Welcome back, {name} 👋</h1>
      <p className="mt-1 text-foreground/65">Here's where you left off.</p>
      {profile?.registration_number && (
        <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-forest/15 bg-mint/40 px-3 py-1 text-xs font-semibold text-forest">
          Registration No: <span className="font-mono tracking-wider">{profile.registration_number}</span>
        </p>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={BookOpen} label="Enrolled courses" value={loading ? "…" : String(stats.enrolled)} />
        <Stat icon={CheckCircle2} label="Completed lessons" value={loading ? "…" : String(stats.completedLessons)} />
        <Stat icon={ClipboardCheck} label="Pending capstone" value={loading ? "…" : String(stats.pendingCapstone)} />
        <Stat icon={Award} label="Certificates earned" value={loading ? "…" : String(stats.certificates)} />
      </div>

      <div className="mt-8 rounded-2xl border border-mint/40 bg-mint/15 p-5 flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint text-forest"><Megaphone className="h-5 w-5" /></span>
        <div>
          <p className="font-display font-bold text-forest">Welcome to your cohort</p>
          <p className="mt-1 text-sm text-foreground/70">Cohort announcements from your instructor will appear here. Check back daily for live class reminders and updates.</p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="font-display text-xl font-bold text-forest">Continue learning</h2>
          {loading ? (
            <div className="mt-4 grid place-items-center py-12 text-foreground/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : next ? (
            <div className="mt-4 rounded-3xl bg-background border border-border overflow-hidden shadow-soft md:flex">
              {next.cover_image_url && (
                <img src={next.cover_image_url} alt={next.title} className="md:w-64 w-full h-48 md:h-auto object-cover" />
              )}
              <div className="p-6 flex-1">
                {next.category && <p className="text-xs uppercase tracking-wide text-secondary font-bold">{next.category}</p>}
                <h3 className="mt-1 font-display text-xl font-bold text-forest">{next.title}</h3>
                {next.description && <p className="mt-1 text-sm text-foreground/70">{next.description}</p>}
                <div className="mt-4">
                  <p className="text-xs text-foreground/55 mb-1">{next.progress}% complete</p>
                  <Progress value={next.progress} />
                </div>
                <Button asChild className="mt-5 rounded-full bg-forest text-mint hover:bg-forest/90">
                  <Link to="/dashboard/courses/$slug" params={{ slug: next.slug }}>Continue <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-3xl border border-dashed border-border bg-background p-10 text-center">
              <p className="font-display text-lg font-bold text-forest">No active enrollments</p>
              <p className="mt-1 text-sm text-foreground/60">Browse the catalog and join the next cohort.</p>
              <Button asChild className="mt-5 rounded-full bg-forest text-mint hover:bg-forest/90"><Link to="/courses">Browse courses</Link></Button>
            </div>
          )}
        </div>

        <div>
          <h2 className="font-display text-xl font-bold text-forest">Upcoming live class</h2>
          <div className="mt-4 rounded-3xl border border-border bg-background p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest text-mint"><Video className="h-5 w-5" /></span>
            <p className="mt-4 font-display font-bold text-forest">No sessions scheduled</p>
            <p className="mt-1 text-sm text-foreground/65">Your next Zoom live class will appear here with a one-click join link.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background border border-border p-6 flex items-center gap-4">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-mint/30 text-secondary"><Icon className="h-5 w-5" /></span>
      <div>
        <p className="text-sm text-foreground/60">{label}</p>
        <p className="font-display text-2xl font-extrabold text-forest">{value}</p>
      </div>
    </div>
  );
}
