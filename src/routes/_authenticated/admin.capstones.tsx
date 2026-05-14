import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ExternalLink, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/capstones")({
  component: AdminCapstones,
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

const statusStyles: Record<Row["status"], string> = {
  pending: "bg-star/15 text-star",
  recommended: "bg-mint text-forest",
  approved: "bg-secondary/15 text-secondary",
  rejected: "bg-destructive/15 text-destructive",
};

function AdminCapstones() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("capstone_submissions")
      .select("id, status, submitted_at, submission_text, file_url, instructor_recommendation, instructor_note, student:profiles!capstone_submissions_student_id_fkey(full_name, email), course:courses!capstone_submissions_course_id_fkey(title)")
      .order("submitted_at", { ascending: false });
    setRows((data ?? []) as unknown as Row[]);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) void load(); }, [isAdmin]);

  const setStatus = async (id: string, status: Row["status"]) => {
    const { error } = await supabase
      .from("capstone_submissions")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "approved" ? "Approved · certificate issued" : `Marked ${status}`);
    void load();
  };

  const viewFile = async (path: string) => {
    const { data, error } = await supabase.storage.from("capstones").createSignedUrl(path, 60);
    if (error || !data) { toast.error("Could not generate file link"); return; }
    window.open(data.signedUrl, "_blank", "noreferrer");
  };

  if (authLoading) return <DashboardLayout><div /></DashboardLayout>;
  if (!isAdmin) return (
    <DashboardLayout>
      <div className="max-w-md mx-auto mt-10 rounded-3xl border border-dashed border-border bg-background p-10 text-center">
        <h1 className="font-display text-2xl font-extrabold text-forest">Admin access only</h1>
        <Link to="/dashboard" className="mt-4 inline-block text-secondary font-bold">Back to dashboard</Link>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-6 w-6 text-secondary" />
        <h1 className="font-display text-3xl font-extrabold text-forest">Capstone Submissions</h1>
      </div>
      <p className="mt-2 text-foreground/65">Review student capstone projects. Approving issues a certificate automatically.</p>

      {loading ? (
        <div className="mt-10 grid place-items-center text-foreground/50"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-background p-12 text-center text-foreground/60">No submissions yet.</div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-background">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-mint-tint text-foreground/70">
              <tr>
                <th className="text-left p-3 font-semibold">Student</th>
                <th className="text-left p-3 font-semibold">Course</th>
                <th className="text-left p-3 font-semibold">Submitted</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-right p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border align-top">
                  <td className="p-3">
                    <div className="font-semibold text-forest">{r.student?.full_name || "Student"}</div>
                    <div className="text-xs text-foreground/55">{r.student?.email}</div>
                  </td>
                  <td className="p-3 text-foreground/80">{r.course?.title ?? "—"}</td>
                  <td className="p-3 text-foreground/70">{new Date(r.submitted_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[r.status]}`}>{r.status}</span>
                    {r.instructor_recommendation && <div className="mt-1 text-[11px] text-secondary font-bold">★ Instructor recommended</div>}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2 justify-end">
                      <details className="rounded">
                        <summary className="cursor-pointer text-secondary text-xs font-bold">View</summary>
                        <div className="absolute right-4 mt-2 max-w-md rounded-xl bg-background border border-border shadow-soft p-4 text-xs z-20">
                          <p className="whitespace-pre-wrap text-foreground/80">{r.submission_text}</p>
                          {r.instructor_note && <p className="mt-2 italic text-foreground/65">Instructor: {r.instructor_note}</p>}
                          {r.file_url && (
                            <Button onClick={() => viewFile(r.file_url!)} variant="outline" size="sm" className="mt-2 rounded-full">
                              <ExternalLink className="h-3 w-3 mr-1" /> Open file
                            </Button>
                          )}
                        </div>
                      </details>
                      {r.status !== "approved" && <Button size="sm" className="rounded-full bg-forest text-mint hover:bg-forest/90" onClick={() => setStatus(r.id, "approved")}>Approve</Button>}
                      {r.status !== "rejected" && <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(r.id, "rejected")}>Reject</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
