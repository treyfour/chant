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
    const linked = await sql`
      UPDATE collectors SET auth0_sub = ${sub} WHERE id = ${byEmail[0].id} RETURNING *`;
    return toCollector(linked[0]);
  }

  const base = (email.split("@")[0] || "collector").replace(/[^a-z0-9]/gi, "").toLowerCase();
  const color = AVATAR_COLORS[base.length % AVATAR_COLORS.length];
  const created = await sql`
    INSERT INTO collectors (id, auth0_sub, email, handle, name, avatar_color)
    VALUES (${`col_${sub.replace(/[^a-z0-9]/gi, "").slice(-10)}`}, ${sub}, ${email},
            ${base}, ${session.user.name ?? base}, ${color})
    ON CONFLICT (email) DO UPDATE SET auth0_sub = EXCLUDED.auth0_sub
    RETURNING *`;
  return toCollector(created[0]);
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
