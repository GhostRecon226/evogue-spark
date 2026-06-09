import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import {
  ChevronRight,
  ChevronDown,
  Clock,
  BarChart3,
  Users,
  Award,
  Check,
  ArrowRight,
  ClipboardList,
  FileCheck2,
  Crown,
} from "lucide-react";
import { PublicShell } from "@/components/PublicShell";

export type CourseDetailConfig = {
  slug: string;
  title: string;
  breadcrumb: string;
  category: string;
  description: string;
  pills: { weeks: string; level: string };
  imageGradient: string;
  imageSrc?: string;
  imageAlt?: string;
  outcomes: string[];
  capstone: string;
  faqs: { q: string; a: string }[];
  certificateLabel?: string; // default "Certificate included"
  // curriculum modules
  curriculum?: {
    eyebrow: string;
    headline: string;
    subtext: string;
    modules: { title: string; bullets: string[] }[];
  };
  // target audience
  targetAudience?: {
    eyebrow: string;
    headline: string;
    subtext: string;
    items: string[];
  };
  // variants
  mode?: "default" | "waitlist" | "elite";
  // price card
  priceLabel?: string; // default "Contact us for pricing"
  // bottom CTA overrides (elite)
  bottomHeadline?: string;
  bottomSubtext?: string;
  // elite-only capstone extra note
  capstoneExtraNote?: string;
  // elite-only price card top banner
  priceBannerText?: string;
};

