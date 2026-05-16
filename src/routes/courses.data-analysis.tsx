import { createFileRoute } from "@tanstack/react-router";
import { CourseDetailTemplate } from "@/components/courses/CourseDetailTemplate";
import img from "@/assets/courses/data-analysis.jpg";

export const Route = createFileRoute("/courses/data-analysis")({
  head: () => ({
    meta: [
      { title: "Data Analysis — Evogue Academy" },
      { name: "description", content: "Turn messy data into clear insights with Excel, SQL and modern BI tools." },
      { property: "og:title", content: "Data Analysis — Evogue Academy" },
      { property: "og:description", content: "A 4-week live cohort that builds practical data analysis skills from scratch." },
    ],
  }),
  component: () => (
    <CourseDetailTemplate
      slug="data-analysis"
      title="Data Analysis"
      breadcrumb="Data Analysis"
      category="Data"
      description="Turn raw, messy data into clear business insights. Learn the tools and thinking behind great data analysis and build the confidence to present your findings to any room."
      pills={{ weeks: "4 weeks", level: "Beginner" }}
      imageGradient="linear-gradient(135deg, #0a2e3a, #1a6a8c, #0d3a5a)"
      imageSrc={img}
      outcomes={[
        "Clean and organise messy datasets in Excel",
        "Write SQL queries to extract and filter data",
        "Build dashboards in Power BI or Google Looker Studio",
        "Identify trends and patterns in business data",
        "Present data findings clearly to non-technical stakeholders",
        "Complete a full data analysis capstone project",
      ]}
      capstone="Analyse a real-world dataset, extract meaningful business insights, build a dashboard to visualise your findings and present a structured report to a non-technical audience."
      faqs={[
        { q: "Do I need prior experience?", a: "No. We start with the basics of Excel and build from there. If you can use a spreadsheet, you're ready to start." },
        { q: "How are classes delivered?", a: "All classes are live online via Zoom. Sessions are recorded and shared with enrolled students so you never miss anything." },
        { q: "What do I need to enrol?", a: "A reliable laptop, a stable internet connection and the commitment to show up every week. That's it." },
        { q: "How does the certificate work?", a: "Your certificate is issued after your capstone project is reviewed and approved by the Evogue Academy team. Every graduate receives the same certificate regardless of scholarship status." },
        { q: "Is there a payment plan?", a: "Yes. Reach out to us at hello@evogueacademy.com and we'll work something out based on your situation." },
      ]}
    />
  ),
});
