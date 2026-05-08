import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { Values } from "@/components/landing/Values";
import { Courses } from "@/components/landing/Courses";
import { Testimonials } from "@/components/landing/Testimonials";
import { EnrollCta } from "@/components/landing/EnrollCta";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Evogue Academy — Master a Tech Skill. Launch Your Career." },
      {
        name: "description",
        content:
          "Africa's most visionary product design and tech academy. Hands-on cohorts in Product Design, Frontend, Backend, Data, Cyber Security and more.",
      },
      { property: "og:title", content: "Evogue Academy — Africa's Design & Tech Academy" },
      {
        property: "og:description",
        content: "Train with world-class mentors. Build a portfolio. Launch your tech career.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  return (
    <main className="bg-background text-foreground">
      <Navbar />
      <Hero />
      <About />
      <Values />
      <Courses />
      <Testimonials />
      <EnrollCta />
      <Contact />
      <Footer />
      <Toaster richColors position="top-center" />
    </main>
  );
}
