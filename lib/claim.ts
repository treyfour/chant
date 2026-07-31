/**
 * The ONLY path by which a coin comes into existence.
 *
 * Called from the Stripe webhook. Not exported to any route a user can hit —
 * a coin without a payment must be unrepresentable.
 */

import { sql } from "./db";
import type { ClaimCoinInput, ClaimResult, Coin } from "./types";

const rid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 11)}`;

function rowToCoin(r: Record<string, unknown>): Coin {
  return {
    id: String(r.id),
    runId: String(r.run_id),
    sellerId: String(r.seller_id),
    collectorId: String(r.collector_id),
    serial: Number(r.serial),
    kind: r.kind as Coin["kind"],
    isPublic: Boolean(r.is_public),
    acquiredAt: new Date(String(r.acquired_at)).toISOString(),
    stripeEventId: String(r.stripe_event_id),
  };
}

/**
 * Claim the next serial in a run.
 *
 * Two distinct hazards, two distinct defences — do not conflate them:
 *
 *   1. CONCURRENCY. Two people subscribing in the same second must not both
 *      get #35. The UPDATE ... WHERE claimed < size RETURNING is atomic: Postgres
 *      row-locks the run, so exactly one caller can observe each value of
 *      `claimed`. No SELECT-then-UPDATE, which is where this normally breaks.
 *
 *   2. REDELIVERY. Stripe guarantees at-least-once, so the same event WILL
 *      arrive twice. `stripe_event_id UNIQUE` plus an upfront lookup makes a
 *      replay return the original coin instead of burning a second serial.
 */
export async function claimCoin(input: ClaimCoinInput): Promise<ClaimResult> {
  // (2) redelivery — cheap check before touching the run
  const existing = await sql`
    SELECT * FROM coins WHERE stripe_event_id = ${input.stripeEventId} LIMIT 1`;
  if (existing.length > 0) {
    return { status: "duplicate", coin: rowToCoin(existing[0]) };
  }

  const planRows = await sql`
    SELECT p.run_id, p.seller_id, r.retired, r.claimed, r.size
    FROM plans p LEFT JOIN runs r ON r.id = p.run_id
    WHERE p.stripe_price_id = ${input.stripePriceId}
       OR p.id = ${input.planId ?? ""}
    LIMIT 1`;

  const plan = planRows[0];
  if (!plan || !plan.run_id) return { status: "no_run" };
  if (plan.retired) return { status: "retired" };

  const collectorId = await upsertCollector(input.collectorEmail);

  // (1) concurrency — single atomic statement, guard in the WHERE clause
  const bumped = await sql`
    UPDATE runs SET claimed = claimed + 1
    WHERE id = ${plan.run_id} AND retired = false AND claimed < size
    RETURNING claimed, seller_id`;

  if (bumped.length === 0) return { status: "sold_out" };

  const serial = Number(bumped[0].claimed);
  const sellerId = String(bumped[0].seller_id);
  const id = rid("coin");

  try {
    const inserted = await sql`
      INSERT INTO coins (id, run_id, seller_id, collector_id, serial, kind, is_public, stripe_event_id)
      VALUES (${id}, ${plan.run_id}, ${sellerId}, ${collectorId}, ${serial},
              ${input.kind}, true, ${input.stripeEventId})
      RETURNING *`;

    await sql`
      INSERT INTO activity (id, seller_id, kind, text, actor_initial, actor_color)
      VALUES (${rid("ev")}, ${sellerId}, 'coin_claimed',
              ${`Coin <b>#${serial}</b> claimed`}, ${input.collectorEmail[0]?.toUpperCase() ?? "?"},
              '#8f6a45')`;

    return { status: "claimed", coin: rowToCoin(inserted[0]), serial };
  } catch (err) {
    // Insert failed after the counter moved — hand the serial back rather than
    // silently burning it. Only reachable on a UNIQUE race we already guard.
    await sql`UPDATE runs SET claimed = claimed - 1 WHERE id = ${plan.run_id} AND claimed > 0`;
    throw err;
  }
}

/** Collectors are created lazily by their first purchase; Auth0 links up in Slice 3. */
async function upsertCollector(email: string): Promise<string> {
  const found = await sql`SELECT id FROM collectors WHERE email = ${email} LIMIT 1`;
  if (found.length > 0) return String(found[0].id);

  const base = (email.split("@")[0] || "collector").replace(/[^a-z0-9]/gi, "").toLowerCase();
  const id = rid("col");
  const inserted = await sql`
    INSERT INTO collectors (id, email, handle, name)
    VALUES (${id}, ${email}, ${base + Math.floor(Math.random() * 900 + 100)}, ${base})
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id`;
  return String(inserted[0].id);
}
