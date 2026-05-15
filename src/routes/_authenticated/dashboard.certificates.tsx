import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Download, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { generateCertificate } from "@/lib/generate-certificate";

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
  const { user, profile } = useAuth();
  const studentName = profile?.full_name?.trim() || user?.email?.split("@")[0] || "Student";
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
        <div className="mt-10 rounded-3xl border border-dashed border-mint/50 bg-mint/10 p-12 text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-mint/30 grid place-items-center">
            <Award className="h-10 w-10 text-secondary" />
          </div>
          <p className="mt-5 font-display text-lg font-bold text-forest">No certificates yet</p>
          <p className="mt-1 text-sm text-foreground/60 max-w-sm mx-auto">
            Your certificate will appear here after your capstone is approved.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {certs.map((c) => (
            <div key={c.id} className="rounded-2xl bg-background border border-border border-t-4 border-t-[#00F5A0] p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint/30 text-secondary"><Award className="h-5 w-5" /></span>
                <p className="text-[11px] uppercase tracking-wider font-bold text-secondary">Certificate</p>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-forest line-clamp-2">{c.course_title}</h3>
              <p className="mt-1 text-xs text-foreground/60">
                Issued {new Date(c.issued_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </p>
              {profile?.registration_number && (
                <p className="mt-1 text-xs font-mono tracking-wider text-foreground/55">Reg. {profile.registration_number}</p>
              )}
              <Button
                onClick={() =>
                  generateCertificate({
                    studentName,
                    courseTitle: c.course_title,
                    issuedAt: c.issued_at,
                  })
                }
                className="mt-5 w-full rounded-full bg-[#0A2E1A] text-mint hover:bg-[#0A2E1A]/90"
              >
                <Download className="h-4 w-4 mr-1" /> Download Certificate
              </Button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
