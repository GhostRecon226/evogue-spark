import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Evogue Academy" },
      { name: "description", content: "Insights, stories and lessons from our global community of builders and designers." },
      { property: "og:title", content: "Blog — Evogue Academy" },
      { property: "og:description", content: "Insights, stories and lessons from our global community of builders and designers." },
    ],
  }),
  component: BlogPage,
});

const posts = [
  { title: "How I landed my first design role from Lagos", category: "Career", date: "May 4, 2026", excerpt: "From Figma tutorials to interviewing at global startups — a graduate shares the playbook.", cover: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&q=80" },
  { title: "5 portfolio mistakes junior designers keep making", category: "Design", date: "Apr 22, 2026", excerpt: "Reviewers flag the same patterns over and over. Avoid these and you'll stand out.", cover: "https://images.unsplash.com/photo-1561070791-2526d30994b8?w=1200&q=80" },
  { title: "A practical guide to React Server Components", category: "Engineering", date: "Apr 10, 2026", excerpt: "When to use them, when to avoid them, and what changes in your mental model.", cover: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=1200&q=80" },
  { title: "From spreadsheets to dashboards: the data analyst path", category: "Data", date: "Mar 30, 2026", excerpt: "The fastest way to go from Excel-curious to landing analytics roles.", cover: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80" },
  { title: "Prompting like a pro: patterns that ship", category: "AI", date: "Mar 18, 2026", excerpt: "The handful of techniques that consistently produce reliable LLM outputs.", cover: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80" },
  { title: "Cyber hygiene every founder should know", category: "Security", date: "Mar 6, 2026", excerpt: "The 12 controls that prevent 90% of breaches at early-stage startups.", cover: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80" },
];

function BlogPage() {
  return (
    <PublicShell>
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-secondary">Blog</span>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl font-extrabold text-forest leading-tight">
              Stories from the <span className="text-secondary">Evogue community</span>
            </h1>
            <p className="mt-5 text-foreground/70 text-base sm:text-lg">
              Insights, stories and lessons from our global community of builders and designers.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <article key={p.title} className="group rounded-2xl border border-border bg-background overflow-hidden shadow-soft hover:-translate-y-1 transition">
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={p.cover} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="p-6">
                  <span className="inline-block rounded-full bg-mint/30 text-secondary text-xs font-bold px-3 py-1 uppercase tracking-wide">{p.category}</span>
                  <h3 className="mt-3 font-display text-lg font-bold text-forest leading-snug">{p.title}</h3>
                  <p className="mt-2 text-sm text-foreground/70">{p.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-foreground/55">{p.date}</span>
                    <a href="#" className="font-semibold text-secondary inline-flex items-center gap-1 hover:gap-2 transition-all">Read more <ArrowRight className="h-4 w-4" /></a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
