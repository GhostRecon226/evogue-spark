import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, ExternalLink, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/capstone")({
  component: StudentCapstonePage,
});

const briefs: Record<string, string> = {
  "pm & business analysis":
    "Complete a full project lifecycle including requirements gathering, stakeholder management, project planning and a final business case presentation.",
  "project management":
    "Complete a full project lifecycle including requirements gathering, stakeholder management, project planning and a final business case presentation.",
  "product management":
    "Define, scope and present a product roadmap for a real-world problem, including user research, feature prioritisation and success metrics.",
  "data analysis":
    "Analyse a real dataset, extract insights, build a dashboard and present your findings in a structured business report.",
  "cyber security":
    "Conduct a security audit of a simulated environment, identify vulnerabilities, document findings and propose a remediation plan.",
  cybersecurity:
    "Conduct a security audit of a simulated environment, identify vulnerabilities, document findings and propose a remediation plan.",
  "digital marketing":
    "Plan and present a full-funnel digital marketing campaign for a real or fictional brand, including budget allocation, channel strategy and KPIs.",
  "scrum master":
    "Lead a simulated 2-sprint agile project from kickoff to retrospective, including backlog grooming, sprint planning and velocity tracking.",
  "ai for professionals":
    "Build an AI-powered workflow that solves a real problem in your industry, document the process and present the outcome.",
  "prompt engineering":
    "Build an AI-powered workflow that solves a real problem in your industry, document the process and present the outcome.",
  "virtual assistant":
    "Set up a complete VA operations system for a fictional client including inbox management, calendar setup, task tracking and a standard operating procedures document.",
  "project planner":
    "Develop a full project controls plan for a simulated infrastructure project including baseline schedule, critical path analysis and progress reporting using Primavera P6.",
};

const defaultBrief =
  "Submit a project that demonstrates the core skills from your course. Include any supporting materials in your shared link.";

type Enrollment = { course_id: string; course: { title: string } | null };
type Submission = {
  id: string;
  status: "pending" | "recommended" | "approved" | "rejected";
  submission_url: string | null;
  submission_text: string;
  notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
};

function isValidUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function StudentCapstonePage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: enr } = await supabase
      .from("enrollments")
      .select("course_id, course:courses!enrollments_course_id_fkey(title)")
      .eq("student_id", user.id)
      .order("enrolled_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const e = (enr as unknown as Enrollment | null) ?? null;
    setEnrollment(e);
    if (e) {
      const { data: sub } = await supabase
        .from("capstone_submissions")
        .select("id, status, submission_url, submission_text, notes, submitted_at, reviewed_at")
        .eq("student_id", user.id)
        .eq("course_id", e.course_id)
        .maybeSingle();
      setSubmission((sub as unknown as Submission | null) ?? null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && user) void load();
  }, [authLoading, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !enrollment) return;
    const link = url.trim();
    if (!link) return toast.error("Please paste a submission link.");
    if (!isValidUrl(link)) return toast.error("Please enter a valid http(s) URL.");
    setSubmitting(true);
    const isResubmit = resubmitting && submission;
    const payload = {
      student_id: user.id,
      course_id: enrollment.course_id,
      submission_url: link,
      submission_text: link,
      notes: notes.trim() || null,
      status: "pending" as const,
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by: null,
    };
    let error;
    if (isResubmit) {
      const res = await supabase
        .from("capstone_submissions")
        .update(payload as never)
        .eq("id", submission!.id);
      error = res.error;
    } else {
      const res = await supabase.from("capstone_submissions").insert(payload as never);
      error = res.error;
    }
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Capstone submitted. We'll review it within 5 working days.");
    setUrl("");
    setNotes("");
    setResubmitting(false);
    void load();
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="grid place-items-center py-20 text-foreground/50">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!enrollment) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto rounded-3xl border border-dashed border-border bg-background p-10 text-center">
          <h1 className="font-display text-2xl font-extrabold text-forest">
            No active enrollment
          </h1>
          <p className="mt-3 text-foreground/65">
            You are not enrolled in any course yet. Browse our courses to get started.
          </p>
          <Link
            to="/courses"
            className="mt-5 inline-block rounded-full bg-forest text-mint px-5 py-2 font-bold"
          >
            View courses
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const courseTitle = enrollment.course?.title ?? "your course";
  const brief = briefs[courseTitle.toLowerCase()] ?? defaultBrief;

  const showForm = !submission || resubmitting;

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-secondary" />
          <h1 className="font-display text-3xl font-extrabold text-forest">
            {submission && !resubmitting ? "Your Capstone Submission" : "Submit Your Capstone Project"}
          </h1>
        </div>

        {!submission && (
          <p className="mt-3 text-foreground/70">
            Your capstone project is the final step before your certificate is issued. Submit your
            work below and the Evogue Academy team will review it within 5 working days.
          </p>
        )}

        {/* Submission state */}
        {submission && !resubmitting && (
          <div className="mt-6 rounded-3xl border border-border bg-background p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs text-foreground/55">Course</div>
                <div className="font-display text-xl font-extrabold text-forest">
                  {courseTitle}
                </div>
              </div>
              <StatusPill status={submission.status} />
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div>
                <div className="text-xs text-foreground/55">Submission link</div>
                {submission.submission_url ? (
                  <a
                    href={submission.submission_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-secondary break-all"
                  >
                    {submission.submission_url} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <p className="text-foreground/70 break-all">{submission.submission_text}</p>
                )}
              </div>
              <div>
                <div className="text-xs text-foreground/55">Date submitted</div>
                <div className="text-foreground/80">
                  {new Date(submission.submitted_at).toLocaleString()}
                </div>
              </div>
              {submission.status !== "rejected" && submission.notes && (
                <div>
                  <div className="text-xs text-foreground/55">Your notes</div>
                  <p className="text-foreground/80 whitespace-pre-wrap">{submission.notes}</p>
                </div>
              )}
            </div>

            {submission.status === "approved" && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-secondary/10 p-4 text-secondary">
                <CheckCircle2 className="h-5 w-5 mt-0.5" />
                <p className="text-sm font-semibold">
                  Your capstone has been approved. Your certificate is being prepared.
                </p>
              </div>
            )}

            {submission.status === "rejected" && (
              <div className="mt-6 rounded-2xl bg-destructive/10 p-4">
                <p className="text-sm font-semibold text-destructive">
                  Your submission was not approved. Please review the feedback below and resubmit.
                </p>
                {submission.notes && (
                  <p className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">
                    {submission.notes}
                  </p>
                )}
                <Button
                  className="mt-4 rounded-full bg-forest text-mint hover:bg-forest/90"
                  onClick={() => {
                    setResubmitting(true);
                    setUrl("");
                    setNotes("");
                  }}
                >
                  Resubmit
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Form state */}
        {showForm && (
          <>
            <div className="mt-6 rounded-3xl border border-border bg-mint/30 p-5">
              <div className="text-xs uppercase tracking-wide text-foreground/55 font-bold">
                Capstone brief — {courseTitle}
              </div>
              <p className="mt-2 text-foreground/80">{brief}</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-forest">Submission Link</label>
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="mt-2 rounded-2xl"
                  required
                />
                <p className="mt-1 text-xs text-foreground/55">
                  Paste a link to your project. This can be a Google Drive link, Notion page,
                  GitHub repo, or any accessible URL.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-forest">
                  Notes to reviewer{" "}
                  <span className="font-normal text-foreground/55">(optional)</span>
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything you'd like the reviewer to know about your submission."
                  rows={5}
                  className="mt-2 rounded-2xl"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-forest text-mint hover:bg-forest/90"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Submit Capstone Project"
                  )}
                </Button>
                {resubmitting && submission && (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setResubmitting(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
              <p className="text-xs text-foreground/55">
                Make sure your link is accessible before submitting. Use Google Drive? Set sharing
                to "Anyone with the link can view".
              </p>
            </form>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatusPill({ status }: { status: Submission["status"] }) {
  const styles: Record<Submission["status"], string> = {
    pending: "bg-amber-100 text-amber-700",
    recommended: "bg-mint text-forest",
    approved: "bg-secondary/15 text-secondary",
    rejected: "bg-destructive/15 text-destructive",
  };
  const labels: Record<Submission["status"], string> = {
    pending: "Pending Review",
    recommended: "Recommended",
    approved: "Approved",
    rejected: "Rejected",
  };
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
