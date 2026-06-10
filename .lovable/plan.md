## Vercel Deployment Configuration

### Problem
The project is configured for Cloudflare Workers by default (via `@lovable.dev/vite-tanstack-config`). When deploying to Vercel, this causes a 404 because Vercel expects Nitro's Build Output API v3 format with the `vercel` preset.

### Changes

1. **Update `vite.config.ts`**
   - Add `nitro` configuration with `preset: "vercel"`
   - Set `output.dir` to `.vercel/output`
   - Set `output.serverDir` to `.vercel/output/functions/__server.func`
   - Set `output.publicDir` to `.vercel/output/static`

2. **Create `vercel.json`** in the project root:
   - `buildCommand`: `npm run build`
   - `outputDirectory`: `.vercel/output`
   - `framework`: `null` (disables auto-detection so Vercel respects our config)

### Verification Step
After the changes are applied, run `npm run build` locally and confirm that `.vercel/output/` is generated containing `config.json`, `functions/`, and `static/`.

### Technical Details
The `@lovable.dev/vite-tanstack-config` wrapper accepts a top-level `nitro` key that merges into the underlying Nitro plugin configuration. This overrides the default Cloudflare preset without duplicating plugins. The `vercel.json` tells the Vercel platform where to find the build artifacts and which command to run.