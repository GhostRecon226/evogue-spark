import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Loader2, Plus, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { generateCertificate } from "@/lib/generate-certificate";

export const Route = createFileRoute("/_authenticated/admin/certificates")({
  component: AdminCertificatesPage,
});

type Cert = {
  id: string;
  student_id: string;
  course_id: string;
  cohort_id: string | null;
  registration_number: string | null;
  student_name: string;
  course_title: string;
  cohort_name: string | null;
  issued_at: string;
};

function AdminCertificatesPage() {
  const [rows, setRows] = useState<Cert[]>([]);
  const [students, setStudents] = useState<{ id: string; full_name: string | null; registration_number: string | null }[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [form, setForm] = useState({ student_id: "", course_id: "" });

  const load = async () => {
    setLoading(true);
    const [certsRes, studentsRes, coursesRes] = await Promise.all([
      supabase
        .from("certificates")
        .select("*, profiles:student_id(full_name, registration_number), courses:course_id(title), cohorts:cohort_id(name)")
        .order("issued_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, registration_number").order("full_name"),
      supabase.from("courses").select("id, title").order("title"),
    ]);
    setStudents(studentsRes.data ?? []);
    setCourses(coursesRes.data ?? []);
    setRows((certsRes.data ?? []).map((c: any) => ({
      id: c.id, student_id: c.student_id, course_id: c.course_id, cohort_id: c.cohort_id,
      registration_number: c.registration_number ?? c.profiles?.registration_number ?? null,
      student_name: c.profiles?.full_name ?? "—",
      course_title: c.courses?.title ?? "—",
      cohort_name: c.cohorts?.name ?? null,
      issued_at: c.issued_at,
    })));
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const issue = async () => {
    if (!form.student_id || !form.course_id) { toast.error("Student and course required"); return; }
    setIssuing(true);
    const { error } = await supabase.from("certificates").insert({
      student_id: form.student_id, course_id: form.course_id,
    });
    setIssuing(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Certificate issued");
    setOpen(false);
    setForm({ student_id: "", course_id: "" });
    void load();
  };

  const revoke = async () => {
    if (!revokeId) return;
    const { error } = await supabase.from("certificates").delete().eq("id", revokeId);
    if (error) { toast.error(error.message); return; }
    toast.success("Certificate revoked");
    setRevokeId(null);
    void load();
  };

  const download = async (c: Cert) => {
    try {
      await generateCertificate({
        studentName: c.student_name,
        courseTitle: c.course_title,
        issuedAt: new Date(c.issued_at),
      });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not generate certificate");
    }
  };

  const columns: Column<Cert>[] = [
    { key: "registration_number", header: "Reg #", accessor: (r) => r.registration_number ?? "—",
      cell: (r) => <span className="font-mono text-xs tracking-wider text-forest">{r.registration_number ?? "—"}</span> },
    { key: "student_name", header: "Student", accessor: (r) => r.student_name },
    { key: "course_title", header: "Course", accessor: (r) => r.course_title },
    { key: "cohort_name", header: "Cohort", accessor: (r) => r.cohort_name ?? "—" },
    { key: "issued_at", header: "Issued", accessor: (r) => r.issued_at,
      cell: (r) => new Date(r.issued_at).toLocaleDateString() },
  ];

  return (
    <AdminGuard>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Award className="h-6 w-6 text-secondary" />
          <h1 className="font-display text-3xl font-extrabold text-forest">Certificates</h1>
        </div>
        <Button onClick={() => setOpen(true)} className="rounded-full bg-forest text-mint hover:bg-forest/90">
          <Plus className="h-4 w-4 mr-1" /> Issue Manually
        </Button>
      </div>
      <p className="mt-1 text-foreground/65">All certificates issued on completion of capstone projects.</p>

      <div className="mt-6">
        {loading ? (
          <div className="grid place-items-center py-20 text-foreground/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <DataTable
            rows={rows} columns={columns} rowKey={(r) => r.id} pageSize={10}
            actions={(r) => (
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => download(r)}><Download className="h-3.5 w-3.5" /></Button>
                <Button variant="outline" size="sm" className="rounded-full text-destructive" onClick={() => setRevokeId(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            )}
          />
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue certificate</DialogTitle>
            <DialogDescription>Manually issue a certificate to a student for a course.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Student</Label>
              <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>{students.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name || s.id} {s.registration_number ? `· ${s.registration_number}` : ""}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Course</Label>
              <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
                <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="rounded-full bg-forest text-mint hover:bg-forest/90" onClick={issue} disabled={issuing}>
              {issuing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Issue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!revokeId} onOpenChange={(o) => !o && setRevokeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke certificate?</AlertDialogTitle>
            <AlertDialogDescription>The student will lose access to this certificate. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={revoke} className="bg-destructive text-destructive-foreground">Revoke</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminGuard>
  );
}
