import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock, Signal, CheckCircle2, ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCourseBySlug, type Course } from "@/lib/courses-data";

export const Route = createFileRoute("/courses/$slug")({
  loader: ({ params }) => {
    const course = getCourseBySlug(params.slug);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.course.title} — Evogue Academy` },
          { name: "description", content: loaderData.course.description },
          { property: "og:title", content: `${loaderData.course.title} — Evogue Academy` },
          { property: "og:description", content: loaderData.course.description },
          { property: "og:image", content: loaderData.course.cover },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <PublicShell>
      <div className="py-32 text-center">
        <h1 className="font-display text-4xl text-forest">Course not found</h1>
        <Button asChild className="mt-6 rounded-full"><Link to="/courses">Browse courses</Link></Button>
      </div>
    </PublicShell>
  ),
  errorComponent: ({ error }) => (
    <PublicShell>
      <div className="py-32 text-center text-foreground/70">{error.message}</div>
    </PublicShell>
  ),
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { course } = Route.useLoaderData() as { course: Course };

  return (
    <PublicShell>
      <section className="bg-mint-tint py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-secondary">{course.category}</span>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl font-extrabold text-forest leading-tight">{course.title}</h1>
            <p className="mt-5 text-foreground/75 text-base sm:text-lg">{course.longDescription}</p>
            <div className="mt-6 flex flex-wrap gap-5 text-sm text-foreground/70">
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.duration}</span>
              <span className="inline-flex items-center gap-1.5"><Signal className="h-4 w-4" /> {course.level}</span>
              <span className="font-bold text-forest">{course.price}</span>
            </div>
            <EnrollButton className="mt-8 rounded-full bg-forest text-mint hover:bg-forest/90 h-12 px-8">
              Enroll Now <ArrowRight className="ml-1 h-4 w-4" />
            </EnrollButton>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-soft">
            <img src={course.cover} alt={course.title} className="w-full aspect-[4/3] object-cover" />
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-forest">What you'll learn</h2>
              <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                {course.whatYouLearn.map((it) => (
                  <li key={it} className="flex items-start gap-3 text-foreground/80">
                    <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-forest">Curriculum</h2>
              <Accordion type="single" collapsible className="mt-6">
                {course.curriculum.map((m, i) => (
                  <AccordionItem key={i} value={`m-${i}`}>
                    <AccordionTrigger className="text-left">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-secondary font-bold">{m.week}</p>
                        <p className="font-display font-bold text-forest">{m.title}</p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1.5 text-foreground/75">
                        {m.topics.map((t) => <li key={t}>• {t}</li>)}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-forest">Your instructor</h2>
              <div className="mt-6 flex items-start gap-5 rounded-2xl border border-border p-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={course.instructor.avatar} />
                  <AvatarFallback>{course.instructor.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-display text-xl font-bold text-forest">{course.instructor.name}</p>
                  <p className="text-sm text-secondary font-semibold">{course.instructor.title}</p>
                  <p className="mt-3 text-foreground/75">{course.instructor.bio}</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 h-fit">
            <div className="rounded-3xl border border-border bg-background p-6 shadow-soft">
              <p className="text-xs uppercase tracking-wide text-foreground/55">Tuition</p>
              <p className="mt-1 font-display text-4xl font-extrabold text-forest">{course.price}</p>
              <ul className="mt-5 space-y-2 text-sm text-foreground/70">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-secondary" /> {course.duration} cohort</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-secondary" /> Live mentorship</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-secondary" /> Career support</li>
              </ul>
              <EnrollButton className="mt-6 w-full rounded-full bg-forest text-mint hover:bg-forest/90 h-12">
                Enroll Now
              </EnrollButton>
              <p className="mt-3 text-xs text-foreground/55 text-center">Scholarships available</p>
            </div>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}
