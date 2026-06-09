import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { Values } from "@/components/landing/Values";
import { Courses } from "@/components/landing/Courses";
import { Testimonials } from "@/components/landing/Testimonials";
import { EnrollCta } from "@/components/landing/EnrollCta";

import { PublicShell } from "@/components/PublicShell";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Evogue Academy — Master a Tech Skill. Launch Your Career." },
      { name: "description", content: "Built in Africa, open to the world. Hands-on cohorts in Product Design, Frontend, Backend, Data, Cyber Security and more." },
      { property: "og:title", content: "Evogue Academy" },
      { property: "og:description", content: "Train with world-class mentors. Build a portfolio. Launch your tech career." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  return (
    <PublicShell className="pt-0">
      <Hero />
      <About />
      <Values />
      <Courses />
      <Testimonials />
      <EnrollCta />
    </PublicShell>
  );
}