const pageBg: CSSProperties = {
  background: "#EDF7F0",
  backgroundImage:
    "radial-gradient(circle, rgba(10,46,26,0.055) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

const STEPS = [
  {
    title: "Enrol and join your cohort",
    desc: "Choose your course, complete enrolment and get access to your cohort community.",
  },
  {
    title: "Attend weekly live classes",
    desc: "Join live sessions each week with your instructor and cohort. Sessions are recorded.",
  },
  {
    title: "Complete assignments",
    desc: "Apply what you learn through weekly practicals and real-world exercises.",
  },
  {
    title: "Submit your capstone",
    desc: "Complete your capstone project, get it reviewed and receive your certificate.",
  },
];

export function CourseDetailTemplate(cfg: CourseDetailConfig) {
  const [openFaq, setOpenFaq] = useState<number>(0);
  const isWaitlist = cfg.mode === "waitlist";
  const isElite = cfg.mode === "elite";
  const priceLabel = cfg.priceLabel ?? (isWaitlist ? "Coming Soon" : "Contact us for pricing");
  const ctaText = isWaitlist ? "Join Waitlist" : "Enrol Now";
  const certLabel = cfg.certificateLabel ?? "Certificate included";

  const categoryBadge: ReactNode = isElite ? (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "rgba(10,46,26,0.08)",
      border: "1px solid rgba(10,46,26,0.15)",
      borderRadius: 50, padding: "4px 13px", fontSize: 10, fontWeight: 600,
      letterSpacing: "0.1em", color: "#0A2E1A", textTransform: "uppercase",
      marginBottom: 16,
    }}>
      <Crown size={12} /> {cfg.category}
    </div>
  ) : (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      border: "1px solid rgba(10,46,26,0.18)", borderRadius: 50,
      padding: "4px 13px", fontSize: 10, fontWeight: 600,
      letterSpacing: "0.1em", color: "#1A8C4E", textTransform: "uppercase",
      background: "rgba(255,255,255,0.6)", marginBottom: 16,
    }}>
      {cfg.category}
    </div>
  );

  return (
    <PublicShell>
      <style>{`
        .sm-hero { display:grid; grid-template-columns:1fr 420px; gap:48px; padding:64px 48px; align-items:center; }
        .sm-title { font-family: var(--font-display, Georgia, serif); font-size:44px; font-weight:900; color:#0A2E1A; line-height:1.08; letter-spacing:-0.02em; margin:0 0 16px; }
        .sm-display { font-family: var(--font-display, Georgia, serif); }
        .sm-outcomes { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .sm-capstone-cards { display:flex; gap:16px; }
        .sm-steps { display:flex; gap:0; position:relative; }
        .sm-step { flex:1; text-align:center; position:relative; }
        .sm-step:not(:last-child)::after { content:""; position:absolute; top:20px; left:50%; right:-50%; height:1px; background:rgba(10,46,26,0.1); z-index:0; }
        .sm-cta-strip { background:#0A2E1A; padding:40px 48px; display:flex; align-items:center; justify-content:space-between; gap:24px; }
        .sm-enrol-btn:hover { background:#1A8C4E !important; }

        @media (max-width: 1023px) {
          .sm-hero { grid-template-columns:1fr; padding:48px 32px; }
          .sm-outcomes { grid-template-columns:1fr; }
          .sm-steps { display:grid; grid-template-columns:1fr 1fr; gap:32px 16px; }
          .sm-step:not(:last-child)::after { display:none; }
          .sm-section { padding:48px 32px !important; }
        }
        @media (max-width: 767px) {
          .sm-hero { padding:40px 20px; }
          .sm-title { font-size:32px !important; }
          .sm-cta-row { flex-direction:column; align-items:stretch !important; gap:12px !important; }
          .sm-cta-row > * { width:100%; text-align:center; }
          .sm-section { padding:40px 20px !important; }
          .sm-capstone-cards { flex-direction:column; }
          .sm-steps { grid-template-columns:1fr; gap:24px; }
          .sm-cta-strip { padding:32px 20px; flex-direction:column; align-items:flex-start; }
        }
      `}</style>

      <div style={pageBg}>
        {/* HERO */}
        <section className="sm-hero">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#1A8C4E", marginBottom: 16 }}>
              <Link to="/courses" style={{ color: "#1A8C4E", textDecoration: "none" }}>Courses</Link>
              <ChevronRight size={12} />
              <span>{cfg.breadcrumb}</span>
            </div>

            {categoryBadge}

            <h1 className="sm-title">{cfg.title}</h1>

            <p style={{ fontSize: 15, color: "#3d6b4f", lineHeight: 1.7, maxWidth: 520, marginBottom: 28 }}>
              {cfg.description}
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
              {[
                { icon: <Clock size={14} color="#1A8C4E" />, text: cfg.pills.weeks },
                { icon: <BarChart3 size={14} color="#1A8C4E" />, text: cfg.pills.level },
                { icon: <Users size={14} color="#1A8C4E" />, text: "Live cohort" },
                { icon: <Award size={14} color="#1A8C4E" />, text: certLabel },
              ].map((p) => (
                <span key={p.text} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#fff", border: "1.5px solid rgba(10,46,26,0.1)",
                  borderRadius: 50, padding: "7px 16px", fontSize: 13,
                  color: "#0A2E1A", fontWeight: 500,
                }}>
                  {p.icon}{p.text}
                </span>
              ))}
            </div>

            <div className="sm-cta-row" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Link to="/contact" className="sm-enrol-btn" style={{
                background: "#0A2E1A", color: "#fff", padding: "14px 32px",
                borderRadius: 8, fontSize: 14, fontWeight: 600, border: "none",
                cursor: "pointer", transition: "background 0.2s", textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}>
                {ctaText} <ArrowRight size={16} />
              </Link>
              <Link to="/scholarship" style={{
                fontSize: 14, color: "#1A8C4E", fontWeight: 500,
                textDecoration: "underline", textUnderlineOffset: 3,
              }}>
                Apply for a Scholarship →
              </Link>
            </div>
          </div>

          {/* Right column */}
          <div>
            {cfg.imageSrc ? (
              <img
                src={cfg.imageSrc}
                alt={cfg.imageAlt ?? cfg.title}
                style={{
                  width: "100%", aspectRatio: "4 / 3", borderRadius: 16,
                  objectFit: "cover", marginBottom: 16,
                  background: cfg.imageGradient,
                }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <div style={{
                width: "100%", aspectRatio: "4 / 3", borderRadius: 16,
                marginBottom: 16, background: cfg.imageGradient,
              }} />
            )}
            <div style={{
              background: "#fff", borderRadius: 12,
              border: "1px solid rgba(10,46,26,0.08)", padding: "22px 24px",
            }}>
              {cfg.priceBannerText && (
                <div style={{
                  background: "rgba(0,245,160,0.08)",
                  border: "1px solid rgba(0,245,160,0.2)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 14,
                  fontSize: 12,
                  color: "#0A5C2A",
                  fontWeight: 500,
                }}>
                  {cfg.priceBannerText}
                </div>
              )}
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(10,46,26,0.4)" }}>
                Programme Fee
              </div>
              <div className="sm-display" style={{ fontSize: 22, fontWeight: 700, color: "#0A2E1A", margin: "6px 0" }}>
                {priceLabel}
              </div>
              {!isWaitlist && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#1A8C4E", fontWeight: 500 }}>
                  <Check size={14} /> Scholarship available — up to 100% tuition coverage
                </div>
              )}
              <div style={{ borderTop: "1px solid rgba(10,46,26,0.06)", margin: "14px 0" }} />
              {isWaitlist ? (
                <div style={{ fontSize: 12, color: "#4a7a5a" }}>
                  Join the waitlist to be first in line when enrolment opens.
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "#4a7a5a" }}>
                  Flexible payment plans available.{" "}
                  <Link to="/contact" style={{ color: "#1A8C4E", fontWeight: 600 }}>Talk to us</Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* WHAT YOU'LL LEARN */}
        <section className="sm-section" style={{ padding: "64px 48px", background: "#fff" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "#1A8C4E", fontWeight: 600, marginBottom: 10 }}>
            PROGRAMME OUTCOMES
          </div>
          <h2 className="sm-display" style={{ fontSize: 28, fontWeight: 700, color: "#0A2E1A", marginBottom: 8 }}>
            What you'll learn
          </h2>
          <p style={{ fontSize: 14, color: "#4a7a5a", marginBottom: 36 }}>
            Every session is designed around practical skills you can apply immediately.
          </p>
          <div className="sm-outcomes">
            {cfg.outcomes.map((o) => (
              <div key={o} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "16px 18px", background: "#EDF7F0",
                borderRadius: 10, border: "1px solid rgba(10,46,26,0.06)",
              }}>
                <Check size={18} color="#00F5A0" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 14, color: "#0A2E1A", fontWeight: 500, lineHeight: 1.5 }}>{o}</span>
              </div>
            ))}
          </div>
        </section>

        {/* COURSE CURRICULUM */}
        {cfg.curriculum && (
          <CurriculumSection curriculum={cfg.curriculum} />
        )}

        {/* CAPSTONE */}
        <section className="sm-section" style={{
          background: "#0A2E1A",
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(0,245,160,0.06) 0%, transparent 50%)",
          padding: "64px 48px",
        }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "#00F5A0", fontWeight: 600, marginBottom: 10 }}>
            CAPSTONE PROJECT
          </div>
          <h2 className="sm-display" style={{ fontSize: 28, fontWeight: 700, color: "#EDF7F0", marginBottom: 16 }}>
            Your capstone project
          </h2>
          <p style={{ fontSize: 15, color: "rgba(237,247,240,0.65)", lineHeight: 1.7, maxWidth: 620, marginBottom: 28 }}>
            {cfg.capstone}
          </p>
          <div className="sm-capstone-cards">
            {[
              { icon: <ClipboardList size={22} color="#00F5A0" />, title: "Real-world brief", text: "You'll work on a realistic project scenario, not a toy exercise." },
              { icon: <Users size={22} color="#00F5A0" />, title: "Instructor reviewed", text: "Your submission is reviewed by the Evogue Academy team before approval." },
              { icon: <FileCheck2 size={22} color="#00F5A0" />, title: "Certificate gated", text: "Your certificate is only issued once your capstone is approved." },
            ].map((c) => (
              <div key={c.title} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "22px 20px", flex: 1,
              }}>
                <div style={{ marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#EDF7F0", marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: "rgba(237,247,240,0.55)", lineHeight: 1.6 }}>{c.text}</div>
              </div>
            ))}
          </div>
          <p style={{ fontStyle: "italic", fontSize: 13, color: "rgba(237,247,240,0.4)", marginTop: 24 }}>
            Your certificate is issued only after your capstone project is reviewed and approved by the Evogue Academy team.
          </p>
          {cfg.capstoneExtraNote && (
            <div style={{
              background: "rgba(0,245,160,0.08)",
              border: "1px solid rgba(0,245,160,0.15)",
              borderRadius: 8,
              padding: "12px 16px",
              marginTop: 20,
              fontSize: 13,
              color: "#EDF7F0",
            }}>
              {cfg.capstoneExtraNote}
            </div>
          )}
        </section>

        {/* HOW IT WORKS */}
        <section className="sm-section" style={{ padding: "64px 48px", background: "#EDF7F0" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "#1A8C4E", fontWeight: 600, marginBottom: 10 }}>
            THE PROCESS
          </div>
          <h2 className="sm-display" style={{ fontSize: 28, fontWeight: 700, color: "#0A2E1A", marginBottom: 40 }}>
            How the programme works
          </h2>
          <div className="sm-steps">
            {STEPS.map((s, i) => (
              <div key={s.title} className="sm-step">
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", background: "#0A2E1A",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px", position: "relative", zIndex: 1,
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0A2E1A", marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "#4a7a5a", lineHeight: 1.6, maxWidth: 160, margin: "0 auto" }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="sm-section" style={{ padding: "64px 48px", background: "#fff" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "#1A8C4E", fontWeight: 600, marginBottom: 10 }}>
            FAQ
          </div>
          <h2 className="sm-display" style={{ fontSize: 28, fontWeight: 700, color: "#0A2E1A", marginBottom: 32 }}>
            Common questions
          </h2>
          <div>
            {cfg.faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q} style={{ borderBottom: "1px solid rgba(10,46,26,0.08)", padding: "18px 0", cursor: "pointer" }}
                  onClick={() => setOpenFaq(open ? -1 : i)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#0A2E1A" }}>{f.q}</span>
                    <ChevronDown size={18} color="#0A2E1A" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateRows: open ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.25s ease",
                  }}>
                    <div style={{ overflow: "hidden" }}>
                      <p style={{ fontSize: 14, color: "#4a7a5a", lineHeight: 1.7, paddingTop: 10, margin: 0 }}>{f.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* BOTTOM CTA STRIP */}
      <section className="sm-cta-strip">
        <div>
          <div className="sm-display" style={{ fontSize: 22, fontWeight: 700, color: "#EDF7F0" }}>
            {cfg.bottomHeadline ?? "Ready to get started?"}
          </div>
          <div style={{ fontSize: 13, color: "rgba(237,247,240,0.55)", marginTop: 4 }}>
            {cfg.bottomSubtext ?? "Enrol now and join the next cohort. Limited spots available."}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/contact" style={{
            background: "#00F5A0", color: "#0A2E1A", fontWeight: 600,
            padding: "12px 24px", borderRadius: 8, fontSize: 14, textDecoration: "none",
          }}>
            {ctaText}
          </Link>
          <Link to="/scholarship" style={{
            background: "transparent", border: "1.5px solid rgba(255,255,255,0.2)",
            color: "#EDF7F0", padding: "12px 24px", borderRadius: 8, fontSize: 14,
            fontWeight: 600, textDecoration: "none",
          }}>
            Apply for a Scholarship
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type CurriculumProps = {
  curriculum: NonNullable<CourseDetailConfig["curriculum"]>;
};

