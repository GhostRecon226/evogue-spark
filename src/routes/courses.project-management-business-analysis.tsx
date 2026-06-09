import { createFileRoute } from "@tanstack/react-router";
import { CourseDetailTemplate } from "@/components/courses/CourseDetailTemplate";

export const Route = createFileRoute("/courses/project-management-business-analysis")({
  head: () => ({
    meta: [
      { title: "Project Management & Business Analysis — Evogue Academy" },
      { name: "description", content: "Our flagship 6-week elite programme covering both disciplines in depth, with a dual certificate." },
      { property: "og:title", content: "Project Management & Business Analysis — Evogue Academy" },
      { property: "og:description", content: "Study PM and BA in depth, then choose the path that fits you best." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://evogue-spark.lovable.app/courses/project-management-business-analysis" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Project Management & Business Analysis — Evogue Academy" },
      { name: "twitter:description", content: "Study PM and BA in depth, then choose the path that fits you best." },
    ],
    links: [{ rel: "canonical", href: "https://evogue-spark.lovable.app/courses/project-management-business-analysis" }],
  }),
  component: () => (
    <CourseDetailTemplate
      slug="project-management-business-analysis"
      title="Project Management & Business Analysis"
      breadcrumb="Project Management & Business Analysis"
      category="Elite Programme"
      description="Our most comprehensive programme. Study both disciplines in depth over 10 weeks, then choose the career path that fits you best. Built for people who want to lead, not just participate."
      pills={{ weeks: "10 weeks", level: "Beginner – Intermediate" }}
      certificateLabel="Dual certificate"
      imageGradient="linear-gradient(135deg, #0a2e1a, #1a6b3a, #0d3a20)"
      mode="elite"
      priceBannerText="Our flagship programme. Covers two full disciplines."
      outcomes={[
        "Plan, execute and close projects using Agile and Waterfall",
        "Manage budgets, timelines, risks and stakeholders",
        "Elicit, document and validate business requirements",
        "Model processes using BPMN and use case diagrams",
        "Build financial models and business cases",
        "Choose your specialist path — PM or BA — after graduation",
      ]}
      capstone="Complete a full project lifecycle including requirements gathering, stakeholder management, project planning and a final business case presentation that demonstrates mastery of both disciplines."
      capstoneExtraNote="Graduates of this programme receive a single Evogue Academy certificate recognising both Project Management and Business Analysis. You then choose which discipline to pursue in your career."
      faqs={[
        { q: "Do I need prior experience?", a: "No prior experience in project management or business analysis is required. We start from first principles and build up. A basic comfort with professional workplace environments is all you need." },
        { q: "How are classes delivered?", a: "All classes are live online via Zoom. Sessions are recorded and shared with enrolled students so you never miss anything." },
        { q: "What do I need to enrol?", a: "A reliable laptop, a stable internet connection and the commitment to show up every week. That's it." },
        { q: "How does the certificate work?", a: "Your certificate is issued after your capstone project is reviewed and approved by the Evogue Academy team. Every graduate receives the same certificate regardless of scholarship status." },
        { q: "Is there a payment plan?", a: "Yes. Reach out to us at hello@evogueacademy.com and we'll work something out based on your situation." },
      ]}
      bottomHeadline="Ready to become our most qualified graduate?"
      bottomSubtext="The PM & BA programme is our most comprehensive offering. Limited cohort spots available."
    />
  ),
});
