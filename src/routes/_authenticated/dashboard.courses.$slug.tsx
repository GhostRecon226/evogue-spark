import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Video, CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { getCourseBySlug } from "@/lib/courses-data";

export const Route = createFileRoute("/_authenticated/dashboard/courses/$slug")({
  loader: ({ params }) => {
    const course = getCourseBySlug(params.slug);
    if (!course) throw notFound();
    return { course };
  },
  component: ClassroomPage,
});

function ClassroomPage() {
  const { course } = Route.useLoaderData();
  const lessons = course.curriculum.flatMap((m, mi) =>
    m.topics.map((t, ti) => ({ id: `${mi}-${ti}`, title: t, module: m.title }))
  );
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState(lessons[0].id);
  const active = lessons.find((l) => l.id === activeId)!;
  const progress = Math.round((Object.values(done).filter(Boolean).length / lessons.length) * 100);

  const toggle = (id: string) => setDone((d) => ({ ...d, [id]: !d[id] }));

  return (
    <DashboardLayout>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl bg-background border border-border p-4 h-fit">
          <h2 className="font-display font-bold text-forest">{course.title}</h2>
          <div className="mt-2"><Progress value={progress} /><p className="mt-1 text-xs text-foreground/60">{progress}% complete</p></div>
          <ul className="mt-4 space-y-1 max-h-[60vh] overflow-y-auto pr-1">
            {lessons.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => setActiveId(l.id)}
                  className={`w-full flex items-start gap-2 text-left rounded-lg px-3 py-2 text-sm transition ${
                    activeId === l.id ? "bg-mint/30 text-forest" : "hover:bg-mint-tint text-foreground/80"
                  }`}
                >
                  <Checkbox checked={!!done[l.id]} onCheckedChange={() => toggle(l.id)} onClick={(e) => e.stopPropagation()} className="mt-0.5" />
                  <span className="flex-1">{l.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main>
          <p className="text-xs uppercase tracking-wide text-secondary font-bold">{active.module}</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-forest">{active.title}</h1>
          <div className="mt-5 aspect-video rounded-2xl bg-forest/90 grid place-items-center text-mint border border-border overflow-hidden">
            <div className="text-center">
              <Video className="h-12 w-12 mx-auto opacity-70" />
              <p className="mt-2 text-sm text-mint/70">Video lesson placeholder</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-full"><Download className="h-4 w-4 mr-1" /> Download PDF</Button>
            <Button asChild className="rounded-full bg-mint text-forest hover:bg-mint/90 font-bold">
              <a href="#" target="_blank" rel="noreferrer"><Video className="h-4 w-4 mr-1" /> Join Zoom Live</a>
            </Button>
          </div>
          <div className="mt-8">
            <Button onClick={() => toggle(active.id)} className="rounded-full bg-forest text-mint hover:bg-forest/90">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {done[active.id] ? "Marked Complete" : "Mark as Complete"}
            </Button>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
