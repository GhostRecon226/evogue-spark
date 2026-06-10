import { createFileRoute } from "@tanstack/react-router";
import { CourseDetailTemplate } from "@/components/courses/CourseDetailTemplate";
import img from "@/assets/courses/cybersecurity.jpg";

export const Route = createFileRoute("/courses/cybersecurity")({
  head: () => ({
    meta: [
      { title: "Cybersecurity — Evogue Academy" },
      {
        name: "description",
        content: "Defend systems, audit networks and respond to real threats. Join the waitlist.",
      },
      { property: "og:title", content: "Cybersecurity — Evogue Academy" },
      {
        property: "og:description",
        content: "A 4-week live cohort that builds modern cybersecurity skills. Coming soon.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://evogue-spark.lovable.app/courses/cybersecurity" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Cybersecurity — Evogue Academy" },
      {
        name: "twitter:description",
        content: "A 4-week live cohort that builds modern cybersecurity skills. Coming soon.",
      },
    ],
    links: [{ rel: "canonical", href: "https://evogue-spark.lovable.app/courses/cybersecurity" }],
  }),
  component: () => (
    <CourseDetailTemplate
      slug="cybersecurity"
      title="Cybersecurity"
      breadcrumb="Cybersecurity"
      category="Security"
      description="Defend systems, audit networks and respond to real threats like a trained security professional. This programme builds the technical and strategic skills behind modern cybersecurity practice."
      pills={{ weeks: "4 weeks", level: "Intermediate" }}
      imageGradient="linear-gradient(135deg, #2a0a0a, #5a1a1a, #3a0d0d)"
      imageSrc={img}
      mode="waitlist"
      outcomes={[
        "Understand common attack vectors and threat models",
        "Conduct basic network and system security audits",
        "Implement security controls and access management",
        "Respond to and document security incidents",
        "Understand compliance frameworks including ISO 27001 and GDPR",
        "Build a cybersecurity portfolio with real-world projects",
      ]}
      capstone="Conduct a security audit of a simulated environment, identify vulnerabilities, document your findings and propose a detailed remediation plan with prioritised recommendations."
      faqs={[
        {
          q: "Do I need prior experience?",
          a: "Some comfort with technology helps but no formal security background is needed. We'll build the foundation in the first week.",
        },
        {
          q: "How are classes delivered?",
          a: "All classes are live online via Zoom. Sessions are recorded and shared with enrolled students so you never miss anything.",
        },
        {
          q: "What do I need to enrol?",
          a: "A reliable laptop, a stable internet connection and the commitment to show up every week. That's it.",
        },
        {
          q: "How does the certificate work?",
          a: "Your certificate is issued after your capstone project is reviewed and approved by the Evogue Academy team. Every graduate receives the same certificate regardless of scholarship status.",
        },
        {
          q: "When does this course open?",
          a: "We're putting the finishing touches on this programme. Join the waitlist and you'll be the first to know when enrolment opens.",
        },
      ]}
    />
  ),
});
