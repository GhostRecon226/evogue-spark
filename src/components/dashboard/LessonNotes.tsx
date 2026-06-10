import { useEffect, useState } from "react";
import { Loader2, NotebookPen, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function LessonNotes({ lessonId }: { lessonId: string }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("student_notes")
        .select("note_text, updated_at")
        .eq("student_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();
      if (cancelled) return;
      setText(data?.note_text ?? "");
      setSavedAt(data?.updated_at ?? null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, lessonId]);

  const save = async () => {
    if (!user) return;
    if (text.length > 10000) {
      toast.error("Notes are limited to 10,000 characters.");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("student_notes")
      .upsert(
        { student_id: user.id, lesson_id: lessonId, note_text: text },
        { onConflict: "student_id,lesson_id" },
      )
      .select("updated_at")
      .single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSavedAt(data?.updated_at ?? new Date().toISOString());
    toast.success("Notes saved");
  };

  return (
    <section className="mt-8 rounded-2xl border border-border bg-background p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="flex items-center gap-2 font-display font-bold text-forest">
          <NotebookPen className="h-4 w-4" /> My Notes
        </h3>
        {savedAt && (
          <span className="text-xs text-foreground/55">
            Saved{" "}
            {new Date(savedAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
      {loading ? (
        <div className="grid place-items-center py-6 text-foreground/40">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <>
          <Textarea
            className="mt-3"
            rows={6}
            maxLength={10000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Jot down ideas, questions, or key takeaways from this lesson…"
          />
          <div className="mt-3 flex justify-end">
            <Button
              onClick={save}
              disabled={saving}
              className="rounded-full bg-forest text-mint hover:bg-forest/90"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Notes
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
