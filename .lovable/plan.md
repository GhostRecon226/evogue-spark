## Problem

Five homepage images are 404ing from the CDN:

- `hero-designer.jpg` (Hero)
- `card-collaborative.jpg`, `card-handson.jpg`, `card-mentorship.jpg` (Values section)
- `about-collaboration.jpg` (About section)

The `.asset.json` pointer files in `src/assets/` still reference asset IDs that no longer resolve on the CDN (likely purged), and the original binaries were removed from the repo during the earlier asset migration, so the components render empty `<img>` tags.

Course cards on the homepage use Unsplash URLs and are loading fine — not affected.

## Fix

Regenerate the 5 images and re-upload them as fresh CDN assets, overwriting each existing `.asset.json` pointer. Components don't need to change — they already import the pointer files.

Steps:

1. Generate 5 replacement images at appropriate aspect ratios with prompts matching the current alt text (designer sketching on tablet; diverse students collaborating around laptop; collaborative learning; hands-on projects; industry mentorship).
2. For each, run `lovable-assets create --file <generated.jpg>` and overwrite the matching `.asset.json` in `src/assets/` with the new pointer.
3. Verify in a headless browser load of `/` that all five images return 200 and have non-zero natural dimensions.

No component code, routes, or styles change. Only the 5 `.asset.json` pointer files are rewritten.
