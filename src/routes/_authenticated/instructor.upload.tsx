import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Upload, Loader2, FileText, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { InstructorGuard } from "@/components/instructor/InstructorGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/instructor/upload")({
  component: UploadContent,
});

type Course = { id: string; title: string };
type Cohort = { id: string; name: string; course_id: string };
type Lesson = {
  id: string;
  course_id: string;
  cohort_id: string | null;
  title: string;
  lesson_number: number;
  lesson_date: string | null;
  zoom_live_link: string | null;
  zoom_recording_link: string | null;
  pdf_url: string | null;
  is_published: boolean;
};

const emptyForm = {
  id: null as string | null,
  courseId: "",
  cohortId: "",
  title: "",
  lessonNumber: 1,
  lessonDate: "",
  zoomLive: "",
  zoomRecording: "",
  published: false,
};

function UploadContent() {
  const { instructorCourseIds, user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [pdf, setPdf] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reload = async () => {
    if (instructorCourseIds.length === 0 || !user) return;
    const [{ data: cs }, { data: cohs }, { data: ls }] = await Promise.all([
      supabase.from("courses").select("id, title").in("id", instructorCourseIds).order("title"),
      supabase
        .from("cohorts")
        .select("id, name, course_id")
        .in("course_id", instructorCourseIds)
        .order("start_date", { ascending: false }),
      supabase
        .from("lessons")
        .select(
          "id, course_id, cohort_id, title, lesson_number, lesson_date, zoom_live_link, zoom_recording_link, pdf_url, is_published",
        )
        .in("course_id", instructorCourseIds)
        .eq("uploaded_by", user.id)
        .order("lesson_number", { ascending: false })
        .limit(50),
    ]);
    setCourses(cs ?? []);
    setCohorts(cohs ?? []);
    setLessons(ls ?? []);
  };

  useEffect(() => {
    void reload();
  }, [instructorCourseIds.join(","), user?.id]);

  // Auto-suggest next lesson_number when course changes (only for new lessons)
  useEffect(() => {
    if (form.id || !form.courseId) return;
    (async () => {
      const { data } = await supabase
        .from("lessons")
        .select("lesson_number")
        .eq("course_id", form.courseId)
        .order("lesson_number", { ascending: false })
        .limit(1);
      setForm((f) => ({ ...f, lessonNumber: (data?.[0]?.lesson_number ?? 0) + 1 }));
    })();
  }, [form.courseId, form.id]);

  const cohortsForCourse = cohorts.filter((c) => c.course_id === form.courseId);

  const startEdit = (l: Lesson) => {
    setForm({
      id: l.id,
      courseId: l.course_id,
      cohortId: l.cohort_id ?? "",
      title: l.title,
      lessonNumber: l.lesson_number,
      lessonDate: l.lesson_date ? l.lesson_date.slice(0, 16) : "",
      zoomLive: l.zoom_live_link ?? "",
      zoomRecording: l.zoom_recording_link ?? "",
      published: l.is_published,
    });
    setPdf(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setForm(emptyForm);
    setPdf(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.courseId) {
      toast.error("Select a course");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Lesson title is required");
      return;
    }
    if (!Number.isFinite(form.lessonNumber) || form.lessonNumber < 1) {
      toast.error("Lesson number must be 1 or higher");
      return;
    }

    setSubmitting(true);
    try {
      let pdfUrl: string | null | undefined = undefined; // undefined = keep existing
      if (pdf) {
        if (pdf.size > 50 * 1024 * 1024) {
          toast.error("PDF must be 50 MB or smaller.");
          setSubmitting(false);
          return;
        }
        const ext = pdf.name.split(".").pop() || "pdf";
        const path = `${form.courseId}/lesson-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("lesson-pdfs")
          .upload(path, pdf, { upsert: false });
        if (upErr) throw upErr;
        // Store storage path; bucket is private and signed URLs are minted at view time
        pdfUrl = path;
      }

      const payload = {
        course_id: form.courseId,
        cohort_id: form.cohortId || null,
        title: form.title.trim(),
        lesson_number: form.lessonNumber,
        lesson_date: form.lessonDate ? new Date(form.lessonDate).toISOString() : null,
        zoom_live_link: form.zoomLive.trim() || null,
        zoom_recording_link: form.zoomRecording.trim() || null,
        is_published: form.published,
        ...(pdfUrl !== undefined ? { pdf_url: pdfUrl } : {}),
      };

      if (form.id) {
        const { error } = await supabase.from("lessons").update(payload).eq("id", form.id);
        if (error) throw error;
        toast.success("Lesson updated");
      } else {
        const { error } = await supabase.from("lessons").insert(payload);
        if (error) throw error;
        toast.success("Lesson saved");
      }
      cancelEdit();
      void reload();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <InstructorGuard>
      <div className="flex items-center gap-3">
        <Upload className="h-6 w-6 text-secondary" />
        <h1 className="font-display text-3xl font-extrabold text-forest">Upload Content</h1>
      </div>
      <p className="mt-1 text-foreground/65">Add or edit lessons for the courses you teach.</p>

      {courses.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-background p-12 text-center text-foreground/60">
          You have no assigned courses yet. Ask an admin to assign you to a course.
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <form
            onSubmit={submit}
            className="lg:col-span-3 space-y-5 rounded-2xl border border-border bg-background p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-forest">
                {form.id ? "Edit lesson" : "New lesson"}
              </h2>
              {form.id && (
                <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-1" /> Cancel edit
                </Button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Course</Label>
                <Select
                  value={form.courseId}
                  onValueChange={(v) => setForm({ ...form, courseId: v, cohortId: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course…" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Cohort</Label>
                <Select
                  value={form.cohortId}
                  onValueChange={(v) => setForm({ ...form, cohortId: v })}
                  disabled={!form.courseId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={form.courseId ? "Select cohort…" : "Pick course first"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cohortsForCourse.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Lesson title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                maxLength={200}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Lesson number</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.lessonNumber}
                  onChange={(e) =>
                    setForm({ ...form, lessonNumber: parseInt(e.target.value, 10) || 1 })
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Lesson date & time</Label>
                <Input
                  type="datetime-local"
                  value={form.lessonDate}
                  onChange={(e) => setForm({ ...form, lessonDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Zoom live link</Label>
                <Input
                  type="url"
                  value={form.zoomLive}
                  onChange={(e) => setForm({ ...form, zoomLive: e.target.value })}
                  placeholder="https://zoom.us/j/…"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Zoom recording link</Label>
                <Input
                  type="url"
                  value={form.zoomRecording}
                  onChange={(e) => setForm({ ...form, zoomRecording: e.target.value })}
                  placeholder="https://zoom.us/rec/…"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>PDF (max 50 MB){form.id ? " — leave empty to keep existing" : ""}</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
              />
              {pdf && (
                <p className="text-xs text-foreground/55 inline-flex items-center gap-1">
                  <FileText className="h-3 w-3" /> {pdf.name}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <Label>Publish lesson</Label>
                <p className="text-xs text-foreground/55">
                  Visible to enrolled students immediately.
                </p>
              </div>
              <Switch
                checked={form.published}
                onCheckedChange={(v) => setForm({ ...form, published: v })}
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-forest text-mint hover:bg-forest/90"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {form.id ? "Save changes" : "Save lesson"}
            </Button>
          </form>

          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-display font-bold text-forest">Recent lessons</h2>
            {lessons.length === 0 ? (
              <p className="text-sm text-foreground/60">No lessons yet.</p>
            ) : (
              lessons.map((l) => {
                const courseName = courses.find((c) => c.id === l.course_id)?.title ?? "—";
                return (
                  <div key={l.id} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-forest text-sm truncate">
                          {l.lesson_number}. {l.title}
                        </p>
                        <p className="text-xs text-foreground/55 truncate">{courseName}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${l.is_published ? "bg-secondary/20 text-forest" : "bg-mint-tint text-foreground/60"}`}
                      >
                        {l.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 rounded-full"
                      onClick={() => startEdit(l)}
                    >
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </InstructorGuard>
  );
}
