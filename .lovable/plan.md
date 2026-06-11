### Goal
Turn the existing Evogue Academy logo into a full favicon & PWA icon set and wire it into the site.

### Steps

1. **Generate a favicon-friendly square icon** from `src/assets/logo.png` using `imagegen--edit_image`. The logo is text-based, so the edit will create a simplified, square-format version that remains readable at 16×16 and 32×32.

2. **Batch-resize the generated icon** with a Python/PIL script into all standard sizes and save them to `public/`:
   - `favicon.ico` (multi-resolution: 16×16, 32×32)
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png` (180×180)
   - `android-chrome-192x192.png`
   - `android-chrome-512x512.png`

3. **Create `public/manifest.webmanifest`** with:
   - `name`: "Evogue Academy"
   - `short_name`: "Evogue"
   - `theme_color`: "#0A2E1A" (the site's dark green)
   - `background_color`: "#ffffff"
   - `display`: "standalone"
   - Icon references for 192×192 and 512×192

4. **Update `src/routes/__root.tsx`** head links/meta to include:
   - `<link rel="icon" type="image/x-icon" href="/favicon.ico">`
   - `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">`
   - `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">`
   - `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`
   - `<link rel="manifest" href="/manifest.webmanifest">`
   - `<meta name="theme-color" content="#0A2E1A">`

### No changes to
Navbar, footer, page content, routes, or auth logic.