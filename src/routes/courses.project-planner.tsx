import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type CSSProperties } from "react";
import {
  ChevronRight,
  ChevronDown,
  Clock,
  BarChart3,
  Users,
  Award,
  Check,
  ArrowRight,
  Calendar,
  ClipboardList,
  FileCheck2,
  FileText,
  Target,
} from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import plannerImg from "@/assets/courses/project-planner.jpg";

export const Route = createFileRoute("/courses/project-planner")({
  head: () => ({
    meta: [
      { title: "Project Planner — Evogue Academy" },
      {
        name: "description",
        content:
          "Master Primavera P6, project scheduling and controls. Built for engineers, graduates and career changers entering the UK and global project planning job market.",
      },
      { property: "og:title", content: "Project Planner — Evogue Academy" },
      {
        property: "og:description",
        content:
          "A 6-week live cohort that prepares you for a career as a Project Planner using Primavera P6.",
      },
    ],
  }),
  component: ProjectPlannerPage,
});

const OUTCOMES = [
  "Use Primavera P6 from beginner to intermediate levels.",
  "Develop schedules using programme development and scheduling principles",
  "Apply critical path analysis to real project scenarios",
  "Set up, manage, and track project baselines effectively",
  "Update progress, report performance, and handle compensation events",
  "Apply project controls fundamentals across real-life project scenarios",
];

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

const CAREER = [
  {
    icon: <FileText size={22} color="#1A8C4E" />,
    title: "CV Preparation",
    text: "One-on-one CV review and rewriting tailored to project planning roles in the UK and global market.",
  },
  {
    icon: <Users size={22} color="#1A8C4E" />,
    title: "Mock Interviews",
    text: "Practice with real interview questions for Project Planner and Planning Engineer positions.",
  },
  {
    icon: <Target size={22} color="#1A8C4E" />,
    title: "Job Market Prep",
    text: "Learn what UK construction, rail and infrastructure employers look for and how to position yourself.",
  },
];

const FAQS = [
  {
    q: "Do I need prior experience?",
    a: "No formal project planning experience is required. The programme is built for beginners and career changers. Some professional context helps but is not essential.",
  },
  {
    q: "What is Primavera P6 and why does it matter?",
    a: "Primavera P6 is the industry-standard scheduling software used across construction, infrastructure, energy and defence projects globally. Mastering it is a key requirement for almost every Project Planner role.",
  },
  {
    q: "When are classes held?",
    a: "Classes run live every Saturday at 11:00am UK time. The schedule is designed to fit around full-time work and other commitments.",
  },
  {
    q: "What kind of jobs can I apply for after this?",
    a: "Graduates can pursue roles such as Project Planner, Planning Engineer, Project Controls Analyst, Scheduler and Project Coordinator across construction, rail, infrastructure, energy and defence sectors.",
  },
  {
    q: "Is there a payment plan?",
    a: "Yes. Reach out to us at hello@evogueacademy.com and we'll work something out based on your situation.",
  },
];

