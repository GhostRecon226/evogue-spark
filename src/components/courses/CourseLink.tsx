import { Link } from "@tanstack/react-router";
import type { ReactNode, CSSProperties } from "react";

/**
 * Slugs with their own dedicated course page under src/routes/courses.*.tsx.
 * Keep in sync with the file-based routes — every entry MUST exist as a
 * concrete route file so TanStack Router resolves a literal `to` path.
 */
export const COURSE_SLUGS = [
  "scrum-master",
  "digital-marketing",
  "product-management",
  "ai-for-professionals",
  "data-analysis",
  "cybersecurity",
  "virtual-assistant-programme",
  "project-management-business-analysis",
] as const;

export type CourseSlug = (typeof COURSE_SLUGS)[number];

export function isCourseSlug(slug: string): slug is CourseSlug {
  return (COURSE_SLUGS as readonly string[]).includes(slug);
}

type Props = {
  slug: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * Type-safe Link to a course's dedicated page. Using literal `to` paths
 * guarantees TanStack Router resolves the static route. Unknown slugs
 * render a plain anchor to `/courses/<slug>` so the router's 404
 * boundary handles them — we never silently redirect to `/courses`.
 */
export function CourseLink({ slug, className, style, children }: Props) {
  switch (slug) {
    case "scrum-master":
      return (
        <Link to="/courses/scrum-master" className={className} style={style}>
          {children}
        </Link>
      );
    case "digital-marketing":
      return (
        <Link to="/courses/digital-marketing" className={className} style={style}>
          {children}
        </Link>
      );
    case "product-management":
      return (
        <Link to="/courses/product-management" className={className} style={style}>
          {children}
        </Link>
      );
    case "ai-for-professionals":
      return (
        <Link to="/courses/ai-for-professionals" className={className} style={style}>
          {children}
        </Link>
      );
    case "data-analysis":
      return (
        <Link to="/courses/data-analysis" className={className} style={style}>
          {children}
        </Link>
      );
    case "cybersecurity":
      return (
        <Link to="/courses/cybersecurity" className={className} style={style}>
          {children}
        </Link>
      );
    case "virtual-assistant-programme":
      return (
        <Link to="/courses/virtual-assistant-programme" className={className} style={style}>
          {children}
        </Link>
      );
    case "project-management-business-analysis":
      return (
        <Link
          to="/courses/project-management-business-analysis"
          className={className}
          style={style}
        >
          {children}
        </Link>
      );
    default:
      return (
        <a href={`/courses/${slug}`} className={className} style={style}>
          {children}
        </a>
      );
  }
}
