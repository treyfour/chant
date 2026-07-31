/**
 * Recreate the production webhook endpoint and store its signing secret in one
 * process, so the plaintext never reaches a terminal or a log.
 *
 *   npx tsx scripts/rotate-webhook.ts https://your-app.vercel.app
 *
 * Stripe returns a webhook secret ONLY at creation. If you lose it, the only
 * recovery is delete-and-recreate — which is exactly what this does.
 */

import "dotenv/config";
import { execFileSync } from "node:child_process";
import { stripe } from "../lib/stripe";

const base = process.argv[2]?.replace(/\/$/, "");
if (!base) {
  console.error("usage: npx tsx scripts/rotate-webhook.ts https://your-app.vercel.app");
  process.exit(1);
}
const url = `${base}/api/webhooks/stripe`;

async function main() {
  const existing = await stripe.webhookEndpoints.list({ limit: 100 });
  for (const e of existing.data.filter((e) => e.url === url)) {
    await stripe.webhookEndpoints.del(e.id);
    console.log(`  removed old endpoint ${e.id}`);
  }

  const created = await stripe.webhookEndpoints.create({
    url,
    enabled_events: ["checkout.session.completed"],
    description: "Ovation — issues a coin when a subscription starts",
  });
  const secret = created.secret!;
  console.log(`  ✓ endpoint ${created.id} → ${created.url}`);

  // Stripe Projects vault (also rewrites .env)
  execFileSync(
    "stripe",
    ["projects", "variables", "set", "stripe_webhook_secret",
     "--env-key", "STRIPE_WEBHOOK_SECRET", "--value", secret, "--yes"],
    { stdio: "ignore" },
  );
  console.log("  ✓ stored in Stripe Projects vault");

  // Vercel production
  try {
    execFileSync("vercel", ["env", "rm", "STRIPE_WEBHOOK_SECRET", "production", "--yes"],
      { stdio: "ignore" });
  } catch { /* not set yet */ }
  execFileSync("vercel", ["env", "add", "STRIPE_WEBHOOK_SECRET", "production"],
    { input: secret, stdio: ["pipe", "ignore", "ignore"] });
  console.log("  ✓ stored in Vercel production");

  console.log(`\n  secret length ${secret.length}, never printed`);
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
