import { createFileRoute } from "@tanstack/react-router";
import { CourseDetailTemplate } from "@/components/courses/CourseDetailTemplate";
import img from "@/assets/courses/virtual-assistant.jpg";

export const Route = createFileRoute("/courses/virtual-assistant-programme")({
  head: () => ({
    meta: [
      { title: "Virtual Assistant Programme — Evogue Academy" },
      {
        name: "description",
        content: "Build the skills to work remotely for global clients. Join the waitlist.",
      },
      { property: "og:title", content: "Virtual Assistant Programme — Evogue Academy" },
      {
        property: "og:description",
        content: "A 4-week live cohort. Coming soon — join the waitlist.",
      },
      { property: "og:type", content: "article" },
      {
        property: "og:url",
        content: "https://evogue-spark.lovable.app/courses/virtual-assistant-programme",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Virtual Assistant Programme — Evogue Academy" },
      {
        name: "twitter:description",
        content: "A 4-week live cohort. Coming soon — join the waitlist.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://evogue-spark.lovable.app/courses/virtual-assistant-programme",
      },
    ],
  }),
  component: () => (
    <CourseDetailTemplate
      slug="virtual-assistant-programme"
      title="Virtual Assistant Programme"
      breadcrumb="Virtual Assistant Programme"
      category="Management"
      description="Build the skills to work remotely for global clients, manage schedules and deliver exceptional professional support from anywhere in the world."
      pills={{ weeks: "4 weeks", level: "Beginner" }}
      imageGradient="linear-gradient(135deg, #0a1a3a, #1a3a7a, #0d2050)"
      imageSrc={img}
      mode="waitlist"
      outcomes={[
        "Manage executive calendars, inboxes and travel schedules",
        "Use tools like Notion, Asana, Trello and Google Workspace",
        "Handle client communication professionally and proactively",
        "Create systems for tracking tasks and deliverables",
        "Work efficiently across time zones for global clients",
        "Build a portfolio and land your first remote VA role",
      ]}
      capstone="Set up a complete VA operations system for a fictional client including inbox management, calendar setup, task tracking and a standard operating procedures document ready for handover."
      faqs={[
        {
          q: "Do I need prior experience?",
          a: "None. If you're organised, reliable and good with people, this programme will give you everything else you need.",
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
          a: "We're finalising the programme details. Join the waitlist and we'll reach out as soon as enrolment opens.",
        },
      ]}
    />
  ),
});
