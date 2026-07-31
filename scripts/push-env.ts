/**
 * Push .env to Vercel production, correctly.
 *
 * Two traps this avoids, both of which produced a silently-broken deploy:
 *
 *  1. Stripe Projects writes values wrapped in SINGLE QUOTES
 *     (`KEY='postgresql://...'`). dotenv strips those at runtime, so local dev
 *     works fine — but a naive shell read pushes the quotes verbatim and
 *     `neon()` rejects the string as an invalid URL.
 *
 *  2. `while IFS='=' read ... done < .env` puts .env on stdin, and
 *     `vercel env add` reads its value FROM stdin. They fight, and every
 *     variable lands empty while still reporting success.
 *
 *   npx tsx scripts/push-env.ts [https://your-deploy-url]
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const target = process.argv[2];

function parseEnv(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const raw of readFileSync(path, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    // strip one layer of surrounding quotes, single or double
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const vars = parseEnv(".env");
if (target) vars.APP_BASE_URL = target;

for (const [key, value] of Object.entries(vars)) {
  if (!value) {
    console.log(`  ⚠ ${key} — empty locally, skipped`);
    continue;
  }
  try {
    execFileSync("vercel", ["env", "rm", key, "production", "--yes"], { stdio: "ignore" });
  } catch {
    /* wasn't set yet */
  }
  try {
    // input: passes the value on stdin without any shell involvement
    execFileSync("vercel", ["env", "add", key, "production"], {
      input: value,
      stdio: ["pipe", "ignore", "ignore"],
    });
    console.log(`  ✓ ${key} (${value.length} chars)`);
  } catch (e) {
    console.log(`  ✗ ${key} — ${(e as Error).message.slice(0, 80)}`);
  }
}

console.log("\nverify with: vercel env pull /tmp/check.env --environment production --yes");
