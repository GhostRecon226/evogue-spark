import { ArrowRight, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnrollButton } from "@/components/EnrollButton";
import heroImg from "@/assets/hero-designer.jpg";

function DotCluster({ className }: { className?: string }) {
  const dots = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      dots.push(<circle key={`${r}-${c}`} cx={c * 12 + 2} cy={r * 12 + 2} r="2" fill="#00F5A0" />);
    }
  }
  return (
    <svg
      aria-hidden
      className={className}
      width="52"
      height="52"
      viewBox="0 0 52 52"
      style={{ opacity: 0.2 }}
    >
      {dots}
    </svg>
  );
}

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

      {/* soft radial glow behind hero image (top-right) */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 h-[60%] w-[55%]"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(0,245,160,0.08) 0%, rgba(0,245,160,0) 70%)",
        }}
      />

      {/* dot clusters */}
      <DotCluster className="pointer-events-none absolute top-24 right-8 sm:right-16" />
      <DotCluster className="pointer-events-none absolute bottom-8 left-6 sm:left-16" />

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
                className="absolute -left-2 -right-2 -bottom-3 w-[calc(100%+1rem)]"
                viewBox="0 0 220 16"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M3 11 C 55 2, 150 2, 217 9"
                  stroke="#00F5A0"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-foreground/70">
            Real projects. Expert mentors. A community of builders from Lagos to London, Nairobi to
            New York.
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
              <p className="font-display text-2xl font-bold text-forest">500+</p>
              <p>Students trained</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="font-display text-2xl font-bold text-forest">94%</p>
              <p>Completion rate</p>
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

            {/* Top-left: Graduates badge (smaller) */}
            <div
              className="absolute -top-4 -left-4 sm:-left-6 rounded-[12px] bg-white p-3"
              style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="grid h-9 w-9 place-items-center rounded-full text-white"
                  style={{ backgroundColor: "#0A2E1A" }}
                >
                  <Users className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-display text-base font-bold text-forest leading-none">500+</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Students</p>
                </div>
              </div>
            </div>

            {/* Bottom-right: Rating badge (inside image bounds) */}
            <div
              className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-[12px] bg-white p-4"
              style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid h-11 w-11 place-items-center rounded-full"
                  style={{ backgroundColor: "#00F5A0" }}
                >
                  <Star className="h-5 w-5" fill="#F5A524" stroke="#F5A524" />
                </span>
                <div>
                  <p className="font-display text-lg font-bold text-forest leading-none">4.9/5.0</p>
                  <p className="text-xs text-muted-foreground mt-1">Average rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
