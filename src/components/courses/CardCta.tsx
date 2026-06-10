import { Link } from "@tanstack/react-router";
import { ArrowRight, Bell } from "lucide-react";

export type CourseCardLink = {
  slug: string;
  status: "live" | "soon";
};

/**
 * Renders the CTA link for a course card on /courses.
 * Uses literal `to` paths so TanStack Router's type-safe Link resolves each
 * route correctly (a dynamic `to={variable}` falls back to the parent route).
 */
export function CardCta({ card }: { card: CourseCardLink }) {
  const className = card.status === "live" ? "cc-cta cc-cta-live" : "cc-cta cc-cta-soon";
  const label =
    card.status === "live" ? (
      <>
        View Details <ArrowRight size={13} />
      </>
    ) : (
      <>
        <Bell size={13} /> Join Waitlist
      </>
    );

  if (card.status === "soon") {
    return (
      <Link to="/contact" className={className}>
        {label}
      </Link>
    );
  }
  switch (card.slug) {
    case "scrum-master":
      return (
        <Link to="/courses/scrum-master" className={className}>
          {label}
        </Link>
      );
    case "digital-marketing":
      return (
        <Link to="/courses/digital-marketing" className={className}>
          {label}
        </Link>
      );
    case "product-management":
      return (
        <Link to="/courses/product-management" className={className}>
          {label}
        </Link>
      );
    case "ai-for-professionals":
      return (
        <Link to="/courses/ai-for-professionals" className={className}>
          {label}
        </Link>
      );
    case "data-analysis":
      return (
        <Link to="/courses/data-analysis" className={className}>
          {label}
        </Link>
      );
    case "cybersecurity":
      return (
        <Link to="/courses/cybersecurity" className={className}>
          {label}
        </Link>
      );
    case "virtual-assistant-programme":
      return (
        <Link to="/courses/virtual-assistant-programme" className={className}>
          {label}
        </Link>
      );
    case "project-management-business-analysis":
      return (
        <Link to="/courses/project-management-business-analysis" className={className}>
          {label}
        </Link>
      );
    default:
      // Unknown slug: let the router resolve and hit the 404 boundary
      // (use a plain anchor because TanStack's typed Link can't express
      // an arbitrary unknown path).
      return (
        <a href={`/courses/${card.slug}`} className={className}>
          {label}
        </a>
      );
  }
}
