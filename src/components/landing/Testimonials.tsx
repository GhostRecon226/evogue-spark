import { Quote, Star } from "lucide-react";

const items = [
  {
    name: "Chioma Nwosu",
    role: "Product Designer · Lagos",
    quote:
      "Evogue gave me the portfolio and the confidence to land my first design role at a global startup. The mentors were unreal.",
  },
  {
    name: "Adebayo Williams",
    role: "Frontend Engineer · Abuja",
    quote:
      "I tried bootcamps before — Evogue is on another level. Real projects, sharp feedback, and a community that actually shows up.",
  },
  {
    name: "Fatima Ibrahim",
    role: "Data Analyst · Kano",
    quote:
      "From zero to hired in five months. The curriculum is no-fluff, and the career support carried me to the finish line.",
  },
];

export function Testimonials() {
  return (
    <section className="py-14 sm:py-20 bg-mint-tint">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-secondary">
            Testimonials
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-extrabold text-forest leading-tight">
            Student <span className="text-secondary">success stories</span>
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <figure
              key={t.name}
              className="rounded-3xl bg-background p-7 border border-border shadow-soft flex flex-col"
            >
              <Quote className="h-9 w-9 text-mint" strokeWidth={2.5} fill="currentColor" />
              <div className="mt-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-star" fill="currentColor" />
                ))}
              </div>
              <blockquote className="mt-4 text-foreground/80 leading-relaxed flex-1">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 pt-5 border-t border-border">
                <p className="font-display font-bold text-forest">{t.name}</p>
                <p className="text-sm text-foreground/60">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
