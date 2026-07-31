import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { APP_BASE_URL, stripe } from "@/lib/stripe";

/**
 * Start a subscription for one of the seller's plans.
 * We never invent prices here — the price id comes from the DB, which was
 * populated from real Stripe Price objects.
 */
export async function POST(req: Request) {
  const { planId } = (await req.json()) as { planId?: string };
  if (!planId) {
    return NextResponse.json({ error: "planId required" }, { status: 400 });
  }

  const rows = await sql`
    SELECT p.stripe_price_id, p.name, s.slug
    FROM plans p JOIN sellers s ON s.id = p.seller_id
    WHERE p.id = ${planId} LIMIT 1`;

  const plan = rows[0];
  if (!plan) return NextResponse.json({ error: "unknown plan" }, { status: 404 });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: String(plan.stripe_price_id), quantity: 1 }],
    success_url: `${APP_BASE_URL}/s/${plan.slug}/welcome?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_BASE_URL}/s/${plan.slug}`,
    // Read back by the webhook. The coin is issued from this, not from the browser.
    metadata: { plan_id: planId },
    subscription_data: { metadata: { plan_id: planId } },
  });

  return NextResponse.json({ url: session.url });
}
