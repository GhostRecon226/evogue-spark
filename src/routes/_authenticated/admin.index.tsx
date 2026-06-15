import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  ClipboardCheck,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  UserPlus,
  GraduationCap,
  Award,
  FileCheck2,
  Search,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { formatUSD } from "@/lib/coursePricing";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { sendEnrollmentEmails } from "@/lib/enrollment-emails.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

type RecentRow = {
  id: string;
  student: string;
  reg_no: string;
  course: string;
  cohort: string;
  enrolled_at: string;
  payment_status: string;
};
type CapstoneRow = {
  id: string;
  student: string;
  reg_no: string;
  course: string;
  submitted_at: string;
};
type ActivityItem = {
  id: string;
  type: "enrollment" | "student" | "capstone" | "certificate";
  title: string;
  meta: string;
  at: string;
};

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(d: Date) {
  return d.toLocaleString("en-US", { month: "short" });
}

function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<"USD" | "NGN">("USD");
  const [usdToNgn] = useState<number>(1600);
  const [stats, setStats] = useState({
    students: 0,
    activeEnrollments: 0,
    revenueUSD: 0,
    revenueNGN: 0,
    pendingApplications: 0,
  });
  const [recent, setRecent] = useState<RecentRow[]>([]);
  const [pendingCapstones, setPendingCapstones] = useState<CapstoneRow[]>([]);
  const [chartRange, setChartRange] = useState<"month" | "year">("year");
  const [chartData, setChartData] = useState<
    { month: string; enrollments: number; revenue: number }[]
  >([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [trends, setTrends] = useState({ students: 0, enrollments: 0, revenue: 0, applications: 0 });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [
        studentsRes,
        enrolRes,
        coursesRes,
        recentRes,
        capRes,
        certRes,
        profRes,
        paymentsRes,
        applicationsRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id, created_at").eq("role", "student"),
        supabase
          .from("enrollments")
          .select("id, payment_status, course_id, enrolled_at, cohort_id, status"),
        supabase.from("courses").select("id, price, title, slug"),
        supabase
          .from("enrollments")
          .select(
            "id, enrolled_at, payment_status, profiles:student_id(full_name, email, registration_number), courses:course_id(title), cohorts:cohort_id(name)",
          )
          .order("enrolled_at", { ascending: false })
          .limit(8),
        supabase
          .from("capstone_submissions")
          .select(
            "id, status, submitted_at, student:profiles!capstone_submissions_student_id_fkey(full_name, email, registration_number), course:courses!capstone_submissions_course_id_fkey(title)",
          )
          .order("submitted_at", { ascending: false })
          .limit(20),
        supabase
          .from("certificates")
          .select("id, issued_at")
          .order("issued_at", { ascending: false })
          .limit(5),
        supabase
          .from("profiles")
          .select("id, full_name, email, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("payments")
          .select("id, amount, currency, payment_status, paid_at, created_at")
          .eq("payment_status", "paid"),
        supabase.from("applications").select("id, status, created_at"),
      ]);
      if (cancelled) return;

      const courseRows = coursesRes.data ?? [];
      const courseMap = new Map(courseRows.map((c) => [c.id, c]));
      const enrolRows = enrolRes.data ?? [];
      const profileRows = studentsRes.data ?? [];
      const paymentRows = paymentsRes.data ?? [];
      const applicationRows = applicationsRes.data ?? [];
      const capRows = (capRes.data ?? []) as unknown as Array<{
        id: string;
        status: string;
        submitted_at: string;
        student: {
          full_name: string | null;
          email: string | null;
          registration_number: string | null;
        } | null;
        course: { title: string | null } | null;
      }>;

      // Revenue from payments table; split by currency
      let revenueUSD = 0;
      let revenueNGN = 0;
      for (const p of paymentRows) {
        const amt = Number(p.amount) || 0;
        if (p.currency === "USD") revenueUSD += amt;
        else if (p.currency === "NGN") revenueNGN += amt;
      }

      const activeEnrollments = enrolRows.filter((e) => e.status === "active").length;
      const pendingApplications = applicationRows.filter((a) => a.status === "new").length;

      setStats({
        students: profileRows.length,
        activeEnrollments,
        revenueUSD,
        revenueNGN,
        pendingApplications,
      });

      // Trend calc: last 30d vs prior 30d
      const now = Date.now();
      const day = 86400000;
      const calc = (
        rows: { created_at?: string | null; enrolled_at?: string | null; paid_at?: string | null }[],
        key: "created_at" | "enrolled_at" | "paid_at",
      ) => {
        const recent = rows.filter(
          (r) => r[key] && now - new Date(r[key]!).getTime() < 30 * day,
        ).length;
        const prior = rows.filter((r) => {
          const t = r[key] ? now - new Date(r[key]!).getTime() : 0;
          return t >= 30 * day && t < 60 * day;
        }).length;
        if (prior === 0) return recent > 0 ? 100 : 0;
        return Math.round(((recent - prior) / prior) * 100);
      };
      setTrends({
        students: calc(profileRows, "created_at"),
        enrollments: calc(enrolRows.filter((e) => e.status === "active"), "enrolled_at"),
        revenue: calc(paymentRows, "paid_at"),
        applications: calc(applicationRows.filter((a) => a.status === "new"), "created_at"),
      });

      // Chart: build last 6 months series (enrollments + USD revenue from payments)
      const months: { date: Date; key: string; label: string }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        months.push({ date: d, key: monthKey(d), label: monthLabel(d) });
      }
      const series = months.map((m) => {
        const monthEnrols = enrolRows.filter(
          (e) => e.enrolled_at && monthKey(new Date(e.enrolled_at)) === m.key,
        );
        const monthPayments = paymentRows.filter(
          (p) => p.paid_at && monthKey(new Date(p.paid_at)) === m.key,
        );
        const rev = monthPayments.reduce((sum, p) => {
          const amt = Number(p.amount) || 0;
          if (p.currency === "USD") return sum + amt;
          if (p.currency === "NGN") return sum + amt / (usdToNgn || 1600);
          return sum;
        }, 0);
        return { month: m.label, enrollments: monthEnrols.length, revenue: Math.round(rev) };
      });
      setChartData(series);

      setRecent(
        (recentRes.data ?? []).slice(0, 5).map((r) => ({
          id: r.id,
          student: r.profiles?.full_name || r.profiles?.email || "—",
          reg_no: r.profiles?.registration_number || "—",
          course: r.courses?.title || "—",
          cohort: r.cohorts?.name || "—",
          enrolled_at: r.enrolled_at,
          payment_status: r.payment_status,
        })),
      );

      setPendingCapstones(
        capRows
          .filter((c) => c.status === "pending")
          .slice(0, 4)
          .map((c) => ({
            id: c.id,
            student: c.student?.full_name || c.student?.email || "—",
            reg_no: c.student?.registration_number || "—",
            course: c.course?.title || "—",
            submitted_at: c.submitted_at,
          })),
      );

      // Build activity feed
      const acts: ActivityItem[] = [];
      (profRes.data ?? []).slice(0, 3).forEach((p) =>
        acts.push({
          id: `p-${p.id}`,
          type: "student",
          title: "New student registered",
          meta: p.full_name || p.email || "",
          at: p.created_at,
        }),
      );
      (recentRes.data ?? []).slice(0, 3).forEach((r) =>
        acts.push({
          id: `e-${r.id}`,
          type: "enrollment",
          title: "New enrollment",
          meta: `${r.profiles?.full_name || "Student"} → ${r.courses?.title || ""}`,
          at: r.enrolled_at,
        }),
      );
      capRows.slice(0, 3).forEach((c) =>
        acts.push({
          id: `c-${c.id}`,
          type: "capstone",
          title: "Capstone submitted",
          meta: c.student?.full_name || "—",
          at: c.submitted_at,
        }),
      );
      (certRes.data ?? []).slice(0, 2).forEach((c) =>
        acts.push({
          id: `cert-${c.id}`,
          type: "certificate",
          title: "Certificate issued",
          meta: "",
          at: c.issued_at,
        }),
      );
      acts.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
      setActivity(acts.slice(0, 8));

      setLoading(false);
    };

    void load();

    // Realtime: refresh when applications/payments/enrollments change
    const ch = supabase
      .channel("admin-overview")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        () => void load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => void load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enrollments" },
        () => void load(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(ch);
    };
  }, [usdToNgn]);

  const visibleChart = useMemo(() => {
    return chartRange === "month" ? chartData.slice(-1) : chartData;
  }, [chartData, chartRange]);

  const revenueDisplay =
    currency === "USD"
      ? formatUSD(stats.revenueUSD + stats.revenueNGN / (usdToNgn || 1600))
      : new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
          maximumFractionDigits: 0,
        }).format(stats.revenueNGN + stats.revenueUSD * (usdToNgn || 1600));

  const cards = [
    {
      label: "Total Students",
      value: stats.students.toLocaleString(),
      trend: trends.students,
      icon: Users,
      bg: "bg-[#0A2E1A]",
      text: "text-white",
      iconWrap: "bg-white/10 text-[#00F5A0]",
      trendBg: "bg-[#00F5A0]/15 text-[#00F5A0]",
    },
    {
      label: "Active Enrollments",
      value: stats.activeEnrollments.toLocaleString(),
      trend: trends.enrollments,
      icon: ClipboardCheck,
      bg: "bg-[#ECFDF5]",
      text: "text-[#0A2E1A]",
      iconWrap: "bg-white text-[#1A8C4E]",
      trendBg: "bg-[#1A8C4E]/10 text-[#1A8C4E]",
    },
    {
      label: `Total Revenue (${currency})`,
      value: revenueDisplay,
      trend: trends.revenue,
      icon: Wallet,
      bg: "bg-[#DCFCE7]",
      text: "text-[#0A2E1A]",
      iconWrap: "bg-white text-[#1A8C4E]",
      trendBg: "bg-[#1A8C4E]/10 text-[#1A8C4E]",
    },
    {
      label: "Pending Applications",
      value: stats.pendingApplications.toLocaleString(),
      trend: trends.applications,
      icon: Clock,
      bg: "bg-[#FFFBEB]",
      text: "text-[#0A2E1A]",
      iconWrap: "bg-white text-[#F59E0B]",
      trendBg: "bg-[#F59E0B]/15 text-[#B45309]",
    },
  ];

  return (
    <AdminGuard>
      {/* Page header w/ search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#0A2E1A]">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            A snapshot of activity across the academy.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <TestEnrollmentEmailsButton />
          <div className="inline-flex rounded-full border border-border bg-white p-1 text-xs font-semibold self-start">
            {(["USD", "NGN"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`rounded-full px-3 py-1.5 transition ${
                  currency === c
                    ? "bg-[#0A2E1A] text-[#00F5A0]"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
            <input
              type="search"
              placeholder="Search students, courses…"
              className="w-full rounded-full border border-border bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00F5A0]/40"
            />
          </div>
        </div>
      </div>

      {/* Row 1: stat cards (always rendered; skeleton while loading to prevent layout jump) */}
      <div className="mt-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const up = c.trend >= 0;
          return (
            <div
              key={c.label}
              className={`relative overflow-hidden rounded-2xl ${c.bg} ${c.text} px-4 py-3 shadow-sm max-h-[120px]`}
            >
              <div className="flex items-start justify-between">
                <div className={`grid h-9 w-9 place-items-center rounded-lg ${c.iconWrap}`}>
                  <c.icon className="h-4 w-4" />
                </div>
                {loading ? (
                  <span className="h-5 w-12 rounded-full bg-current/10 animate-pulse" aria-hidden />
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${c.trendBg}`}
                  >
                    {up ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(c.trend)}%
                  </span>
                )}
              </div>
              {loading ? (
                <>
                  <div className="mt-3 h-6 w-20 rounded-md bg-current/10 animate-pulse" />
                  <div className="mt-2 h-3 w-24 rounded bg-current/10 animate-pulse" />
                </>
              ) : (
                <>
                  <p className="mt-2 font-display text-2xl font-extrabold leading-none">
                    {c.value}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold opacity-80">{c.label}</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="grid place-items-center py-16 text-foreground/50">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          {/* Row 2: chart + activity */}
          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#0A2E1A]">
                    Enrollment & Revenue Trends
                  </h2>
                  <p className="text-xs text-foreground/55">
                    Last 6 months · revenue in USD
                  </p>
                </div>
                <div className="inline-flex rounded-full border border-border p-1 text-xs font-semibold">
                  {(["month", "year"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setChartRange(r)}
                      className={`rounded-full px-3 py-1.5 transition ${chartRange === r ? "bg-[#0A2E1A] text-[#00F5A0]" : "text-foreground/60 hover:text-foreground"}`}
                    >
                      {r === "month" ? "This Month" : "This Year"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={visibleChart}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="enrollments"
                      stroke="#1A8C4E"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#00F5A0"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-[#0A2E1A]">Recent Activity</h2>
                <span className="text-xs text-foreground/55">Live</span>
              </div>
              <ul className="mt-4 space-y-4 max-h-72 overflow-y-auto pr-1">
                {activity.length === 0 && (
                  <li className="text-sm text-foreground/50">No activity yet.</li>
                )}
                {activity.map((a) => (
                  <li key={a.id} className="flex items-start gap-3">
                    <ActivityIcon type={a.type} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#0A2E1A] truncate">{a.title}</p>
                      {a.meta && <p className="text-xs text-foreground/60 truncate">{a.meta}</p>}
                      <p className="mt-0.5 text-[11px] text-foreground/45">{fmtRelative(a.at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Row 3: enrollments table + pending capstones */}
          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-[#0A2E1A]">
                  Recent Enrollments
                </h2>
                <Link
                  to="/admin/enrollments"
                  className="text-sm font-bold text-[#1A8C4E] hover:text-[#0A2E1A]"
                >
                  View all →
                </Link>
              </div>
              <div className="mt-4 -mx-5 overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-foreground/55 border-b border-border">
                      <th className="py-2.5 px-5 font-semibold">Student ID</th>
                      <th className="py-2.5 px-2 font-semibold">Student</th>
                      <th className="py-2.5 px-2 font-semibold">Course</th>
                      <th className="py-2.5 px-2 font-semibold">Cohort</th>
                      <th className="py-2.5 px-2 font-semibold">Date</th>
                      <th className="py-2.5 px-5 font-semibold">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-foreground/50">
                          No enrollments yet.
                        </td>
                      </tr>
                    )}
                    {recent.map((r, i) => (
                      <tr key={r.id} className={i % 2 ? "bg-[#F9FAFB]" : ""}>
                        <td className="py-3 px-5 font-mono text-xs text-foreground/70">
                          {r.reg_no}
                        </td>
                        <td className="py-3 px-2 font-semibold text-[#0A2E1A]">{r.student}</td>
                        <td className="py-3 px-2 text-foreground/75">{r.course}</td>
                        <td className="py-3 px-2 text-foreground/75">{r.cohort}</td>
                        <td className="py-3 px-2 text-foreground/60">
                          {new Date(r.enrolled_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-5">
                          <PaymentBadge status={r.payment_status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-[#0A2E1A]">Pending Capstones</h2>
                <Link
                  to="/admin/capstones"
                  className="text-sm font-bold text-[#1A8C4E] hover:text-[#0A2E1A]"
                >
                  View all →
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {pendingCapstones.length === 0 && (
                  <p className="text-sm text-foreground/50 py-6 text-center">
                    No pending submissions. 🎉
                  </p>
                )}
                {pendingCapstones.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-border bg-[#F9FAFB] p-3.5 hover:border-[#00F5A0] transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#0A2E1A] truncate">{c.student}</p>
                        <p className="text-[11px] font-mono text-foreground/55">{c.reg_no}</p>
                        <p className="text-xs text-foreground/65 mt-1 truncate">{c.course}</p>
                        <p className="text-[11px] text-foreground/45 mt-1">
                          {fmtRelative(c.submitted_at)}
                        </p>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className="bg-[#0A2E1A] text-[#00F5A0] hover:bg-[#0A2E1A]/90 shrink-0"
                      >
                        <Link to="/admin/capstones">Review</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminGuard>
  );
}

function ActivityIcon({ type }: { type: ActivityItem["type"] }) {
  const map = {
    student: { Icon: UserPlus, color: "bg-[#0A2E1A] text-[#00F5A0]", dot: "bg-[#00F5A0]" },
    enrollment: {
      Icon: GraduationCap,
      color: "bg-[#00F5A0]/15 text-[#1A8C4E]",
      dot: "bg-[#1A8C4E]",
    },
    capstone: { Icon: FileCheck2, color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
    certificate: { Icon: Award, color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  } as const;
  const { Icon, color, dot } = map[type];
  return (
    <div className="relative">
      <div className={`grid h-9 w-9 place-items-center rounded-full ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <span
        className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${dot}`}
      />
    </div>
  );
}

export function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-[#00F5A0]/20 text-[#1A8C4E]",
    pending: "bg-amber-100 text-amber-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-foreground/10 text-foreground/70",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${map[status] ?? "bg-muted"}`}
    >
      {status}
    </span>
  );
}

function TestEnrollmentEmailsButton() {
  const send = useServerFn(sendEnrollmentEmails);
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const adminEmail = userRes.user?.email;
      if (!adminEmail) {
        toast.error("You must be signed in to send a test email.");
        return;
      }
      const res = await send({
        data: {
          fullName: "Test Student",
          studentEmail: adminEmail,
          whatsapp: "+44 7404 331835",
          country: "United Kingdom",
          studentId: "EVG-2026-TEST",
          tempPassword: "Evogue!Test12",
          courseName: "Product Management",
          courseDuration: "12 weeks",
          amount: 450,
          currency: "USD",
          originalAmount: 500,
          discountPercent: 10,
          couponCode: "EVOGUE10",
          paymentReference: `TEST-${Date.now()}`,
          enrolledAt: new Date().toISOString(),
        },
      });
      const w = (res as any)?.summary?.welcome;
      const a = (res as any)?.summary?.admin;
      const allOk = w === "queued" && a === "queued";
      if (allOk) {
        toast.success(
          `Test emails queued — welcome → ${adminEmail}, admin → evogueconsulting@gmail.com`,
        );
      } else {
        toast.warning(
          `Welcome: ${w} • Admin: ${a}. Check Cloud → Emails for details.`,
        );
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to send test emails");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={loading}
      className="whitespace-nowrap"
    >
      {loading ? "Sending…" : "Send test enrollment emails"}
    </Button>
  );
}
