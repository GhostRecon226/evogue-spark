import { createFileRoute } from "@tanstack/react-router";
import { CourseDetailTemplate } from "@/components/courses/CourseDetailTemplate";
import img from "@/assets/courses/ai-for-professionals.jpg";

export const Route = createFileRoute("/courses/ai-for-professionals")({
  head: () => ({
    meta: [
      { title: "AI for Professionals — Evogue Academy" },
      { name: "description", content: "Use AI tools to work smarter and automate repetitive tasks. No coding required." },
      { property: "og:title", content: "AI for Professionals — Evogue Academy" },
      { property: "og:description", content: "Practical, non-technical AI skills you can apply from week one." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://evogue-spark.lovable.app/courses/ai-for-professionals" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AI for Professionals — Evogue Academy" },
      { name: "twitter:description", content: "Practical, non-technical AI skills you can apply from week one." },
    ],
    links: [{ rel: "canonical", href: "https://evogue-spark.lovable.app/courses/ai-for-professionals" }],
  }),
  component: () => (
    <CourseDetailTemplate
      slug="ai-for-professionals"
      title="AI for Professionals"
      breadcrumb="AI for Professionals"
      category="Technology"
      description="Use AI tools to work smarter, automate repetitive tasks and stay ahead in your industry. No coding required. Just practical skills you can apply from week one."
      pills={{ weeks: "3 weeks", level: "Beginner" }}
      imageGradient="linear-gradient(135deg, #1a0a3a, #5a1a8c, #2a0d5a)"
      imageSrc={img}
      outcomes={[
        "Use ChatGPT, Claude and Gemini effectively at work",
        "Build AI-powered workflows to automate repetitive tasks",
        "Write prompts that get consistent, high-quality outputs",
        "Apply AI to content creation, research and analysis",
        "Evaluate AI tools for your specific industry",
        "Understand AI risks, ethics and limitations",
      ]}
      capstone="Build an AI-powered workflow that solves a real problem in your industry. Document the process, the tools used and the measurable impact, then present your solution to the cohort."
      faqs={[
        { q: "Do I need to know how to code?", a: "Not at all. This programme is built specifically for non-technical professionals. If you can use a smartphone, you can do this course." },
        { q: "How are classes delivered?", a: "All classes are live online via Zoom. Sessions are recorded and shared with enrolled students so you never miss anything." },
        { q: "What do I need to enrol?", a: "A reliable laptop, a stable internet connection and the commitment to show up every week. That's it." },
        { q: "How does the certificate work?", a: "Your certificate is issued after your capstone project is reviewed and approved by the Evogue Academy team. Every graduate receives the same certificate regardless of scholarship status." },
        { q: "Is there a payment plan?", a: "Yes. Reach out to us at hello@evogueacademy.com and we'll work something out based on your situation." },
      ]}
    />
  ),
});
