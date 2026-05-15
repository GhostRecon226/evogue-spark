import { createFileRoute } from "@tanstack/react-router";
import { Hammer, Globe2, TrendingUp } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Evogue Academy" },
      { name: "description", content: "Our founder story, mission and team behind Evogue Academy." },
      { property: "og:title", content: "About — Evogue Academy" },
      { property: "og:description", content: "Building Africa's next generation of tech leaders." },
    ],
  }),
  component: AboutPage,
});

const features = [
  { icon: Hammer, title: "Practical Learning", text: "Build real products from week one — no passive lectures." },
  { icon: Globe2, title: "Global Standards", text: "Curriculum benchmarked against the world's best companies." },
  { icon: TrendingUp, title: "Career Growth", text: "Portfolio reviews, interview prep, and a global hiring network." },
];

const team = [
  { name: "Adaeze Okonkwo", role: "Head of Design", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80" },
  { name: "Tunde Bakare", role: "Head of Product", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80" },
  { name: "Funmi Adesanya", role: "Head of Engineering", avatar: "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=400&q=80" },
  { name: "Kemi Lawal", role: "Head of Data", avatar: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&q=80" },
];

function AboutPage() {
  return (
    <PublicShell>
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-secondary">Our Story</span>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl font-extrabold text-forest leading-tight">
              Built by Africans, for <span className="text-secondary">global ambition</span>
            </h1>
            <p className="mt-5 text-foreground/75 text-base sm:text-lg">
              Evogue Academy started with a simple question: why can't African talent
              learn the exact same skills, from the same caliber of mentors, as graduates
              from the world's best schools? We built the academy to answer that — pairing
              ambitious learners with world-class practitioners who've shipped real products.
            </p>
            <p className="mt-4 text-foreground/75 text-base sm:text-lg">
              Today, our graduates are designing, engineering and shipping at top global
              companies. We're just getting started.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-soft">
            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80"
              alt="Evogue Academy founder"
              className="w-full aspect-[4/3] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-mint-tint py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-forest">Our Mission</h2>
          <p className="mt-5 text-foreground/75 text-base sm:text-lg leading-relaxed">
            To equip Africa's brightest minds with the skills, mentorship and
            confidence to compete and win on the global tech stage.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl sm:text-4xl font-extrabold text-forest">Our Values</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl bg-background p-7 border border-border shadow-soft">
                <span className="inline-grid h-12 w-12 place-items-center rounded-xl bg-mint/30 text-secondary">
                  <f.icon className="h-6 w-6" strokeWidth={2.25} />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold text-forest">{f.title}</h3>
                <p className="mt-2 text-foreground/70 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mint-tint py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl sm:text-4xl font-extrabold text-forest">Meet the team</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <div key={m.name} className="rounded-2xl bg-background p-6 border border-border text-center">
                <Avatar className="h-20 w-20 mx-auto">
                  <AvatarImage src={m.avatar} />
                  <AvatarFallback>{m.name[0]}</AvatarFallback>
                </Avatar>
                <p className="mt-4 font-display font-bold text-forest">{m.name}</p>
                <p className="text-sm text-secondary">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
