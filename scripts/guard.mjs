#!/usr/bin/env node
/**
 * THE SWAP TEST, ENFORCED.
 *
 *   npm run guard
 *
 * A design system is only real if you can swap the token file and have the
 * whole app change. That property decays the moment somebody writes a raw
 * value, and nothing catches it — the app still looks fine, it just stops
 * being themeable. Six weeks later you can't re-skin anything.
 *
 * So: fail on raw hex, raw px and raw font names outside the files that are
 * ALLOWED to contain values. Warnings for inline `style={{}}`, which is
 * sometimes legitimate (computed sizes, dynamic transforms) but usually drift.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

/**
 * Only these may contain literal values. Everything else consumes tokens.
 *
 * `lib/` is excluded wholesale and that's deliberate — it is data and server
 * code, not the UI layer:
 *   yc.ts / mocks.ts   each seller's real brand hex IS the data
 *   session.ts         avatar palette, assigned per user, not themed
 *   db.ts              SQL DEFAULT values in the schema
 *   email.ts           HTML email, where CSS variables do not resolve at all —
 *                      mail clients need literal hex or the text is invisible
 *
 * The guard protects the themeable surface. Applying it to data would just
 * teach people to silence it.
 */
const VALUE_FILES = [
  "app/tokens.css",
  "app/themes.css",
  "lib/",
  "scripts/",
  // The gallery's entire purpose is showing real brand hexes dyed by the
  // theme. Flagging it would be flagging the test itself.
  "app/dev/themes/",
];

/**
 * Where inline style is the correct answer, not drift.
 *
 * A primitive's job is turning props into computed style — an avatar's colour
 * comes off a database row, a meter's width off a fraction, a grid's template
 * off how many coins fit. Those values MUST NOT move when a theme changes, and
 * concentrating them here is what keeps every call site clean. Everywhere else,
 * an inline style means somebody reached past the primitives.
 */
const ALLOW_INLINE = [
  "components/ui/",               // the primitive layer — props in, style out
  "components/Coin.tsx",          // size is an input; the glyph scales from it
  "app/dev/themes/page.tsx",      // the gallery deliberately shows real hexes
];

const RULES = [
  { id: "raw-hex", re: /#[0-9a-fA-F]{6}\b/g, msg: "raw hex colour — use a token" },
  { id: "raw-px", re: /\[[0-9]+(?:\.[0-9]+)?px\]/g, msg: "raw px — use --space-* or --text-*" },
  // This one matches on the untouched line: its own lookahead already lets
  // `var(--font-*)` through, and stripping vars first would leave `font: ""`.
  { id: "font-name", re: /font(?:Family)?:\s*["'](?!var\()/g, raw: true, msg: "literal font name — use var(--font-*)" },
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|css)$/.test(name)) out.push(full);
  }
  return out;
}

const files = [...walk(join(ROOT, "app")), ...walk(join(ROOT, "components")), ...walk(join(ROOT, "lib"))];

let failures = 0;
let warnings = 0;

for (const full of files) {
  const rel = relative(ROOT, full);
  if (VALUE_FILES.some((v) => rel.startsWith(v))) continue;

  const src = readFileSync(full, "utf8");
  const lines = src.split("\n");

  for (const rule of RULES) {
    lines.forEach((line, i) => {
      // Strip the var() references and check what's LEFT. Skipping the whole
      // line because it mentions a token was the old behaviour, and it hid 14
      // raw pixel values — almost every line touches a token somewhere.
      const bare = rule.raw ? line : line.replace(/var\([^)]*\)/g, "");
      const hits = bare.match(rule.re);
      if (!hits) return;
      console.log(`  ✗ ${rel}:${i + 1}  ${rule.msg}  →  ${hits[0]}`);
      failures++;
    });
  }

  if (!ALLOW_INLINE.some((a) => rel.startsWith(a))) {
    const inline = (src.match(/style=\{\{/g) ?? []).length;
    if (inline > 0) {
      console.log(`  ⚠ ${rel}  ${inline} inline style block(s) — prefer a primitive`);
      warnings += inline;
    }
  }
}

console.log("");
if (failures) {
  console.log(`  ${failures} hard failure(s), ${warnings} warning(s)`);
  console.log("  The swap test is broken: a theme change will not reach these values.\n");
  process.exit(1);
}
console.log(`  ✓ swap test holds — no raw values outside the token files (${warnings} warning(s))\n`);