function CurriculumSection({ curriculum }: CurriculumProps) {
  const moduleSlugs = curriculum.modules.map((m) => slugify(m.title));
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(moduleSlugs.map((s) => [s, true])),
  );
  const [activeSlug, setActiveSlug] = useState<string>(moduleSlugs[0] ?? "");
  const tocLinkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const headerBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const SCROLL_OFFSET = 96;

  const toggle = (slug: string) =>
    setOpenModules((prev) => ({ ...prev, [slug]: !prev[slug] }));

  const scrollToModule = (slug: string) => {
    const el = document.getElementById(`module-${slug}`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
    if (typeof history !== "undefined") {
      history.replaceState(null, "", `#module-${slug}`);
    }
  };

  const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    setOpenModules((prev) => ({ ...prev, [slug]: true }));
    requestAnimationFrame(() => scrollToModule(slug));
  };

  const focusModule = (i: number) => {
    const slug = moduleSlugs[i];
    if (!slug) return;
    headerBtnRefs.current[slug]?.focus();
  };

  const handleHeaderKey = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusModule((i + 1) % moduleSlugs.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusModule((i - 1 + moduleSlugs.length) % moduleSlugs.length);
        break;
      case "Home":
        e.preventDefault();
        focusModule(0);
        break;
      case "End":
        e.preventDefault();
        focusModule(moduleSlugs.length - 1);
        break;
    }
  };

  // Scrollspy: track which module is currently in view
  useEffect(() => {
    const els = moduleSlugs
      .map((s) => document.getElementById(`module-${s}`))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = visible[0].target.id.replace(/^module-/, "");
          setActiveSlug(id);
        }
      },
      { rootMargin: `-${SCROLL_OFFSET}px 0px -55% 0px`, threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [moduleSlugs.join("|")]);

  // Open initial hash on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    if (hash.startsWith("module-")) {
      const slug = hash.replace(/^module-/, "");
      if (moduleSlugs.includes(slug)) {
        setOpenModules((prev) => ({ ...prev, [slug]: true }));
        requestAnimationFrame(() => scrollToModule(slug));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="sm-section" style={{ padding: "64px 48px", background: "#fff" }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
        }
      `}</style>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "#1A8C4E", fontWeight: 600, marginBottom: 10 }}>
        {curriculum.eyebrow}
      </div>
      <h2 className="sm-display" style={{ fontSize: 28, fontWeight: 700, color: "#0A2E1A", marginBottom: 8 }}>
        {curriculum.headline}
      </h2>
      <p style={{ fontSize: 14, color: "#4a7a5a", lineHeight: 1.6, marginBottom: 28 }}>
        {curriculum.subtext}
      </p>

      <nav
        aria-label="Curriculum modules"
        style={{
          background: "#EDF7F0",
          border: "1px solid rgba(10,46,26,0.08)",
          borderRadius: 12,
          padding: "18px 22px",
          marginBottom: 28,
          position: "sticky",
          top: 12,
          zIndex: 5,
        }}
      >
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#1A8C4E", fontWeight: 600, marginBottom: 12 }}>
          On this page
        </div>
        <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "8px 16px" }}>
          {curriculum.modules.map((m, i) => {
            const slug = moduleSlugs[i];
            const isActive = activeSlug === slug;
            return (
              <li key={slug}>
                <a
                  ref={(el) => { tocLinkRefs.current[slug] = el; }}
                  href={`#module-${slug}`}
                  onClick={(e) => handleTocClick(e, slug)}
                  aria-current={isActive ? "true" : undefined}
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: isActive ? "#0A2E1A" : "#3d6b4f",
                    textDecoration: "none",
                    fontWeight: isActive ? 700 : 500,
                    padding: "6px 10px",
                    borderLeft: `3px solid ${isActive ? "#1A8C4E" : "transparent"}`,
                    background: isActive ? "rgba(26,140,78,0.08)" : "transparent",
                    borderRadius: 4,
                    transition: "all 0.15s ease",
                  }}
                >
                  {m.title}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      <div role="region" aria-label="Curriculum modules detail">
        {curriculum.modules.map((m, i) => {
          const slug = moduleSlugs[i];
          const isOpen = openModules[slug];
          const panelId = `module-panel-${slug}`;
          const headerId = `module-header-${slug}`;
          return (
            <div
              key={m.title}
              id={`module-${slug}`}
              style={{
                border: "1px solid rgba(10,46,26,0.08)",
                borderLeft: `3px solid ${activeSlug === slug ? "#0A2E1A" : "#1A8C4E"}`,
                borderRadius: "0 12px 12px 0",
                marginBottom: 12,
                background: "#fff",
                scrollMarginTop: SCROLL_OFFSET,
              }}
            >
              <h3 style={{ margin: 0 }}>
                <button
                  ref={(el) => { headerBtnRefs.current[slug] = el; }}
                  id={headerId}
                  type="button"
                  onClick={() => toggle(slug)}
                  onKeyDown={(e) => handleHeaderKey(e, i)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    background: "transparent",
                    border: "none",
                    padding: "18px 24px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#0A2E1A",
                    fontFamily: "inherit",
                  }}
                >
                  <span>{m.title}</span>
                  <ChevronDown
                    size={18}
                    color="#1A8C4E"
                    aria-hidden="true"
                    style={{
                      transition: "transform 0.2s",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      flexShrink: 0,
                    }}
                  />
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                hidden={!isOpen}
                style={{ padding: isOpen ? "0 24px 20px" : 0 }}
              >
                <ul style={{ margin: 0, paddingLeft: 16, listStyle: "disc" }}>
                  {m.bullets.map((b) => (
                    <li key={b} style={{ fontSize: 13, color: "#4a7a5a", lineHeight: 1.8 }}>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

