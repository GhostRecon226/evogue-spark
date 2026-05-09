import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Upload, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { InstructorGuard } from "@/components/instructor/InstructorGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/instructor/upload")({
  component: UploadContent,
});

type Course = { id: string; title: string };

function UploadContent() {
  const { instructorCourseIds } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [lessonNumber, setLessonNumber] = useState<number>(1);
  const [zoomLink, setZoomLink] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [published, setPublished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (instructorCourseIds.length === 0) return;
    (async () => {
      const { data } = await supabase.from("courses").select("id, title").in("id", instructorCourseIds).order("title");
      setCourses(data ?? []);
    })();
  }, [instructorCourseIds.join(",")]);

  // Auto-suggest next lesson_number when course changes
  useEffect(() => {
    if (!courseId) return;
    (async () => {
      const { data } = await supabase
        .from("lessons").select("lesson_number")
        .eq("course_id", courseId)
        .order("lesson_number", { ascending: false }).limit(1);
      setLessonNumber((data?.[0]?.lesson_number ?? 0) + 1);
    })();
  }, [courseId]);

  const reset = () => {
    setTitle(""); setZoomLink(""); setPdf(null); setPublished(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) { toast.error("Select a course"); return; }
    if (!title.trim()) { toast.error("Lesson title is required"); return; }
    if (!Number.isFinite(lessonNumber) || lessonNumber < 1) { toast.error("Lesson number must be 1 or higher"); return; }

    setSubmitting(true);
    try {
      let pdfUrl: string | null = null;
      if (pdf) {
        if (pdf.size > 50 * 1024 * 1024) { toast.error("PDF must be 50 MB or smaller."); setSubmitting(false); return; }
        const ext = pdf.name.split(".").pop() || "pdf";
        const path = `${courseId}/lesson-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("lesson-pdfs").upload(path, pdf, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("lesson-pdfs").getPublicUrl(path);
        pdfUrl = pub.publicUrl;
      }
      const { error } = await supabase.from("lessons").insert({
        course_id: courseId,
        title: title.trim(),
        lesson_number: lessonNumber,
        zoom_link: zoomLink.trim() || null,
        pdf_url: pdfUrl,
        is_published: published,
      });
      if (error) throw error;
      toast.success("Lesson saved");
      reset();
      setLessonNumber((n) => n + 1);
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
      <p className="mt-1 text-foreground/65">Add a new lesson to one of your courses.</p>

      {courses.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-background p-12 text-center text-foreground/60">
          You have no assigned courses yet. Ask an admin to assign you to a course.
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 max-w-2xl space-y-5 rounded-2xl border border-border bg-background p-6">
          <div className="grid gap-1.5">
            <Label>Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger><SelectValue placeholder="Select a course…" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Lesson title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Lesson number</Label>
              <Input type="number" min={1} value={lessonNumber}
                onChange={(e) => setLessonNumber(parseInt(e.target.value, 10) || 1)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Zoom recording link</Label>
              <Input type="url" value={zoomLink} onChange={(e) => setZoomLink(e.target.value)} placeholder="https://zoom.us/rec/…" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>PDF (max 50 MB)</Label>
            <Input type="file" accept=".pdf" onChange={(e) => setPdf(e.target.files?.[0] ?? null)} />
            {pdf && <p className="text-xs text-foreground/55 inline-flex items-center gap-1"><FileText className="h-3 w-3" /> {pdf.name}</p>}
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <Label>Publish lesson</Label>
              <p className="text-xs text-foreground/55">Visible to enrolled students immediately.</p>
            </div>
            <Switch checked={published} onCheckedChange={setPublished} />
          </div>
          <Button type="submit" disabled={submitting} className="rounded-full bg-forest text-mint hover:bg-forest/90">
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Save lesson
          </Button>
        </form>
      )}
    </InstructorGuard>
  );
}
