import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Award, ArrowRight, Loader2, CheckCircle2, Flag, Megaphone, Video, Mail, Info, Clock, CheckCircle, XCircle, Upload } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

type CapstoneDetail = {
  status: "pending" | "recommended" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at: string | null;
  instructor_recommendation: boolean | null;
  instructor_note: string | null;
  admin_note?: string | null;
};

export const Route = createFileRoute("/_authenticated/dashboard/")({
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
  const { user, profile, isAdmin, isInstructor, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const name = profile?.full_name?.trim() || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";

  // Redirect non-students away from the student dashboard.
  useEffect(() => {
    if (authLoading) return;
    if (isAdmin) void navigate({ to: "/admin", replace: true });
    else if (isInstructor) void navigate({ to: "/instructor", replace: true });
  }, [authLoading, isAdmin, isInstructor, navigate]);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ enrolled: 0, completedLessons: 0, certificates: 0 });
  const [capstoneStatus, setCapstoneStatus] = useState<"not_started" | "pending" | "approved" | "rejected" | "recommended">("not_started");
  const [next, setNext] = useState<Continue | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingLesson | null>(null);
  const [capstoneDetail, setCapstoneDetail] = useState<CapstoneDetail | null>(null);
  const [capstoneOpen, setCapstoneOpen] = useState(false);

  useEffect(() => {
    if (!user || isAdmin || isInstructor) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: enrollments }, { count: certCount }, { count: completedLessons }, { data: capstoneRows }] = await Promise.all([
        supabase
          .from("enrollments")
          .select("course_id, cohort_id, enrolled_at, courses(slug, title, description, cover_image_url, category)")
          .eq("student_id", user.id)
          .order("enrolled_at", { ascending: false }),
        supabase.from("certificates").select("id", { count: "exact", head: true }).eq("student_id", user.id),
        supabase.from("lesson_progress").select("id", { count: "exact", head: true }).eq("student_id", user.id).eq("completed", true),
        supabase.from("capstone_submissions").select("status, submitted_at").eq("student_id", user.id).order("submitted_at", { ascending: false }).limit(1),
      ]);

      const enrolled = enrollments ?? [];
      const cohortIds = enrolled.map((e) => e.cohort_id).filter((id): id is string => Boolean(id));
      const courseIds = enrolled.map((e) => e.course_id);
      const courseSlugById = new Map(enrolled.map((e) => [e.course_id, e.courses?.slug ?? ""]));

      let annRows: Announcement[] = [];
      let nextLesson: UpcomingLesson | null = null;
      let capstoneByCourse = new Map<string, boolean>();
      if (cohortIds.length > 0) {
        const [{ data: ann }, { data: up }, { data: caps }] = await Promise.all([
          supabase.from("announcements")
            .select("id, title, message, created_at")
            .in("cohort_id", cohortIds)
            .order("created_at", { ascending: false }).limit(5),
          supabase.from("lessons")
            .select("id, title, lesson_date, zoom_live_link, course_id")
            .in("cohort_id", cohortIds)
            .gte("lesson_date", new Date().toISOString())
            .order("lesson_date", { ascending: true }).limit(1),
          supabase.from("courses")
            .select("id, capstone_released")
            .in("id", courseIds.length ? courseIds : ["00000000-0000-0000-0000-000000000000"]),
        ]);
        annRows = (ann ?? []) as Announcement[];
        const u = up?.[0];
        if (u && u.lesson_date) {
          nextLesson = {
            id: u.id,
            title: u.title,
            lesson_date: u.lesson_date,
            zoom_live_link: u.zoom_live_link,
            courseSlug: courseSlugById.get(u.course_id) ?? "",
          };
        }
        for (const c of caps ?? []) {
          if (c.capstone_released) capstoneByCourse.set(c.id, true);
        }
      }

      // Per-course progress (for My Progress section + Continue card)
      const perCourse = await Promise.all(
        enrolled.map(async (e) => {
          const [{ count: lessonsTotal }, { count: lessonsDone }] = await Promise.all([
            supabase.from("lessons").select("id", { count: "exact", head: true })
              .eq("course_id", e.course_id).eq("is_published", true),
            supabase.from("lesson_progress").select("id", { count: "exact", head: true })
              .eq("student_id", user.id).eq("course_id", e.course_id).eq("completed", true),
          ]);
          return {
            slug: e.courses?.slug ?? "",
            title: e.courses?.title ?? "Course",
            done: lessonsDone ?? 0,
            total: lessonsTotal ?? 0,
            capstoneReleased: capstoneByCourse.get(e.course_id) ?? false,
          };
        }),
      );

      let nextCourse: Continue | null = null;
      if (enrolled[0]?.courses) {
        const c = enrolled[0];
        const p = perCourse[0];
        nextCourse = {
          slug: c.courses!.slug,
          title: c.courses!.title,
          description: c.courses!.description,
          cover_image_url: c.courses!.cover_image_url,
          category: c.courses!.category,
          progress: p.total > 0 ? Math.round((p.done / p.total) * 100) : 0,
        };
      }

      const latestCap = capstoneRows?.[0];
      const capStatus: typeof capstoneStatus = !latestCap
        ? "not_started"
        : (latestCap.status as "pending" | "approved" | "rejected" | "recommended") ?? "pending";

      if (!cancelled) {
        setStats({
          enrolled: enrolled.length,
          completedLessons: completedLessons ?? 0,
          certificates: certCount ?? 0,
        });
        setCapstoneStatus(capStatus);
        setNext(nextCourse);
        setAnnouncements(annRows);
        setUpcoming(nextLesson);
        setProgressList(perCourse);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, isAdmin, isInstructor]);

  // While redirecting non-students away, render nothing to avoid flashing student UI.
  if (isAdmin || isInstructor) return null;

  const capstoneLabel = capstoneStatus === "approved" ? "Approved"
    : capstoneStatus === "recommended" ? "Recommended"
    : capstoneStatus === "pending" ? "Submitted"
    : capstoneStatus === "rejected" ? "Revise"
    : "Not Started";

  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl font-extrabold text-forest">Welcome back, {name} 👋</h1>
      <p className="mt-1 text-foreground/65">
        {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      </p>
      {profile?.registration_number && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-forest/15 bg-mint/40 px-3 py-1 text-xs font-semibold text-forest">
          Student ID: <span className="font-mono tracking-wider">{profile.registration_number}</span>
        </p>
      )}

      {/* Row 1 — stat cards */}
      <div className="mt-8 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={BookOpen} label="Enrolled Courses" value={loading ? "…" : String(stats.enrolled)}
          iconBg="bg-[#00F5A0]" iconColor="text-[#0A2E1A]" accent="border-t-4 border-[#00F5A0]" />
        <Stat icon={CheckCircle2} label="Lessons Completed" value={loading ? "…" : String(stats.completedLessons)}
          iconBg="bg-[#1A8C4E]" iconColor="text-white" accent="border-t-4 border-[#1A8C4E]" />
        <Stat icon={Flag} label="Capstone Status" value={loading ? "…" : capstoneLabel}
          iconBg="bg-[#F59E0B]" iconColor="text-white" accent="border-t-4 border-[#F59E0B]" valueClassName="text-base"
          tooltip="Your capstone project is the final assignment for your course. Once submitted and approved by the Evogue Academy team, your certificate will be issued." />
        <Stat icon={Award} label="Certificates Earned" value={loading ? "…" : String(stats.certificates)}
          iconBg="bg-[#0A2E1A]" iconColor="text-[#00F5A0]" accent="border-t-4 border-[#0A2E1A]" />
      </div>

      {/* Row 2 — 60/40 split */}
      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="font-display text-xl font-bold text-forest">Continue Learning</h2>
          {loading ? (
            <div className="mt-4 grid place-items-center py-12 text-foreground/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : next ? (
            <div className="mt-4 rounded-3xl bg-background border border-border overflow-hidden shadow-soft md:flex">
              {next.cover_image_url && (
                <img src={next.cover_image_url} alt={next.title} className="md:w-56 w-full h-44 md:h-auto object-cover" />
              )}
              <div className="p-6 flex-1">
                {next.category && <p className="text-xs uppercase tracking-wide text-secondary font-bold">{next.category}</p>}
                <h3 className="mt-1 font-display text-xl font-bold text-forest">{next.title}</h3>
                {next.description && <p className="mt-1 text-sm text-foreground/70 line-clamp-2">{next.description}</p>}
                <div className="mt-4">
                  <p className="text-xs text-foreground/55 mb-1">{next.progress}% complete</p>
                  <Progress value={next.progress} />
                </div>
                <Button asChild className="mt-5 rounded-full bg-[#0A2E1A] text-mint hover:bg-[#0A2E1A]/90">
                  <Link to="/dashboard/courses/$slug" params={{ slug: next.slug }}>Continue <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-3xl border border-dashed border-mint/50 bg-mint/10 p-10 text-center">
              <BookOpen className="h-10 w-10 text-secondary mx-auto" />
              <p className="mt-3 font-display text-lg font-bold text-forest">You're not enrolled yet</p>
              <p className="mt-1 text-sm text-foreground/60">Reach out and we'll get you into the next cohort.</p>
              <Button asChild className="mt-5 rounded-full bg-[#0A2E1A] text-mint hover:bg-[#0A2E1A]/90">
                <Link to="/contact"><Mail className="h-4 w-4 mr-1.5" /> Contact us to enroll</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div>
            <h2 className="font-display text-xl font-bold text-forest">Upcoming Live Class</h2>
            <div className="mt-4 rounded-3xl border border-border bg-background p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest text-mint"><Video className="h-5 w-5" /></span>
              {upcoming ? (
                <>
                  <p className="mt-4 font-display font-bold text-forest">{upcoming.title}</p>
                  <p className="mt-1 text-sm text-foreground/65">
                    {new Date(upcoming.lesson_date).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {upcoming.zoom_live_link && (
                    <Button asChild className="mt-4 rounded-full bg-[#00F5A0] text-[#0A2E1A] hover:bg-[#00F5A0]/90 font-bold">
                      <a href={upcoming.zoom_live_link} target="_blank" rel="noreferrer">Join Class</a>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <p className="mt-4 font-display font-bold text-forest">No sessions scheduled</p>
                  <p className="mt-1 text-sm text-foreground/65">Your next Zoom live class will appear here.</p>
                </>
              )}
            </div>
          </div>

          {announcements[0] && (
            <div className="rounded-3xl border border-mint/40 bg-mint/15 p-5 flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint text-forest"><Megaphone className="h-4 w-4" /></span>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider font-bold text-secondary">Latest announcement</p>
                <p className="mt-0.5 font-display font-bold text-forest truncate">{announcements[0].title}</p>
                <p className="mt-1 text-sm text-foreground/70 line-clamp-2">{announcements[0].message}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 3 — My Progress (full width) */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-forest">My Progress</h2>
        <div className="mt-4 rounded-3xl bg-background border border-border p-6">
          {loading ? (
            <div className="grid place-items-center py-8 text-foreground/50"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : progressList.length === 0 ? (
            <p className="text-sm text-foreground/60 text-center py-6">Enroll in a course to start tracking your progress.</p>
          ) : (
            <ul className="space-y-5">
              {progressList.map((p) => {
                const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
                return (
                  <li key={p.slug}>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <Link to="/dashboard/courses/$slug" params={{ slug: p.slug }} className="font-display font-bold text-forest hover:underline truncate">
                          {p.title}
                        </Link>
                        {p.capstoneReleased && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            <Flag className="h-3 w-3" /> Capstone Available
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground/55">{p.done} of {p.total} lessons complete</p>
                    </div>
                    <Progress value={pct} className="mt-2" />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function Stat({ icon: Icon, label, value, iconBg = "bg-mint/30", iconColor = "text-secondary", accent = "", valueClassName = "", tooltip }: { icon: typeof BookOpen; label: string; value: string; iconBg?: string; iconColor?: string; accent?: string; valueClassName?: string; tooltip?: string }) {
  const isMobile = useIsMobile();
  const [showTip, setShowTip] = useState(false);
  const tipPos = isMobile ? "top-full mt-2" : "bottom-full mb-2";
  return (
    <div className={`rounded-2xl bg-background border border-border p-5 flex items-center gap-4 shadow-sm ${accent}`}>
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${iconBg} ${iconColor}`}><Icon className="h-5 w-5" /></span>
      <div className="min-w-0">
        <div className="flex items-center gap-[6px]">
          <p className="text-[12px] uppercase tracking-wider font-semibold text-foreground/55">{label}</p>
          {tooltip && (
            <div className="relative" onMouseEnter={() => setShowTip(true)} onMouseLeave={() => setShowTip(false)}>
              <Info
                className="h-[14px] w-[14px] cursor-pointer"
                style={{ color: "rgba(10,46,26,0.35)", fontSize: "14px" }}
                onClick={() => setShowTip((s) => !s)}
              />
              {showTip && (
                <div className={`absolute left-1/2 -translate-x-1/2 z-50 w-max ${tipPos}`}>
                  <div
                    className="rounded-lg p-[10px_14px] text-[12px] leading-[1.6] max-w-[240px]"
                    style={{ background: "#0A2E1A", color: "#EDF7F0", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
                  >
                    {tooltip}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <p className={`font-display font-extrabold text-forest ${valueClassName || "text-2xl"} truncate`}>{value}</p>
      </div>
    </div>
  );
}
