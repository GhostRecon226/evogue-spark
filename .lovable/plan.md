## What I found
- I could not find any remaining hardcoded singular `/course` links in the current source.
- The current preview and the published site both route the visible `/courses` CTAs correctly to dedicated URLs such as:
  - `/courses/scrum-master`
  - `/courses/digital-marketing`
  - `/courses/product-management`
- Dedicated static route files already exist for the course pages under `src/routes/`.

## Likely root cause
The app currently has **two parallel course-detail systems**:
1. **Dedicated static course pages** like `src/routes/courses.scrum-master.tsx`, `src/routes/courses.digital-marketing.tsx`, etc.
2. A **generic dynamic fallback page** at `src/routes/courses.$slug.tsx`, fed by `src/lib/courses-data.ts`.

That duplication is the deeper issue. Different parts of the app can still point into different routing/data systems, which makes course navigation inconsistent and can make the app behave like it is using a generic course page instead of the intended dedicated page.

## Implementation plan
1. **Audit every course entry point**
   - Check homepage featured-course cards, `/courses`, dashboard course links, and any other CTA that leads into course details.
   - Build a single map of which slug each entry point should open.

2. **Unify routing around dedicated pages**
   - Point all live-course CTAs to the dedicated static course routes.
   - Keep waitlist courses pointing to `/contact` only where intended.
   - Remove or narrow generic fallback behavior so it does not compete with dedicated course pages.

3. **Resolve slug/data mismatches**
   - Compare `src/lib/courses-data.ts` slugs with the dedicated route filenames.
   - Fix mismatches and outdated course definitions so all navigation sources agree.

4. **Expand regression tests**
   - Keep the existing `/courses` CTA tests.
   - Add tests for other entry points, especially the homepage featured cards and any dashboard course links that should land on dedicated course pages.

5. **Re-verify in both environments**
   - Validate the fixed routes in preview and published output on desktop and mobile.

## Technical notes
Relevant files to align:
- `src/routes/courses.tsx`
- `src/components/courses/CardCta.tsx`
- `src/components/landing/Courses.tsx`
- `src/routes/courses.$slug.tsx`
- `src/lib/courses-data.ts`
- Dedicated route files under `src/routes/courses.*.tsx`

This plan focuses on eliminating the duplicate routing paths that are most likely causing the persistent inconsistency.