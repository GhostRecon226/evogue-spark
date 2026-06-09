import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Crown,
  Clock,
  BarChart3,
  Award,
  Code2,
  Check,
  ArrowRight,
  Heart,
  Bell,
} from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import scrumImg from "@/assets/courses/scrum-master.jpg";
import marketingImg from "@/assets/courses/digital-marketing.jpg";
import pmImg from "@/assets/courses/product-management.jpg";
import aiImg from "@/assets/courses/ai-for-professionals.jpg";
import dataImg from "@/assets/courses/data-analysis.jpg";
import cyberImg from "@/assets/courses/cybersecurity.jpg";
import vaImg from "@/assets/courses/virtual-assistant.jpg";

type CourseCard = {
  slug: string;
  title: string;
  category: "Management" | "Marketing" | "Technology" | "Data" | "Security";
  duration: string;
  level: string;
  status: "live" | "soon";
  href: string;
  description: string;
  image: string;
};

const COURSE_CARDS: CourseCard[] = [
  { slug: "scrum-master", title: "Scrum Master", category: "Management", duration: "3 weeks", level: "Intermediate", status: "live", href: "/courses/scrum-master", description: "Lead agile teams with confidence. Master sprints, ceremonies and servant leadership.", image: scrumImg },
  { slug: "digital-marketing", title: "Digital Marketing", category: "Marketing", duration: "3 weeks", level: "Beginner", status: "live", href: "/courses/digital-marketing", description: "Run campaigns that convert across social, search and email channels.", image: marketingImg },
  { slug: "product-management", title: "Product Management", category: "Management", duration: "4 weeks", level: "Intermediate", status: "live", href: "/courses/product-management", description: "Ship products users love. Strategy, roadmaps and stakeholder alignment.", image: pmImg },
  { slug: "ai-for-professionals", title: "AI for Professionals", category: "Technology", duration: "3 weeks", level: "Beginner", status: "live", href: "/courses/ai-for-professionals", description: "Apply AI tools to real work. Prompting, automation and practical workflows.", image: aiImg },
  { slug: "data-analysis", title: "Data Analysis", category: "Data", duration: "4 weeks", level: "Beginner", status: "live", href: "/courses/data-analysis", description: "Turn raw data into decisions with SQL, spreadsheets and visualisation.", image: dataImg },
  { slug: "cybersecurity", title: "Cybersecurity", category: "Security", duration: "4 weeks", level: "Intermediate", status: "soon", href: "/contact", description: "Defend systems and data. Threats, controls and modern security practice.", image: cyberImg },
  { slug: "virtual-assistant-programme", title: "Virtual Assistant Programme", category: "Management", duration: "4 weeks", level: "Beginner", status: "soon", href: "/contact", description: "Launch a remote VA career with the tools, workflows and client skills that pay.", image: vaImg },
];

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Courses — Evogue Academy" },
      { name: "description", content: "Browse all design, development, data, management and security tracks at Evogue Academy." },
      { property: "og:title", content: "Courses — Evogue Academy" },
      { property: "og:description", content: "All Evogue Academy tracks in one place." },
    ],
  }),
  component: CoursesPage,
});

const FILTERS = ["All", "Management", "Marketing", "Technology", "Data", "Security"] as const;

const TRACK_PILLS = [
  "Project Management",
  "Business Analysis",
  "Agile & Scrum",
  "Requirements Gathering",
  "Stakeholder Management",
];

const CHECKLIST = [
  "Live cohort classes",
  "1-on-1 mentorship",
  "Real-world capstone project",
  "Dual certificate on completion",
  "Career placement support",
];

import { CardCta } from "@/components/courses/CardCta";

function CoursesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof FILTERS)[number]>("All");

  const filteredCards = useMemo(() => {
    return COURSE_CARDS.filter((c) => {
      const matchesCat = cat === "All" || c.category === cat;
      const matchesQ = !q || (c.title + " " + c.description).toLowerCase().includes(q.toLowerCase());
      return matchesCat && matchesQ;
    });
  }, [q, cat]);

  return (
    <PublicShell>
      {/* HERO */}
      <section className="courses-hero">
        <div className="courses-hero-inner">
          <span className="courses-badge">
            <span className="courses-badge-dot" />
            8 Courses Available
          </span>
          <h1 className="courses-headline">
            Skills that get you<br />
            <em>hired. Fast.</em>
          </h1>
          <p className="courses-sub">
            Live classes. Real mentors. Globally recognised certificates. Find the track that moves your career forward.
          </p>

          <div className="courses-search">
            <Search className="courses-search-icon" size={18} />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search courses..."
              className="courses-search-input"
            />
          </div>

          <div className="courses-filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setCat(f)}
                className={`courses-filter-pill${cat === f ? " is-active" : ""}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ELITE PROGRAMME BANNER */}
      <div className="elite-banner">
        <div className="elite-left">
          <span className="elite-crown-badge">
            <Crown size={12} />
            ELITE PROGRAMME
          </span>
          <h2 className="elite-headline">
            Project Management<br />
            & <em>Business Analysis</em>
          </h2>
          <p className="elite-desc">
            Our most comprehensive programme. Study both disciplines in depth, then graduate into the role that fits your career best. Built for people who want to lead, not just participate.
          </p>
          <div className="elite-tracks">
            {TRACK_PILLS.map((t) => (
              <span key={t} className="elite-track-pill">{t}</span>
            ))}
          </div>
          <div className="elite-meta">
            <span className="elite-meta-item"><Clock size={14} /> 10 weeks · Live</span>
            <span className="elite-meta-item"><BarChart3 size={14} /> Beginner – Intermediate</span>
            <span className="elite-meta-item"><Award size={14} /> Dual certificate</span>
            <span className="elite-meta-item"><Code2 size={14} /> Capstone project included</span>
          </div>
          <Link to="/courses/project-management-business-analysis" className="elite-cta">
            View Programme Details <ArrowRight size={14} />
          </Link>
        </div>

        <aside className="elite-right">
          <span className="elite-scholarship-badge">Scholarship Available</span>
          <ul className="elite-checklist">
            {CHECKLIST.map((c) => (
              <li key={c}><Check size={13} /> <span>{c}</span></li>
            ))}
          </ul>
          <div className="elite-divider" />
          <div className="elite-stats">
            <div><div className="elite-stat-num">2</div><div className="elite-stat-label">Disciplines</div></div>
            <div><div className="elite-stat-num">10</div><div className="elite-stat-label">Weeks</div></div>
            <div><div className="elite-stat-num">1</div><div className="elite-stat-label">Certificate</div></div>
          </div>
          <Link to="/courses/project-management-business-analysis" className="elite-ghost-cta">
            View Full Details <ArrowRight size={13} />
          </Link>
        </aside>
      </div>

      {/* COURSE GRID */}
      <div className="cc-section-label">ALL COURSES</div>
      <div className="cc-grid">
        {filteredCards.map((c) => (
          <article key={c.slug} className="cc-card">
            <div className="cc-card-image">
              <img src={c.image} alt={c.title} loading="lazy" width={768} height={512} />
              {c.status === "live" && <span className="cc-live-badge">Now Enrolling</span>}
              {c.status === "soon" && (
                <div className="cc-soon-overlay">
                  <span className="cc-soon-pill">Coming Soon</span>
                </div>
              )}
            </div>
            <div className="cc-card-body">
              <div className="cc-cat">{c.category}</div>
              <h3 className="cc-title">{c.title}</h3>
              <p className="cc-desc">{c.description}</p>
              <div className="cc-divider" />
              <div className="cc-meta">
                <span><Clock size={13} /> {c.duration}</span>
                <span><BarChart3 size={13} /> {c.level}</span>
              </div>
              <div className="cc-capstone"><Check size={13} /> Includes capstone project</div>
              <CardCta card={c} />

            </div>
          </article>
        ))}
      </div>

      {/* SCHOLARSHIP CTA STRIP */}
      <div className="scholarship-strip">
        <div className="scholarship-glow" />
        <div className="scholarship-text">
          <h3 className="scholarship-headline">Can't cover the fee right now?</h3>
          <p className="scholarship-sub">
            We offer scholarships covering up to 100% of tuition for candidates with the drive but not the funds. Every cohort has spots set aside.
          </p>
        </div>
        <Link to="/scholarship" className="scholarship-cta">
          <Heart size={14} /> Apply for a Scholarship
        </Link>
      </div>
    </PublicShell>
  );
}
