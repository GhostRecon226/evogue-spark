import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PlayCircle, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/lessons")({
  component: AdminLessonsPage,
});

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
  course_title: string;
  cohort_name: string | null;
};

type Form = {
  course_id: string;
  cohort_id: string;
  title: string;
  lesson_number: number;
  lesson_date: string;
  zoom_live_link: string;
  zoom_recording_link: string;
  pdf_url: string;
  is_published: boolean;
};

const empty: Form = {
  course_id: "", cohort_id: "", title: "", lesson_number: 1,
  lesson_date: "", zoom_live_link: "", zoom_recording_link: "",
  pdf_url: "", is_published: false,
};

function AdminLessonsPage() {
  const [rows, setRows] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [cohorts, setCohorts] = useState<{ id: string; name: string; course_id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const [lessonsRes, coursesRes, cohortsRes] = await Promise.all([
      supabase.from("lessons").select("*, courses:course_id(title), cohorts:cohort_id(name)").order("course_id").order("lesson_number"),
      supabase.from("courses").select("id, title").order("title"),
      supabase.from("cohorts").select("id, name, course_id").order("name"),
    ]);
    setCourses(coursesRes.data ?? []);
    setCohorts(cohortsRes.data ?? []);
    setRows((lessonsRes.data ?? []).map((l: any) => ({
      ...l,
      course_title: l.courses?.title ?? "—",
      cohort_name: l.cohorts?.name ?? null,
    })));
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() =>
    filter === "all" ? rows : rows.filter((r) => r.course_id === filter),
  [rows, filter]);

  const cohortOptions = useMemo(() =>
    form.course_id ? cohorts.filter((c) => c.course_id === form.course_id) : cohorts,
  [cohorts, form.course_id]);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (l: Lesson) => {
    setEditing(l);
    setForm({
      course_id: l.course_id, cohort_id: l.cohort_id ?? "",
      title: l.title, lesson_number: l.lesson_number,
      lesson_date: l.lesson_date ? l.lesson_date.slice(0, 16) : "",
      zoom_live_link: l.zoom_live_link ?? "",
      zoom_recording_link: l.zoom_recording_link ?? "",
      pdf_url: l.pdf_url ?? "", is_published: l.is_published,
    });
    setOpen(true);
  };

  const handlePdfUpload = async (file: File) => {
    setUploading(true);
    const path = `${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("lesson-pdfs").upload(path, file);
    if (error) { setUploading(false); toast.error(error.message); return; }
    // Store storage path (bucket is private; signed URLs are minted at view time)
    setForm((f) => ({ ...f, pdf_url: path }));
    setUploading(false);
    toast.success("PDF uploaded");
  };

  const save = async () => {
    if (!form.course_id || !form.title.trim()) { toast.error("Course and title required"); return; }
    setSaving(true);
    const payload = {
      course_id: form.course_id,
      cohort_id: form.cohort_id || null,
      title: form.title.trim(),
      lesson_number: form.lesson_number,
      lesson_date: form.lesson_date ? new Date(form.lesson_date).toISOString() : null,
      zoom_live_link: form.zoom_live_link || null,
      zoom_recording_link: form.zoom_recording_link || null,
      pdf_url: form.pdf_url || null,
      is_published: form.is_published,
    };
    const res = editing
      ? await supabase.from("lessons").update(payload).eq("id", editing.id)
      : await supabase.from("lessons").insert(payload);
    setSaving(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(editing ? "Lesson updated" : "Lesson created");
    setOpen(false);
    void load();
  };

  const remove = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("lessons").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success("Lesson deleted");
    setDeleteId(null);
    void load();
  };

  const columns: Column<Lesson>[] = [
    { key: "course_title", header: "Course", accessor: (r) => r.course_title },
    { key: "lesson_number", header: "#", accessor: (r) => r.lesson_number, className: "w-12" },
    { key: "title", header: "Title", accessor: (r) => r.title },
    { key: "cohort_name", header: "Cohort", accessor: (r) => r.cohort_name ?? "—" },
    { key: "lesson_date", header: "Date", accessor: (r) => r.lesson_date,
      cell: (r) => r.lesson_date ? new Date(r.lesson_date).toLocaleString() : "—" },
    { key: "is_published", header: "Published", accessor: (r) => (r.is_published && r.cohort_id && r.lesson_date) ? 1 : 0,
      cell: (r) => {
        const live = r.is_published && r.cohort_id && r.lesson_date;
        return live
          ? <span className="inline-flex rounded-full bg-secondary/15 px-2.5 py-0.5 text-xs font-bold text-secondary">Live</span>
          : <span className="inline-flex rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs font-bold text-foreground/55">Draft</span>;
      } },
  ];

  return (
    <AdminGuard>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PlayCircle className="h-6 w-6 text-secondary" />
          <h1 className="font-display text-3xl font-extrabold text-forest">Lessons</h1>
        </div>
        <Button onClick={startCreate} className="rounded-full bg-forest text-mint hover:bg-forest/90">
          <Plus className="h-4 w-4 mr-1" /> New Lesson
        </Button>
      </div>
      <p className="mt-1 text-foreground/65">Add live class links, recordings, and PDF resources per lesson.</p>

      <div className="mt-6">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-64 rounded-full"><SelectValue placeholder="Filter by course" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid place-items-center py-20 text-foreground/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <DataTable
            rows={filtered} columns={columns} rowKey={(r) => r.id} pageSize={10}
            actions={(r) => (
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => startEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="outline" size="sm" className="rounded-full text-destructive" onClick={() => setDeleteId(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            )}
          />
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit lesson" : "New lesson"}</DialogTitle>
            <DialogDescription>Configure live class details and resources.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Course</Label>
                <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v, cohort_id: "" })}>
                  <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cohort (optional)</Label>
                <Select value={form.cohort_id || "none"} onValueChange={(v) => setForm({ ...form, cohort_id: v === "none" ? "" : v })}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {cohortOptions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Lesson number</Label>
                <Input type="number" min={1} value={form.lesson_number} onChange={(e) => setForm({ ...form, lesson_number: parseInt(e.target.value || "1", 10) })} />
              </div>
              <div>
                <Label>Lesson date / time</Label>
                <Input type="datetime-local" value={form.lesson_date} onChange={(e) => setForm({ ...form, lesson_date: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Zoom live link</Label>
                <Input value={form.zoom_live_link} onChange={(e) => setForm({ ...form, zoom_live_link: e.target.value })} placeholder="https://zoom.us/j/…" />
              </div>
              <div className="col-span-2">
                <Label>Zoom recording link (added after class)</Label>
                <Input value={form.zoom_recording_link} onChange={(e) => setForm({ ...form, zoom_recording_link: e.target.value })} placeholder="https://…" />
              </div>
              <div className="col-span-2">
                <Label>PDF resource</Label>
                <div className="flex gap-2 items-center">
                  <Input type="file" accept="application/pdf" onChange={(e) => e.target.files?.[0] && handlePdfUpload(e.target.files[0])} disabled={uploading} />
                  {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                {form.pdf_url && <p className="mt-1 text-xs text-foreground/55 truncate">Current: {form.pdf_url}</p>}
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                <Label>Published</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="rounded-full bg-forest text-mint hover:bg-forest/90" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editing ? "Save changes" : "Create lesson")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lesson?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminGuard>
  );
}
