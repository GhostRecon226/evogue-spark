import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Loader2, Plus, Pencil, Trash2, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  component: AdminCoursesPage,
});

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration: string | null;
  level: string | null;
  price: string | null;
  category: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  capstone_released: boolean;
  capstone_brief: string | null;
  capstone_brief_url: string | null;
  enrolled_count: number;
};

type Form = Omit<CourseRow, "id" | "enrolled_count">;

const emptyForm: Form = {
  title: "", slug: "", description: "", duration: "", level: "", price: "",
  category: "", cover_image_url: "", is_published: false, capstone_released: false,
  capstone_brief: "", capstone_brief_url: "",
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function AdminCoursesPage() {
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CourseRow | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [coursesRes, enrolRes] = await Promise.all([
      supabase.from("courses").select("*").order("created_at", { ascending: false }),
      supabase.from("enrollments").select("course_id"),
    ]);
    const counts = new Map<string, number>();
    for (const e of enrolRes.data ?? []) counts.set(e.course_id, (counts.get(e.course_id) ?? 0) + 1);
    setRows((coursesRes.data ?? []).map((c) => ({ ...c, enrolled_count: counts.get(c.id) ?? 0 } as CourseRow)));
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const startCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const startEdit = (c: CourseRow) => {
    setEditing(c);
    const { id: _id, enrolled_count: _ec, ...rest } = c;
    setForm({ ...rest, description: rest.description ?? "", duration: rest.duration ?? "",
      level: rest.level ?? "", price: rest.price ?? "", category: rest.category ?? "",
      cover_image_url: rest.cover_image_url ?? "", capstone_brief: rest.capstone_brief ?? "",
      capstone_brief_url: rest.capstone_brief_url ?? "" });
    setOpen(true);
  };

  const togglePublished = async (c: CourseRow, next: boolean) => {
    const prev = rows;
    setRows((r) => r.map((x) => (x.id === c.id ? { ...x, is_published: next } : x)));
    const { error } = await supabase.from("courses").update({ is_published: next }).eq("id", c.id);
    if (error) { setRows(prev); toast.error(error.message); }
    else toast.success(next ? "Published" : "Unpublished");
  };

  const save = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const slug = form.slug.trim() || slugify(form.title);
    const payload = {
      title: form.title.trim(),
      slug,
      description: form.description?.trim() || null,
      duration: form.duration?.trim() || null,
      level: form.level?.trim() || null,
      price: form.price?.trim() || null,
      category: form.category?.trim() || null,
      cover_image_url: form.cover_image_url?.trim() || null,
      is_published: form.is_published,
      capstone_released: form.capstone_released,
      capstone_brief: form.capstone_brief?.trim() || null,
      capstone_brief_url: form.capstone_brief_url?.trim() || null,
    };
    setSaving(true);
    const { error } = editing
      ? await supabase.from("courses").update(payload).eq("id", editing.id)
      : await supabase.from("courses").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Course updated" : "Course created");
    setOpen(false);
    void load();
  };

  const remove = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("courses").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    setRows((r) => r.filter((c) => c.id !== deleteId));
    setDeleteId(null);
    toast.success("Course deleted");
  };

  const columns: Column<CourseRow>[] = useMemo(() => [
    { key: "title", header: "Title", accessor: (r) => r.title,
      cell: (r) => (
        <div>
          <p className="font-semibold text-forest">{r.title}</p>
          <p className="text-xs text-foreground/55">/{r.slug}</p>
        </div>
      ) },
    { key: "category", header: "Category", accessor: (r) => r.category ?? "—" },
    { key: "level", header: "Level", accessor: (r) => r.level ?? "—" },
    { key: "price", header: "Price", accessor: (r) => r.price ?? "—" },
    { key: "enrolled_count", header: "Enrolled", accessor: (r) => r.enrolled_count },
    { key: "is_published", header: "Published", accessor: (r) => (r.is_published ? 1 : 0),
      cell: (r) => <Switch checked={r.is_published} onCheckedChange={(v) => togglePublished(r, v)} /> },
  ], []);

  return (
    <AdminGuard>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-secondary" />
            <h1 className="font-display text-3xl font-extrabold text-forest">Courses</h1>
          </div>
          <p className="mt-1 text-foreground/65">Create, edit, and publish courses.</p>
        </div>
        <Button onClick={startCreate} className="rounded-full bg-forest text-mint hover:bg-forest/90">
          <Plus className="h-4 w-4 mr-1" /> Add New Course
        </Button>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid place-items-center py-20 text-foreground/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <DataTable
            rows={rows} columns={columns} rowKey={(r) => r.id} pageSize={10}
            emptyMessage="No courses yet — create your first one."
            actions={(r) => (
              <div className="inline-flex gap-1">
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => startEdit(r)} title="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => setDeleteId(r.id)} title="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit course" : "Add new course"}</DialogTitle>
            <DialogDescription>Fill in the details. Slug auto-generates from title if empty.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="grid gap-1.5">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder={form.title ? slugify(form.title) : "auto-generated"} />
            </div>
            <div className="grid gap-1.5">
              <Label>Description</Label>
              <Textarea rows={4} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Category</Label>
                <Input value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Level</Label>
                <Input placeholder="Beginner / Intermediate / Advanced"
                  value={form.level ?? ""} onChange={(e) => setForm({ ...form, level: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Duration</Label>
                <Input placeholder="6 weeks" value={form.duration ?? ""} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Price</Label>
                <Input placeholder="₦50,000" value={form.price ?? ""} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Cover image URL</Label>
              <Input type="url" value={form.cover_image_url ?? ""} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <Label>Published</Label>
                <p className="text-xs text-foreground/55">Visible to students.</p>
              </div>
              <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
            </div>
            <details className="rounded-xl border border-border p-3">
              <summary className="cursor-pointer flex items-center gap-2 font-bold text-forest">
                <ClipboardCheck className="h-4 w-4" /> Capstone settings
              </summary>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Release capstone to students</Label>
                  <Switch checked={form.capstone_released} onCheckedChange={(v) => setForm({ ...form, capstone_released: v })} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Capstone brief (text)</Label>
                  <Textarea rows={4} value={form.capstone_brief ?? ""} onChange={(e) => setForm({ ...form, capstone_brief: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Capstone brief PDF URL</Label>
                  <Input type="url" value={form.capstone_brief_url ?? ""} onChange={(e) => setForm({ ...form, capstone_brief_url: e.target.value })} />
                </div>
              </div>
            </details>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-forest text-mint hover:bg-forest/90">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? "Save changes" : "Create course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this course?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the course and cannot be undone. Existing enrollments will reference a missing course.
            </AlertDialogDescription>
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
