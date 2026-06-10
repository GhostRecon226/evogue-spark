import { createFileRoute } from "@tanstack/react-router";
import { CourseDetailTemplate } from "@/components/courses/CourseDetailTemplate";
import img from "@/assets/courses/product-management.jpg";

export const Route = createFileRoute("/courses/product-management")({
  head: () => ({
    meta: [
      { title: "Product Management — Evogue Academy" },
      {
        name: "description",
        content:
          "Define strategy, own the roadmap and ship products users want. A 4-week live cohort programme.",
      },
      { property: "og:title", content: "Product Management — Evogue Academy" },
      {
        property: "og:description",
        content: "Learn to think like a PM, work cross-functionally and deliver with confidence.",
      },
      { property: "og:type", content: "article" },
      {
        property: "og:url",
        content: "https://evogue-spark.lovable.app/courses/product-management",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Product Management — Evogue Academy" },
      {
        name: "twitter:description",
        content: "Learn to think like a PM, work cross-functionally and deliver with confidence.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://evogue-spark.lovable.app/courses/product-management" },
    ],
  }),
  component: () => (
    <CourseDetailTemplate
      slug="product-management"
      title="Product Management"
      breadcrumb="Product Management"
      category="Management"
      description="Define strategy, own the roadmap and ship products that users actually want to use. This programme teaches you how to think like a PM, work cross-functionally and deliver with confidence."
      pills={{ weeks: "4 weeks", level: "Intermediate" }}
      imageGradient="linear-gradient(135deg, #0a1e3a, #1a4a8c, #0d2e5a)"
      imageSrc={img}
      outcomes={[
        "Define product vision, strategy and OKRs",
        "Build and prioritise product roadmaps",
        "Conduct user research and synthesise insights",
        "Write clear product requirements and user stories",
        "Work cross-functionally with design and engineering",
        "Measure product success with data and feedback loops",
      ]}
      capstone="Define, scope and present a product roadmap for a real-world problem, including user research findings, feature prioritisation rationale and a set of measurable success metrics."
      faqs={[
        {
          q: "Do I need prior experience?",
          a: "Some experience working in a team or business context helps, but no formal product management background is required. Curiosity and a user-first mindset matter more.",
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
          q: "Is there a payment plan?",
          a: "Yes. Reach out to us at hello@evogueacademy.com and we'll work something out based on your situation.",
        },
      ]}
    />
  ),
});
