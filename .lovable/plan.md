## Root cause

`evogueacademy.com` is hosted on **Vercel** (`Server: Vercel`, Vercel IPs). The Lovable-managed deployment at `evogue-spark.lovable.app` is hosted on Lovable's own infrastructure, which serves both the app *and* the `/__l5e/assets-v1/...` CDN path.

Vercel does not proxy `/__l5e/` to Lovable's CDN, so every image stored as a Lovable Asset returns **404** on the custom domain:

```
GET https://evogueacademy.com/__l5e/assets-v1/.../hero-designer.jpg → 404 (Vercel)
GET https://evogue-spark.lovable.app/__l5e/assets-v1/.../hero-designer.jpg → 200 (Lovable)
```

Affected images on the custom domain right now:
- `hero-designer.jpg` (hero)
- `card-collaborative.jpg`, `card-handson.jpg`, `card-mentorship.jpg` (values cards)
- `about-collaboration.jpg` (about section)

## Fix 1 — Immediate: stop depending on `/__l5e/` for site images

Move the five `.jpg` files currently stored as Lovable Assets back into the repo under `public/images/` so they ship with the Vercel build and resolve at `/images/<name>.jpg` on any host (Vercel, Lovable, custom domain).

Steps:
1. Download each binary from its CDN URL into `public/images/`.
2. Update each consumer to import the local path instead of the `.asset.json` pointer:
   - `src/components/landing/Hero.tsx` → `hero-designer.jpg`
   - `src/components/landing/Values.tsx` → three card images
   - `src/components/landing/About.tsx` → `about-collaboration.jpg`
3. Delete the now-unused `.asset.json` pointer files via the `delete_asset` tool so the CDN copies are also cleaned up.
4. Also remove the `<link rel="preload" as="image" href="/__l5e/assets-v1/.../hero-designer.jpg">` tag in `src/routes/__root.tsx` (or repoint it to the new `/images/hero-designer.jpg` path) so the preload doesn't 404 on the custom domain.
5. Verify on `evogue-spark.lovable.app` (regression check) and, after you redeploy to Vercel, on `evogueacademy.com`.

This fixes the symptom on every host today. No other code or layout changes.

## Fix 2 — Decide where the custom domain should actually live

`evogueacademy.com` is currently on Vercel. That is your choice and there's nothing wrong with it, but it has two implications:

- **Lovable Assets are not reachable from it.** Fix 1 above sidesteps that by moving images into `public/`. Any *new* image must also live in `public/` (or any external CDN you control), not in Lovable Assets, as long as you're on Vercel.
- **Server features behave differently.** Server functions, edge routes, and webhooks are designed for the Lovable runtime. They may still work on Vercel, but they're not the supported path.

You have two paths. Pick one:

### Option A — Stay on Vercel
- Keep the current Vercel setup.
- Treat `public/` (or external storage) as the only place for binary assets. Stop using Lovable Assets for this project.
- After Fix 1, the custom domain renders correctly. No further action.

### Option B — Move the custom domain to Lovable
- In your DNS provider, repoint `evogueacademy.com` and `www.evogueacademy.com` A records from Vercel's IPs to Lovable's `185.158.133.1`.
- Add the `_lovable` TXT verification record.
- Connect the domain in Project Settings → Domains and wait for SSL.
- This gives you Lovable's full feature set on the custom domain, including `/__l5e/` assets. Fix 1 is still nice-to-have (smaller bundle of CDN round-trips) but no longer strictly required.

I'll wait for your pick before doing anything on Fix 2. Fix 1 is safe to run regardless.

## Technical notes

- Files touched in Fix 1:
  - `public/images/hero-designer.jpg` (new, ~172 KB)
  - `public/images/card-collaborative.jpg`, `card-handson.jpg`, `card-mentorship.jpg` (new)
  - `public/images/about-collaboration.jpg` (new)
  - `src/components/landing/Hero.tsx` (swap import for `"/images/hero-designer.jpg"` string)
  - `src/components/landing/Values.tsx`
  - `src/components/landing/About.tsx`
  - `src/routes/__root.tsx` (preload tag)
- Deletes: `src/assets/hero-designer.jpg.asset.json`, `card-collaborative.jpg.asset.json`, `card-handson.jpg.asset.json`, `card-mentorship.jpg.asset.json`, `about-collaboration.jpg.asset.json` (via `delete_asset`).
- Vercel automatically serves anything under `public/` at the URL root, so `public/images/hero-designer.jpg` becomes `/images/hero-designer.jpg` with no build config change.
- After Fix 1 lands, you must re-deploy to Vercel for the custom domain to pick up the change. Pushing to `lovable.app` is separate.

Switch to build mode when you want me to execute Fix 1.
