## Changes

**1. About Us image (`src/components/landing/About.tsx`)**
- Replace `@/assets/about-academy.jpg` import with a direct Unsplash URL of African students/professionals collaborating in a modern workspace (no text overlay).
- Candidate: `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1600&q=80` (diverse team in modern office).
- Update `alt` text accordingly.

**2. Tighten vertical spacing**
- `About.tsx`: section padding `py-20 sm:py-28` → `py-14 sm:py-20`; image margin `mt-14` → `mt-10`; heading `mt-4` stays; intro `mt-6` → `mt-5`.
- `Values.tsx`: section padding `py-20 sm:py-28` → `py-14 sm:py-20`; feature grid `mt-16` → `mt-12`; image cards `mt-8` stays.
- `Courses.tsx`: section padding `py-20 sm:py-28` → `py-14 sm:py-20`; grid `mt-12` → `mt-10`; heading intro `mt-4` stays.

**3. Testimonials gap (`Testimonials.tsx`)**
- Reduce gap between heading block and cards: `mt-14` → `mt-10` on the cards grid.
- Section padding `py-20 sm:py-28` → `py-14 sm:py-20` to match the tightened rhythm.

No business-logic or component-structure changes — purely presentational.
