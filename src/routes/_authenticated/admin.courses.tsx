import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  component: AdminCourses,
});

function AdminCourses() {
  const { isAdmin, loading } = useAuth();
  if (loading) return <DashboardLayout><div /></DashboardLayout>;
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-10 rounded-3xl border border-dashed border-border bg-background p-10 text-center">
          <h1 className="font-display text-2xl font-extrabold text-forest">Admin access only</h1>
          <p className="mt-2 text-sm text-foreground/65">You don't have permission to view this page.</p>
          <Link to="/dashboard" className="mt-6 inline-block text-secondary font-bold">Back to dashboard</Link>
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-6 w-6 text-secondary" />
        <h1 className="font-display text-3xl font-extrabold text-forest">Manage Courses</h1>
      </div>
      <p className="mt-2 text-foreground/65">Toggle the capstone release per course and provide the project brief.</p>
      <AdminCoursesTable />
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  capstone_released: boolean;
  capstone_brief: string | null;
  capstone_brief_url: string | null;
};

function AdminCoursesTable() {
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ brief: string; url: string }>({ brief: "", url: "" });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, title, slug, capstone_released, capstone_brief, capstone_brief_url")
        .order("title");
      setRows((data ?? []) as CourseRow[]);
      setLoading(false);
    })();
  }, []);

  const toggle = async (id: string, next: boolean) => {
    const prev = rows;
    setRows((r) => r.map((c) => (c.id === id ? { ...c, capstone_released: next } : c)));
    const { error } = await supabase.from("courses").update({ capstone_released: next }).eq("id", id);
    if (error) { setRows(prev); toast.error(error.message); }
    else toast.success(next ? "Capstone released to students" : "Capstone hidden from students");
  };

  const startEdit = (c: CourseRow) => {
    setEditing(c.id);
    setDraft({ brief: c.capstone_brief ?? "", url: c.capstone_brief_url ?? "" });
  };

  const [briefFile, setBriefFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const saveBrief = async (id: string) => {
    setUploading(true);
    try {
      let url = draft.url;
      if (briefFile) {
        if (briefFile.size > 25 * 1024 * 1024) { toast.error("File must be 25 MB or smaller."); return; }
        const ext = briefFile.name.split(".").pop() ?? "pdf";
        const path = `${id}/brief-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("course-briefs").upload(path, briefFile, { upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("course-briefs").getPublicUrl(path);
        url = pub.publicUrl;
      }
      const { error } = await supabase
        .from("courses")
        .update({ capstone_brief: draft.brief || null, capstone_brief_url: url || null })
        .eq("id", id);
      if (error) throw error;
      setRows((r) => r.map((c) => (c.id === id ? { ...c, capstone_brief: draft.brief || null, capstone_brief_url: url || null } : c)));
      setEditing(null);
      setBriefFile(null);
      toast.success("Brief saved");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="mt-10 grid place-items-center text-foreground/50"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="mt-8 space-y-4">
      {rows.map((c) => (
        <div key={c.id} className="rounded-2xl border border-border bg-background p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-display text-lg font-bold text-forest">{c.title}</h3>
              <p className="text-xs text-foreground/55">/{c.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor={`r-${c.id}`} className="text-sm">Release Capstone</Label>
              <Switch id={`r-${c.id}`} checked={c.capstone_released} onCheckedChange={(v) => toggle(c.id, v)} />
            </div>
          </div>
          {editing === c.id ? (
            <div className="mt-4 space-y-3">
              <div>
                <Label>Project brief (text)</Label>
                <Textarea rows={5} value={draft.brief} onChange={(e) => setDraft({ ...draft, brief: e.target.value })} maxLength={5000} />
              </div>
              <div>
                <Label>Brief PDF link (optional)</Label>
                <Input type="url" placeholder="https://…" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
                {c.capstone_brief_url && !briefFile && (
                  <p className="mt-1 text-xs text-foreground/55">
                    Current: <a href={c.capstone_brief_url} target="_blank" rel="noreferrer" className="text-secondary underline">view brief</a>
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor={`brief-file-${c.id}`}>Or upload brief PDF (max 25 MB)</Label>
                <Input
                  id={`brief-file-${c.id}`}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setBriefFile(e.target.files?.[0] ?? null)}
                />
                {briefFile && <p className="mt-1 text-xs text-foreground/55">Will upload: {briefFile.name}</p>}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => saveBrief(c.id)} disabled={uploading} className="rounded-full bg-forest text-mint hover:bg-forest/90">
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Save brief
                </Button>
                <Button variant="ghost" onClick={() => { setEditing(null); setBriefFile(null); }} className="rounded-full">Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-sm text-foreground/70">
              {c.capstone_brief ? <p className="line-clamp-2">{c.capstone_brief}</p> : <p className="italic text-foreground/45">No brief set yet.</p>}
              <Button variant="link" className="px-0 mt-1 text-secondary" onClick={() => startEdit(c)}>Edit brief</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
