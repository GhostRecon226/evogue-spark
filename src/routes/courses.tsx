import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";
import { PublicShell } from "@/components/PublicShell";

export const Route = createFileRoute("/courses")({
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

function CoursesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof FILTERS)[number]>("All");

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
            <span className="elite-meta-item"><Clock size={14} /> 6 weeks · Live</span>
            <span className="elite-meta-item"><BarChart3 size={14} /> Beginner – Intermediate</span>
            <span className="elite-meta-item"><Award size={14} /> Dual certificate</span>
            <span className="elite-meta-item"><Code2 size={14} /> Capstone project included</span>
          </div>
          <Link to="/courses/$slug" params={{ slug: "project-management-business-analysis" }} className="elite-cta">
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
            <div><div className="elite-stat-num">6</div><div className="elite-stat-label">Weeks</div></div>
            <div><div className="elite-stat-num">1</div><div className="elite-stat-label">Certificate</div></div>
          </div>
          <Link to="/courses/$slug" params={{ slug: "project-management-business-analysis" }} className="elite-ghost-cta">
            View Full Details <ArrowRight size={13} />
          </Link>
        </aside>
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
