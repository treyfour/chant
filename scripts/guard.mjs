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
  "app/theme.css",
  "app/brand.css",
  "app/theme-codedex.css",
  "app/theme-mocha.css",
  "lib/",
  "scripts/",
  // The gallery's entire purpose is showing real brand hexes dyed by the
  // theme. Flagging it would be flagging the test itself.
  "app/dev/themes/",
  // Chrome for JUDGING a theme. It must look identical no matter how radical
  // the candidate underneath is, so fixed values are the requirement here.
  "components/ThemeSwitcher.tsx",
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
  "components/ThemeSwitcher.tsx", // deliberately un-themed preview chrome
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

/* ============================================================
   PART TWO — IS THE THEME COMPLETE?

   The checks above prove nothing ESCAPED the tokens. They cannot prove the
   theme DEFINES them all, and a theme with a hole doesn't error — it silently
   inherits, so the three screens you happened to open look fine and the fourth
   is wearing the old value. That is the failure mode that makes people stop
   trusting a design system.

   The contract block in tokens.css is the source of truth. Adding a token
   there and forgetting to give it a value is now a build failure.
   ============================================================ */

const contractSrc = readFileSync(join(ROOT, "app/tokens.css"), "utf8");
const between = contractSrc.split("── BEGIN CONTRACT ──")[1]?.split("── END CONTRACT ──")[0];

if (!between) {
  console.log("  ✗ app/tokens.css  no BEGIN/END CONTRACT block — cannot verify the theme");
  failures++;
} else {
  const required = [...new Set(between.match(/--[a-z0-9-]+/g) ?? [])];

  // EVERY theme file, not just the shipping one. A candidate with holes is
  // worse than no candidate: you judge a direction on a render that is partly
  // some other theme showing through, and conclude the direction is wrong.
  const themeFiles = readdirSync(join(ROOT, "app"))
    .filter((f) => /^theme(-[a-z0-9]+)?\.css$/.test(f))
    .map((f) => `app/${f}`)
    .sort();

  let defined = new Set();
  for (const rel of themeFiles) {
    const themeSrc = readFileSync(join(ROOT, rel), "utf8");
    // `--name:` declarations only. A `var(--name)` reference is a USE, not a
    // definition — matching those would let a theme pass by mentioning a token.
    const here = new Set((themeSrc.match(/^\s*(--[a-z0-9-]+)\s*:/gm) ?? [])
      .map((d) => d.trim().replace(/\s*:$/, "")));
    if (rel === "app/theme.css") defined = here;

    const missing = required.filter((k) => !here.has(k));
    if (missing.length) {
      console.log(`  ✗ ${rel}  ${missing.length} token(s) in the contract with no value:`);
      for (const k of missing) console.log(`      ${k}`);
      failures += missing.length;
    }
  }
  console.log(`  · themes checked: ${themeFiles.join(", ")}`);

  /* ── PART THREE — IS EVERY TOKEN ACTUALLY READ? ─────────────────────
     The two checks above look in opposite directions and still miss the
     worst case: a token the theme defines and NOTHING consumes. It passes
     both — the theme has a value, no component leaks a literal — and it is
     invisible. You set it, nothing moves, and you cannot tell whether you
     chose badly or the wire was never connected. Found four of these the
     first time it ran, including --border, whose absence was most of why a
     2px-outline reference rendered as hairlines.

     Two ways a token counts as read:
       1. `var(--token)` somewhere in the app, or
       2. mapped in @theme inline, which makes Tailwind generate a utility
          for it (--color-accent -> bg-accent), so the reference is real
          even though no var() appears at the call site. */
  const consumers = [...walk(join(ROOT, "app")), ...walk(join(ROOT, "components"))]
    .filter((f) => !VALUE_FILES.some((v) => relative(ROOT, f).startsWith(v)))
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  const mapped = new Set((contractSrc.match(/var\((--[a-z0-9-]+)\)/g) ?? [])
    .map((m) => m.slice(4, -1)));

  const unread = required.filter((k) => !mapped.has(k) && !consumers.includes(`var(${k})`));
  if (unread.length) {
    console.log(`  ✗ ${unread.length} token(s) defined but never read — set them and nothing moves:`);
    for (const k of unread) console.log(`      ${k}`);
    failures += unread.length;
  }

  const extra = [...defined].filter((k) => !required.includes(k) && !k.startsWith("--font-instrument") && !k.startsWith("--font-plex"));
  if (extra.length) {
    console.log(`  ⚠ app/theme.css  ${extra.length} value(s) not in the contract — add them to tokens.css or nothing reads them:`);
    for (const k of extra) console.log(`      ${k}`);
    warnings += extra.length;
  }
}

console.log("");
if (failures) {
  console.log(`  ${failures} hard failure(s), ${warnings} warning(s)`);
  console.log("  The swap test is broken: a theme change will not reach these values.\n");
  process.exit(1);
}
console.log(`  ✓ swap test holds — nothing escapes the tokens, and the theme defines all ${
  (contractSrc.split("── BEGIN CONTRACT ──")[1]?.split("── END CONTRACT ──")[0].match(/--[a-z0-9-]+/g) ?? []).length
} of them (${warnings} warning(s))\n`);
