/**
 * Put the database into demo-ready state. Run this before every rehearsal
 * and immediately before the real demo.
 *
 *   npx tsx scripts/reset-demo.ts
 *
 * - drops any test runs (anything not seeded)
 * - clears coins claimed during testing
 * - rewinds Warrick's founding run so the demo purchase lands on #35
 */

import "dotenv/config";
import { sql } from "../lib/db";

async function main() {
  // Runs we keep: the two real Warrick runs, plus the per-seller seeded ones.
  const keep = await sql`
    SELECT id FROM runs
    WHERE id IN ('run_founding', 'run_charter') OR id LIKE 'run\\_%\\_%'`;
  const keepIds = keep.map((r) => String(r.id));

  // 1 ─ drop coins claimed by webhook tests (seeded ones use stripe_event_id 'seed_%')
  const wiped = await sql`
    DELETE FROM coins WHERE stripe_event_id NOT LIKE 'seed_%' RETURNING id`;
  console.log(`  cleared ${wiped.length} test-claimed coin(s)`);

  // 2 ─ FK ORDER MATTERS: detach plans and delete dependent coins BEFORE the runs,
  //     or plans_run_id_fkey rejects the delete.
  await sql`UPDATE plans SET run_id = NULL WHERE run_id IS NOT NULL AND NOT (run_id = ANY(${keepIds}))`;
  await sql`DELETE FROM coins WHERE NOT (run_id = ANY(${keepIds}))`;
  const orphaned = await sql`
    DELETE FROM runs WHERE NOT (id = ANY(${keepIds})) RETURNING id, name`;
  for (const r of orphaned) console.log(`  dropped test run ${r.id} (${r.name})`);

  // 3 ─ @trey must hold NO Warrick coin, so the demo purchase is an arrival
  const wiped2 = await sql`
    DELETE FROM coins WHERE collector_id = (SELECT id FROM collectors WHERE handle='trey')
      AND seller_id = 'sel_warrick' RETURNING id`;
  if (wiped2.length) console.log(`  removed ${wiped2.length} pre-existing Warrick coin(s) from @trey`);

  // 4 ─ rewind so the demo purchase is #35
  await sql`UPDATE runs SET claimed = 34, retired = false WHERE id = 'run_founding'`;
  await sql`UPDATE runs SET claimed = 3, retired = false WHERE id = 'run_charter'`;

  // 5 ─ clear test activity noise
  await sql`DELETE FROM activity WHERE text LIKE '%early bird%' OR text LIKE '%Run <b>%'`;

  const [{ coins }] = await sql`SELECT count(*)::int AS coins FROM coins`;
  const [{ runs }] = await sql`SELECT count(*)::int AS runs FROM runs`;
  const [{ claimed }] = await sql`SELECT claimed FROM runs WHERE id = 'run_founding'`;
  console.log(`\nready — ${coins} coins, ${runs} runs, next Warrick purchase = #${Number(claimed) + 1}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
