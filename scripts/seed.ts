/**
 * Migrate + seed. Idempotent — safe to re-run.
 *   npx tsx scripts/seed.ts
 *
 * Seeds Warrick with three plans, the founding-user run pre-filled to 34 so the
 * demo purchase lands on #35, and the charter run for Team.
 */

// MUST be first: a side-effect import runs before the imports below it.
// `import { config } from "dotenv"; config()` does NOT work here — ESM hoists
// all imports above statements, so lib/db would read env before it was loaded.
import "dotenv/config";

import { migrate, sql } from "../lib/db";
import { TREY, TREY_ITEMS, WARRICK, WARRICK_PLANS, WARRICK_RUNS } from "../lib/mocks";
import { stripe } from "../lib/stripe";

async function main() {
  await migrate();
  console.log("✓ schema");

  await sql`
    INSERT INTO sellers (id, org_id, slug, name, tagline, location, stage, mark, tint,
                         stripe_account_id, ovation_tier)
    VALUES (${WARRICK.id}, ${WARRICK.orgId}, ${WARRICK.slug}, ${WARRICK.name},
            ${WARRICK.tagline}, ${WARRICK.location}, ${WARRICK.stage}, ${WARRICK.mark},
            ${WARRICK.tint}, ${WARRICK.stripeAccountId}, ${WARRICK.ovationTier})
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, tagline = EXCLUDED.tagline`;
  console.log("✓ seller warrick");

  for (const r of WARRICK_RUNS) {
    // claimed-1 so the first real purchase in the demo lands on the pretty number
    const seeded = Math.max(0, r.claimed - 1);
    await sql`
      INSERT INTO runs (id, seller_id, plan_id, name, size, claimed, glyph, tint, retired)
      VALUES (${r.id}, ${r.sellerId}, ${r.planId}, ${r.name}, ${r.size}, ${seeded},
              ${r.glyph}, ${r.tint}, ${r.retired})
      ON CONFLICT (id) DO UPDATE SET size = EXCLUDED.size, claimed = EXCLUDED.claimed`;
  }
  console.log(`✓ ${WARRICK_RUNS.length} runs`);

  // Real Stripe Products + Prices, so `stripe_price_id` is genuine and the
  // webhook can match on it. Reuses existing objects by lookup_key on re-run.
  for (const p of WARRICK_PLANS) {
    let priceId = p.stripePriceId;
    let productId = p.stripeProductId;

    if (p.unitAmount > 0) {
      const lookupKey = `warrick_${p.name.toLowerCase()}`;
      const found = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });

      if (found.data.length > 0) {
        priceId = found.data[0].id;
        productId = String(found.data[0].product);
      } else {
        const product = await stripe.products.create({
          name: `Warrick ${p.name}`,
          description: p.name === "Pro" ? "Unlimited repositories, self-hosted runners" : undefined,
        });
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: p.unitAmount,
          currency: "usd",
          recurring: { interval: "month" },
          lookup_key: lookupKey,
        });
        priceId = price.id;
        productId = product.id;
      }
      console.log(`  ${p.name} → ${priceId}`);
    }

    await sql`
      INSERT INTO plans (id, seller_id, stripe_product_id, stripe_price_id, name,
                         price_label, unit_amount, interval, subscriber_count, run_id)
      VALUES (${p.id}, ${p.sellerId}, ${productId}, ${priceId}, ${p.name},
              ${p.priceLabel}, ${p.unitAmount}, ${p.interval}, ${p.subscriberCount}, ${p.runId})
      ON CONFLICT (id) DO UPDATE SET run_id = EXCLUDED.run_id,
                                     stripe_product_id = EXCLUDED.stripe_product_id,
                                     stripe_price_id = EXCLUDED.stripe_price_id`;
  }
  console.log(`✓ ${WARRICK_PLANS.length} plans`);

  // ── Trey and his existing collection ──────────────────────
  // Every other seller gets a minimal row + one run so his coins are real rows,
  // not fixtures. An empty grid is the worst possible hero shot.
  await sql`
    INSERT INTO collectors (id, email, handle, name, avatar_color, since, is_public)
    VALUES (${TREY.id}, 'treyfour@gmail.com', ${TREY.handle}, ${TREY.name},
            ${TREY.avatarColor}, ${TREY.since}, true)
    ON CONFLICT (id) DO UPDATE SET handle = EXCLUDED.handle`;

  let seeded = 0;
  // Warrick is deliberately EXCLUDED: the demo purchase must be a genuine
  // arrival — the grid visibly gains a cell — not a duplicate of something
  // already sitting there.
  const treySeed = TREY_ITEMS.filter((i) => i.sellerSlug !== "warrick");
  for (const [idx, item] of treySeed.entries()) {
    const sellerId = `sel_${item.sellerSlug}`;
    const runId = `run_${item.sellerSlug}_${item.runName.replace(/[^a-z]/gi, "")}`;

    await sql`
      INSERT INTO sellers (id, org_id, slug, name, mark, tint)
      VALUES (${sellerId}, ${`org_${item.sellerSlug}`}, ${item.sellerSlug},
              ${item.sellerName}, ${item.glyph}, ${item.tint})
      ON CONFLICT (id) DO NOTHING`;

    // Reuse a run that already exists for this seller+name (Warrick's runs come
    // from WARRICK_RUNS above) instead of creating a near-duplicate.
    const existing = await sql`
      SELECT id FROM runs WHERE seller_id = ${sellerId} AND name = ${item.runName} LIMIT 1`;
    const effectiveRunId = existing.length > 0 ? String(existing[0].id) : runId;

    if (existing.length === 0) {
      await sql`
        INSERT INTO runs (id, seller_id, plan_id, name, size, claimed, glyph, tint)
        VALUES (${runId}, ${sellerId}, ${`plan_${item.sellerSlug}`}, ${item.runName},
                ${item.size}, ${item.serial}, ${item.glyph}, ${item.tint})
        ON CONFLICT (id) DO NOTHING`;
    }

    await sql`
      INSERT INTO coins (id, run_id, seller_id, collector_id, serial, kind, is_public,
                         acquired_at, stripe_event_id)
      VALUES (${`coin_seed_${idx}`}, ${effectiveRunId}, ${sellerId}, ${TREY.id}, ${item.serial},
              ${item.kind}, ${item.isPublic}, ${item.acquiredAt}, ${`seed_${idx}`})
      ON CONFLICT DO NOTHING`; // bare: guards id, (run_id,serial) and stripe_event_id
    seeded++;
  }
  console.log(`✓ collector @trey with ${seeded} coins (Warrick excluded on purpose)`);

  // ── Dana, so there is somebody to discover ────────────────
  // Six of her sellers are ones Trey doesn't hold, which is what makes the
  // discovery screen show leads rather than a nice grid.
  await sql`
    INSERT INTO collectors (id, email, handle, name, avatar_color, since, is_public)
    VALUES ('col_dana', 'dana@example.com', 'dana', 'Dana Okoro', '#3B5BA5', '2025-03-11', true)
    ON CONFLICT (id) DO NOTHING`;

  const DANA_COINS: Array<[slug: string, name: string, run: string, serial: number,
    size: number, tint: string, glyph: string]> = [
    ["warrick", "Warrick", "founding user", 8, 50, "#C87137", "▲"],
    ["tessera", "Tessera", "design partner", 4, 25, "#2F6690", "❖"],
    ["gravel", "Gravel", "beta", 41, 120, "#B5651D", "▣"],
    ["almanac", "Almanac", "founding user", 11, 50, "#5D5FA8", "✎"],
    ["halyard", "Halyard", "beta", 88, 250, "#2E7D7B", "≈"],
    ["ferrite", "Ferrite", "early access", 2, 30, "#7A3B3B", "✧"],
    ["ostrich", "Ostrich", "waitlist", 63, 200, "#3C6E71", "◍"],
    ["quorum", "Quorum", "design partner", 19, 150, "#6F4E37", "⬮"],
  ];

  for (const [idx, [slug, name, runName, serial, size, tint, glyph]] of DANA_COINS.entries()) {
    const sellerId = `sel_${slug}`;
    await sql`
      INSERT INTO sellers (id, org_id, slug, name, mark, tint)
      VALUES (${sellerId}, ${`org_${slug}`}, ${slug}, ${name}, ${glyph}, ${tint})
      ON CONFLICT (id) DO NOTHING`;

    const existing = await sql`
      SELECT id FROM runs WHERE seller_id = ${sellerId} AND name = ${runName} LIMIT 1`;
    const runId = existing.length > 0 ? String(existing[0].id) : `run_${slug}_dana`;
    if (existing.length === 0) {
      await sql`
        INSERT INTO runs (id, seller_id, plan_id, name, size, claimed, glyph, tint)
        VALUES (${runId}, ${sellerId}, ${`plan_${slug}`}, ${runName}, ${size}, ${serial},
                ${glyph}, ${tint})
        ON CONFLICT (id) DO NOTHING`;
    }

    await sql`
      INSERT INTO coins (id, run_id, seller_id, collector_id, serial, kind, is_public,
                         acquired_at, stripe_event_id)
      VALUES (${`coin_dana_${idx}`}, ${runId}, ${sellerId}, 'col_dana', ${serial},
              'owned', true, now(), ${`seed_dana_${idx}`})
      ON CONFLICT DO NOTHING`;
  }
  console.log(`✓ collector @dana with ${DANA_COINS.length} coins`);

  // ── Ovation itself ────────────────────────────────────────
  // We are our own first customer. Ovation is a seller row like any other, so
  // its plans go through the same Checkout and the same webhook — the product
  // demonstrates itself on itself, and this is what makes it "monetized".
  await sql`
    INSERT INTO sellers (id, org_id, slug, name, tagline, location, stage, mark, tint, ovation_tier)
    VALUES ('sel_ovation', 'org_ovation', 'ovation', 'Ovation',
            'A receipt you''d actually keep.', 'San Francisco', 'Pre-seed', '◈', '#8a6a3b', 'scale')
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`;

  const OVATION_TIERS = [
    { id: "plan_ov_starter", name: "Starter", amount: 0, run: null },
    { id: "plan_ov_studio", name: "Studio", amount: 2900,
      run: { id: "run_ov_studio", name: "founding studio", size: 100, claimed: 11, glyph: "◈", tint: "#8a6a3b" } },
    { id: "plan_ov_scale", name: "Scale", amount: 9900,
      run: { id: "run_ov_scale", name: "charter", size: 25, claimed: 1, glyph: "✦", tint: "#5D5FA8" } },
  ];

  for (const t of OVATION_TIERS) {
    if (t.run) {
      await sql`
        INSERT INTO runs (id, seller_id, plan_id, name, size, claimed, glyph, tint)
        VALUES (${t.run.id}, 'sel_ovation', ${t.id}, ${t.run.name}, ${t.run.size},
                ${t.run.claimed}, ${t.run.glyph}, ${t.run.tint})
        ON CONFLICT (id) DO UPDATE SET claimed = EXCLUDED.claimed, retired = false`;
    }

    let priceId = `price_ov_${t.name.toLowerCase()}`;
    let productId = `prod_ov_${t.name.toLowerCase()}`;
    if (t.amount > 0) {
      const lookupKey = `ovation_${t.name.toLowerCase()}`;
      const found = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
      if (found.data.length > 0) {
        priceId = found.data[0].id;
        productId = String(found.data[0].product);
      } else {
        const product = await stripe.products.create({ name: `Ovation ${t.name}` });
        const price = await stripe.prices.create({
          product: product.id, unit_amount: t.amount, currency: "usd",
          recurring: { interval: "month" }, lookup_key: lookupKey,
        });
        priceId = price.id;
        productId = product.id;
      }
      console.log(`  Ovation ${t.name} → ${priceId}`);
    }

    await sql`
      INSERT INTO plans (id, seller_id, stripe_product_id, stripe_price_id, name, price_label,
                         unit_amount, interval, subscriber_count, run_id)
      VALUES (${t.id}, 'sel_ovation', ${productId}, ${priceId}, ${t.name},
              ${t.amount === 0 ? "$0" : `$${t.amount / 100}/mo`}, ${t.amount}, 'month', 0,
              ${t.run?.id ?? null})
      ON CONFLICT (id) DO UPDATE SET stripe_price_id = EXCLUDED.stripe_price_id,
                                     run_id = EXCLUDED.run_id`;
  }
  console.log("✓ Ovation's own 3 tiers");

  const [{ count }] = await sql`SELECT count(*)::int AS count FROM runs`;
  const [{ coins }] = await sql`SELECT count(*)::int AS coins FROM coins`;
  console.log(`\nready — runs: ${count}, coins: ${coins}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
