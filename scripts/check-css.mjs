#!/usr/bin/env node
/**
 * Compile src/styles.css through Vite's CSS pipeline (Lightning CSS) and
 * fail the build if any transform errors occur. Run before deploying to
 * catch issues like misplaced @import, unresolved package imports, or
 * invalid Tailwind v4 syntax that only surface at CSS build time.
 *
 * Usage: node scripts/check-css.mjs
 */
import { createServer } from "vite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const CSS_ENTRY = resolve(process.cwd(), "src/styles.css");

function fail(msg, err) {
  console.error("\n\u001b[31m✗ CSS build check failed\u001b[0m");
  console.error(msg);
  if (err?.stack) console.error(err.stack);
  else if (err) console.error(err);
  process.exit(1);
}

let server;
try {
  // Use Vite in middleware mode so we get the same CSS plugin chain
  // (Tailwind v4 + Lightning CSS) as `vite dev` without binding a port.
  server = await createServer({
    configFile: resolve(process.cwd(), "vite.config.ts"),
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    logLevel: "error",
  });

  const code = readFileSync(CSS_ENTRY, "utf8");
  const result = await server.transformRequest("/src/styles.css");

  if (!result || typeof result.code !== "string") {
    fail("Vite returned no transformed CSS for src/styles.css.");
  }

  // Lightning CSS errors are thrown above; if we got here the pipeline succeeded.
  console.log(
    `\u001b[32m✓ CSS compiled successfully\u001b[0m ` +
      `(${code.length} → ${result.code.length} bytes)`,
  );
  await server.close();
  process.exit(0);
} catch (err) {
  await server?.close().catch(() => {});
  const msg = err?.message || String(err);
  // Surface the most common Lightning CSS failure modes loudly so CI logs
  // make the root cause obvious.
  if (/lightningcss/i.test(msg) || /@import/i.test(msg)) {
    fail(
      "Lightning CSS / @import error detected in src/styles.css. " +
        "Check that @import rules come before any other rule and that all " +
        "imported packages are installed.",
      err,
    );
  }
  fail("Vite CSS transform failed.", err);
}
