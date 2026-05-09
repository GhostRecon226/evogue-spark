import { useEffect, useState } from "react";
import { FileText, Upload, Loader2, CheckCircle2, AlertCircle, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

type Course = {
  id: string;
  title: string;
  capstone_released: boolean;
  capstone_brief: string | null;
  capstone_brief_url: string | null;
};

type Submission = {
  id: string;
  status: "pending" | "recommended" | "approved" | "rejected";
  submission_text: string;
  file_url: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  instructor_recommendation: boolean;
  instructor_note: string | null;
};

export function CapstoneSection({ course }: { course: Course }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !course.capstone_released) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("capstone_submissions")
        .select("id, status, submission_text, file_url, submitted_at, reviewed_at, instructor_recommendation, instructor_note")
        .eq("student_id", user.id).eq("course_id", course.id).maybeSingle();
      if (!cancelled) { setSubmission(data as Submission | null); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [user, course.id, course.capstone_released]);

  if (!course.capstone_released) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (text.trim().length < 20) { toast.error("Tell us a bit more about your project (at least 20 characters)."); return; }
    setSubmitting(true);
    try {
      let fileUrl: string | null = null;
      if (file) {
        if (file.size > 25 * 1024 * 1024) { toast.error("File must be 25 MB or smaller."); setSubmitting(false); return; }
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${user.id}/${course.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("capstones").upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        fileUrl = path;
      }
      const { data, error } = await supabase
        .from("capstone_submissions")
        .insert({
          student_id: user.id,
          course_id: course.id,
          submission_text: text.trim(),
          file_url: fileUrl,
        })
        .select("id, status, submission_text, file_url, submitted_at, reviewed_at, instructor_recommendation, instructor_note")
        .single();
      if (error) throw error;
      setSubmission(data as Submission);
      toast.success("Capstone submitted! We'll review it shortly.");
    } catch (err) {
      const e = err as Error;
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadFile = async () => {
    if (!submission?.file_url) return;
    const { data, error } = await supabase.storage.from("capstones").createSignedUrl(submission.file_url, 60);
    if (error || !data) { toast.error("Could not get file link."); return; }
    window.open(data.signedUrl, "_blank", "noreferrer");
  };

  const statusBadge = () => {
    if (!submission) return null;
    const map = {
      pending: { icon: Clock, text: "Pending review", cls: "bg-star/15 text-star" },
      recommended: { icon: CheckCircle2, text: "Recommended by instructor", cls: "bg-mint text-forest" },
      approved: { icon: CheckCircle2, text: "Approved · Certificate issued", cls: "bg-secondary/15 text-secondary" },
      rejected: { icon: AlertCircle, text: "Needs revision", cls: "bg-destructive/15 text-destructive" },
    } as const;
    const s = map[submission.status];
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${s.cls}`}>
        <Icon className="h-3.5 w-3.5" /> {s.text}
      </span>
    );
  };

  return (
    <section className="mt-12 rounded-3xl border border-border bg-background p-6 sm:p-8 shadow-soft">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wide text-secondary font-bold">Final Step</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-forest">Capstone Project</h2>
          <p className="mt-1 text-sm text-foreground/65">Submit your final project to earn your certificate.</p>
        </div>
        {statusBadge()}
      </div>

      {(course.capstone_brief || course.capstone_brief_url) && (
        <div className="mt-6 rounded-2xl bg-mint-tint border border-border p-5">
          <h3 className="flex items-center gap-2 font-display font-bold text-forest">
            <FileText className="h-4 w-4" /> Project Brief
          </h3>
          {course.capstone_brief && (
            <p className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">{course.capstone_brief}</p>
          )}
          {course.capstone_brief_url && (
            <Button asChild variant="outline" className="mt-3 rounded-full">
              <a href={course.capstone_brief_url} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" /> Open brief PDF
              </a>
            </Button>
          )}
        </div>
      )}

      {loading ? (
        <div className="mt-6 grid place-items-center py-8 text-foreground/50"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : submission ? (
        <div className="mt-6 rounded-2xl border border-border p-5">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/55">
            <span>
              Submitted {new Date(submission.submitted_at).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
            {submission.reviewed_at && (
              <span>
                Reviewed {new Date(submission.reviewed_at).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">{submission.submission_text}</p>
          {submission.file_url && (
            <Button onClick={downloadFile} variant="outline" className="mt-3 rounded-full">
              <FileText className="h-4 w-4 mr-1" /> View attached file
            </Button>
          )}
          {submission.instructor_note && (
            <div className="mt-4 rounded-xl bg-mint-tint p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-secondary">Instructor note</p>
              <p className="mt-1 text-sm text-foreground/80">{submission.instructor_note}</p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="capstone-text">Project description</Label>
            <Textarea
              id="capstone-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              maxLength={5000}
              placeholder="Describe your project, the problem it solves, and your approach…"
              required
            />
            <p className="text-xs text-foreground/55">{text.length} / 5000 characters</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="capstone-file">Project file (optional · PDF, ZIP, image — max 25 MB)</Label>
            <Input
              id="capstone-file"
              type="file"
              accept=".pdf,.zip,.png,.jpg,.jpeg,.doc,.docx,.ppt,.pptx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && <p className="text-xs text-foreground/55">Selected: {file.name}</p>}
          </div>
          <Button type="submit" disabled={submitting} className="rounded-full bg-forest text-mint hover:bg-forest/90 font-bold">
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Submit Project
          </Button>
        </form>
      )}
    </section>
  );
}
