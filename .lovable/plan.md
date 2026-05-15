
Two surgical edits in `src/routes/contact.tsx`. No copy, color, field, or other-page changes.

## 1. Left panel width

Currently: `w-full md:w-[360px] lg:w-[480px]` with `md:flex-shrink-0`.

Change to: `w-full md:w-[380px] lg:w-[480px]` and add `lg:min-w-[480px]` so flex never shrinks it below the spec.

- Tablet (768–1023px): 380px (per request)
- Desktop (≥1024px): 480px, locked
- Mobile: full width (unchanged)

This gives the headline room to breathe and removes the cramped 3-line break.

## 2. Right panel vertical centering

Current right `<section>` already uses `flex flex-col justify-center`, but vertical-padding is asymmetric in feel because:
- the form's inner container has no top spacer, and
- the eyebrow sits flush to the top of the form block, so when the row stretches to match the (taller) left panel, the form appears low.

Fix:
- Keep `justify-center` on the section.
- Normalize vertical padding to `py-12` (48px) at every breakpoint instead of `lg:py-16`, matching the spec's `padding-top: 48px; padding-bottom: 48px`.
- Remove the `mt-8` on the `<form>` and rely on consistent spacing from the header block, so the visual center matches the geometric center.

After this the form's midpoint aligns with the panel's midpoint at 1180px (current viewport) and at all desktop sizes.

## Files touched

- `src/routes/contact.tsx` — two class-string edits on the `<aside>` and `<section>` plus removing one `mt-8`.

Nothing else changes — no copy, no colors, no fields, no other routes, no global CSS.
