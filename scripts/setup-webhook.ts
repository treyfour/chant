/**
 * Register a REAL Stripe webhook endpoint against the deployed app.
 *
 *   npx tsx scripts/setup-webhook.ts https://your-app.vercel.app
 *
 * `stripe listen` only forwards to localhost. Production needs a registered
 * endpoint, and its signing secret differs from the CLI one — mixing them up
 * means every production event fails signature verification.
 *
 * Idempotent: reuses an endpoint already pointing at the same URL.
 * NOTE: the signing secret is only returned at CREATE time. If an endpoint
 * already exists and you lost the secret, delete it and re-run.
 */

import "dotenv/config";
import { stripe } from "../lib/stripe";

const base = process.argv[2]?.replace(/\/$/, "");
if (!base) {
  console.error("usage: npx tsx scripts/setup-webhook.ts https://your-app.vercel.app");
  process.exit(1);
}

const url = `${base}/api/webhooks/stripe`;

async function main() {
  const existing = await stripe.webhookEndpoints.list({ limit: 100 });
  const match = existing.data.find((e) => e.url === url);

  if (match) {
    console.log(`  endpoint already exists: ${match.id}`);
    console.log(`  status: ${match.status} · events: ${match.enabled_events.join(", ")}`);
    console.log(
      "\n  ⚠ The signing secret is shown only at creation. If you don't have it:\n" +
        `     stripe webhook_endpoints delete ${match.id}\n` +
        "     then re-run this script.",
    );
    return;
  }

  const created = await stripe.webhookEndpoints.create({
    url,
    enabled_events: ["checkout.session.completed"],
    description: "Ovation — issues a coin when a subscription starts",
  });

  console.log(`  ✓ created ${created.id}`);
  console.log(`  url:    ${created.url}`);
  console.log(`  events: ${created.enabled_events.join(", ")}`);
  console.log(`\n  STRIPE_WEBHOOK_SECRET=${created.secret}`);
  console.log("\n  Store it (never paste it into a file by hand):");
  console.log(
    `     stripe projects variables set stripe_webhook_secret \\\n` +
      `       --env-key STRIPE_WEBHOOK_SECRET --value ${created.secret} --yes`,
  );
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
