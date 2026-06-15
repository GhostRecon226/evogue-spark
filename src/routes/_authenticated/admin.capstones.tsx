import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, ExternalLink, ClipboardCheck, Inbox, X } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/capstones")({
  component: AdminCapstones,
});

type Row = {
  id: string;
  status: "pending" | "recommended" | "approved" | "rejected";
  submitted_at: string;
  submission_text: string;
  file_url: string | null;
  instructor_recommendation: boolean;
  instructor_note: string | null;
  course_id: string;
  cohort_id: string | null;
  registration_number: string | null;
  student: {
    full_name: string | null;
    email: string | null;
    registration_number: string | null;
  } | null;
  course: { title: string } | null;
  cohort: { name: string } | null;
};

const statusStyles: Record<Row["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  recommended: "bg-mint text-forest",
  approved: "bg-secondary/15 text-secondary",
  rejected: "bg-destructive/15 text-destructive",
};

function AdminCapstones() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("all");
  const [cohortFilter, setCohortFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("capstone_submissions")
      .select(
        "id, status, submitted_at, submission_text, file_url, instructor_recommendation, instructor_note, course_id, cohort_id, student:profiles!capstone_submissions_student_id_fkey(full_name, email, registration_number), course:courses!capstone_submissions_course_id_fkey(title), cohort:cohorts!capstone_submissions_cohort_id_fkey(name)",
      )
      .order("submitted_at", { ascending: false });
    setRows(
      (data ?? []).map((r: any) => ({
        ...r,
        registration_number: r.student?.registration_number ?? null,
      })) as unknown as Row[],
    );
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    void load();
    const ch = supabase
      .channel("admin-capstones")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "capstone_submissions" },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [isAdmin]);

  const setStatus = async (id: string, status: Row["status"], reason?: string) => {
    const { data: userRes } = await supabase.auth.getUser();
    const reviewer = userRes?.user?.id ?? null;
    const patch: Record<string, unknown> = {
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewer,
    };
    if (status === "rejected" && reason && reason.trim()) {
      patch.notes = reason.trim();
    }
    const { error } = await supabase
      .from("capstone_submissions")
      .update(patch as never)
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(status === "approved" ? "Approved · certificate issued" : `Marked ${status}`);
    void load();
  };

  const rejectWithReason = async (id: string) => {
    const reason = window.prompt("Reason for rejection (visible to the student):");
    if (reason === null) return; // cancelled
    if (!reason.trim()) {
      toast.error("Please enter a rejection reason.");
      return;
    }
    await setStatus(id, "rejected", reason);
  };

  const viewFile = async (path: string) => {
    const { data, error } = await supabase.storage.from("capstones").createSignedUrl(path, 60);
    if (error || !data) {
      toast.error("Could not generate file link");
      return;
    }
    window.open(data.signedUrl, "_blank", "noreferrer");
  };

  const courses = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rows) if (r.course?.title) m.set(r.course_id, r.course.title);
    return Array.from(m.entries());
  }, [rows]);

  const cohorts = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rows) if (r.cohort_id && r.cohort?.name) m.set(r.cohort_id, r.cohort.name);
    return Array.from(m.entries());
  }, [rows]);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (courseFilter !== "all" && r.course_id !== courseFilter) return false;
        if (cohortFilter !== "all" && r.cohort_id !== cohortFilter) return false;
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        return true;
      }),
    [rows, courseFilter, cohortFilter, statusFilter],
  );

  if (authLoading)
    return (
      <DashboardLayout>
        <div />
      </DashboardLayout>
    );
  if (!isAdmin)
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-10 rounded-3xl border border-dashed border-border bg-background p-10 text-center">
          <h1 className="font-display text-2xl font-extrabold text-forest">Admin access only</h1>
          <Link to="/dashboard" className="mt-4 inline-block text-secondary font-bold">
            Back to dashboard
          </Link>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-6 w-6 text-secondary" />
        <h1 className="font-display text-3xl font-extrabold text-forest">Capstone Submissions</h1>
      </div>
      <p className="mt-2 text-foreground/65">
        Review student capstone projects. Approving issues a certificate automatically.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-52 rounded-full">
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {courses.map(([id, title]) => (
              <SelectItem key={id} value={id}>
                {title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={cohortFilter} onValueChange={setCohortFilter}>
          <SelectTrigger className="w-44 rounded-full">
            <SelectValue placeholder="Cohort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cohorts</SelectItem>
            {cohorts.map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 rounded-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        {(courseFilter !== "all" || cohortFilter !== "all" || statusFilter !== "all") && (
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => {
              setCourseFilter("all");
              setCohortFilter("all");
              setStatusFilter("all");
            }}
          >
            <X className="h-3.5 w-3.5 mr-1" /> Reset filters
          </Button>
        )}
      </div>

      {loading ? (
        <div className="mt-10 grid place-items-center text-foreground/50">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-border bg-background overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-mint-tint/60 text-forest">
                <tr>
                  <th className="text-left font-bold px-4 py-3">Student ID</th>
                  <th className="text-left font-bold px-4 py-3">Student</th>
                  <th className="text-left font-bold px-4 py-3">Course</th>
                  <th className="text-left font-bold px-4 py-3">Cohort</th>
                  <th className="text-left font-bold px-4 py-3">Submitted</th>
                  <th className="text-left font-bold px-4 py-3">Status</th>
                  <th className="text-right font-bold px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="h-14 w-14 rounded-full bg-mint-tint grid place-items-center">
                          <Inbox className="h-6 w-6 text-secondary" />
                        </div>
                        <p className="font-display text-base font-bold text-forest">
                          No capstone submissions yet
                        </p>
                        <p className="text-sm text-foreground/60 max-w-md">
                          Students can submit after the capstone is released.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-border/60 align-top hover:bg-mint-tint/30"
                    >
                      <td className="px-4 py-3 font-mono text-xs">
                        {r.registration_number ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-forest">
                          {r.student?.full_name || "Student"}
                        </div>
                        <div className="text-xs text-foreground/55">{r.student?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-foreground/80">{r.course?.title ?? "—"}</td>
                      <td className="px-4 py-3 text-foreground/80">{r.cohort?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-foreground/70">
                        {new Date(r.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusStyles[r.status]}`}
                        >
                          {r.status}
                        </span>
                        {r.instructor_recommendation && (
                          <div className="mt-1 text-[11px] text-secondary font-bold">
                            ★ Recommended
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2 justify-end">
                          <details className="rounded">
                            <summary className="cursor-pointer text-secondary text-xs font-bold">
                              View
                            </summary>
                            <div className="absolute right-4 mt-2 max-w-md rounded-xl bg-background border border-border shadow-soft p-4 text-xs z-20">
                              <p className="whitespace-pre-wrap text-foreground/80">
                                {r.submission_text}
                              </p>
                              {r.instructor_note && (
                                <p className="mt-2 italic text-foreground/65">
                                  Instructor: {r.instructor_note}
                                </p>
                              )}
                              {r.file_url && (
                                <Button
                                  onClick={() => viewFile(r.file_url!)}
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 rounded-full"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" /> Open file
                                </Button>
                              )}
                            </div>
                          </details>
                          {r.status !== "approved" && (
                            <Button
                              size="sm"
                              className="rounded-full bg-forest text-mint hover:bg-forest/90"
                              onClick={() => setStatus(r.id, "approved")}
                            >
                              Approve
                            </Button>
                          )}
                          {r.status !== "rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => rejectWithReason(r.id)}
                            >
                              Reject
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
