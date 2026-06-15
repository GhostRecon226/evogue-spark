import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Award,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Flag,
  Megaphone,
  Video,
  Mail,
  Info,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  BarChart3,
  Check,
  X,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import pmBaImg from "@/assets/courses/project-management-business-analysis.jpg";
import dmImg from "@/assets/courses/digital-marketing.jpg";
import aiImg from "@/assets/courses/ai-for-professionals.jpg";

type CapstoneDetail = {
  status: "pending" | "recommended" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at: string | null;
  instructor_recommendation: boolean | null;
  instructor_note: string | null;
  admin_note?: string | null;
  file_url?: string | null;
  notes?: string | null;
};

type PaymentRow = {
  id: string;
  amount: number;
  original_amount: number | null;
  currency: string;
  payment_status: "paid" | "pending" | "unpaid" | "failed" | string;
  payment_method: string | null;
  flutterwave_tx_id: string | null;
  paid_at: string | null;
  discount_applied: number;
  coupon: { code: string; discount_type: string; discount_value: number } | null;
  course_title: string;
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
type UpcomingLesson = {
  id: string;
  title: string;
  lesson_date: string;
  zoom_live_link: string | null;
  courseSlug: string;
};

const RECOMMENDED_COURSES = [
  {
    slug: "project-management-business-analysis",
    title: "Project Management & Business Analysis",
    cover: pmBaImg,
    duration: "10 weeks",
    level: "Beginner – Intermediate",
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    cover: dmImg,
    duration: "3 weeks",
    level: "Beginner",
  },
  {
    slug: "ai-for-professionals",
    title: "AI for Professionals",
    cover: aiImg,
    duration: "3 weeks",
    level: "Beginner",
  },
];

function DashboardHome() {
  const { user, profile, isAdmin, isInstructor, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const name =
    profile?.full_name?.trim() ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Student";

  // Redirect non-students away from the student dashboard.
  useEffect(() => {
    if (authLoading) return;
    if (isAdmin) void navigate({ to: "/admin", replace: true });
    else if (isInstructor) void navigate({ to: "/instructor", replace: true });
  }, [authLoading, isAdmin, isInstructor, navigate]);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ enrolled: 0, completedLessons: 0, certificates: 0 });
  const [capstoneStatus, setCapstoneStatus] = useState<
    "not_started" | "pending" | "approved" | "rejected" | "recommended"
  >("not_started");
  const [next, setNext] = useState<Continue | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingLesson | null>(null);
  const [progressList, setProgressList] = useState<
    Array<{ slug: string; title: string; done: number; total: number; capstoneReleased: boolean }>
  >([]);
  const [capstoneDetail, setCapstoneDetail] = useState<CapstoneDetail | null>(null);
  const [capstoneOpen, setCapstoneOpen] = useState(false);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [enrolledCourse, setEnrolledCourse] = useState<{
    id: string;
    title: string;
    duration: string | null;
    level: string | null;
    slug: string;
    enrolled_at: string;
  } | null>(null);

  useEffect(() => {
    if (authLoading || !user || isAdmin || isInstructor) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [
        { data: enrollments },
        { count: certCount },
        { count: completedLessons },
        { data: capstoneRows },
        { data: paymentRows },
      ] = await Promise.all([
        supabase
          .from("enrollments")
          .select(
            "course_id, cohort_id, enrolled_at, courses(slug, title, description, cover_image_url, category, duration, level)",
          )
          .eq("student_id", user.id)
          .order("enrolled_at", { ascending: false }),
        supabase
          .from("certificates")
          .select("id", { count: "exact", head: true })
          .eq("student_id", user.id),
        supabase
          .from("lesson_progress")
          .select("id", { count: "exact", head: true })
          .eq("student_id", user.id)
          .eq("completed", true),
        supabase
          .from("capstone_submissions")
          .select(
            "status, submitted_at, reviewed_at, instructor_recommendation, instructor_note, file_url, notes",
          )
          .eq("student_id", user.id)
          .order("submitted_at", { ascending: false })
          .limit(1),
        supabase
          .from("payments")
          .select(
            "id, amount, original_amount, currency, payment_status, payment_method, flutterwave_tx_id, paid_at, discount_applied, courses:course_id(title), coupon_codes:coupon_id(code, discount_type, discount_value)",
          )
          .eq("student_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      const enrolled = enrollments ?? [];
      const cohortIds = enrolled.map((e) => e.cohort_id).filter((id): id is string => Boolean(id));
      const courseIds = enrolled.map((e) => e.course_id);
      const courseSlugById = new Map(enrolled.map((e) => [e.course_id, e.courses?.slug ?? ""]));

      let annRows: Announcement[] = [];
      let nextLesson: UpcomingLesson | null = null;
      const capstoneByCourse = new Map<string, boolean>();
      if (cohortIds.length > 0) {
        const [{ data: ann }, { data: up }, { data: caps }] = await Promise.all([
          supabase
            .from("announcements")
            .select("id, title, message, created_at")
            .in("cohort_id", cohortIds)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("lessons")
            .select("id, title, lesson_date, zoom_live_link, course_id")
            .in("cohort_id", cohortIds)
            .gte("lesson_date", new Date().toISOString())
            .order("lesson_date", { ascending: true })
            .limit(1),
          supabase
            .from("courses")
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
            supabase
              .from("lessons")
              .select("id", { count: "exact", head: true })
              .eq("course_id", e.course_id)
              .eq("is_published", true),
            supabase
              .from("lesson_progress")
              .select("id", { count: "exact", head: true })
              .eq("student_id", user.id)
              .eq("course_id", e.course_id)
              .eq("completed", true),
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
        : ((latestCap.status as "pending" | "approved" | "rejected" | "recommended") ?? "pending");

      if (!cancelled) {
        setStats({
          enrolled: enrolled.length,
          completedLessons: completedLessons ?? 0,
          certificates: certCount ?? 0,
        });
        setCapstoneStatus(capStatus);
        setCapstoneDetail((latestCap as CapstoneDetail | undefined) ?? null);
        setNext(nextCourse);
        setAnnouncements(annRows);
        setUpcoming(nextLesson);
        setProgressList(perCourse);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isAdmin, isInstructor, authLoading]);

  // While auth/role resolution is in flight, or while redirecting a non-student
  // away, render nothing so student UI never flashes for admins/instructors.
  if (authLoading || isAdmin || isInstructor) return null;

  const capstoneLabel =
    capstoneStatus === "approved"
      ? "Approved"
      : capstoneStatus === "recommended"
        ? "Recommended"
        : capstoneStatus === "pending"
          ? "Submitted"
          : capstoneStatus === "rejected"
            ? "Revise"
            : "Not Started";

  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl font-extrabold text-forest">Welcome back, {name} 👋</h1>
      <p className="mt-1 text-foreground/65">
        {new Date().toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>
      {profile?.registration_number && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-forest/15 bg-mint/40 px-3 py-1 text-xs font-semibold text-forest">
          Student ID:{" "}
          <span className="font-mono tracking-wider">{profile.registration_number}</span>
        </p>
      )}

      {/* Row 1 — stat cards */}
      <div className="mt-8 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={BookOpen}
          label="Enrolled Courses"
          value={loading ? "…" : String(stats.enrolled)}
          iconBg="bg-[#00F5A0]"
          iconColor="text-[#0A2E1A]"
          accent="border-t-4 border-[#00F5A0]"
        />
        <Stat
          icon={CheckCircle2}
          label="Lessons Completed"
          value={loading ? "…" : String(stats.completedLessons)}
          iconBg="bg-[#1A8C4E]"
          iconColor="text-white"
          accent="border-t-4 border-[#1A8C4E]"
        />
        <Stat
          icon={Flag}
          label="Capstone Status"
          value={loading ? "…" : capstoneLabel}
          iconBg="bg-[#F59E0B]"
          iconColor="text-white"
          accent="border-t-4 border-[#F59E0B]"
          valueClassName="text-base"
          tooltip="Your capstone project is the final assignment for your course. Once submitted and approved by the Evogue Academy team, your certificate will be issued."
          actionLabel="View details"
          onAction={() => setCapstoneOpen(true)}
        />

        <Stat
          icon={Award}
          label="Certificates Earned"
          value={loading ? "…" : String(stats.certificates)}
          iconBg="bg-[#0A2E1A]"
          iconColor="text-[#00F5A0]"
          accent="border-t-4 border-[#0A2E1A]"
        />
      </div>

      {/* Row 2 — 60/40 split */}
      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="font-display text-xl font-bold text-forest">Continue Learning</h2>
          {loading ? (
            <div className="mt-4 grid place-items-center py-12 text-foreground/50">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : next ? (
            <div className="mt-4 rounded-3xl bg-background border border-border overflow-hidden shadow-soft md:flex">
              {next.cover_image_url && (
                <img
                  src={next.cover_image_url}
                  alt={next.title}
                  className="md:w-56 w-full h-44 md:h-auto object-cover"
                />
              )}
              <div className="p-6 flex-1">
                {next.category && (
                  <p className="text-xs uppercase tracking-wide text-secondary font-bold">
                    {next.category}
                  </p>
                )}
                <h3 className="mt-1 font-display text-xl font-bold text-forest">{next.title}</h3>
                {next.description && (
                  <p className="mt-1 text-sm text-foreground/70 line-clamp-2">{next.description}</p>
                )}
                <div className="mt-4">
                  <p className="text-xs text-foreground/55 mb-1">{next.progress}% complete</p>
                  <Progress value={next.progress} />
                </div>
                <Button
                  asChild
                  className="mt-5 rounded-full bg-[#0A2E1A] text-mint hover:bg-[#0A2E1A]/90"
                >
                  <Link to="/dashboard/courses/$slug" params={{ slug: next.slug }}>
                    Continue <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-3xl border border-dashed border-mint/50 bg-mint/10 p-10 text-center">
              <BookOpen className="h-10 w-10 text-secondary mx-auto" />
              <p className="mt-3 font-display text-lg font-bold text-forest">
                You're not enrolled yet
              </p>
              <p className="mt-1 text-sm text-foreground/60">
                Reach out and we'll get you into the next cohort.
              </p>
              <Button
                asChild
                className="mt-5 rounded-full bg-[#0A2E1A] text-mint hover:bg-[#0A2E1A]/90"
              >
                <Link to="/contact">
                  <Mail className="h-4 w-4 mr-1.5" /> Contact us to enroll
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div>
            <h2 className="font-display text-xl font-bold text-forest">Upcoming Live Class</h2>
            <div className="mt-4 rounded-3xl border border-border bg-background p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest text-mint">
                <Video className="h-5 w-5" />
              </span>
              {upcoming ? (
                <>
                  <p className="mt-4 font-display font-bold text-forest">{upcoming.title}</p>
                  <p className="mt-1 text-sm text-foreground/65">
                    {new Date(upcoming.lesson_date).toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {upcoming.zoom_live_link && (
                    <Button
                      asChild
                      className="mt-4 rounded-full bg-[#00F5A0] text-[#0A2E1A] hover:bg-[#00F5A0]/90 font-bold"
                    >
                      <a href={upcoming.zoom_live_link} target="_blank" rel="noreferrer">
                        Join Class
                      </a>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <p className="mt-4 font-display font-bold text-forest">No sessions scheduled</p>
                  <p className="mt-1 text-sm text-foreground/65">
                    Your next Zoom live class will appear here.
                  </p>
                </>
              )}
            </div>
          </div>

          {announcements[0] && (
            <div className="rounded-3xl border border-mint/40 bg-mint/15 p-5 flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint text-forest">
                <Megaphone className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider font-bold text-secondary">
                  Latest announcement
                </p>
                <p className="mt-0.5 font-display font-bold text-forest truncate">
                  {announcements[0].title}
                </p>
                <p className="mt-1 text-sm text-foreground/70 line-clamp-2">
                  {announcements[0].message}
                </p>
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
            <div className="grid place-items-center py-8 text-foreground/50">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : progressList.length === 0 ? (
            <p className="text-sm text-foreground/60 text-center py-6">
              Enroll in a course to start tracking your progress.
            </p>
          ) : (
            <ul className="space-y-5">
              {progressList.map((p) => {
                const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
                return (
                  <li key={p.slug}>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <Link
                          to="/dashboard/courses/$slug"
                          params={{ slug: p.slug }}
                          className="font-display font-bold text-forest hover:underline truncate"
                        >
                          {p.title}
                        </Link>
                        {p.capstoneReleased && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            <Flag className="h-3 w-3" /> Capstone Available
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground/55">
                        {p.done} of {p.total} lessons complete
                      </p>
                    </div>
                    <Progress value={pct} className="mt-2" />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Row 4 — Explore More Courses */}
      <div className="mt-10">
        <h2 className="font-display text-[18px] font-semibold text-[#0A2E1A]">
          Explore More Courses
        </h2>
        <p className="mt-1 text-[13px] text-[rgba(10,46,26,0.5)] mb-5">
          Expand your skills with another Evogue Academy programme.
        </p>
        {loading ? (
          <div className="grid place-items-center py-8 text-foreground/50">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:overflow-visible">
            {(() => {
              const enrolledTitles = new Set(progressList.map((p) => p.title));
              const recs = RECOMMENDED_COURSES.filter((c) => !enrolledTitles.has(c.title)).slice(
                0,
                3,
              );
              return recs.map((course) => (
                <div
                  key={course.slug}
                  className="min-w-[260px] w-[260px] snap-start bg-white rounded-xl border border-[rgba(10,46,26,0.08)] overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(10,46,26,0.08)] sm:min-w-0 sm:w-auto"
                >
                  <img
                    src={course.cover}
                    alt={course.title}
                    className="w-full h-[120px] object-cover"
                  />
                  <div className="p-[14px_16px] flex flex-col flex-1">
                    <h3 className="text-[13px] font-semibold text-[#0A2E1A] mb-1">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-[10px] text-[11px] text-[rgba(10,46,26,0.5)] mb-3">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {course.duration}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" /> {course.level}
                      </span>
                    </div>
                    <Link
                      to="/courses/$slug"
                      params={{ slug: course.slug }}
                      className="mt-auto block w-full text-center bg-[#EDF7F0] border border-[rgba(10,46,26,0.12)] text-[#0A2E1A] px-[14px] py-2 rounded-md text-[12px] font-medium transition-colors duration-200 hover:bg-[#d4eede]"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </div>

      {/* Row 5 — Coupon code */}
      <CouponSection userId={user?.id} initialCode={profile?.applied_coupon_code ?? null} />

      <CapstoneTimelineDialog
        open={capstoneOpen}
        onOpenChange={setCapstoneOpen}
        status={capstoneStatus}
        detail={capstoneDetail}
      />
    </DashboardLayout>
  );
}

function CouponSection({
  userId,
  initialCode,
}: {
  userId: string | undefined;
  initialCode: string | null;
}) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [applied, setApplied] = useState<{
    code: string;
    type: "percentage" | "fixed";
    value: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const formatDiscount = (type: "percentage" | "fixed", value: number) =>
    type === "fixed" ? `£${value}` : `${value}%`;

  useEffect(() => {
    if (!initialCode) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.rpc("get_coupon_preview", { _code: initialCode });
      const row = Array.isArray(data) ? data[0] : null;
      if (!cancelled && row) {
        setApplied({
          code: row.code,
          type: (row.discount_type as "percentage" | "fixed") ?? "percentage",
          value: Number(row.discount_value ?? 0),
        });
        setStatus("success");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialCode]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setStatus("loading");
    setErrorMsg("");

    const { data, error } = await supabase.rpc("redeem_coupon", { _code: trimmed });

    if (error || !data || data.length === 0) {
      setStatus("error");
      setErrorMsg("Invalid or expired code. Please check and try again.");
      setApplied(null);
      return;
    }

    const row = data[0];
    setApplied({
      code: row.code,
      type: (row.discount_type as "percentage" | "fixed") ?? "percentage",
      value: Number(row.discount_value ?? 0),
    });
    setStatus("success");
    setCode("");
  };

  return (
    <div className="mt-10">
      <h2 className="text-[18px] font-semibold text-[#0A2E1A] mb-1">Got a discount code?</h2>
      <p className="text-[13px] text-[rgba(10,46,26,0.5)] mb-5">
        Enter your coupon code below and we'll apply it to your next enrolment.
      </p>
      <div className="bg-white rounded-xl border border-[rgba(10,46,26,0.08)] p-6 flex flex-col gap-4 max-w-[480px]">
        <form onSubmit={handleApply} className="flex gap-[10px] items-center">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ENTER CODE"
            maxLength={32}
            className="flex-1 px-4 py-[11px] border-[1.5px] border-[rgba(10,46,26,0.12)] rounded-lg text-sm text-[#0A2E1A] uppercase tracking-[0.08em] outline-none focus:border-[#1A8C4E] focus:shadow-[0_0_0_3px_rgba(26,140,78,0.08)] transition-all"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-[#0A2E1A] text-white px-[22px] py-[11px] rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors hover:bg-[#1A8C4E] disabled:opacity-60"
          >
            {status === "loading" ? "Applying…" : "Apply"}
          </button>
        </form>

        {status === "success" && applied && (
          <div className="flex items-start gap-2 bg-[rgba(0,245,160,0.08)] border border-[rgba(0,245,160,0.25)] rounded-lg px-4 py-3 text-[13px] text-[#0A5C2A] font-medium">
            <Check className="h-4 w-4 mt-0.5 shrink-0 text-[#00F5A0]" strokeWidth={3} />
            <span>
              Code applied successfully. Your {formatDiscount(applied.type, applied.value)} discount
              has been noted. Mention this code when you contact us to enrol.
            </span>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-start gap-2 bg-[rgba(220,38,38,0.06)] border border-[rgba(220,38,38,0.2)] rounded-lg px-4 py-3 text-[13px] text-[#991b1b] font-medium">
            <X className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={3} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  iconBg = "bg-mint/30",
  iconColor = "text-secondary",
  accent = "",
  valueClassName = "",
  tooltip,
  actionLabel,
  onAction,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
  iconBg?: string;
  iconColor?: string;
  accent?: string;
  valueClassName?: string;
  tooltip?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const isMobile = useIsMobile();
  const [showTip, setShowTip] = useState(false);
  const tipPos = isMobile ? "top-full mt-2" : "bottom-full mb-2";
  return (
    <div
      className={`rounded-2xl bg-background border border-border p-5 flex items-center gap-4 shadow-sm ${accent}`}
    >
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${iconBg} ${iconColor}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-[6px] flex-wrap">
          <p className="text-[12px] uppercase tracking-wider font-semibold text-foreground/55">
            {label}
          </p>
          {tooltip && (
            <div
              className="relative"
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
            >
              <Info
                className="h-[14px] w-[14px] cursor-pointer"
                style={{ color: "rgba(10,46,26,0.35)", fontSize: "14px" }}
                onClick={() => setShowTip((s) => !s)}
              />
              {showTip && (
                <div className={`absolute left-1/2 -translate-x-1/2 z-50 w-max ${tipPos}`}>
                  <div
                    className="rounded-lg p-[10px_14px] text-[12px] leading-[1.6] max-w-[240px]"
                    style={{
                      background: "#0A2E1A",
                      color: "#EDF7F0",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    }}
                  >
                    {tooltip}
                  </div>
                </div>
              )}
            </div>
          )}
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="text-[11px] font-semibold text-secondary hover:underline"
            >
              {actionLabel}
            </button>
          )}
        </div>
        <p
          className={`font-display font-extrabold text-forest ${valueClassName || "text-2xl"} truncate`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function CapstoneTimelineDialog({
  open,
  onOpenChange,
  status,
  detail,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  status: "not_started" | "pending" | "approved" | "rejected" | "recommended";
  detail: CapstoneDetail | null;
}) {
  const fmt = (d: string | null | undefined) =>
    d
      ? new Date(d).toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  type Step = {
    key: string;
    label: string;
    icon: typeof Upload;
    state: "done" | "current" | "pending" | "rejected";
    at?: string | null;
    note?: string | null;
  };

  const steps: Step[] = (() => {
    if (!detail) {
      return [
        { key: "submit", label: "Submit your capstone", icon: Upload, state: "current" },
        { key: "instructor", label: "Instructor review", icon: CheckCircle2, state: "pending" },
        { key: "admin", label: "Final approval & certificate", icon: Award, state: "pending" },
      ];
    }
    const submittedAt = fmt(detail.submitted_at);
    const reviewedAt = fmt(detail.reviewed_at);
    const submitStep: Step = {
      key: "submit",
      label: "Capstone submitted",
      icon: Upload,
      state: "done",
      at: submittedAt,
    };

    if (status === "rejected") {
      return [
        submitStep,
        {
          key: "instructor",
          label: "Needs revision",
          icon: XCircle,
          state: "rejected",
          at: reviewedAt,
          note: detail.instructor_note,
        },
        { key: "admin", label: "Final approval & certificate", icon: Award, state: "pending" },
      ];
    }
    if (status === "approved") {
      return [
        submitStep,
        {
          key: "instructor",
          label: "Instructor recommended",
          icon: CheckCircle2,
          state: "done",
          at: reviewedAt,
          note: detail.instructor_note,
        },
        {
          key: "admin",
          label: "Approved · Certificate issued",
          icon: Award,
          state: "done",
          at: reviewedAt,
        },
      ];
    }
    if (status === "recommended") {
      return [
        submitStep,
        {
          key: "instructor",
          label: "Instructor recommended",
          icon: CheckCircle2,
          state: "done",
          at: reviewedAt,
          note: detail.instructor_note,
        },
        { key: "admin", label: "Awaiting final approval", icon: Clock, state: "current" },
      ];
    }
    // pending
    return [
      submitStep,
      { key: "instructor", label: "Instructor review in progress", icon: Clock, state: "current" },
      { key: "admin", label: "Final approval & certificate", icon: Award, state: "pending" },
    ];
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-forest">Capstone Timeline</DialogTitle>
          <DialogDescription>Track your submission and approval progress.</DialogDescription>
        </DialogHeader>
        <ol className="mt-2 space-y-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const tone =
              s.state === "done"
                ? "bg-secondary text-white border-secondary"
                : s.state === "current"
                  ? "bg-[#F59E0B] text-white border-[#F59E0B]"
                  : s.state === "rejected"
                    ? "bg-destructive text-white border-destructive"
                    : "bg-background text-foreground/40 border-border";
            return (
              <li key={s.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`grid h-8 w-8 place-items-center rounded-full border-2 ${tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  {i < steps.length - 1 && <span className="flex-1 w-px bg-border mt-1" />}
                </div>
                <div className="pb-2 min-w-0">
                  <p className="font-display font-bold text-forest">{s.label}</p>
                  {s.at && <p className="text-xs text-foreground/55 mt-0.5">{s.at}</p>}
                  {s.note && (
                    <div className="mt-2 rounded-lg bg-mint-tint p-3 text-sm text-foreground/80">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">
                        Instructor note
                      </p>
                      {s.note}
                    </div>
                  )}
                  {s.state === "current" && !s.at && (
                    <p className="text-xs text-foreground/55 mt-0.5">In progress…</p>
                  )}
                  {s.state === "pending" && (
                    <p className="text-xs text-foreground/45 mt-0.5">Pending</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
