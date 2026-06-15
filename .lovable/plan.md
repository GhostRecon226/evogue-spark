## Goal
Replace the 5 imported local images on the home page with real Unsplash photographs matching the queries you provided, keeping all existing layout, sizing, border-radius, and aspect ratios intact.

## Images to replace

| # | File | Current import | Unsplash query |
|---|------|----------------|----------------|
| 1 | `src/components/landing/Hero.tsx` | `@/assets/hero-designer.jpg` | black woman smiling working laptop office professional |
| 2 | `src/components/landing/Values.tsx` | `@/assets/card-collaborative.jpg` | black and white people laughing working together laptop |
| 3 | `src/components/landing/Values.tsx` | `@/assets/card-handson.jpg` | diverse hands working desk documents planning |
| 4 | `src/components/landing/Values.tsx` | `@/assets/card-mentorship.jpg` | black man white woman professional mentorship conversation office |
| 5 | `src/components/landing/About.tsx` | `@/assets/about-collaboration.jpg` | diverse team african caucasian professionals meeting table |

## Approach
1. For each query, search Unsplash (via web search) and shortlist candidates. Skip anything that looks AI-generated, overly posed, or like a stock cliché. Pick the most natural-looking result.
2. Download the chosen photo, upload via `lovable-assets` CLI, and write the resulting `.asset.json` pointer into `src/assets/` (replacing the existing file). This keeps the existing import paths working — no component logic changes, just the underlying asset bytes.
3. Delete the original local `.jpg` (the `.asset.json` pointer takes its place) so the import resolves to the CDN URL.
4. Verify by viewing the home page in the preview after rebuild.

Nothing else on the page changes — no markup, classes, alt text edits, or layout tweaks.

## Confirm before I start
- OK to host the Unsplash photos on the Lovable CDN (recommended — fast, cached, survives Unsplash URL changes)? Alternative is referencing `images.unsplash.com` URLs directly in the components.
- Want me to show you my 5 picks (with thumbnails / Unsplash links) for approval before swapping, or just pick and swap in one go?
