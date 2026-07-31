/**
 * The only test in this project, because it's the only thing that can silently
 * corrupt the product: two buyers getting the same serial.
 *
 *   npx tsx scripts/test-race.ts
 */

import "dotenv/config";
import { claimCoin } from "../lib/claim";
import { sql } from "../lib/db";

const RUN = "run_founding";

async function reset(claimed: number) {
  await sql`DELETE FROM coins WHERE run_id = ${RUN}`;
  await sql`UPDATE runs SET claimed = ${claimed}, retired = false WHERE id = ${RUN}`;
}

async function main() {
  let failures = 0;
  const check = (label: string, pass: boolean, detail = "") => {
    console.log(`${pass ? "  ✓" : "  ✗"} ${label}${detail ? ` — ${detail}` : ""}`);
    if (!pass) failures++;
  };

  // ── 1. concurrency ────────────────────────────────────────
  console.log("\n1. Ten simultaneous buyers");
  await reset(34);
  const results = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      claimCoin({
        stripeEventId: `evt_race_${i}_${Date.now()}`,
        stripePriceId: "",
        planId: "plan_pro",
        collectorEmail: `racer${i}@example.com`,
        kind: "owned",
      }),
    ),
  );
  const serials = results.flatMap((r) => ("serial" in r ? [r.serial] : []));
  const unique = new Set(serials);
  check("all claims succeeded", serials.length === 10, `${serials.length}/10`);
  check("every serial unique", unique.size === serials.length,
    `${unique.size} unique of ${serials.length}`);
  check("serials are 35..44", [...unique].sort((a, b) => a - b).join(",") ===
    Array.from({ length: 10 }, (_, i) => 35 + i).join(","),
    [...unique].sort((a, b) => a - b).join(","));

  // ── 2. redelivery ─────────────────────────────────────────
  console.log("\n2. Stripe redelivers the same event");
  await reset(34);
  const evt = `evt_dup_${Date.now()}`;
  const first = await claimCoin({ stripeEventId: evt, stripePriceId: "", planId: "plan_pro",
    collectorEmail: "dup@example.com", kind: "owned" });
  const second = await claimCoin({ stripeEventId: evt, stripePriceId: "", planId: "plan_pro",
    collectorEmail: "dup@example.com", kind: "owned" });
  check("first claims", first.status === "claimed", first.status);
  check("second is duplicate, not a new coin", second.status === "duplicate", second.status);
  const [{ claimed }] = await sql`SELECT claimed FROM runs WHERE id = ${RUN}`;
  check("counter moved exactly once", Number(claimed) === 35, `claimed=${claimed}`);

  // ── 3. sold out ───────────────────────────────────────────
  console.log("\n3. Run is full");
  await reset(50);
  const full = await claimCoin({ stripeEventId: `evt_full_${Date.now()}`, stripePriceId: "",
    planId: "plan_pro", collectorEmail: "late@example.com", kind: "owned" });
  check("returns sold_out", full.status === "sold_out", full.status);

  // ── 4. retired ────────────────────────────────────────────
  console.log("\n4. Run retired early");
  await reset(10);
  await sql`UPDATE runs SET retired = true WHERE id = ${RUN}`;
  const dead = await claimCoin({ stripeEventId: `evt_ret_${Date.now()}`, stripePriceId: "",
    planId: "plan_pro", collectorEmail: "late2@example.com", kind: "owned" });
  check("returns retired", dead.status === "retired", dead.status);

  // leave the db demo-ready: next real purchase lands on #35
  await reset(34);
  console.log("\nreset — next purchase will be #35");
  console.log(failures === 0 ? "\nALL PASS\n" : `\n${failures} FAILED\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
