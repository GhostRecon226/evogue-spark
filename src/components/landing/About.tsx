import { Link } from "@tanstack/react-router";
import aboutImg from "@/assets/about-collaboration.jpg";

export function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-left">
        <span className="about-eyebrow">About Us</span>
        <h2 className="about-headline">
          Building the next generation of <em>global tech leaders</em>
        </h2>
        <p className="about-body">
          Evogue Academy was built with a simple belief: where you start should never limit how far
          you go. We pair ambitious learners from anywhere in the world with world-class
          practitioners who have shipped at the best companies. Every cohort is intentionally small
          so students get direct feedback, dedicated mentors, and a curriculum built around real
          industry briefs. Our mission is simple: produce graduates who are job-ready, confident,
          and globally competitive from day one.
        </p>
        <div className="about-stats">
          <div className="about-stat">
            <div className="about-stat-num">500+</div>
            <div className="about-stat-label">Students trained</div>
          </div>
          <div className="about-stat-divider" />
          <div className="about-stat">
            <div className="about-stat-num">30+</div>
            <div className="about-stat-label">Countries</div>
          </div>
          <div className="about-stat-divider" />
          <div className="about-stat">
            <div className="about-stat-num">94%</div>
            <div className="about-stat-label">Completion rate</div>
          </div>
        </div>
        <Link to="/about" className="about-cta">
          Learn more about us
        </Link>
      </div>
      <div className="about-right">
        <img
          src={aboutImg}
          alt="Diverse group of students collaborating around a laptop"
          width={1280}
          height={960}
          loading="lazy"
          className="about-image"
        />
        <div className="about-image-overlay" />
      </div>
    </section>
  );
}
