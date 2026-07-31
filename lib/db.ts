/**
 * Postgres (Neon, provisioned via Stripe Projects).
 *
 * No ORM. The schema is here, inline, so a wrong assumption is caught by
 * reading twenty lines rather than by debugging a migration at hour six.
 */

import { neon } from "@neondatabase/serverless";

/**
 * Stripe Projects writes NEON_POSTGRES_CONNECTION_STRING, not DATABASE_URL.
 * Provider variable names are not published anywhere — this one came from
 * `stripe projects env --json` after provisioning. Do not guess these.
 */
const CONNECTION_STRING =
  process.env.NEON_POSTGRES_CONNECTION_STRING ?? process.env.DATABASE_URL;

if (!CONNECTION_STRING) {
  throw new Error(
    "NEON_POSTGRES_CONNECTION_STRING missing. Run: stripe projects env --pull",
  );
}

export const sql = neon(CONNECTION_STRING);

/**
 * Idempotent schema. Safe to run on every boot.
 *
 * The two guarantees that matter:
 *   1. coins.stripe_event_id UNIQUE  → Stripe redelivers webhooks at least once
 *   2. coins (run_id, serial) UNIQUE → two buyers can never share serial #35
 * Both are enforced by the database, not by application logic.
 */
export async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS sellers (
      id TEXT PRIMARY KEY,
      org_id TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      stage TEXT NOT NULL DEFAULT '',
      mark TEXT NOT NULL DEFAULT '●',
      tint TEXT NOT NULL DEFAULT '#C87137',
      stripe_account_id TEXT,
      ovation_tier TEXT NOT NULL DEFAULT 'starter',
      -- Where the coin points. A collectible with no way back to the company
      -- is decoration; with a link it's a promotional object that pays the
      -- seller back every time somebody browses a collection.
      website TEXT
    )`;
  await sql`ALTER TABLE sellers ADD COLUMN IF NOT EXISTS website TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS collectors (
      id TEXT PRIMARY KEY,
      auth0_sub TEXT UNIQUE,
      email TEXT UNIQUE NOT NULL,
      handle TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      avatar_color TEXT NOT NULL DEFAULT '#8f6a45',
      since TIMESTAMPTZ NOT NULL DEFAULT now(),
      is_public BOOLEAN NOT NULL DEFAULT true
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      seller_id TEXT NOT NULL REFERENCES sellers(id),
      plan_id TEXT NOT NULL,
      name TEXT NOT NULL,
      size INT NOT NULL CHECK (size > 0),
      claimed INT NOT NULL DEFAULT 0 CHECK (claimed >= 0 AND claimed <= size),
      glyph TEXT NOT NULL,
      tint TEXT NOT NULL,
      retired BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      seller_id TEXT NOT NULL REFERENCES sellers(id),
      stripe_product_id TEXT NOT NULL,
      stripe_price_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      price_label TEXT NOT NULL,
      unit_amount INT NOT NULL DEFAULT 0,
      interval TEXT NOT NULL DEFAULT 'month',
      subscriber_count INT NOT NULL DEFAULT 0,
      run_id TEXT REFERENCES runs(id)
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS coins (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES runs(id),
      seller_id TEXT NOT NULL REFERENCES sellers(id),
      collector_id TEXT NOT NULL REFERENCES collectors(id),
      serial INT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'owned',
      is_public BOOLEAN NOT NULL DEFAULT true,
      acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      stripe_event_id TEXT UNIQUE NOT NULL,
      UNIQUE (run_id, serial)
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS activity (
      id TEXT PRIMARY KEY,
      seller_id TEXT NOT NULL REFERENCES sellers(id),
      kind TEXT NOT NULL,
      text TEXT NOT NULL,
      actor_initial TEXT NOT NULL DEFAULT '?',
      actor_color TEXT NOT NULL DEFAULT '#a29a8c',
      at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

  await sql`CREATE INDEX IF NOT EXISTS coins_collector_idx ON coins (collector_id)`;
  await sql`CREATE INDEX IF NOT EXISTS coins_run_idx ON coins (run_id)`;
}
