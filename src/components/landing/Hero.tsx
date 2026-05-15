import { ArrowRight, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnrollButton } from "@/components/EnrollButton";
import heroImg from "@/assets/hero-designer.jpg";

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-mint-tint pt-28 sm:pt-32 pb-16 sm:pb-24"
    >
      {/* decorative blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-mint/30 blur-3xl"
      />

      {/* decorative dot clusters */}
      <svg
        aria-hidden
        className="pointer-events-none absolute top-24 right-6 sm:right-12 opacity-40"
        width="120"
        height="80"
        viewBox="0 0 120 80"
      >
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 7 }).map((_, col) => (
            <circle
              key={`tr-${row}-${col}`}
              cx={col * 16 + 6}
              cy={row * 16 + 6}
              r="2"
              fill="#00F5A0"
            />
          ))
        )}
      </svg>
      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-10 left-6 sm:left-12 opacity-40"
        width="120"
        height="80"
        viewBox="0 0 120 80"
      >
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 7 }).map((_, col) => (
            <circle
              key={`bl-${row}-${col}`}
              cx={col * 16 + 6}
              cy={row * 16 + 6}
              r="2"
              fill="#00F5A0"
            />
          ))
        )}
      </svg>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-12 lg:items-center relative">
        <div className="lg:col-span-7 text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-background/60 px-4 py-1.5 text-xs font-semibold tracking-wide text-secondary uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" />
            EXPLORE, LEARN, SUCCEED
          </span>

          <h1 className="mt-6 font-display font-extrabold leading-[1.05] tracking-tight text-forest text-[clamp(2.25rem,6vw,4.5rem)]">
            Master a <span className="text-secondary">Tech Skill.</span>
            <br />
            Launch Your{" "}
            <span className="relative inline-block text-secondary">
              Career.
              <svg
                aria-hidden
                className="absolute left-0 -bottom-3 w-full"
                viewBox="0 0 200 16"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M3 11 C 50 2, 120 2, 197 9"
                  stroke="#00F5A0"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-foreground/70">
            Real projects. Expert mentors. A community that pushes you further than you thought possible.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
            <EnrollButton
              size="lg"
              className="rounded-full bg-forest text-mint hover:bg-forest/90 px-7 h-12 text-base shadow-soft"
            >
              Enroll for the Next Cohort <ArrowRight className="ml-1 h-4 w-4" />
            </EnrollButton>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-2 border-forest text-forest hover:bg-forest hover:text-mint px-7 h-12 text-base"
            >
              <a href="#courses">View Courses</a>
            </Button>
          </div>

          <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-foreground/60">
            <div>
              <p className="font-display text-2xl font-bold text-forest">1.2k+</p>
              <p>Students trained</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="font-display text-2xl font-bold text-forest">87%</p>
              <p>Job outcome</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="absolute -inset-4 rounded-[2rem] bg-mint/40 blur-2xl" aria-hidden />
            <img
              src={heroImg}
              alt="Product designer sketching wireframes on a tablet at Evogue Academy"
              width={1280}
              height={960}
              className="relative rounded-[2rem] shadow-[var(--shadow-soft)] object-cover w-full aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]"
            />

            {/* Bottom-left: rating card */}
            <div className="absolute -bottom-6 -left-4 sm:-left-8 rounded-2xl bg-background p-4 shadow-soft border border-border max-w-[15rem]">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-mint text-forest shadow-sm">
                  <Star className="h-6 w-6 fill-forest" />
                </span>
                <div>
                  <p className="font-display text-2xl font-bold text-forest leading-none">4.9</p>
                  <p className="text-xs text-foreground/60 mt-1">Avg. student rating</p>
                </div>
              </div>
            </div>

            {/* Top-right: graduates badge */}
            <div className="absolute -top-4 -right-3 sm:-right-6 rounded-2xl bg-background p-3 shadow-soft border border-border">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-mint text-forest">
                  <Users className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-display text-base font-bold text-forest leading-none">1.2k+</p>
                  <p className="text-[10px] text-foreground/60 mt-0.5 uppercase tracking-wide">Graduates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
