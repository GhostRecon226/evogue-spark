import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/cohorts")({
  component: AdminCohortsPage,
});

type Cohort = {
  id: string;
  name: string;
  course_id: string;
  course_title: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  capstone_released: boolean;
  capstone_brief_text: string | null;
  capstone_brief_url: string | null;
  enrolled_count: number;
};

type Form = {
  name: string;
  course_id: string;
  start_date: string;
  end_date: string;
  status: string;
  capstone_released: boolean;
  capstone_brief_text: string;
  capstone_brief_url: string;
};

const empty: Form = {
  name: "",
  course_id: "",
  start_date: "",
  end_date: "",
  status: "upcoming",
  capstone_released: false,
  capstone_brief_text: "",
  capstone_brief_url: "",
};

function AdminCohortsPage() {
  const [rows, setRows] = useState<Cohort[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cohort | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const [cohortsRes, coursesRes, enrolRes] = await Promise.all([
      supabase
        .from("cohorts")
        .select("*, courses:course_id(title)")
        .order("created_at", { ascending: false }),
      supabase.from("courses").select("id, title").order("title"),
      supabase.from("enrollments").select("cohort_id"),
    ]);
    const counts = new Map<string, number>();
    for (const e of enrolRes.data ?? [])
      if (e.cohort_id) counts.set(e.cohort_id, (counts.get(e.cohort_id) ?? 0) + 1);
    setCourses(coursesRes.data ?? []);
    setRows(
      (cohortsRes.data ?? []).map((c: any) => ({
        id: c.id,
        name: c.name,
        course_id: c.course_id,
        course_title: c.courses?.title ?? "—",
        start_date: c.start_date,
        end_date: c.end_date,
        status: c.status,
        capstone_released: c.capstone_released,
        capstone_brief_text: c.capstone_brief_text,
        capstone_brief_url: c.capstone_brief_url,
        enrolled_count: counts.get(c.id) ?? 0,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };
  const startEdit = (c: Cohort) => {
    setEditing(c);
    setForm({
      name: c.name,
      course_id: c.course_id,
      start_date: c.start_date ?? "",
      end_date: c.end_date ?? "",
      status: c.status,
      capstone_released: c.capstone_released,
      capstone_brief_text: c.capstone_brief_text ?? "",
      capstone_brief_url: c.capstone_brief_url ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.course_id) {
      toast.error("Name and course required");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      course_id: form.course_id,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      status: form.status,
      capstone_released: form.capstone_released,
      capstone_brief_text: form.capstone_brief_text || null,
      capstone_brief_url: form.capstone_brief_url || null,
    };
    const res = editing
      ? await supabase.from("cohorts").update(payload).eq("id", editing.id)
      : await supabase.from("cohorts").insert(payload);
    setSaving(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success(editing ? "Cohort updated" : "Cohort created");
    setOpen(false);
    void load();
  };

  const toggleCapstone = async (c: Cohort) => {
    const next = !c.capstone_released;
    const { error } = await supabase
      .from("cohorts")
      .update({ capstone_released: next })
      .eq("id", c.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(next ? "Capstone released to cohort" : "Capstone hidden");
    void load();
  };

  const remove = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("cohorts").delete().eq("id", deleteId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Cohort deleted");
    setDeleteId(null);
    void load();
  };

  const columns: Column<Cohort>[] = [
    { key: "name", header: "Cohort", accessor: (r) => r.name },
    { key: "course_title", header: "Course", accessor: (r) => r.course_title },
    {
      key: "start_date",
      header: "Start",
      accessor: (r) => r.start_date,
      cell: (r) => (r.start_date ? new Date(r.start_date).toLocaleDateString() : "—"),
    },
    {
      key: "end_date",
      header: "End",
      accessor: (r) => r.end_date,
      cell: (r) => (r.end_date ? new Date(r.end_date).toLocaleDateString() : "—"),
    },
    {
      key: "status",
      header: "Status",
      accessor: (r) => r.status,
      cell: (r) => (
        <span className="inline-block rounded-full bg-mint-tint px-2.5 py-1 text-xs font-bold text-forest capitalize">
          {r.status}
        </span>
      ),
    },
    { key: "enrolled_count", header: "Enrolled", accessor: (r) => r.enrolled_count },
    {
      key: "capstone_released",
      header: "Capstone",
      accessor: (r) => (r.capstone_released ? 1 : 0),
      cell: (r) => (
        <Switch checked={r.capstone_released} onCheckedChange={() => void toggleCapstone(r)} />
      ),
    },
  ];

  return (
    <AdminGuard>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-secondary" />
          <h1 className="font-display text-3xl font-extrabold text-forest">Cohorts</h1>
        </div>
        <Button
          onClick={startCreate}
          className="rounded-full bg-forest text-mint hover:bg-forest/90"
        >
          <Plus className="h-4 w-4 mr-1" /> New Cohort
        </Button>
      </div>
      <p className="mt-1 text-foreground/65">
        Manage course intakes, status, and capstone releases.
      </p>

      <div className="mt-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/45" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search cohorts by name or course…"
          className="pl-9 rounded-full"
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid place-items-center py-20 text-foreground/50">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <DataTable
            rows={rows.filter((r) => {
              const s = q.trim().toLowerCase();
              if (!s) return true;
              return r.name.toLowerCase().includes(s) || r.course_title.toLowerCase().includes(s);
            })}
            columns={columns}
            rowKey={(r) => r.id}
            pageSize={10}
            emptyState={
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="h-14 w-14 rounded-full bg-mint-tint grid place-items-center">
                  <CalendarDays className="h-6 w-6 text-secondary" />
                </div>
                <p className="font-display text-base font-bold text-forest">
                  No cohorts created yet
                </p>
                <Button
                  onClick={startCreate}
                  className="rounded-full bg-forest text-mint hover:bg-forest/90"
                >
                  <Plus className="h-4 w-4 mr-1" /> New Cohort
                </Button>
              </div>
            }
            actions={(r) => (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => startEdit(r)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-destructive"
                  onClick={() => setDeleteId(r.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          />
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit cohort" : "New cohort"}</DialogTitle>
            <DialogDescription>
              Cohorts represent an intake of students for a specific course.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Course</Label>
                <Select
                  value={form.course_id}
                  onValueChange={(v) => setForm({ ...form, course_id: v })}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select course" />
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
              <div>
                <Label>Cohort name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. January 2026"
                />
              </div>
              <div>
                <Label>Start date</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>End date</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <Switch
                  checked={form.capstone_released}
                  onCheckedChange={(v) => setForm({ ...form, capstone_released: v })}
                />
                <Label>Capstone released</Label>
              </div>
            </div>
            <div>
              <Label>Capstone brief (text)</Label>
              <Textarea
                rows={4}
                value={form.capstone_brief_text}
                onChange={(e) => setForm({ ...form, capstone_brief_text: e.target.value })}
                placeholder="Paste capstone instructions…"
              />
            </div>
            <div>
              <Label>Capstone brief (URL)</Label>
              <Input
                value={form.capstone_brief_url}
                onChange={(e) => setForm({ ...form, capstone_brief_url: e.target.value })}
                placeholder="https://…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-full bg-forest text-mint hover:bg-forest/90"
              onClick={save}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editing ? (
                "Save changes"
              ) : (
                "Create cohort"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete cohort?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={remove}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminGuard>
  );
}
