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
import { YC_COMPANIES, YC_DANA } from "../lib/yc";

async function main() {
  await migrate();
  console.log("✓ schema");

  await sql`
    INSERT INTO sellers (id, org_id, slug, name, tagline, location, stage, mark, tint,
                         stripe_account_id, ovation_tier, website)
    VALUES (${WARRICK.id}, ${WARRICK.orgId}, ${WARRICK.slug}, ${WARRICK.name},
            ${WARRICK.tagline}, ${WARRICK.location}, ${WARRICK.stage}, ${WARRICK.mark},
            ${WARRICK.tint}, ${WARRICK.stripeAccountId}, ${WARRICK.ovationTier}, '/s/warrick')
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, tagline = EXCLUDED.tagline`;
  console.log("✓ seller warrick");

  for (const r of WARRICK_RUNS) {
    // claimed-1 so the first real purchase in the demo lands on the pretty number
    const seeded = Math.max(0, r.claimed - 1);
    await sql`
      INSERT INTO runs (id, seller_id, plan_id, name, size, claimed, glyph, tint, retired)
      VALUES (${r.id}, ${r.sellerId}, ${r.planId}, ${r.name}, ${r.size}, ${seeded},
              ${r.glyph}, ${r.tint}, ${r.retired})
      ON CONFLICT (id) DO UPDATE SET size = EXCLUDED.size, claimed = EXCLUDED.claimed,
                                     name = EXCLUDED.name, glyph = EXCLUDED.glyph`;
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
        // Shown on the Stripe Checkout page under the price. Keep it in sync
        // with the landing page — stale copy here is very visible mid-purchase.
        const DESCRIPTIONS: Record<string, string> = {
          Pro: "Unlimited concurrency, 50k agent steps/mo, 90-day traces and replay",
          Team: "Everything in Pro, self-hosted workers, SSO and SAML, 99.9% SLA",
        };
        const product = await stripe.products.create({
          name: `Warrick ${p.name}`,
          description: DESCRIPTIONS[p.name],
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
  // Real YC company names with brand-coloured letterform marks. Serial numbers,
  // dates and run sizes are INVENTED — see lib/yc.ts. Warrick is excluded so the
  // demo purchase is a genuine arrival rather than a duplicate.
  for (const [idx, c] of YC_COMPANIES.entries()) {
    const sellerId = `sel_${c.slug}`;
    const runId = `run_${c.slug}_yc`;
    const isPrivate = idx % 5 === 3;              // a few private ones
    // All owned. "backed" is the hollow-outline state meaning "supported them,
    // nothing to sell yet" — nonsense for real companies that all ship products,
    // and a single hollow coin in a filled grid just reads as a rendering bug.
    const kind = "owned";

    await sql`
      INSERT INTO sellers (id, org_id, slug, name, mark, tint, website)
      VALUES (${sellerId}, ${`org_${c.slug}`}, ${c.slug}, ${c.name}, ${c.mark}, ${c.tint},
              ${c.website})
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, mark = EXCLUDED.mark,
                                     tint = EXCLUDED.tint, website = EXCLUDED.website`;

    await sql`
      INSERT INTO runs (id, seller_id, plan_id, name, size, claimed, glyph, tint)
      VALUES (${runId}, ${sellerId}, ${`plan_${c.slug}`}, ${c.run}, ${c.size},
              ${c.serial}, ${c.mark}, ${c.tint})
      ON CONFLICT (id) DO UPDATE SET glyph = EXCLUDED.glyph, tint = EXCLUDED.tint,
                                     name = EXCLUDED.name, size = EXCLUDED.size,
                                     claimed = EXCLUDED.claimed`;

    // Compute the date in JS: `now() - interval '...'` inside a tagged template
    // is passed as a STRING parameter, not SQL, and Postgres fails to parse it.
    const acquiredAt = new Date(Date.now() - (idx + 1) * 23 * 86400000).toISOString();
    await sql`
      INSERT INTO coins (id, run_id, seller_id, collector_id, serial, kind, is_public,
                         acquired_at, stripe_event_id)
      VALUES (${`coin_yc_${idx}`}, ${runId}, ${sellerId}, ${TREY.id}, ${c.serial},
              ${kind}, ${!isPrivate}, ${acquiredAt},
              ${`seed_yc_${idx}`})
      ON CONFLICT DO NOTHING`;
    seeded++;
  }
  console.log(`✓ collector @trey with ${seeded} YC coins (Warrick excluded on purpose)`);

  // ── Dana, so there is somebody to discover ────────────────
  // Six of her sellers are ones Trey doesn't hold, which is what makes the
  // discovery screen show leads rather than a nice grid.
  await sql`
    INSERT INTO collectors (id, email, handle, name, avatar_color, since, is_public)
    VALUES ('col_dana', 'dana@example.com', 'dana', 'Dana Okoro', '#3B5BA5', '2025-03-11', true)
    ON CONFLICT (id) DO NOTHING`;

  for (const [idx, c] of YC_DANA.entries()) {
    const sellerId = `sel_${c.slug}`;
    const runId = `run_${c.slug}_dana`;
    await sql`
      INSERT INTO sellers (id, org_id, slug, name, mark, tint, website)
      VALUES (${sellerId}, ${`org_${c.slug}`}, ${c.slug}, ${c.name}, ${c.mark}, ${c.tint},
              ${c.website})
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, website = EXCLUDED.website`;

    const existing = await sql`
      SELECT id FROM runs WHERE seller_id = ${sellerId} AND name = ${c.run} LIMIT 1`;
    const rid2 = existing.length > 0 ? String(existing[0].id) : runId;
    if (existing.length === 0) {
      await sql`
        INSERT INTO runs (id, seller_id, plan_id, name, size, claimed, glyph, tint)
        VALUES (${runId}, ${sellerId}, ${`plan_${c.slug}`}, ${c.run}, ${c.size},
                ${c.serial}, ${c.mark}, ${c.tint})
        ON CONFLICT (id) DO NOTHING`;
    }

    await sql`
      INSERT INTO coins (id, run_id, seller_id, collector_id, serial, kind, is_public,
                         acquired_at, stripe_event_id)
      VALUES (${`coin_dana_${idx}`}, ${rid2}, ${sellerId}, 'col_dana', ${c.serial},
              'owned', true, now(), ${`seed_dana_${idx}`})
      ON CONFLICT DO NOTHING`;
  }
  console.log(`✓ collector @dana with ${YC_DANA.length} YC coins`);

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
