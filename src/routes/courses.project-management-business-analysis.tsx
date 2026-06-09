import { createFileRoute } from "@tanstack/react-router";
import { CourseDetailTemplate } from "@/components/courses/CourseDetailTemplate";

const CURRICULUM_MODULES = [
  "Foundations of Project Management",
  "Project Planning & Scheduling",
  "Project Execution & Control",
  "Introduction to Business Analysis",
  "Requirements Elicitation & Collaboration",
  "Agile PM & Business Analysis",
];

const COURSE_URL = "https://evogue-spark.lovable.app/courses/project-management-business-analysis";
const COURSE_TITLE = "Project Management & Business Analysis Course (10 Weeks) — Evogue Academy";
const COURSE_DESC = "10-week live cohort covering 6 modules: PM foundations, planning & scheduling, execution & control, business analysis, requirements elicitation, and agile PM & BA. Dual certificate.";

export const Route = createFileRoute("/courses/project-management-business-analysis")({
  head: () => ({
    meta: [
      { title: COURSE_TITLE },
      { name: "description", content: COURSE_DESC },
      { property: "og:title", content: COURSE_TITLE },
      { property: "og:description", content: COURSE_DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: COURSE_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: COURSE_TITLE },
      { name: "twitter:description", content: COURSE_DESC },
    ],
    links: [{ rel: "canonical", href: COURSE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          name: "Project Management & Business Analysis",
          description: COURSE_DESC,
          url: COURSE_URL,
          provider: {
            "@type": "Organization",
            name: "Evogue Academy",
            sameAs: "https://evogue-spark.lovable.app",
          },
          educationalCredentialAwarded: "Dual certificate in Project Management and Business Analysis",
          timeRequired: "P10W",
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "Online",
            courseWorkload: "P10W",
          },
          syllabusSections: CURRICULUM_MODULES.map((title, i) => ({
            "@type": "Syllabus",
            name: `Module ${i + 1}: ${title}`,
          })),
        }),
      },
    ],
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
      curriculum={{
        eyebrow: "COURSE CURRICULUM",
        headline: "What the programme covers",
        subtext: "Six structured modules designed around what employers actually need. Every session is practical, every concept is applied.",
        modules: [
          {
            title: "Module 1: Foundations of Project Management",
            bullets: [
              "Introduction to project management, lifecycles and methodologies",
              "Project initiation and defining scope",
              "Stakeholder identification and analysis",
            ],
          },
          {
            title: "Module 2: Project Planning & Scheduling",
            bullets: [
              "Work breakdown structures (WBS)",
              "Activity planning, sequencing and resource allocation",
              "Budgeting and cost management",
            ],
          },
          {
            title: "Module 3: Project Execution & Control",
            bullets: [
              "Team leadership and communication",
              "Quality management",
              "Monitoring progress and performance reporting",
              "Risk management and mitigation",
            ],
          },
          {
            title: "Module 4: Introduction to Business Analysis",
            bullets: [
              "Core concepts and the BA role",
              "Business analysis planning and monitoring",
              "Understanding business problems and opportunities",
            ],
          },
          {
            title: "Module 5: Requirements Elicitation & Collaboration",
            bullets: [
              "Techniques for gathering requirements (interviews, workshops, surveys)",
              "Documenting and confirming requirements",
              "Stakeholder management in BA",
              "Modelling techniques (process, data, use cases)",
            ],
          },
          {
            title: "Module 6: Agile PM & Business Analysis",
            bullets: [
              "Integrating BA in agile environments",
              "User stories and backlog management",
              "Tools and techniques for PM & BA (Jira, Trello, MS Project)",
              "Applying your skills to a real-world capstone project",
            ],
          },
        ],
      }}
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
