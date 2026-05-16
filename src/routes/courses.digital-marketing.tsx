import { createFileRoute } from "@tanstack/react-router";
import { CourseDetailTemplate } from "@/components/courses/CourseDetailTemplate";
import img from "@/assets/courses/digital-marketing.jpg";

export const Route = createFileRoute("/courses/digital-marketing")({
  head: () => ({
    meta: [
      { title: "Digital Marketing — Evogue Academy" },
      { name: "description", content: "Run campaigns that convert. Paid ads, organic content, copywriting and analytics across every channel." },
      { property: "og:title", content: "Digital Marketing — Evogue Academy" },
      { property: "og:description", content: "A 3-week live cohort that teaches modern digital marketing end-to-end." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://evogue-spark.lovable.app/courses/digital-marketing" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Digital Marketing — Evogue Academy" },
      { name: "twitter:description", content: "A 3-week live cohort that teaches modern digital marketing end-to-end." },
    ],
    links: [{ rel: "canonical", href: "https://evogue-spark.lovable.app/courses/digital-marketing" }],
  }),
  component: () => (
    <CourseDetailTemplate
      slug="digital-marketing"
      title="Digital Marketing"
      breadcrumb="Digital Marketing"
      category="Marketing"
      description="Learn to run campaigns that actually convert. From paid ads to organic content, this programme gives you the full picture of modern digital marketing and the skills to execute it across every channel."
      pills={{ weeks: "3 weeks", level: "Beginner" }}
      imageGradient="linear-gradient(135deg, #1a2e0a, #4a7a1a, #2a4a0d)"
      imageSrc={img}
      outcomes={[
        "Run and optimise Google and Meta paid campaigns",
        "Build content strategies that drive organic growth",
        "Track and interpret campaign performance data",
        "Grow and engage social media audiences",
        "Write copy that converts across every channel",
        "Build and manage email marketing campaigns",
      ]}
      capstone="Plan and present a full-funnel digital marketing campaign for a real or fictional brand, including budget allocation, channel strategy, audience targeting and measurable KPIs."
      faqs={[
        { q: "Do I need prior experience?", a: "None at all. This programme starts from the basics and builds up. If you've ever used social media or browsed the internet, you already have more context than you think." },
        { q: "How are classes delivered?", a: "All classes are live online via Zoom. Sessions are recorded and shared with enrolled students so you never miss anything." },
        { q: "What do I need to enrol?", a: "A reliable laptop, a stable internet connection and the commitment to show up every week. That's it." },
        { q: "How does the certificate work?", a: "Your certificate is issued after your capstone project is reviewed and approved by the Evogue Academy team. Every graduate receives the same certificate regardless of scholarship status." },
        { q: "Is there a payment plan?", a: "Yes. Reach out to us at hello@evogueacademy.com and we'll work something out based on your situation." },
      ]}
    />
  ),
});
