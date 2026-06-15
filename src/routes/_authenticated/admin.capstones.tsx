import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, ExternalLink, ClipboardCheck, X } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/admin/DataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { generateCertificate } from "@/lib/certificates.functions";
import { useServerFn } from "@tanstack/react-start";

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
  student_id: string;
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
  const generateCert = useServerFn(generateCertificate);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("all");
  const [cohortFilter, setCohortFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rejectTarget, setRejectTarget] = useState<Row | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("capstone_submissions")
      .select(
        "id, status, submitted_at, submission_text, file_url, instructor_recommendation, instructor_note, student_id, course_id, cohort_id, student:profiles!capstone_submissions_student_id_fkey(full_name, email, registration_number), course:courses!capstone_submissions_course_id_fkey(title), cohort:cohorts!capstone_submissions_cohort_id_fkey(name)",
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

  const setStatus = async (row: Row, status: Row["status"], reason?: string) => {
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
      .eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return { ok: false } as const;
    }
    if (status === "approved") {
      toast.success("Capstone approved. Certificate generation triggered.");
      // Fire-and-forget cert generation
      void (async () => {
        try {
          await generateCert({
            data: { studentId: row.student_id, courseId: row.course_id },
          });
          toast.success("Certificate generated.");
        } catch (e) {
          toast.error(`Certificate generation failed: ${(e as Error).message}`);
        }
      })();
    } else if (status === "rejected") {
      toast.success("Submission rejected. Student has been notified.");
    } else {
      toast.success(`Marked ${status}`);
    }
    void load();
    return { ok: true } as const;
  };

  const openReject = (row: Row) => {
    setRejectTarget(row);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide feedback for the student.");
      return;
    }
    setRejectSubmitting(true);
    const res = await setStatus(rejectTarget, "rejected", rejectReason);
    setRejectSubmitting(false);
    if (res.ok) {
      setRejectTarget(null);
      setRejectReason("");
    }
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
        <div className="mt-6">
          <DataTable
            rows={filtered}
            columns={
              [
                {
                  key: "registration_number",
                  header: "Student ID",
                  accessor: (r) => r.registration_number ?? "",
                  cell: (r) => (
                    <span className="font-mono text-xs">{r.registration_number ?? "—"}</span>
                  ),
                },
                {
                  key: "student",
                  header: "Student",
                  accessor: (r) => r.student?.full_name ?? "",
                  cell: (r) => (
                    <div>
                      <div className="font-semibold text-forest">
                        {r.student?.full_name || "Student"}
                      </div>
                      <div className="text-xs text-foreground/55">{r.student?.email}</div>
                    </div>
                  ),
                },
                {
                  key: "course",
                  header: "Course",
                  accessor: (r) => r.course?.title ?? "",
                  cell: (r) => r.course?.title ?? "—",
                },
                {
                  key: "cohort",
                  header: "Cohort",
                  accessor: (r) => r.cohort?.name ?? "",
                  cell: (r) => r.cohort?.name ?? "—",
                },
                {
                  key: "submitted_at",
                  header: "Submitted",
                  accessor: (r) => r.submitted_at,
                  cell: (r) => new Date(r.submitted_at).toLocaleDateString(),
                },
                {
                  key: "status",
                  header: "Status",
                  accessor: (r) => r.status,
                  cell: (r) => (
                    <>
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
                    </>
                  ),
                },
              ] satisfies Column<Row>[]
            }
            rowKey={(r) => r.id}
            pageSize={10}
            emptyMessage="No capstone submissions yet."
            actions={(r) => (
              <div className="flex flex-wrap gap-2 justify-end">
                <details className="rounded">
                  <summary className="cursor-pointer text-secondary text-xs font-bold list-none">
                    View
                  </summary>
                  <div className="absolute right-4 mt-2 max-w-md rounded-xl bg-background border border-border shadow-soft p-4 text-xs z-20">
                    <p className="whitespace-pre-wrap text-foreground/80">{r.submission_text}</p>
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
                    onClick={() => setStatus(r, "approved")}
                  >
                    Approve
                  </Button>
                )}
                {r.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => openReject(r)}
                  >
                    Reject
                  </Button>
                )}
              </div>
            )}
          />
        </div>
      )}

      <Dialog
        open={!!rejectTarget}
        onOpenChange={(o) => {
          if (!o) {
            setRejectTarget(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-forest">Reject submission</DialogTitle>
            <DialogDescription>
              {rejectTarget?.student?.full_name
                ? `Send feedback to ${rejectTarget.student.full_name}.`
                : "Send feedback to the student."}{" "}
              They will be notified and can resubmit.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Provide feedback for the student"
            rows={5}
            className="rounded-2xl"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setRejectTarget(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={rejectSubmitting}
              className="rounded-full bg-forest text-mint hover:bg-forest/90"
              onClick={confirmReject}
            >
              {rejectSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
