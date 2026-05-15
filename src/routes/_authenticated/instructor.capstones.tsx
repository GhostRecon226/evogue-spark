import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ExternalLink, GraduationCap, Check, X } from "lucide-react";
import { toast } from "sonner";
import { InstructorGuard } from "@/components/instructor/InstructorGuard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  cohort_id: string | null;
  instructor_recommendation: boolean;
  instructor_note: string | null;
  student: { full_name: string | null; email: string | null; registration_number: string | null } | null;
  course: { title: string } | null;
};

function InstructorCapstones() {
  const { instructorCourseIds } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [cohortNames, setCohortNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");

  const load = async () => {
    if (instructorCourseIds.length === 0) { setRows([]); setLoading(false); return; }
    setLoading(true);
    const [{ data }, { data: cohs }] = await Promise.all([
      supabase
        .from("capstone_submissions")
        .select("id, status, submitted_at, submission_text, file_url, cohort_id, instructor_recommendation, instructor_note, student:profiles!capstone_submissions_student_id_fkey(full_name, email, registration_number), course:courses!capstone_submissions_course_id_fkey(title)")
        .in("course_id", instructorCourseIds)
        .order("submitted_at", { ascending: false }),
      supabase.from("cohorts").select("id, name").in("course_id", instructorCourseIds),
    ]);
    setRows((data ?? []) as unknown as Row[]);
    setCohortNames(new Map((cohs ?? []).map((c) => [c.id, c.name])));
    setLoading(false);
  };

  useEffect(() => { void load(); }, [instructorCourseIds.join(",")]);

  const recommend = async (id: string, currentNote: string | null, recommend: boolean) => {
    const note = noteDraft[id] ?? currentNote ?? "";
    const status = recommend ? "recommended" : "rejected";
    const { error } = await supabase
      .from("capstone_submissions")
      .update({ instructor_recommendation: recommend, instructor_note: note || null, status })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(recommend ? "Recommended for admin approval" : "Marked as rejected — admin will review");
    void load();
  };

  const viewFile = async (path: string) => {
    const { data, error } = await supabase.storage.from("capstones").createSignedUrl(path, 60);
    if (error || !data) { toast.error("Could not generate file link"); return; }
    window.open(data.signedUrl, "_blank", "noreferrer");
  };

  const filtered = rows.filter((r) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return (
      (r.student?.full_name ?? "").toLowerCase().includes(s) ||
      (r.student?.registration_number ?? "").toLowerCase().includes(s) ||
      (r.course?.title ?? "").toLowerCase().includes(s)
    );
  });

  return (
    <InstructorGuard>
      <div className="flex items-center gap-3">
        <GraduationCap className="h-6 w-6 text-secondary" />
        <h1 className="font-display text-3xl font-extrabold text-forest">Capstone Reviews</h1>
      </div>
      <p className="mt-2 text-foreground/65">Review submissions for the courses you teach. Final approval sits with admin.</p>

      <div className="mt-6 max-w-md">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by student, Student ID or course…" className="rounded-full" />
      </div>

      {loading ? (
        <div className="mt-10 grid place-items-center text-foreground/50"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-background p-12 text-center text-foreground/60">
          {instructorCourseIds.length === 0 ? "No courses assigned to you yet." : "No submissions match."}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((r) => {
            const cohort = r.cohort_id ? (cohortNames.get(r.cohort_id) ?? "—") : "—";
            const decided = r.status === "approved" || r.status === "rejected";
            return (
              <div key={r.id} className="rounded-2xl border border-border bg-background p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-forest">{r.student?.full_name || "Student"}</h3>
                    <p className="text-xs text-foreground/55">
                      {r.student?.registration_number ?? "—"} · {r.course?.title ?? "—"} · {cohort} · {new Date(r.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="inline-block rounded-full bg-mint-tint px-3 py-1 text-xs font-bold text-forest capitalize">{r.status}</span>
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
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => recommend(r.id, r.instructor_note, true)}
                      disabled={decided}
                      className="rounded-full bg-forest text-mint hover:bg-forest/90"
                    >
                      <Check className="h-4 w-4 mr-1" /> Recommend approval
                    </Button>
                    <Button
                      onClick={() => recommend(r.id, r.instructor_note, false)}
                      disabled={decided}
                      variant="outline"
                      className="rounded-full"
                    >
                      <X className="h-4 w-4 mr-1" /> Recommend reject
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </InstructorGuard>
  );
}
