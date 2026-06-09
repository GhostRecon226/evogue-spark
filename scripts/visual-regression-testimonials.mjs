#!/usr/bin/env node
/**
 * Visual regression check for the home page Testimonials section.
 *
 * Captures a screenshot of [data-testid="testimonials-section"] at three
 * breakpoints (mobile 320, mobile 390, tablet 768, desktop 1280) and
 * compares against the committed baselines in tests/visual/baseline/.
 *
 * Usage:
 *   node scripts/visual-regression-testimonials.mjs            # compare
 *   node scripts/visual-regression-testimonials.mjs --update   # write baselines
 *
 * Env:
 *   PREVIEW_URL  (default http://localhost:8080)
 *   DIFF_THRESHOLD  per-pixel diff ratio that fails the check (default 0.01 = 1%)
 *
 * Requires: playwright, pixelmatch, pngjs  (install on demand).
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BASELINE_DIR = join(ROOT, "tests/visual/baseline");
const ACTUAL_DIR = join(ROOT, "tests/visual/actual");
const DIFF_DIR = join(ROOT, "tests/visual/diff");

const PREVIEW_URL = process.env.PREVIEW_URL || "http://localhost:8080";
const THRESHOLD = Number(process.env.DIFF_THRESHOLD || 0.01);
const UPDATE = process.argv.includes("--update");

const VIEWPORTS = [
  { name: "mobile-320", width: 320, height: 900 },
  { name: "mobile-390", width: 390, height: 900 },
  { name: "tablet-768", width: 768, height: 900 },
  { name: "desktop-1280", width: 1280, height: 900 },
];

function ensureDeps() {
  try {
    await import("playwright");
  } catch {
    console.log("Installing playwright + pixelmatch + pngjs…");
    spawnSync("bun", ["add", "-d", "playwright", "pixelmatch", "pngjs"], {
      stdio: "inherit",
      cwd: ROOT,
    });
    spawnSync("npx", ["playwright", "install", "chromium"], {
      stdio: "inherit",
      cwd: ROOT,
    });
  }
}

async function main() {
  // dynamic imports after ensure
  let playwright, pixelmatch, PNG;
  try {
    playwright = await import("playwright");
    pixelmatch = (await import("pixelmatch")).default;
    PNG = (await import("pngjs")).PNG;
  } catch {
    console.log("Installing playwright + pixelmatch + pngjs…");
    spawnSync("bun", ["add", "-d", "playwright", "pixelmatch", "pngjs"], {
      stdio: "inherit",
      cwd: ROOT,
    });
    spawnSync("npx", ["playwright", "install", "chromium"], {
      stdio: "inherit",
      cwd: ROOT,
    });
    playwright = await import("playwright");
    pixelmatch = (await import("pixelmatch")).default;
    PNG = (await import("pngjs")).PNG;
  }

  [BASELINE_DIR, ACTUAL_DIR, DIFF_DIR].forEach(
    (d) => existsSync(d) || mkdirSync(d, { recursive: true })
  );

  const browser = await playwright.chromium.launch();
  const failures = [];

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.goto(PREVIEW_URL, { waitUntil: "networkidle" });
    const locator = page.locator('[data-testid="testimonials-section"]');
    await locator.waitFor({ state: "visible", timeout: 15000 });
    await page.evaluate(() => document.fonts?.ready);

    const buf = await locator.screenshot();
    const file = `testimonials-${vp.name}.png`;
    const baselinePath = join(BASELINE_DIR, file);
    const actualPath = join(ACTUAL_DIR, file);
    writeFileSync(actualPath, buf);

    if (UPDATE || !existsSync(baselinePath)) {
      writeFileSync(baselinePath, buf);
      console.log(`✓ baseline written: ${file}`);
      await ctx.close();
      continue;
    }

    const base = PNG.sync.read(readFileSync(baselinePath));
    const actual = PNG.sync.read(buf);
    if (base.width !== actual.width || base.height !== actual.height) {
      failures.push(
        `${file}: size mismatch baseline=${base.width}x${base.height} actual=${actual.width}x${actual.height}`
      );
      writeFileSync(join(DIFF_DIR, file), buf);
      await ctx.close();
      continue;
    }
    const diff = new PNG({ width: base.width, height: base.height });
    const mismatched = pixelmatch(
      base.data,
      actual.data,
      diff.data,
      base.width,
      base.height,
      { threshold: 0.1 }
    );
    const ratio = mismatched / (base.width * base.height);
    if (ratio > THRESHOLD) {
      writeFileSync(join(DIFF_DIR, file), PNG.sync.write(diff));
      failures.push(
        `${file}: ${(ratio * 100).toFixed(2)}% pixels differ (>${THRESHOLD * 100}%)`
      );
    } else {
      console.log(`✓ ${file} (${(ratio * 100).toFixed(3)}% diff)`);
    }
    await ctx.close();
  }

  await browser.close();

  if (failures.length) {
    console.error("\n✗ Visual regression failures:");
    failures.forEach((f) => console.error("  - " + f));
    console.error(`\nDiffs in ${DIFF_DIR}. Re-run with --update to accept.`);
    process.exit(1);
  }
  console.log("\nAll testimonials snapshots match baselines.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
