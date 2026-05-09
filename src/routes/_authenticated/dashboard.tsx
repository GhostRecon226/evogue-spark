import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Award, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { courses } from "@/lib/courses-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardHome,
});

function DashboardHome() {
  const { user, profile } = useAuth();
  const name = profile?.full_name?.trim() || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";
  const last = courses[0];

  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl font-extrabold text-forest">Welcome back, {name} 👋</h1>
      <p className="mt-1 text-foreground/65">Here's where you left off.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Stat icon={BookOpen} label="Enrolled courses" value="2" />
        <Stat icon={Award} label="Completed" value="0" />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-forest">Continue learning</h2>
        <div className="mt-4 rounded-3xl bg-background border border-border overflow-hidden shadow-soft md:flex">
          <img src={last.cover} alt={last.title} className="md:w-64 w-full h-48 md:h-auto object-cover" />
          <div className="p-6 flex-1">
            <p className="text-xs uppercase tracking-wide text-secondary font-bold">{last.category}</p>
            <h3 className="mt-1 font-display text-xl font-bold text-forest">{last.title}</h3>
            <p className="mt-1 text-sm text-foreground/70">{last.description}</p>
            <div className="mt-4">
              <p className="text-xs text-foreground/55 mb-1">35% complete</p>
              <Progress value={35} />
            </div>
            <Button asChild className="mt-5 rounded-full bg-forest text-mint hover:bg-forest/90">
              <Link to="/dashboard/courses/$slug" params={{ slug: last.slug }}>Continue <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background border border-border p-6 flex items-center gap-4">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-mint/30 text-secondary"><Icon className="h-5 w-5" /></span>
      <div>
        <p className="text-sm text-foreground/60">{label}</p>
        <p className="font-display text-2xl font-extrabold text-forest">{value}</p>
      </div>
    </div>
  );
}
