const aboutImg =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80";

export function About() {
  return (
    <section id="about" className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-secondary">
            About Us
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-extrabold leading-tight text-forest">
            Building Africa's next generation of{" "}
            <span className="text-secondary">tech leaders</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-foreground/70">
            Evogue Academy equips ambitious Africans with the design, engineering and product skills they need to compete on the global stage. Taught by practitioners who have shipped at the world's best companies. Every cohort is intentionally small so students get direct feedback, dedicated mentors, and a curriculum built around real industry briefs. Our mission is simple: produce graduates who are job-ready, confident, and globally competitive from day one.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl shadow-[var(--shadow-soft)]">
          <img
            src={aboutImg}
            alt="Diverse team of professionals collaborating in a modern workspace"
            width={1600}
            height={900}
            loading="lazy"
            className="w-full object-cover aspect-[16/9]"
          />
        </div>
      </div>
    </section>
  );
}
