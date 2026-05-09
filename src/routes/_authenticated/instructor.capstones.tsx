import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ExternalLink, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/instructor/capstones")({
  component: InstructorCapstones,
});

type Row = {
  id: string;
  status: "pending" | "recommended" | "approved" | "rejected";
  submitted_at: string;
  submission_text: string;
  file_url: string | null;
  instructor_recommendation: boolean;
  instructor_note: string | null;
  student: { full_name: string | null; email: string | null } | null;
  course: { title: string } | null;
};

function InstructorCapstones() {
  const { isInstructor, instructorCourseIds, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const load = async () => {
    if (instructorCourseIds.length === 0) { setRows([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("capstone_submissions")
      .select("id, status, submitted_at, submission_text, file_url, instructor_recommendation, instructor_note, student:profiles!capstone_submissions_student_id_fkey(full_name, email), course:courses!capstone_submissions_course_id_fkey(title)")
      .in("course_id", instructorCourseIds)
      .order("submitted_at", { ascending: false });
    setRows((data ?? []) as unknown as Row[]);
    setLoading(false);
  };

  useEffect(() => { if (isInstructor) void load(); }, [isInstructor, instructorCourseIds.join(",")]);

  const recommend = async (id: string, currentNote: string | null) => {
    const note = noteDraft[id] ?? currentNote ?? "";
    const { error } = await supabase
      .from("capstone_submissions")
      .update({ instructor_recommendation: true, instructor_note: note || null, status: "recommended" })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Recommended for admin approval");
    void load();
  };

  const viewFile = async (path: string) => {
    const { data, error } = await supabase.storage.from("capstones").createSignedUrl(path, 60);
    if (error || !data) { toast.error("Could not generate file link"); return; }
    window.open(data.signedUrl, "_blank", "noreferrer");
  };

  if (authLoading) return <DashboardLayout><div /></DashboardLayout>;
  if (!isInstructor) return (
    <DashboardLayout>
      <div className="max-w-md mx-auto mt-10 rounded-3xl border border-dashed border-border bg-background p-10 text-center">
        <h1 className="font-display text-2xl font-extrabold text-forest">Instructor access only</h1>
        <Link to="/dashboard" className="mt-4 inline-block text-secondary font-bold">Back to dashboard</Link>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3">
        <GraduationCap className="h-6 w-6 text-secondary" />
        <h1 className="font-display text-3xl font-extrabold text-forest">Capstone Reviews</h1>
      </div>
      <p className="mt-2 text-foreground/65">Review submissions for the courses you teach. Final approval sits with admin.</p>

      {loading ? (
        <div className="mt-10 grid place-items-center text-foreground/50"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-background p-12 text-center text-foreground/60">
          {instructorCourseIds.length === 0 ? "No courses assigned to you yet." : "No submissions yet for your courses."}
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {rows.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-background p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-forest">{r.student?.full_name || "Student"}</h3>
                  <p className="text-xs text-foreground/55">{r.course?.title} · {new Date(r.submitted_at).toLocaleDateString()}</p>
                </div>
                <span className="inline-block rounded-full bg-mint-tint px-3 py-1 text-xs font-bold text-forest">{r.status}</span>
              </div>
              <p className="mt-3 text-sm text-foreground/80 whitespace-pre-wrap">{r.submission_text}</p>
              {r.file_url && (
                <Button onClick={() => viewFile(r.file_url!)} variant="outline" size="sm" className="mt-3 rounded-full">
                  <ExternalLink className="h-3 w-3 mr-1" /> Open file
                </Button>
              )}
              <div className="mt-4 space-y-2">
                <Textarea
                  rows={2}
                  placeholder="Note for admin (optional)…"
                  defaultValue={r.instructor_note ?? ""}
                  onChange={(e) => setNoteDraft({ ...noteDraft, [r.id]: e.target.value })}
                />
                <Button
                  onClick={() => recommend(r.id, r.instructor_note)}
                  disabled={r.status === "approved" || r.status === "rejected"}
                  className="rounded-full bg-forest text-mint hover:bg-forest/90"
                >
                  Recommend approval
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
