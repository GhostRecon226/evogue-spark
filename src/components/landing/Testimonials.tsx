import { Quote, Star } from "lucide-react";

const items = [
  {
    name: "Amara Osei",
    role: "Digital Marketer · Accra, Ghana",
    quote:
      "I had no background in tech at all. Three weeks into the Digital Marketing programme and I was already running live campaigns. The mentors don't let you stay stuck.",
  },
  {
    name: "Daniel Mwangi",
    role: "Product Manager · Nairobi, Kenya",
    quote:
      "The PM & BA programme is unlike anything I've seen. You're not just learning theory — you're solving real problems from week one. Worth every penny.",
  },
  {
    name: "Priya Nair",
    role: "Data Analyst · London, UK",
    quote:
      "I was working a 9-to-5 and studying on evenings. The cohort structure made it manageable. Got my certificate and a new role within two months of graduating.",
  },
];

export function Testimonials() {
  return (
    <section
      className="py-16 bg-mint-tint"
      aria-labelledby="testimonials-heading"
      data-testid="testimonials-section"
    >
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-secondary">
            Testimonials
          </span>
          <h2
            id="testimonials-heading"
            className="mt-4 font-display text-3xl sm:text-5xl font-extrabold text-forest leading-tight"
          >
            Student <span className="text-secondary">success stories</span>
          </h2>
        </div>

        <ul role="list" className="mt-10 grid gap-5 md:grid-cols-3 list-none p-0">
          {items.map((t) => (
            <li key={t.name} className="h-full">
              <figure className="h-full rounded-3xl bg-background p-6 border border-border shadow-soft flex flex-col">
                <Quote
                  className="h-5 w-5 text-mint mb-2"
                  strokeWidth={2.5}
                  fill="currentColor"
                  aria-hidden="true"
                  focusable="false"
                />
                <div className="flex gap-0.5 mb-3" role="img" aria-label="Rated 5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 text-star"
                      fill="currentColor"
                      aria-hidden="true"
                      focusable="false"
                    />
                  ))}
                </div>
                <blockquote className="mt-4 text-[13px] leading-[1.6] text-foreground/80 flex-1">
                  <p>"{t.quote}"</p>
                </blockquote>
                <figcaption className="mt-4 pt-3 border-t border-border">
                  <p className="font-display text-sm font-semibold text-forest">{t.name}</p>
                  <p className="text-xs text-foreground/60">{t.role}</p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
