import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { courses } from "@/lib/courses-data";

export const Route = createFileRoute("/_authenticated/dashboard/courses")({
  component: MyCourses,
});

const enrolled = [
  { course: courses[0], progress: 35 },
  { course: courses[2], progress: 10 },
];

function MyCourses() {
  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl font-extrabold text-forest">My Courses</h1>
      <p className="mt-1 text-foreground/65">Pick up where you left off.</p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {enrolled.map(({ course, progress }) => (
          <div key={course.slug} className="rounded-2xl bg-background border border-border overflow-hidden shadow-soft">
            <img src={course.cover} alt={course.title} className="w-full h-40 object-cover" />
            <div className="p-5">
              <h3 className="font-display font-bold text-forest text-lg">{course.title}</h3>
              <div className="mt-3"><p className="text-xs text-foreground/55 mb-1">{progress}% complete</p><Progress value={progress} /></div>
              <Button asChild className="mt-5 w-full rounded-full bg-forest text-mint hover:bg-forest/90">
                <Link to="/dashboard/courses/$slug" params={{ slug: course.slug }}>Continue</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
