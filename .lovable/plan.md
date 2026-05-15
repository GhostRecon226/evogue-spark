## Scope
Make navbar and footer inner rows span the full viewport width (logo far left, links/columns far right) while keeping page section content centered at 1280px.

## Files

**`src/components/landing/Navbar.tsx`** — line 49
- Replace `mx-auto flex h-20 md:h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8`
- With `flex h-20 md:h-24 w-full items-center justify-between px-4 sm:px-6 lg:px-8`

**`src/components/landing/Footer.tsx`** — line 29
- Replace `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16`
- With `w-full px-4 sm:px-6 lg:px-8 py-16`

## Not changed
- `PublicShell` — already has no max-width on the wrapper or `<main>`.
- Page sections (Home, About, Courses, Scholarship, Blog, Contact) — backgrounds already stretch full width; inner `mx-auto max-w-7xl` keeps text/cards centered at 1280px as requested.
- Login page — centered card layout by design; no full-width section to fix.
- No design, color, copy, or functional changes.
