import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Download, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/certificates")({
  component: CertificatesPage,
});

type Cert = {
  id: string;
  course_title: string;
  issued_at: string;
  certificate_url: string | null;
};

function CertificatesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [certs, setCerts] = useState<Cert[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("certificates")
        .select("id, issued_at, certificate_url, courses(title)")
        .eq("student_id", user.id)
        .order("issued_at", { ascending: false });
      const mapped: Cert[] = (data ?? []).map((c) => ({
        id: c.id,
        course_title: c.courses?.title ?? "Course",
        issued_at: c.issued_at,
        certificate_url: c.certificate_url,
      }));
      if (!cancelled) { setCerts(mapped); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [user]);

  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl font-extrabold text-forest">Certificates</h1>
      <p className="mt-1 text-foreground/65">Earned certificates appear here once you complete a course.</p>

      {loading ? (
        <div className="mt-12 grid place-items-center text-foreground/50"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : certs.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-background p-12 text-center">
          <Award className="h-12 w-12 text-secondary mx-auto" />
          <p className="mt-4 font-display text-lg font-bold text-forest">No certificates yet</p>
          <p className="mt-1 text-sm text-foreground/60">Complete a course to earn your first certificate.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {certs.map((c) => (
            <div key={c.id} className="rounded-2xl bg-background border border-border p-6">
              <Award className="h-8 w-8 text-secondary" />
              <h3 className="mt-4 font-display font-bold text-forest">{c.course_title}</h3>
              <p className="mt-1 text-sm text-foreground/60">
                Issued {new Date(c.issued_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <Button
                asChild
                disabled={!c.certificate_url}
                className="mt-5 rounded-full bg-forest text-mint hover:bg-forest/90"
              >
                <a href={c.certificate_url ?? "#"} target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4 mr-1" /> {c.certificate_url ? "Download Certificate" : "Pending"}
                </a>
              </Button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
