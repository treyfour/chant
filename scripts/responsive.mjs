#!/usr/bin/env node
/**
 * THE RESPONSIVE CHECK.
 *
 *   npm run responsive
 *
 * The token guard is static: it reads source. It cannot see a coin squashed
 * into an ellipse or a button whose label overflows its own box, because those
 * only exist once a real browser has laid the page out at a real width.
 *
 * Three failures, each a rule worth never breaking:
 *
 *   1. ASPECT   an element that sets its own width AND height must render
 *               square-to-declaration. A flex child defaults to shrink:1 and
 *               compresses the MAIN axis only, so a circle becomes an ellipse
 *               and nothing warns you.
 *   2. OVERFLOW a control with a clamped height must not contain content
 *               taller than itself. Wrapping inside a fixed box reads as
 *               broken padding rather than as the layout problem it is.
 *   3. SPILL    nothing may exceed the viewport width. A horizontal scrollbar
 *               on a landing page is always a bug.
 *
 * Runs every theme at every breakpoint, because a restyle changes type sizes
 * and padding — which is exactly what pushes a label past its container.
 */

import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const WIDTHS = [390, 640, 768, 900, 1024, 1280, 1600];
const PAGES = [
  ["/s/warrick", ["brand", "ovation", "codedex", "mocha"]],
  ["/@trey", [null]],
  ["/app/plans", [null]],
  ["/demo", [null]],
];

const probe = () => {
  const problems = [];
  const seen = new Set();
  const add = (kind, what, detail) => {
    const k = `${kind}|${what}|${detail}`;
    if (!seen.has(k)) { seen.add(k); problems.push({ kind, what, detail }); }
  };

  // 1. ASPECT — self-sized elements must not be squashed
  //
  // NOT by comparing computed width to rendered width: getComputedStyle
  // returns the USED value, i.e. the already-shrunk one, so that comparison
  // can never fire. The first version of this check was written that way and
  // silently passed on the exact bug it existed to catch.
  //
  // Instead, apply `flex: none` and see whether the box changes. If it grows,
  // it was being compressed by its flex parent — which is the real condition,
  // measured rather than inferred.
  for (const el of document.querySelectorAll("*")) {
    const parent = el.parentElement;
    if (!parent) continue;
    const pd = getComputedStyle(parent).display;
    if (pd !== "flex" && pd !== "inline-flex") continue;

    const s = getComputedStyle(el);
    if (s.flexShrink === "0") continue;          // already opted out, fine
    if (s.width === "auto" || s.height === "auto") continue;

    const before = el.getBoundingClientRect();
    if (before.width < 8 || before.height < 8) continue;

    const prev = el.style.flex;
    el.style.flex = "none";
    const after = el.getBoundingClientRect();
    el.style.flex = prev;

    // Width recovered but height did NOT move => the element was DISTORTED.
    // Text under the same pressure reflows: it gets narrower and taller, and
    // that is correct behaviour, not a bug. Height holding still while width
    // gives is the signature of a fixed-aspect shape being crushed, and it is
    // the only case worth failing a build over.
    const widthRecovered = after.width - before.width > 1.5;
    const heightHeld = Math.abs(after.height - before.height) <= 1.5;
    if (widthRecovered && heightHeld) {
      add("ASPECT", el.className?.toString?.().slice(0, 34) || el.tagName,
        `distorted to ${before.width.toFixed(0)}x${before.height.toFixed(0)}, wants ${after.width.toFixed(0)}x${after.height.toFixed(0)} — needs shrink-0`);
    }
  }

  // 2. OVERFLOW — clamped-height controls whose content is taller
  for (const el of document.querySelectorAll("button, a, input, span, div")) {
    const s = getComputedStyle(el);
    if (s.height === "auto" || s.overflow !== "visible") continue;
    if (!/^(BUTTON|A|INPUT)$/.test(el.tagName)) continue;
    if (el.scrollHeight > el.clientHeight + 1) {
      add("OVERFLOW", (el.textContent || "").trim().slice(0, 26) || el.tagName,
        `content ${el.scrollHeight}px in a ${el.clientHeight}px box`);
    }
  }

  // 3. SPILL — nothing wider than the viewport
  const vw = document.documentElement.clientWidth;
  if (document.documentElement.scrollWidth > vw + 1) {
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 && r.width < vw * 1.6 && r.width > 24) {
        add("SPILL", (el.className?.toString?.() || el.tagName).slice(0, 34),
          `right edge ${r.right.toFixed(0)}px past a ${vw}px viewport`);
        break;
      }
    }
  }
  return problems;
};

const browser = await chromium.launch();
const page = await browser.newPage();
let failures = 0;

for (const [path, themes] of PAGES) {
  for (const theme of themes) {
    const url = `${BASE}${path}${theme ? `?t=${theme}` : ""}`;
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(url, { waitUntil: "networkidle" });
      const problems = await page.evaluate(probe);
      for (const p of problems) {
        console.log(`  ✗ ${w.toString().padStart(4)}px  ${path}${theme ? ` [${theme}]` : ""}  ${p.kind}  ${p.what} — ${p.detail}`);
        failures++;
      }
    }
  }
}

await browser.close();
console.log("");
if (failures) {
  console.log(`  ${failures} layout failure(s) across ${WIDTHS.length} widths\n`);
  process.exit(1);
}
console.log(`  ✓ no squashed shapes, no overflowing controls, no horizontal spill (${WIDTHS.length} widths × every theme)\n`);
