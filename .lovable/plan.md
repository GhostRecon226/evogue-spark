## Problem

On the home page "Our Courses" section, the "View Details" button on each course card navigates to `/courses` instead of the course detail page (e.g. `/courses/project-management-business-analysis`).

Cause: in `src/components/landing/Courses.tsx` line 136, the button uses an interpolated template string:

```tsx
<Link to={`/courses/${course.slug}`}>
```

TanStack Router is type-safe and matches `to` against known route patterns. The actual route is `/courses/$slug`, so the interpolated string doesn't match a registered route and the link falls back to `/courses`. The card image link directly above (line 94) already uses the correct pattern and works.

## Fix

Update the button's `<Link>` in `src/components/landing/Courses.tsx` to use the same param-based syntax used by the image link:

```tsx
<Link to="/courses/$slug" params={{ slug: course.slug }}>
  View Details <ArrowRight className="ml-1 h-4 w-4" />
</Link>
```

No other files or styles change. This fixes the button for all three featured courses (Project Management & Business Analysis, Scrum Master, Digital Marketing).
