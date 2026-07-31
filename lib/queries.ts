import { sql } from "./db";
import type { CollectionView, Hex, SellerPublicView } from "./types";

export async function getCollection(handle: string): Promise<CollectionView | null> {
  const cs = await sql`SELECT * FROM collectors WHERE handle = ${handle} LIMIT 1`;
  if (cs.length === 0) return null;
  const c = cs[0];

  const rows = await sql`
    SELECT co.id, co.serial, co.kind, co.is_public, co.acquired_at,
           r.name AS run_name, r.size, r.glyph, r.tint, r.retired,
           s.slug, s.name AS seller_name
    FROM coins co
    JOIN runs r ON r.id = co.run_id
    JOIN sellers s ON s.id = co.seller_id
    WHERE co.collector_id = ${c.id}
    ORDER BY co.acquired_at DESC`;

  const items = rows.map((r) => ({
    coinId: String(r.id),
    sellerSlug: String(r.slug),
    sellerName: String(r.seller_name),
    runName: String(r.run_name),
    serial: Number(r.serial),
    size: Number(r.size),
    glyph: String(r.glyph),
    tint: String(r.tint) as Hex,
    kind: r.kind as "owned" | "backed",
    isPublic: Boolean(r.is_public),
    retired: Boolean(r.retired),
    acquiredAt: new Date(String(r.acquired_at)).toISOString(),
  }));

  return {
    collector: {
      id: String(c.id),
      handle: String(c.handle),
      name: String(c.name),
      avatarColor: String(c.avatar_color) as Hex,
      since: new Date(String(c.since)).toISOString(),
      isPublic: Boolean(c.is_public),
    },
    items,
    stats: {
      coins: items.length,
      sellers: new Set(items.map((i) => i.sellerSlug)).size,
      privateCount: items.filter((i) => !i.isPublic).length,
    },
  };
}

/**
 * Which sellers a collector already holds a coin from.
 *
 * Drives the faded "new to you" cells when you browse someone else's collection.
 * That contrast is the entire discovery mechanic — without it their collection
 * is just a nice grid, with it it's a list of leads.
 */
export async function sellerSlugsHeldBy(collectorId: string): Promise<Set<string>> {
  const rows = await sql`
    SELECT DISTINCT s.slug FROM coins co
    JOIN sellers s ON s.id = co.seller_id
    WHERE co.collector_id = ${collectorId}`;
  return new Set(rows.map((r) => String(r.slug)));
}

export async function getSellerPublic(slug: string): Promise<SellerPublicView | null> {
  const ss = await sql`SELECT * FROM sellers WHERE slug = ${slug} LIMIT 1`;
  if (ss.length === 0) return null;
  const s = ss[0];

  const planRows = await sql`
    SELECT p.*, r.name AS run_name, r.size, r.claimed, r.glyph AS run_glyph,
           r.tint AS run_tint, r.retired
    FROM plans p LEFT JOIN runs r ON r.id = p.run_id
    WHERE p.seller_id = ${s.id}
    ORDER BY p.unit_amount ASC`;

  const collectors = await sql`
    SELECT DISTINCT c.handle, c.name, c.avatar_color
    FROM coins co JOIN collectors c ON c.id = co.collector_id
    WHERE co.seller_id = ${s.id} AND co.is_public = true
    LIMIT 8`;

  const [{ total }] = await sql`
    SELECT count(*)::int AS total FROM coins WHERE seller_id = ${s.id}`;

  return {
    seller: {
      id: String(s.id), orgId: String(s.org_id), slug: String(s.slug), name: String(s.name),
      tagline: String(s.tagline), location: String(s.location), stage: String(s.stage),
      mark: String(s.mark), tint: String(s.tint) as Hex,
      stripeAccountId: s.stripe_account_id ? String(s.stripe_account_id) : null,
      ovationTier: s.ovation_tier as "starter" | "studio" | "scale",
    },
    plans: planRows.map((p) => ({
      id: String(p.id), sellerId: String(p.seller_id),
      stripeProductId: String(p.stripe_product_id), stripePriceId: String(p.stripe_price_id),
      name: String(p.name), priceLabel: String(p.price_label),
      unitAmount: Number(p.unit_amount), interval: p.interval as "month" | "year" | "once",
      subscriberCount: Number(p.subscriber_count),
      runId: p.run_id ? String(p.run_id) : null,
      run: p.run_id
        ? {
            name: String(p.run_name), size: Number(p.size), claimed: Number(p.claimed),
            glyph: String(p.run_glyph), tint: String(p.run_tint) as Hex,
            retired: Boolean(p.retired),
          }
        : null,
    })),
    collectors: collectors.map((c) => ({
      handle: String(c.handle), name: String(c.name), avatarColor: String(c.avatar_color) as Hex,
    })),
    collectorCount: Number(total),
  };
}
