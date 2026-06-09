## Problem

On `/courses`, clicking "View Details" (or "Join Waitlist") on any of the 7 course cards navigates back to `/courses` instead of the dedicated detail page (e.g. `/courses/scrum-master`, `/courses/digital-marketing`).

Cause: in `src/routes/courses.tsx` lines 204 and 208, the card CTA renders:

```tsx
<Link to={c.href as string} ...>View Details</Link>
```

TanStack Router's `<Link to>` is type-safe and resolved against the registered route tree. A dynamic, casted string variable does not match a known route literal at runtime, so the link falls back to the current route (`/courses`).

This is the same bug pattern fixed earlier on the home page's `Courses` component. All dedicated route files exist (`courses.scrum-master.tsx`, `courses.digital-marketing.tsx`, `courses.product-management.tsx`, `courses.ai-for-professionals.tsx`, `courses.data-analysis.tsx`, plus `/contact` for the "Coming Soon" cards) — they just aren't being reached through these cards.

## Fix

In `src/routes/courses.tsx`, replace the single dynamic `<Link>` with a small render helper that switches on the card's slug and returns a `<Link>` with a **literal** `to` path for each course. "Coming Soon" cards keep their `<Link to="/contact">`.

Shape:

```tsx
function CardCta({ card }: { card: CourseCard }) {
  const className = card.status === "live" ? "cc-cta cc-cta-live" : "cc-cta cc-cta-soon";
  const label = card.status === "live"
    ? (<>View Details <ArrowRight size={13} /></>)
    : (<><Bell size={13} /> Join Waitlist</>);

  if (card.status === "soon") {
    return <Link to="/contact" className={className}>{label}</Link>;
  }
  switch (card.slug) {
    case "scrum-master":
      return <Link to="/courses/scrum-master" className={className}>{label}</Link>;
    case "digital-marketing":
      return <Link to="/courses/digital-marketing" className={className}>{label}</Link>;
    case "product-management":
      return <Link to="/courses/product-management" className={className}>{label}</Link>;
    case "ai-for-professionals":
      return <Link to="/courses/ai-for-professionals" className={className}>{label}</Link>;
    case "data-analysis":
      return <Link to="/courses/data-analysis" className={className}>{label}</Link>;
    default:
      return <Link to="/courses" className={className}>{label}</Link>;
  }
}
```

Then in the grid, replace the existing inline `<Link>` block with `<CardCta card={c} />`.

Nothing else changes — no styling, no copy, no other pages touched. The home page card fix from the previous turn already uses the correct `to="/courses/$slug" params={{ slug }}` shape and continues to work.

## Verification

After the edit, click each "View Details" on `/courses` and confirm the URL changes to the dedicated page (e.g. `/courses/digital-marketing`) and the dedicated page content renders.
