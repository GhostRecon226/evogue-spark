## Evogue Academy Landing Site

A single-page, mobile-first landing site for an African product design & tech academy. Built on the existing TanStack Start + Tailwind v4 stack with a custom mint/forest design system, AI-generated hero, and working enrollment + contact forms backed by Lovable Cloud + Lovable Emails.

### Brand & design system
Define semantic tokens in `src/styles.css` using `oklch` equivalents of:
- `--primary` mint #00F5A0
- `--secondary` mid-green #1A8C4E
- `--dark` deep forest #0A2E1A (navbar/footer/dark sections)
- `--background` white, `--mint-tint` #F0FDF6 (hero + cards)
- Heading font: bold display (e.g. Sora/Space Grotesk); body: Inter/DM Sans
- Reusable gradient + shadow tokens for the enroll CTA section

All components consume tokens — no hardcoded hex in JSX.

### Logo
Waiting on the uploaded logo file. Once attached, it's used in the navbar (left) and footer. Until then I'll wire a placeholder slot so swapping in the file is one line.

### Page structure (single route: `/`)
Built as composable components under `src/components/landing/`:

1. **Navbar** — sticky, transparent → solid on scroll, hamburger drawer on mobile. Links: Home, Courses, Scholarship, About, Contact (in-page anchors). Dark "Enroll Now" pill button.
2. **Hero** — mint-tint background, large headline with mint/green accent words, two CTAs, AI-generated hero image of a designer sketching wireframes (generated with `imagegen` in brand palette).
3. **About Us** — centered "ABOUT US" eyebrow, heading with green accent, full-width academy image.
4. **Values/Features** — 3-paragraph mission, 3 icon feature cards (Practical Learning / Global Standards / Career Growth) using lucide icons, then 3 image cards with overlay labels.
5. **Courses** — 2-col responsive grid (1 col mobile). Product Design active with dark "View Details" CTA; the other 8 show "Coming Soon" with reduced opacity and disabled button.
6. **Testimonials** — 3 cards with mint quote icon, 5 orange stars, quote, named students.
7. **Enroll CTA** — full-width forest→mid-green gradient section, sparkle icon, white form card (Name, Email, WhatsApp +234 placeholder, Course dropdown), full-width mint submit button. Submits to a server route → enqueues a confirmation email to the applicant + notification email to academy.
8. **Contact** — 3 info cards (Email, WhatsApp, Location) on left, contact form on right. Submits via the same email pipeline.
9. **Footer** — dark, 4 columns + logo/tagline + socials + copyright.

SEO: route `head()` updated with proper title, meta description, OG tags, and the hero image as `og:image`. Single H1 in hero.

### Forms & email (Lovable Cloud + Lovable Emails)
- Enable Lovable Cloud.
- Set up Lovable email domain (will trigger the email setup dialog so you can attach a domain — required for sending).
- Tables `enrollment_inquiries` and `contact_messages` with strict RLS (insert-only from anon; select restricted) so submissions are persisted.
- Two React Email templates:
  - `enrollment-confirmation` — "Thanks {name}, we received your interest in {course}"
  - `contact-confirmation` — "Thanks {name}, we'll reply soon"
- Public server routes `/api/contact` and `/api/enroll` validate input with Zod, insert into Cloud, then enqueue the confirmation email to the user (and optionally a notification to an academy inbox you specify).
- Success/error feedback via toast.

### Responsiveness
Mobile-first: every section reflows to single column ≤640px, navbar collapses to a Sheet drawer, all buttons + inputs go full-width, hero typography uses fluid `clamp()`.

### Technical notes
- Stack: existing TanStack Start v1 + Tailwind v4 + shadcn/ui (already installed). No router/framework changes.
- New deps: none required beyond existing shadcn primitives + lucide-react.
- Hero + section imagery generated via `imagegen` and imported as ES6 assets.
- Form submit endpoints live under `src/routes/api/` (public, with rate-limit-friendly validation) since visitors aren't authenticated.

### Open items I'll need from you during build
- The logo image file (please attach in chat).
- Optional: an academy email address to receive enrollment + contact notifications (otherwise only the applicant receives a confirmation).
- Email sender domain — I'll trigger the setup dialog when we get there.