const pageBg: CSSProperties = {
  background: "#EDF7F0",
  backgroundImage:
    "radial-gradient(circle, rgba(10,46,26,0.055) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

function ProjectPlannerPage() {
  const [openFaq, setOpenFaq] = useState<number>(0);

  return (
    <PublicShell>
      <style>{`
        .sm-hero { display:grid; grid-template-columns:1fr 420px; gap:48px; padding:64px 48px; align-items:center; }
        .sm-title { font-family: var(--font-display, Georgia, serif); font-size:44px; font-weight:900; color:#0A2E1A; line-height:1.08; letter-spacing:-0.02em; margin:0 0 16px; }
        .sm-display { font-family: var(--font-display, Georgia, serif); }
        .sm-outcomes { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .sm-capstone-cards { display:flex; gap:16px; }
        .sm-career-cards { display:flex; gap:16px; }
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
          .sm-career-cards { flex-direction:column; }
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
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#1A8C4E", marginBottom: 16 }}>
              <Link to="/courses" style={{ color: "#1A8C4E", textDecoration: "none" }}>Courses</Link>
              <ChevronRight size={12} />
              <span>Project Planner</span>
            </div>

            {/* Category badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              border: "1px solid rgba(10,46,26,0.18)", borderRadius: 50,
              padding: "4px 13px", fontSize: 10, fontWeight: 600,
              letterSpacing: "0.1em", color: "#1A8C4E", textTransform: "uppercase",
              background: "rgba(255,255,255,0.6)", marginBottom: 16,
            }}>
              Engineering
            </div>

            <h1 className="sm-title">Project Planner</h1>

            <p style={{ fontSize: 15, color: "#3d6b4f", lineHeight: 1.7, maxWidth: 520, marginBottom: 28 }}>
              Master Primavera P6, project scheduling and controls. Built for engineers, graduates, career changers and construction professionals entering the high-demand UK and global project planning job market.
            </p>

            {/* Stat pills */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
              {[
                { icon: <Clock size={14} color="#1A8C4E" />, text: "6 weeks" },
                { icon: <BarChart3 size={14} color="#1A8C4E" />, text: "Beginner – Intermediate" },
                { icon: <Users size={14} color="#1A8C4E" />, text: "Live cohort" },
                { icon: <Calendar size={14} color="#1A8C4E" />, text: "Saturdays 11am" },
                { icon: <Award size={14} color="#1A8C4E" />, text: "Certificate included" },
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

            {/* CTA row */}
            <div className="sm-cta-row" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Link to="/contact" className="sm-enrol-btn" style={{
                background: "#0A2E1A", color: "#fff", padding: "14px 32px",
                borderRadius: 8, fontSize: 14, fontWeight: 600, border: "none",
                cursor: "pointer", transition: "background 0.2s", textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}>
                Enrol Now <ArrowRight size={16} />
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
            <img
              src={plannerImg}
              alt="Project Planner programme"
              style={{
                width: "100%", aspectRatio: "4 / 3", borderRadius: 16,
                objectFit: "cover", marginBottom: 16,
                background: "linear-gradient(135deg, #0a1f3a, #1a4a7a, #2a3a0a)",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div style={{
              background: "#fff", borderRadius: 12,
              border: "1px solid rgba(10,46,26,0.08)", padding: "22px 24px",
            }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(10,46,26,0.4)" }}>
                Programme Fee
              </div>
              <div className="sm-display" style={{ fontSize: 22, fontWeight: 700, color: "#0A2E1A", margin: "6px 0" }}>
                Contact us for pricing
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#1A8C4E", fontWeight: 500 }}>
                <Check size={14} /> Scholarship available — up to 100% tuition coverage
              </div>
              <div style={{ borderTop: "1px solid rgba(10,46,26,0.06)", margin: "14px 0" }} />
              <div style={{ fontSize: 12, color: "#4a7a5a" }}>
                Flexible payment plans available.{" "}
                <Link to="/contact" style={{ color: "#1A8C4E", fontWeight: 600 }}>Talk to us</Link>
              </div>
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
            {OUTCOMES.map((o) => (
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
          <div style={{
            background: "rgba(0,245,160,0.08)",
            border: "1px solid rgba(0,245,160,0.18)",
            borderRadius: 10,
            padding: "16px 20px",
            marginTop: 24,
            fontSize: 13,
            color: "#0A5C2A",
            fontWeight: 500,
          }}>
            Classes run live every Saturday at 11:00am with ongoing support throughout the programme. Designed to fit around your work schedule.
          </div>
        </section>

        {/* CAREER SUPPORT */}
        <section className="sm-section" style={{ padding: "64px 48px", background: "#fff" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "#1A8C4E", fontWeight: 600, marginBottom: 10 }}>
            CAREER SUPPORT
          </div>
          <h2 className="sm-display" style={{ fontSize: 26, fontWeight: 700, color: "#0A2E1A", marginBottom: 8 }}>
            Built to get you hired
          </h2>
          <p style={{ fontSize: 14, color: "#4a7a5a", marginBottom: 28 }}>
            This programme doesn't just teach you the craft. It prepares you to land the role.
          </p>
          <div className="sm-career-cards">
            {CAREER.map((c) => (
              <div key={c.title} style={{
                background: "#EDF7F0",
                border: "1px solid rgba(10,46,26,0.08)",
                borderRadius: 12,
                padding: "22px 20px",
                flex: 1,
              }}>
                <div style={{ marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0A2E1A", marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: "#4a7a5a", lineHeight: 1.6 }}>{c.text}</div>
              </div>
            ))}
          </div>
        </section>

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
            Build a complete project schedule in Primavera P6 from scratch, including critical path analysis, baseline setup, progress updates and a final performance report ready for stakeholder presentation.
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
            {FAQS.map((f, i) => {
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
            Ready to plan your future?
          </div>
          <div style={{ fontSize: 13, color: "rgba(237,247,240,0.55)", marginTop: 4 }}>
            Project Planning is one of the highest-demand specialist careers in UK and global infrastructure. Limited cohort spots available.
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/contact" style={{
            background: "#00F5A0", color: "#0A2E1A", fontWeight: 600,
            padding: "12px 24px", borderRadius: 8, fontSize: 14, textDecoration: "none",
          }}>
            Enrol Now
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
