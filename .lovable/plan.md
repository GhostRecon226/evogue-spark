## What's actually happening

Navigation IS working. The session replay confirms the URL and page metadata change to `/courses/digital-marketing` immediately after the click. The reason it *looks* like nothing happened:

- The user clicks "View Details" while scrolled partway down the `/courses` grid.
- TanStack's scroll restoration leaves the scroll Y position unchanged for the new route.
- At that scroll offset on the detail page, the user lands somewhere mid-FAQ or near the bottom dark CTA strip — visually similar enough to the courses page bottom that it reads as "same page."

Scroll restoration is enabled globally in `src/router.tsx`, but it doesn't auto-scroll-to-top on forward navigation between sibling routes the way users expect.

## Fix

Add a small scroll-to-top effect on route change so every forward navigation lands at the top of the new page. Two options:

1. **Global, one-liner (recommended).** In `src/routes/__root.tsx`, subscribe to router location changes via `useRouterState` and call `window.scrollTo(0, 0)` whenever the pathname changes (skip when the user is navigating back/forward, which should keep restored scroll).

2. **Per-page.** Add a `useEffect(() => window.scrollTo(0,0), [])` inside `CourseDetailTemplate` and `courses.$slug.tsx`'s component. Smaller blast radius but easier to forget on new pages.

I'll go with option 1 so it applies to every route (about, scholarship, blog, etc.) and is impossible to forget.

## Technical detail

```tsx
// src/routes/__root.tsx
import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

function ScrollToTop() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior }); }, [pathname]);
  return null;
}
```

Mount `<ScrollToTop />` inside the root component (alongside the existing `<Outlet />`).

## Out of scope

- No changes to the courses page links — those are already correct `<Link>` components pointing at real routes.
- No changes to detail page content, styling, or routing config.
- Nav, footer, and other pages untouched.