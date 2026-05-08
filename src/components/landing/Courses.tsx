import { ArrowRight, Clock, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";

type Course = {
  title: string;
  description: string;
  duration: string;
  level: string;
  cover: string;
  active?: boolean;
};

// Curated Unsplash placeholders per course track.
const courses: Course[] = [
  {
    title: "Product Design",
    description: "Master UX research, UI craft and design systems used by top product teams.",
    duration: "12 weeks",
    level: "Beginner – Intermediate",
    cover: "https://images.unsplash.com/photo-1561070791-2526d30994b8?w=900&q=80",
    active: true,
  },
  {
    title: "Product Management",
    description: "Lead product strategy, roadmaps and cross-functional teams with confidence.",
    duration: "10 weeks",
    level: "Intermediate",
    cover: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80",
  },
  {
    title: "Frontend Development",
    description: "Ship beautiful, accessible interfaces with React, TypeScript and modern tooling.",
    duration: "14 weeks",
    level: "Beginner – Intermediate",
    cover: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=900&q=80",
  },
  {
    title: "Backend Development",
    description: "Build robust APIs, services and data pipelines for production-scale apps.",
    duration: "14 weeks",
    level: "Intermediate",
    cover: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&q=80",
  },
  {
    title: "Data Analysis",
    description: "Turn messy data into clear insights with SQL, Python and modern BI tools.",
    duration: "10 weeks",
    level: "Beginner",
    cover: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80",
  },
  {
    title: "Project Management",
    description: "Deliver complex tech projects on time using agile, scrum and modern PM tools.",
    duration: "8 weeks",
    level: "Beginner – Intermediate",
    cover: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80",
  },
  {
    title: "Prompt Engineering",
    description: "Design powerful prompts and AI workflows that drive real business outcomes.",
    duration: "6 weeks",
    level: "Beginner",
    cover: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&q=80",
  },
  {
    title: "Cyber Security",
    description: "Defend systems, audit networks and respond to threats like a security pro.",
    duration: "12 weeks",
    level: "Intermediate",
    cover: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&q=80",
  },
  {
    title: "Cloud Engineering",
    description: "Architect, deploy and operate cloud infrastructure on AWS, GCP and Azure.",
    duration: "12 weeks",
    level: "Intermediate – Advanced",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=80",
  },
];

export function Courses() {
  return (
    <section id="courses" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-secondary">
            Our Courses
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-extrabold text-forest leading-tight">
            Learn high-demand <span className="text-secondary">tech skills</span>
          </h2>
          <p className="mt-4 text-foreground/70 text-base sm:text-lg">
            Pick a track and join an upcoming cohort. New courses are launching soon.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {courses.map((c) => (
            <CourseCard key={c.title} course={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CourseCard({ course }: { course: Course }) {
  const inactive = !course.active;
  return (
    <article
      className={`group rounded-3xl border border-border bg-background overflow-hidden shadow-soft transition-all ${
        inactive ? "opacity-70" : "hover:-translate-y-1"
      }`}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={course.cover}
          alt={course.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-700 ${
            inactive ? "" : "group-hover:scale-105"
          }`}
        />
        {inactive && (
          <span className="absolute top-4 right-4 rounded-full bg-forest/90 text-mint text-xs font-semibold px-3 py-1.5">
            Coming Soon
          </span>
        )}
        {course.active && (
          <span className="absolute top-4 right-4 rounded-full bg-mint text-forest text-xs font-bold px-3 py-1.5">
            Now Enrolling
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-bold text-forest">{course.title}</h3>
        <p className="mt-2 text-foreground/70 leading-relaxed">{course.description}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-foreground/60">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {course.duration}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Signal className="h-4 w-4" /> {course.level}
          </span>
        </div>
        <div className="mt-6">
          {course.active ? (
            <Button asChild className="w-full sm:w-auto rounded-full bg-forest text-mint hover:bg-forest/90">
              <a href="#enroll">
                View Details <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          ) : (
            <Button disabled className="w-full sm:w-auto rounded-full" variant="secondary">
              Coming Soon
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export const COURSE_NAMES = courses.map((c) => c.title);
