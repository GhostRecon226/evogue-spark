import { ArrowRight, Clock, Signal } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { type Course } from "@/lib/courses-data";

const FEATURED_COURSES: Course[] = [
  {
    slug: "project-management-business-analysis",
    title: "Project Management & Business Analysis",
    description: "Lead projects end-to-end, analyze business requirements and deliver value with modern PM & BA frameworks.",
    longDescription: "",
    duration: "6 weeks",
    level: "Beginner – Intermediate",
    price: "",
    category: "Management",
    cover: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
    active: true,
    whatYouLearn: [],
    curriculum: [],
    instructor: { name: "", title: "", bio: "", avatar: "" },
  } as unknown as Course,
  {
    slug: "scrum-master",
    title: "Scrum Master",
    description: "Facilitate agile teams, run sprints and ceremonies, and drive continuous improvement as a certified Scrum Master.",
    longDescription: "",
    duration: "3 weeks",
    level: "Intermediate",
    price: "",
    category: "Management",
    cover: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=1200&q=80",
    active: true,
    whatYouLearn: [],
    curriculum: [],
    instructor: { name: "", title: "", bio: "", avatar: "" },
  } as unknown as Course,
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    description: "Build brands that grow. Master SEO, social media, content strategy and paid advertising across channels.",
    longDescription: "",
    duration: "3 weeks",
    level: "Beginner",
    price: "",
    category: "Data",
    cover: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
    active: true,
    whatYouLearn: [],
    curriculum: [],
    instructor: { name: "", title: "", bio: "", avatar: "" },
  } as unknown as Course,
  {
    slug: "ai-for-professionals",
    title: "AI for Professionals",
    description: "Boost productivity with AI. Learn prompting, automation and practical AI workflows for any profession.",
    longDescription: "",
    duration: "3 weeks",
    level: "Beginner",
    price: "",
    category: "Development",
    cover: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
    active: true,
    whatYouLearn: [],
    curriculum: [],
    instructor: { name: "", title: "", bio: "", avatar: "" },
  } as unknown as Course,
];

export function Courses() {
  return (
    <section id="courses" className="py-14 sm:py-20">
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

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {FEATURED_COURSES.map((c) => (
            <CourseCard key={c.slug} course={c} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/courses">Browse all courses</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function CourseCard({ course }: { course: Course }) {
  const inactive = !course.active;
  return (
    <article
      className={`group rounded-3xl border border-border bg-background overflow-hidden shadow-soft transition-all ${
        inactive ? "opacity-80" : "hover:-translate-y-1"
      }`}
    >
      <Link to="/courses/$slug" params={{ slug: course.slug }} className="block">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={course.cover}
            alt={course.title}
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.dataset.fallback) {
                img.dataset.fallback = "1";
                img.src = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80";
              }
            }}
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
      </Link>
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
          <Button asChild className="w-full sm:w-auto rounded-full bg-forest text-mint hover:bg-forest/90">
            <Link to="/courses/$slug" params={{ slug: course.slug }}>
              View Details <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export { COURSE_NAMES } from "@/lib/courses-data";
