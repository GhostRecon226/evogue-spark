import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe2, TrendingUp, Wrench } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Evogue Academy" },
      {
        name: "description",
        content: "Our founder story, mission and team behind Evogue Academy.",
      },
      { property: "og:title", content: "About — Evogue Academy" },
      {
        property: "og:description",
        content: "Building the next generation of global tech leaders.",
      },
    ],
  }),
  component: AboutPage,
});

const stats = [
  { value: "500+", label: "Students trained" },
  { value: "94%", label: "Completion rate" },
  { value: "4", label: "Continents represented" },
  { value: "8", label: "Professional tracks" },
];

const steps = [
  {
    title: "Apply",
    desc: "Fill out a short application. Tell us your goals and which track interests you.",
  },
  {
    title: "Join a Cohort",
    desc: "Get enrolled in a live cohort with peers from around the world. Pay once. No hidden fees.",
  },
  {
    title: "Learn & Build",
    desc: "Attend live sessions with practitioners. Work on real projects from week one.",
  },
  {
    title: "Get Certified",
    desc: "Submit your capstone project. Receive your certificate and join our global hiring network.",
  },
];

const values = [
  {
    icon: Wrench,
    title: "Practical Learning",
    desc: "Build real products from week one. No passive lectures, no shallow theory.",
  },
  {
    icon: Globe2,
    title: "Global Standards",
    desc: "Curriculum benchmarked against the world's best tech companies, not just local markets.",
  },
  {
    icon: TrendingUp,
    title: "Career Growth",
    desc: "Portfolio reviews, interview prep, and access to a global hiring network after you graduate.",
  },
];

const eyebrowStyle: React.CSSProperties = {
  color: "#1A8C4E",
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  fontWeight: 500,
};

function AboutPage() {
  return (
    <PublicShell>
      {/* Our Story */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <span className="inline-block" style={eyebrowStyle}>
              OUR STORY
            </span>
            <h1
              className="mt-3 leading-tight"
              style={{
                fontFamily: '"Fraunces", serif',
                fontSize: 38,
                fontWeight: 700,
              }}
            >
              <span style={{ color: "#0A2E1A" }}>Built in Africa.</span>{" "}
              <span style={{ color: "#1A8C4E" }}>Open to the World.</span>
            </h1>
            <p
              className="mt-5"
              style={{ color: "#3a5a47", fontSize: 15, lineHeight: 1.75 }}
            >
              Evogue Academy started with a simple question: why should where
              you grow up determine the quality of your education? We built the
              academy to close that gap. Pairing ambitious learners from
              everywhere with world-class practitioners who have shipped real
              products at top global companies.
            </p>
            <p
              className="mt-4"
              style={{ color: "#3a5a47", fontSize: 15, lineHeight: 1.75 }}
            >
              Today our graduates are designing, engineering and shipping across
              four continents. We are just getting started.
            </p>
          </div>
          <div
            className="overflow-hidden shadow-soft"
            style={{ borderRadius: 12 }}
          >
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80"
              alt="Diverse professionals learning tech together"
              className="w-full aspect-[4/3] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section
        className="w-full"
        style={{ backgroundColor: "#0A2E1A", padding: "48px 0" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div
                  style={{
                    fontFamily: '"Fraunces", serif',
                    fontSize: 42,
                    fontWeight: 700,
                    color: "#00F5A0",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  className="mt-2"
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: 13,
                    color: "#9ecfb0",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section style={{ backgroundColor: "#f4faf7", padding: "72px 48px" }}>
        <div className="mx-auto max-w-4xl text-center">
          <span
            className="inline-block"
            style={{ ...eyebrowStyle, marginBottom: 24 }}
          >
            OUR MISSION
          </span>
          <blockquote
            style={{
              fontFamily: '"Fraunces", serif',
              fontSize: 32,
              fontWeight: 400,
              fontStyle: "italic",
              color: "#0A2E1A",
              lineHeight: 1.3,
              maxWidth: 680,
              margin: "0 auto",
            }}
          >
            "To equip ambitious minds everywhere with the skills, mentorship and
            confidence to compete and win on the global tech stage."
          </blockquote>
        </div>
      </section>

      {/* The Evogue Experience */}
      <section style={{ backgroundColor: "#ffffff", padding: "64px 48px" }}>
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="inline-block" style={eyebrowStyle}>
              THE EVOGUE EXPERIENCE
            </span>
            <h2
              className="mt-4"
              style={{
                fontFamily: '"Fraunces", serif',
                fontSize: 30,
                fontWeight: 400,
                color: "#0A2E1A",
              }}
            >
              Your journey, from zero to hired.
            </h2>
          </div>

          <div className="relative mt-12">
            {/* Connector line — visible on lg only */}
            <div
              className="hidden lg:block absolute h-px bg-[#1A8C4E]"
              style={{
                top: 28,
                left: "12.5%",
                right: "12.5%",
              }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, i) => {
                const isLast = i === steps.length - 1;
                return (
                  <div
                    key={step.title}
                    className="flex flex-col items-center text-center"
                  >
                    <div
                      className="relative flex items-center justify-center shrink-0"
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        backgroundColor: isLast ? "#1A8C4E" : "#0A2E1A",
                        color: isLast ? "#ffffff" : "#00F5A0",
                        fontFamily: '"Fraunces", serif',
                        fontSize: 22,
                        fontWeight: 700,
                        zIndex: 1,
                      }}
                    >
                      {i + 1}
                    </div>
                    <h4
                      className="mt-5"
                      style={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#0A2E1A",
                      }}
                    >
                      {step.title}
                    </h4>
                    <p
                      className="mt-2"
                      style={{
                        fontSize: 13,
                        color: "#5a8070",
                        lineHeight: 1.6,
                        maxWidth: 240,
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section
        style={{
          backgroundColor: "#ffffff",
          padding: "64px 48px",
          borderTop: "0.5px solid #e0ede6",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <span className="inline-block" style={eyebrowStyle}>
            OUR VALUES
          </span>
          <h2
            className="mt-4 mb-10"
            style={{
              fontFamily: '"Fraunces", serif',
              fontSize: 30,
              fontWeight: 400,
              color: "#0A2E1A",
            }}
          >
            What we stand for.
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                style={{
                  border: "0.5px solid #c8e3d4",
                  borderRadius: 12,
                  padding: 28,
                  backgroundColor: "#ffffff",
                }}
              >
                <div
                  className="inline-flex items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#e8f5ee",
                    borderRadius: 8,
                  }}
                >
                  <v.icon
                    size={20}
                    strokeWidth={2}
                    style={{ color: "#1A8C4E" }}
                  />
                </div>
                <h3
                  className="mt-4"
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 600,
                    fontSize: 15,
                    color: "#0A2E1A",
                  }}
                >
                  {v.title}
                </h3>
                <p
                  className="mt-2"
                  style={{
                    fontSize: 13,
                    color: "#5a8070",
                    lineHeight: 1.65,
                  }}
                >
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
