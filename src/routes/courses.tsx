import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { CourseCard } from "@/components/landing/Courses";
import { Input } from "@/components/ui/input";
import { courses, COURSE_CATEGORIES } from "@/lib/courses-data";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses — Evogue Academy" },
      { name: "description", content: "Browse all design, development, data, management and security tracks at Evogue Academy." },
      { property: "og:title", content: "Courses — Evogue Academy" },
      { property: "og:description", content: "All Evogue Academy tracks in one place." },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesCat = cat === "All" || c.category === cat;
      const matchesQ = !q || (c.title + c.description).toLowerCase().includes(q.toLowerCase());
      return matchesCat && matchesQ;
    });
  }, [q, cat]);

  return (
    <PublicShell>
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-secondary">All Courses</span>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl font-extrabold text-forest leading-tight">
              Find your <span className="text-secondary">next skill</span>
            </h1>
            <p className="mt-5 text-foreground/70 text-base sm:text-lg">
              Search by topic or filter by category to find the right cohort for you.
            </p>
          </div>

          <div className="mt-10 max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search courses..."
              className="h-12 pl-12 rounded-full"
            />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {(["All", ...COURSE_CATEGORIES] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  cat === c
                    ? "bg-forest text-mint"
                    : "bg-mint-tint text-forest hover:bg-mint/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {filtered.map((c) => <CourseCard key={c.slug} course={c} />)}
          </div>
          {filtered.length === 0 && (
            <p className="mt-12 text-center text-foreground/60">No courses match your search.</p>
          )}
        </div>
      </section>
    </PublicShell>
  );
}
