import { Hammer, Globe2, TrendingUp } from "lucide-react";
import collab from "@/assets/card-collaborative.jpg";
import handson from "@/assets/card-handson.jpg";
import mentor from "@/assets/card-mentorship.jpg";

const features = [
  {
    icon: Hammer,
    title: "Practical Learning",
    text: "Build real products from week one — no passive lectures, just shipping.",
    iconBg: "bg-mint/30 text-secondary",
  },
  {
    icon: Globe2,
    title: "Global Standards",
    text: "Curriculum benchmarked against the best companies and design schools worldwide.",
    iconBg: "bg-secondary/15 text-secondary",
  },
  {
    icon: TrendingUp,
    title: "Career Growth",
    text: "Portfolio reviews, interview prep, and intros to a global hiring network.",
    iconBg: "bg-forest text-mint",
  },
];

const imageCards = [
  { img: collab, label: "Collaborative Learning" },
  { img: handson, label: "Hands-on Projects" },
  { img: mentor, label: "Industry Mentorship" },
];

export function Values() {
  return (
    <section className="py-20 sm:py-28 bg-mint-tint">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3 max-w-5xl mx-auto text-center lg:text-left">
          <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
            We believe Africa's brightest minds deserve world-class training.
            Evogue exists to close the gap between raw talent and global opportunity.
          </p>
          <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
            Every cohort is intentionally small — students get one-on-one feedback,
            dedicated mentors, and a curriculum designed around real industry briefs.
          </p>
          <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
            Our mission: produce graduates who are <span className="font-semibold text-secondary">job-ready,
            confident, and globally competitive</span> from day one.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-background p-7 border border-border shadow-soft hover:-translate-y-1 transition-transform"
            >
              <span className={`inline-grid h-12 w-12 place-items-center rounded-xl ${f.iconBg}`}>
                <f.icon className="h-6 w-6" strokeWidth={2.25} />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-forest">{f.title}</h3>
              <p className="mt-2 text-foreground/70 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {imageCards.map((c) => (
            <div key={c.label} className="group relative overflow-hidden rounded-2xl shadow-soft">
              <img
                src={c.img}
                alt={c.label}
                width={800}
                height={600}
                loading="lazy"
                className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="inline-block rounded-full bg-mint px-4 py-1.5 text-sm font-semibold text-forest">
                  {c.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
