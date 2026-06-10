import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Megaphone, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/announcements")({
  component: AdminAnnouncementsPage,
});

type Announcement = {
  id: string;
  title: string;
  message: string;
  cohort_id: string;
  cohort_name: string;
  created_at: string;
  reach: number;
};

function AdminAnnouncementsPage() {
  const [rows, setRows] = useState<Announcement[]>([]);
  const [cohorts, setCohorts] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [form, setForm] = useState({ cohort_id: "", title: "", message: "" });

  const load = async () => {
    setLoading(true);
    const [annRes, cohortsRes, enrolRes] = await Promise.all([
      supabase
        .from("announcements")
        .select("*, cohorts:cohort_id(name)")
        .order("created_at", { ascending: false }),
      supabase.from("cohorts").select("id, name").order("name"),
      supabase.from("enrollments").select("cohort_id"),
    ]);
    const reach = new Map<string, number>();
    for (const e of enrolRes.data ?? [])
      if (e.cohort_id) reach.set(e.cohort_id, (reach.get(e.cohort_id) ?? 0) + 1);
    setCohorts(cohortsRes.data ?? []);
    setRows(
      (annRes.data ?? []).map((a: any) => ({
        id: a.id,
        title: a.title,
        message: a.message,
        cohort_id: a.cohort_id,
        cohort_name: a.cohorts?.name ?? "—",
        created_at: a.created_at,
        reach: reach.get(a.cohort_id) ?? 0,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const post = async () => {
    if (!form.cohort_id || !form.title.trim() || !form.message.trim()) {
      toast.error("All fields required");
      return;
    }
    setPosting(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("announcements").insert({
      cohort_id: form.cohort_id,
      title: form.title.trim(),
      message: form.message.trim(),
      created_by: auth.user?.id,
    });
    setPosting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Announcement posted to cohort");
    setForm({ cohort_id: "", title: "", message: "" });
    void load();
  };

  const columns: Column<Announcement>[] = [
    { key: "cohort_name", header: "Cohort", accessor: (r) => r.cohort_name },
    { key: "title", header: "Title", accessor: (r) => r.title },
    {
      key: "created_at",
      header: "Date",
      accessor: (r) => r.created_at,
      cell: (r) => new Date(r.created_at).toLocaleDateString(),
    },
    {
      key: "reach",
      header: "Reach",
      accessor: (r) => r.reach,
      cell: (r) => (
        <span className="font-bold text-forest">
          {r.reach} student{r.reach === 1 ? "" : "s"}
        </span>
      ),
    },
  ];

  return (
    <AdminGuard>
      <div className="flex items-center gap-3">
        <Megaphone className="h-6 w-6 text-secondary" />
        <h1 className="font-display text-3xl font-extrabold text-forest">Announcements</h1>
      </div>
      <p className="mt-1 text-foreground/65">Send updates to a specific cohort.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-2xl border border-border bg-background p-5 shadow-soft">
          <h2 className="font-display text-lg font-extrabold text-forest">New announcement</h2>
          <div className="mt-4 grid gap-3">
            <div>
              <Label>Cohort</Label>
              <Select
                value={form.cohort_id}
                onValueChange={(v) => setForm({ ...form, cohort_id: v })}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select cohort" />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Capstone deadline reminder"
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Write your announcement…"
              />
            </div>
            <Button
              onClick={post}
              disabled={posting}
              className="rounded-full bg-forest text-mint hover:bg-forest/90"
            >
              {posting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" /> Post
                </>
              )}
            </Button>
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-extrabold text-forest mb-3">
            Past announcements
          </h2>
          {loading ? (
            <div className="grid place-items-center py-20 text-foreground/50">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <DataTable
              rows={rows}
              columns={columns}
              rowKey={(r) => r.id}
              pageSize={10}
              emptyMessage="No announcements yet."
            />
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
