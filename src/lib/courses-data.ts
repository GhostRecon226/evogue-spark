export type CourseCategory = "Design" | "Development" | "Data" | "Management" | "Security";

export type Course = {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  duration: string;
  level: string;
  price: string;
  category: CourseCategory;
  cover: string;
  active: boolean;
  whatYouLearn: string[];
  curriculum: { week: string; title: string; topics: string[] }[];
  instructor: { name: string; title: string; bio: string; avatar: string };
};

export const courses: Course[] = [
  {
    slug: "product-design",
    title: "Product Design",
    description: "Master UX research, UI craft and design systems used by top product teams.",
    longDescription:
      "A hands-on 12-week program covering everything from user research and wireframing to building production-ready design systems. You'll ship 3 portfolio projects critiqued by working designers from leading global startups.",
    duration: "12 weeks",
    level: "Beginner – Intermediate",
    price: "₦450,000",
    category: "Design",
    cover: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&q=80",
    active: true,
    whatYouLearn: [
      "Apply UX research methods to real user problems",
      "Design intuitive interfaces with strong visual hierarchy",
      "Build and document a scalable design system in Figma",
      "Run usability tests and iterate based on findings",
      "Present and defend design decisions to stakeholders",
      "Build a portfolio with 3 production-quality case studies",
    ],
    curriculum: [
      {
        week: "Week 1–2",
        title: "Design Foundations",
        topics: ["Design thinking", "User research basics", "Personas & journeys"],
      },
      {
        week: "Week 3–4",
        title: "Wireframing & IA",
        topics: ["Information architecture", "Low-fi wireframes", "User flows"],
      },
      {
        week: "Week 5–6",
        title: "Visual Design",
        topics: ["Typography", "Color theory", "Layout & spacing"],
      },
      {
        week: "Week 7–8",
        title: "Design Systems",
        topics: ["Tokens", "Components in Figma", "Documentation"],
      },
      {
        week: "Week 9–10",
        title: "Prototyping & Testing",
        topics: ["Interactive prototypes", "Usability testing", "Iteration"],
      },
      {
        week: "Week 11–12",
        title: "Portfolio & Career",
        topics: ["Case study writing", "Portfolio review", "Interview prep"],
      },
    ],
    instructor: {
      name: "Adaeze Okonkwo",
      title: "Senior Product Designer · ex-Stripe",
      bio: "Adaeze has shipped products used by millions across fintech and developer tools. She mentors emerging designers across Africa.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    },
  },
  {
    slug: "product-management",
    title: "Product Management",
    description: "Lead product strategy, roadmaps and cross-functional teams with confidence.",
    longDescription:
      "Learn the craft of modern product management — discovery, prioritization, roadmapping, and shipping value continuously.",
    duration: "10 weeks",
    level: "Intermediate",
    price: "₦400,000",
    category: "Management",
    cover: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
    active: false,
    whatYouLearn: [
      "Define product strategy aligned to business goals",
      "Run discovery interviews and synthesize insights",
      "Build & maintain a credible product roadmap",
      "Prioritize ruthlessly using proven frameworks",
      "Lead cross-functional teams without authority",
      "Communicate with executives and stakeholders",
    ],
    curriculum: [
      {
        week: "Week 1–2",
        title: "PM Fundamentals",
        topics: ["Role of PM", "Product lifecycle", "Stakeholder mapping"],
      },
      {
        week: "Week 3–4",
        title: "Discovery",
        topics: ["User interviews", "Jobs-to-be-done", "Opportunity solution trees"],
      },
      { week: "Week 5–6", title: "Strategy & Roadmap", topics: ["Vision", "OKRs", "Roadmapping"] },
      {
        week: "Week 7–8",
        title: "Execution",
        topics: ["Prioritization", "Sprint planning", "Metrics"],
      },
      {
        week: "Week 9–10",
        title: "Leadership",
        topics: ["Influence", "Storytelling", "Career growth"],
      },
    ],
    instructor: {
      name: "Tunde Bakare",
      title: "Director of Product · ex-Flutterwave",
      bio: "15+ years scaling products from 0→1 and 1→100 across African and global markets.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    },
  },
  {
    slug: "frontend-development",
    title: "Frontend Development",
    description: "Ship beautiful, accessible interfaces with React, TypeScript and modern tooling.",
    longDescription:
      "From HTML/CSS fundamentals to production React apps with TypeScript, testing, and performance.",
    duration: "14 weeks",
    level: "Beginner – Intermediate",
    price: "₦500,000",
    category: "Development",
    cover: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=1200&q=80",
    active: false,
    whatYouLearn: [
      "HTML, CSS, JavaScript fundamentals",
      "Modern React with hooks",
      "TypeScript",
      "State management",
      "Testing",
      "Deployment & CI",
    ],
    curriculum: [
      {
        week: "Week 1–3",
        title: "Web Foundations",
        topics: ["HTML semantics", "CSS layout", "JS essentials"],
      },
      { week: "Week 4–6", title: "React", topics: ["Components", "Hooks", "Routing"] },
      {
        week: "Week 7–9",
        title: "TypeScript & State",
        topics: ["Types", "Generics", "Zustand/Redux"],
      },
      {
        week: "Week 10–12",
        title: "Production",
        topics: ["Testing", "Performance", "Accessibility"],
      },
      {
        week: "Week 13–14",
        title: "Capstone",
        topics: ["Build & ship", "Code review", "Portfolio"],
      },
    ],
    instructor: {
      name: "Chinedu Okafor",
      title: "Staff Frontend Engineer · ex-Vercel",
      bio: "Builds and teaches production React. Active open source contributor.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    },
  },
  {
    slug: "backend-development",
    title: "Backend Development",
    description: "Build robust APIs, services and data pipelines for production-scale apps.",
    longDescription: "Server-side engineering with Node.js, databases, queues, and cloud deploys.",
    duration: "14 weeks",
    level: "Intermediate",
    price: "₦500,000",
    category: "Development",
    cover: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80",
    active: false,
    whatYouLearn: [
      "REST & GraphQL APIs",
      "PostgreSQL & Redis",
      "Auth & security",
      "Background jobs",
      "Observability",
      "Cloud deploy",
    ],
    curriculum: [
      {
        week: "Week 1–3",
        title: "Node Foundations",
        topics: ["JS runtime", "Express", "Middleware"],
      },
      { week: "Week 4–6", title: "Databases", topics: ["SQL", "Migrations", "Indexing"] },
      { week: "Week 7–9", title: "APIs", topics: ["REST", "GraphQL", "Versioning"] },
      { week: "Week 10–12", title: "Production", topics: ["Auth", "Caching", "Queues"] },
      {
        week: "Week 13–14",
        title: "Capstone",
        topics: ["Build & deploy", "Code review", "Portfolio"],
      },
    ],
    instructor: {
      name: "Funmi Adesanya",
      title: "Principal Engineer · ex-Paystack",
      bio: "Builds payments infrastructure at scale. Loves teaching reliable systems.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    },
  },
  {
    slug: "data-analysis",
    title: "Data Analysis",
    description: "Turn messy data into clear insights with SQL, Python and modern BI tools.",
    longDescription: "Become a data-fluent analyst capable of driving decisions with evidence.",
    duration: "10 weeks",
    level: "Beginner",
    price: "₦350,000",
    category: "Data",
    cover: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    active: false,
    whatYouLearn: [
      "SQL fluency",
      "Python for analysis",
      "Statistical thinking",
      "Data visualization",
      "Dashboarding",
      "Storytelling with data",
    ],
    curriculum: [
      {
        week: "Week 1–2",
        title: "Foundations",
        topics: ["Spreadsheets", "Stats basics", "Data types"],
      },
      { week: "Week 3–4", title: "SQL", topics: ["Joins", "Window funcs", "Performance"] },
      { week: "Week 5–6", title: "Python", topics: ["Pandas", "Cleaning", "EDA"] },
      { week: "Week 7–8", title: "Visualization", topics: ["Charts", "Dashboards", "BI tools"] },
      {
        week: "Week 9–10",
        title: "Capstone",
        topics: ["Analysis project", "Presentation", "Portfolio"],
      },
    ],
    instructor: {
      name: "Kemi Lawal",
      title: "Lead Data Analyst · ex-Andela",
      bio: "Helps companies make data-driven decisions. Passionate educator.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
    },
  },
  {
    slug: "project-management",
    title: "Project Management",
    description: "Deliver complex tech projects on time using agile, scrum and modern PM tools.",
    longDescription:
      "Master the practical craft of running technology projects to successful delivery.",
    duration: "8 weeks",
    level: "Beginner – Intermediate",
    price: "₦300,000",
    category: "Management",
    cover: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
    active: false,
    whatYouLearn: [
      "Agile & Scrum",
      "Planning & estimation",
      "Risk management",
      "Stakeholder communication",
      "Tools (Jira, Linear)",
      "Reporting",
    ],
    curriculum: [
      {
        week: "Week 1–2",
        title: "Foundations",
        topics: ["PM lifecycle", "Roles", "Methodologies"],
      },
      { week: "Week 3–4", title: "Agile", topics: ["Scrum", "Kanban", "Ceremonies"] },
      { week: "Week 5–6", title: "Execution", topics: ["Planning", "Tracking", "Reporting"] },
      { week: "Week 7–8", title: "Leadership", topics: ["Conflict", "Stakeholders", "Career"] },
    ],
    instructor: {
      name: "Bola Ade",
      title: "Senior PM · ex-Microsoft",
      bio: "Delivered 50+ tech projects across 3 continents.",
      avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80",
    },
  },
  {
    slug: "prompt-engineering",
    title: "Prompt Engineering",
    description: "Design powerful prompts and AI workflows that drive real business outcomes.",
    longDescription:
      "The new craft of working with LLMs — from prompt patterns to agent workflows.",
    duration: "6 weeks",
    level: "Beginner",
    price: "₦250,000",
    category: "Development",
    cover: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
    active: false,
    whatYouLearn: [
      "LLM fundamentals",
      "Prompt patterns",
      "Tool use & agents",
      "Evaluations",
      "RAG basics",
      "Productionizing AI features",
    ],
    curriculum: [
      { week: "Week 1", title: "LLM Basics", topics: ["How LLMs work", "Tokens", "Models"] },
      {
        week: "Week 2–3",
        title: "Prompting",
        topics: ["Patterns", "Few-shot", "Chain of thought"],
      },
      { week: "Week 4", title: "Tools & Agents", topics: ["Function calling", "Workflows"] },
      { week: "Week 5", title: "RAG", topics: ["Embeddings", "Vector DB"] },
      { week: "Week 6", title: "Capstone", topics: ["Ship an AI feature"] },
    ],
    instructor: {
      name: "Nneka Eze",
      title: "AI Engineer · independent consultant",
      bio: "Helps companies adopt LLMs safely and pragmatically.",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
    },
  },
  {
    slug: "cyber-security",
    title: "Cyber Security",
    description: "Defend systems, audit networks and respond to threats like a security pro.",
    longDescription:
      "End-to-end defensive security — networks, applications, identity, and incident response.",
    duration: "12 weeks",
    level: "Intermediate",
    price: "₦480,000",
    category: "Security",
    cover: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
    active: false,
    whatYouLearn: [
      "Network security",
      "Web app security",
      "Identity & access",
      "Cryptography basics",
      "Incident response",
      "Compliance",
    ],
    curriculum: [
      {
        week: "Week 1–3",
        title: "Foundations",
        topics: ["Threat models", "Networking", "OS security"],
      },
      { week: "Week 4–6", title: "AppSec", topics: ["OWASP top 10", "Secure SDLC", "Auth"] },
      { week: "Week 7–9", title: "Operations", topics: ["Logging", "Monitoring", "IR"] },
      { week: "Week 10–12", title: "Capstone", topics: ["Pen test", "Report", "Career"] },
    ],
    instructor: {
      name: "Daniel Igwe",
      title: "Head of Security · fintech",
      bio: "Builds and runs security programs at scale.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    },
  },
  {
    slug: "cloud-engineering",
    title: "Cloud Engineering",
    description: "Architect, deploy and operate cloud infrastructure on AWS, GCP and Azure.",
    longDescription: "Modern cloud — IaC, CI/CD, observability, cost, and reliability.",
    duration: "12 weeks",
    level: "Intermediate – Advanced",
    price: "₦520,000",
    category: "Development",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    active: false,
    whatYouLearn: [
      "AWS core services",
      "Infrastructure as code",
      "CI/CD pipelines",
      "Containers & K8s",
      "Observability",
      "Cost & reliability",
    ],
    curriculum: [
      { week: "Week 1–3", title: "Cloud Foundations", topics: ["IAM", "Compute", "Storage"] },
      { week: "Week 4–6", title: "IaC", topics: ["Terraform", "Modules", "Pipelines"] },
      { week: "Week 7–9", title: "Containers", topics: ["Docker", "K8s", "Service mesh"] },
      { week: "Week 10–12", title: "Operations", topics: ["Monitoring", "SRE", "Cost"] },
    ],
    instructor: {
      name: "Ibrahim Musa",
      title: "Staff SRE · ex-AWS",
      bio: "Helps teams run reliable cloud-native systems.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    },
  },
];

export const COURSE_CATEGORIES: CourseCategory[] = [
  "Design",
  "Development",
  "Data",
  "Management",
  "Security",
];

export const COURSE_NAMES = [
  "Project Management & Business Analysis",
  "Scrum Master",
  "Digital Marketing",
  "Product Management",
  "AI for Professionals",
  "Data Analysis",
  "Cybersecurity",
  "Virtual Assistant Programme",
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}
