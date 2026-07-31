/**
 * One-off repair. Safe to re-run.
 *
 *   1. Deduplicate runs: the TREY_ITEMS seeding created a second Warrick
 *      "founding user" run alongside the real one, so Warrick showed twice.
 *      The real (webhook-claimed) coin wins; the seeded fixture is dropped.
 *   2. Point the @trey collector at a real address so Auth0 links to it.
 */

import "dotenv/config";
import { sql } from "../lib/db";

const REAL_EMAIL = "treyfour@gmail.com";

async function main() {
  // 1 ─ collapse duplicate runs (same seller + same run name)
  const dupes = await sql`
    SELECT seller_id, name, array_agg(id ORDER BY created_at) AS ids, count(*)::int AS n
    FROM runs GROUP BY seller_id, name HAVING count(*) > 1`;

  for (const d of dupes) {
    const ids = d.ids as string[];
    const keep = ids[0];
    for (const drop of ids.slice(1)) {
      // Move coins that don't collide on (run_id, serial); delete the rest.
      await sql`
        DELETE FROM coins c
        WHERE c.run_id = ${drop}
          AND EXISTS (SELECT 1 FROM coins k WHERE k.run_id = ${keep} AND k.serial = c.serial)`;
      await sql`UPDATE coins SET run_id = ${keep} WHERE run_id = ${drop}`;
      await sql`UPDATE plans SET run_id = ${keep} WHERE run_id = ${drop}`;
      await sql`DELETE FROM runs WHERE id = ${drop}`;
      console.log(`  merged ${drop} → ${keep} (${d.name})`);
    }
  }
  console.log(`✓ deduped ${dupes.length} run group(s)`);

  // 2 ─ real email, and clear auth0_sub so the next login re-links cleanly
  const updated = await sql`
    UPDATE collectors SET email = ${REAL_EMAIL}, auth0_sub = NULL
    WHERE handle = 'trey' RETURNING handle, email`;
  console.log(`✓ @${updated[0]?.handle} → ${updated[0]?.email}`);

  const [{ coins }] = await sql`
    SELECT count(*)::int AS coins FROM coins co
    JOIN collectors c ON c.id = co.collector_id WHERE c.handle = 'trey'`;
  const [{ runs }] = await sql`SELECT count(*)::int AS runs FROM runs`;
  console.log(`\n@trey now holds ${coins} coins across ${runs} runs`);
}

main().catch((e) => { console.error(e); process.exit(1); });
