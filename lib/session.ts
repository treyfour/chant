import { auth0 } from "./auth0";
import { sql } from "./db";
import type { Collector, Hex } from "./types";

const AVATAR_COLORS = ["#8f6a45", "#3B5BA5", "#4A7C59", "#A8324A", "#2E7D7B", "#7B4B94"];

/**
 * The Auth0 user → our collector row.
 *
 * Two populations share one Auth0 tenant: collectors are plain users (this
 * function), sellers are Organization members. A collector's identity is the
 * same across every seller — that portability IS the product.
 *
 * Links by email so a coin claimed by the webhook BEFORE the user ever logged
 * in still belongs to them once they do.
 */
export async function currentCollector(): Promise<Collector | null> {
  try {
    return await resolveCollector();
  } catch (err) {
    // A collection page must never 500 because identity resolution failed —
    // it's the hero screen. Degrade to signed-out and keep the page up.
    console.error("currentCollector failed, treating as signed out:", err);
    return null;
  }
}

async function resolveCollector(): Promise<Collector | null> {
  const session = await auth0.getSession();
  if (!session?.user) return null;

  const sub = session.user.sub;
  const email = session.user.email;
  if (!sub || !email) return null;

  const bySub = await sql`SELECT * FROM collectors WHERE auth0_sub = ${sub} LIMIT 1`;
  if (bySub.length > 0) return toCollector(bySub[0]);

  // Claim an existing row created by a purchase made before first login.
  const byEmail = await sql`SELECT * FROM collectors WHERE email = ${email} LIMIT 1`;
  if (byEmail.length > 0) {
    const current = String(byEmail[0].handle);

    // Claiming upgrades `trey-8f2k` → `trey` if the clean name is free. This is
    // the reward for signing in, and it's why unclaimed handles are suffixed.
    let handle = current;
    const stem = current.replace(/-[a-z0-9]{4,6}$/, "");
    if (stem !== current) {
      const taken = await sql`
        SELECT 1 FROM collectors WHERE handle = ${stem} AND id <> ${byEmail[0].id} LIMIT 1`;
      if (taken.length === 0) handle = stem;
    }

    const linked = await sql`
      UPDATE collectors SET auth0_sub = ${sub}, handle = ${handle}
      WHERE id = ${byEmail[0].id} RETURNING *`;
    return toCollector(linked[0]);
  }

  const base = (email.split("@")[0] || "collector").replace(/[^a-z0-9]/gi, "").toLowerCase();
  const color = AVATAR_COLORS[base.length % AVATAR_COLORS.length];
  const handle = await freeHandle(base);

  const created = await sql`
    INSERT INTO collectors (id, auth0_sub, email, handle, name, avatar_color)
    VALUES (${`col_${sub.replace(/[^a-z0-9]/gi, "").slice(-10)}`}, ${sub}, ${email},
            ${handle}, ${session.user.name ?? base}, ${color})
    ON CONFLICT (email) DO UPDATE SET auth0_sub = EXCLUDED.auth0_sub
    RETURNING *`;
  return toCollector(created[0]);
}

/**
 * Handles are UNIQUE, and two different people can easily derive the same one
 * (trey@a.com and trey@b.com both want "trey"). `ON CONFLICT (email)` does NOT
 * cover that — a handle collision threw a 500 on /[handle] in production.
 *
 * Take the base if free, otherwise append the smallest free suffix.
 */
async function freeHandle(base: string): Promise<string> {
  const seed = base || "collector";
  for (let n = 0; n < 50; n++) {
    const candidate = n === 0 ? seed : `${seed}${n + 1}`;
    const taken = await sql`SELECT 1 FROM collectors WHERE handle = ${candidate} LIMIT 1`;
    if (taken.length === 0) return candidate;
  }
  return `${seed}${Math.floor(Math.random() * 90000 + 10000)}`;
}

function toCollector(r: Record<string, unknown>): Collector {
  return {
    id: String(r.id),
    handle: String(r.handle),
    name: String(r.name),
    avatarColor: String(r.avatar_color) as Hex,
    since: new Date(String(r.since)).toISOString(),
    isPublic: Boolean(r.is_public),
  };
}
