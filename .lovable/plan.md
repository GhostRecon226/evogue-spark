## Scope
Two small CSS-only fixes on `src/routes/scholarship.tsx`. No other files, no functionality changes.

## Fix 1 — Tighten closing CTA spacing
In Section 5 (the dark green `#0A2E1A` "Scholarship not the right fit?" block):
- Reduce section vertical padding from `py-16 sm:py-20` to `py-12`.
- Reduce subtext top margin from `mt-5` to `mt-4` (16px).
- Reduce button top margin from `mt-8` to `mt-6` (24px).

This keeps every gap ≤ 24px so the heading, paragraph, and "Let's talk" button sit close together.

## Fix 2 — Remove whitespace below the footer
Section 5 currently uses `py-16 sm:py-20` which adds bottom padding inside the dark green band itself — that's already covered by Fix 1. The footer sits flush after it (no margin in `PublicShell`). 

To guarantee no white gap appears below the footer on the Scholarship page specifically, scope the fix to this route only (avoid touching `PublicShell` / `Footer` which are shared):
- Wrap the page so the closing CTA is the last element with no trailing margin. Already true — no extra element exists after Section 5.
- The visible "white space below the footer" the user sees is the browser's default page background showing through if the page is shorter than the viewport. Since the Scholarship page is long, this should not occur — but to be safe, no change needed beyond Fix 1's reduced padding which removes excess dark-green space that may have been mistaken for whitespace.

If after Fix 1 there is still visible whitespace below the footer, the cause is elsewhere (PublicShell `min-h-screen flex flex-col` + `flex-1` on `<main>` should already prevent it). I'll verify with a screenshot after applying Fix 1 and only then touch shared layout if needed.

## Files changed
- `src/routes/scholarship.tsx` — Section 5 only (3 className tweaks).
