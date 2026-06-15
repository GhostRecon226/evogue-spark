import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Download, Loader2, Lock, Share2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/certificate")({
  component: CertificatePage,
});

type CertData = {
  id: string;
  cert_id: string | null;
  issued_at: string;
  certificate_url: string | null;
  course_title: string;
};

type CapstoneStatus = "pending" | "recommended" | "approved" | "rejected" | "none";

function CertificatePage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState<CertData | null>(null);
  const [capstoneStatus, setCapstoneStatus] = useState<CapstoneStatus>("none");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [certRes, capRes] = await Promise.all([
        supabase
          .from("certificates")
          .select("id, cert_id, issued_at, certificate_url, courses(title)")
          .eq("student_id", user.id)
          .order("issued_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("capstone_submissions")
          .select("status")
          .eq("student_id", user.id)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      if (certRes.data) {
        setCert({
          id: certRes.data.id,
          cert_id: (certRes.data as any).cert_id ?? null,
          issued_at: certRes.data.issued_at,
          certificate_url: certRes.data.certificate_url,
          course_title: (certRes.data as any).courses?.title ?? "Course",
        });
      }
      setCapstoneStatus(((capRes.data as any)?.status ?? "none") as CapstoneStatus);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleDownload = async () => {
    if (!cert?.certificate_url) {
      toast.error("Certificate file not available yet.");
      return;
    }
    setDownloading(true);
    const { data, error } = await supabase.storage
      .from("certificates")
      .createSignedUrl(cert.certificate_url, 60 * 5);
    setDownloading(false);
    if (error || !data) {
      toast.error("Could not generate download link.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noreferrer");
  };

  const handleShare = () => {
    if (!cert) return;
    const text = `I just completed ${cert.course_title} at Evogue Academy. Built in Africa. Open to the World. #EvogueAcademy #TechSkills`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      "https://evogueacademy.com",
    )}&summary=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noreferrer");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="grid place-items-center py-20 text-foreground/50">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <div className="flex items-center gap-3">
          <Award className="h-6 w-6 text-secondary" />
          <h1 className="font-display text-3xl font-extrabold text-forest">Certificate</h1>
        </div>

        {!cert ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-mint/10 p-10 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-mint/40 grid place-items-center">
              <Lock className="h-7 w-7 text-forest" />
            </div>
            <p className="mt-5 font-display text-lg font-bold text-forest">
              Your certificate will appear here once your capstone project is approved.
            </p>
            <p className="mt-2 text-sm text-foreground/65">
              Capstone status:{" "}
              <span className="font-bold capitalize text-forest">
                {capstoneStatus === "none" ? "not submitted" : capstoneStatus}
              </span>
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {cert.certificate_url ? (
              <div className="rounded-3xl border-8 border-forest bg-background p-2 shadow-soft">
                <div className="rounded-xl border border-forest/30 overflow-hidden">
                  <CertificatePreview
                    storagePath={cert.certificate_url}
                    studentName={profile?.full_name ?? "Student"}
                    courseTitle={cert.course_title}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-amber-300 bg-amber-50 p-6 text-amber-900">
                <p className="font-semibold">Certificate is being prepared…</p>
                <p className="mt-1 text-sm">
                  Refresh in a moment. If this persists, contact us at hello@evogueacademy.com.
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-background p-5">
              <div className="grid gap-3 sm:grid-cols-3 text-sm">
                <div>
                  <div className="text-xs text-foreground/55">Course</div>
                  <div className="font-bold text-forest">{cert.course_title}</div>
                </div>
                <div>
                  <div className="text-xs text-foreground/55">Date issued</div>
                  <div className="font-bold text-forest">
                    {new Date(cert.issued_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/55">Certificate ID</div>
                  <div className="font-mono text-xs font-bold text-forest">
                    {cert.cert_id ?? `CERT-${cert.id.slice(0, 8).toUpperCase()}`}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Button
                onClick={handleDownload}
                disabled={downloading || !cert.certificate_url}
                className="w-full sm:w-auto rounded-full bg-forest text-mint hover:bg-forest/90"
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" /> Download Certificate
                  </>
                )}
              </Button>
              <Button variant="outline" className="w-full sm:w-auto rounded-full" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" /> Share on LinkedIn
              </Button>
            </div>


            <p className="text-xs text-foreground/55">
              Certificate ID:{" "}
              {cert.cert_id ?? `CERT-${cert.id.slice(0, 8).toUpperCase()}`}. Employers can verify
              this certificate by contacting hello@evogueacademy.com.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function CertificatePreview({
  storagePath,
  studentName,
  courseTitle,
}: {
  storagePath: string;
  studentName: string;
  courseTitle: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.storage
        .from("certificates")
        .createSignedUrl(storagePath, 60 * 10);
      if (!cancelled) setUrl(data?.signedUrl ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [storagePath]);

  if (!url) {
    return (
      <div className="aspect-[1.414/1] grid place-items-center bg-mint/10 text-foreground/50">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  return (
    <object
      data={`${url}#toolbar=0&navpanes=0`}
      type="application/pdf"
      className="w-full aspect-[1.414/1] bg-background"
      aria-label={`Certificate of completion for ${studentName} — ${courseTitle}`}
    >
      <div className="p-6 text-sm text-foreground/65">
        Your browser cannot preview this PDF. Use the Download button below.
      </div>
    </object>
  );
}
