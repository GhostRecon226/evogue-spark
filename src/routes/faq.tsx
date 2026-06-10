import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/PublicShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Evogue Academy" },
      {
        name: "description",
        content: "Answers about Evogue Academy courses, scholarships, cohorts, and admissions.",
      },
      { property: "og:title", content: "FAQ — Evogue Academy" },
      {
        property: "og:description",
        content:
          "Common questions about courses, scholarships, cohorts, and admissions at Evogue Academy.",
      },
    ],
  }),
  component: FaqPage,
});

const sections: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Courses",
    items: [
      {
        q: "What courses does Evogue Academy offer?",
        a: "We run cohort-based programs in product design, frontend development, backend development, data analytics, product management, and more. Each course is hands-on and built around real projects, not just theory. Visit the Courses page for the full lineup.",
      },
      {
        q: "How long does each course take?",
        a: "Most cohorts run for 12 to 16 weeks of structured live classes, mentor sessions, and project work, followed by a capstone project. Exact length depends on the track.",
      },
      {
        q: "Are classes live or self-paced?",
        a: "Classes are live and cohort-based, with recorded sessions you can revisit anytime. You'll also get weekly mentor calls, peer reviews, and dedicated office hours.",
      },
      {
        q: "Do I get a certificate?",
        a: "Yes. Once you complete coursework and pass the capstone review, you receive a verifiable Evogue Academy certificate with a unique Student ID.",
      },
    ],
  },
  {
    title: "Scholarships",
    items: [
      {
        q: "Do you offer scholarships?",
        a: "Yes. We offer partial and full scholarships every cohort to high-potential applicants who can't cover tuition in full. Decisions are based on motivation, background, and a short task.",
      },
      {
        q: "How do I apply for a scholarship?",
        a: "Submit the scholarship application on our Scholarship page. You'll fill in basic details, share why you want in, and complete a short skills task. Shortlisted applicants get a call.",
      },
      {
        q: "When are scholarship decisions announced?",
        a: "Scholarship outcomes are announced 2 to 3 weeks before each cohort starts. Successful applicants receive an offer email with next steps and an enrollment deadline.",
      },
    ],
  },
  {
    title: "Cohorts",
    items: [
      {
        q: "How often do new cohorts start?",
        a: "We run new cohorts roughly every quarter. Exact dates are listed on each course page, and the closest one is highlighted in the Enroll section on the homepage.",
      },
      {
        q: "How many students are in each cohort?",
        a: "Cohorts are intentionally small, typically 25 to 40 students per track, so mentors can give real, personal feedback.",
      },
      {
        q: "What if I miss a live class?",
        a: "Every live class is recorded and uploaded to your dashboard within 24 hours. You can also bring questions to the next mentor session or office hours.",
      },
      {
        q: "Can I switch cohorts if life happens?",
        a: "Yes. If you can't continue mid-cohort, reach out to the team and we'll move you into the next available cohort at no extra cost, subject to availability.",
      },
    ],
  },
  {
    title: "Admissions",
    items: [
      {
        q: "How do I apply?",
        a: "Pick a course on the Courses page and submit the enrollment form. Our admissions team will reach out within 24 hours to walk you through the process, payment options, and scholarships.",
      },
      {
        q: "Do I need prior experience?",
        a: "No prior tech experience is required for our beginner tracks. Intermediate and advanced tracks have prerequisites listed on each course page.",
      },
      {
        q: "What are the payment options?",
        a: "You can pay tuition in full, split it across installments, or apply for a scholarship. The admissions team will help you pick the option that works best for you.",
      },
      {
        q: "Is there a refund policy?",
        a: "Yes. If you withdraw within the first week of your cohort, you're eligible for a full refund minus processing fees. Details are shared in your enrollment agreement.",
      },
    ],
  },
];

function FaqPage() {
  return (
    <PublicShell>
      <section className="pt-16 sm:pt-24 pb-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Frequently Asked Questions
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold text-foreground">
            Everything you wanted to know.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            Answers to the questions we hear most about courses, scholarships, cohorts, and
            admissions. Still stuck?{" "}
            <Link to="/contact" className="text-primary underline underline-offset-4">
              Talk to our team
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-12">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                {section.title}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {section.items.map((item, i) => (
                  <AccordionItem key={i} value={`${section.title}-${i}`}>
                    <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
