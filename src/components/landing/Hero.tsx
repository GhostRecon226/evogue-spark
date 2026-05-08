import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7 text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-background/60 px-4 py-1.5 text-xs font-semibold tracking-wide text-secondary uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" />
            Africa's Design & Tech Academy
          </span>

          <h1 className="mt-6 font-display font-extrabold leading-[1.05] tracking-tight text-forest text-[clamp(2.25rem,6vw,4.5rem)]">
            Master a <span className="text-secondary">Tech Skill.</span>
            <br />
            Launch Your <span className="text-secondary">Career.</span>
          </h1>

          <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-foreground/70">
            Join Africa's most visionary design and tech learning platform.
            Hands-on cohorts, world-class mentors, real career outcomes.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-forest text-mint hover:bg-forest/90 px-7 h-12 text-base shadow-soft"
            >
              <a href="#enroll">
                Enroll for the Next Cohort <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
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
              <p className="font-display text-2xl font-bold text-forest">9+</p>
              <p>Tech tracks</p>
            </div>
            <div className="h-8 w-px bg-border" />
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
            <div className="absolute -bottom-6 -left-4 sm:-left-8 rounded-2xl bg-background p-4 shadow-soft border border-border max-w-[14rem]">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-mint/30 text-secondary font-bold">
                  ★
                </span>
                <div>
                  <p className="text-xs text-foreground/60">Avg. rating</p>
                  <p className="font-display font-bold text-forest">4.9 / 5.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
