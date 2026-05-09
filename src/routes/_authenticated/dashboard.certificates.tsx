import { createFileRoute } from "@tanstack/react-router";
import { Award, Download } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard/certificates")({
  component: CertificatesPage,
});

const certs: { course: string; date: string }[] = [];

function CertificatesPage() {
  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl font-extrabold text-forest">Certificates</h1>
      <p className="mt-1 text-foreground/65">Earned certificates appear here once you complete a course.</p>

      {certs.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-background p-12 text-center">
          <Award className="h-12 w-12 text-secondary mx-auto" />
          <p className="mt-4 font-display text-lg font-bold text-forest">No certificates yet</p>
          <p className="mt-1 text-sm text-foreground/60">Complete a course to earn your first certificate.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {certs.map((c) => (
            <div key={c.course} className="rounded-2xl bg-background border border-border p-6">
              <Award className="h-8 w-8 text-secondary" />
              <h3 className="mt-4 font-display font-bold text-forest">{c.course}</h3>
              <p className="mt-1 text-sm text-foreground/60">Completed {c.date}</p>
              <Button className="mt-5 rounded-full bg-forest text-mint hover:bg-forest/90"><Download className="h-4 w-4 mr-1" /> Download Certificate</Button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
