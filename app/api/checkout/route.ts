import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { APP_BASE_URL, stripe } from "@/lib/stripe";

/**
 * Start a subscription for one of the seller's plans.
 *
 * We never invent prices here — the price id comes from the DB, which was
 * populated from real Stripe Price objects.
 *
 * The coin is called out via `custom_text` so nobody is surprised by an
 * unexplained collectible showing up after paying. Stripe's hosted Checkout
 * can't be styled beyond Dashboard branding, but custom_text is the one place
 * you can put your own words in front of the pay button.
 */
export async function POST(req: Request) {
  const { planId } = (await req.json()) as { planId?: string };
  if (!planId) {
    return NextResponse.json({ error: "planId required" }, { status: 400 });
  }

  const rows = await sql`
    SELECT p.stripe_price_id, p.name AS plan_name, s.slug, s.name AS seller_name,
           r.name AS run_name, r.size, r.claimed, r.retired
    FROM plans p
    JOIN sellers s ON s.id = p.seller_id
    LEFT JOIN runs r ON r.id = p.run_id
    WHERE p.id = ${planId} LIMIT 1`;

  const plan = rows[0];
  if (!plan) return NextResponse.json({ error: "unknown plan" }, { status: 404 });

  const hasCoin = Boolean(plan.run_name) && !plan.retired;
  const nextSerial = Number(plan.claimed ?? 0) + 1;

  const submitMessage = hasCoin
    ? `Includes the ${plan.run_name} coin — no. ${nextSerial} of ${plan.size}. ` +
      `A numbered collectible from Ovation, free with this plan. ` +
      `It arrives after payment and you can ignore it.`
    : undefined;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: String(plan.stripe_price_id), quantity: 1 }],
    success_url: `${APP_BASE_URL}/s/${plan.slug}/welcome?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_BASE_URL}/s/${plan.slug}#pricing`,
    // Read back by the webhook. The coin is issued from this, not from the browser.
    metadata: { plan_id: planId },
    subscription_data: { metadata: { plan_id: planId } },
    ...(submitMessage
      ? {
          custom_text: {
            submit: { message: submitMessage },
            after_submit: {
              message: `Your coin will be waiting on ${plan.seller_name}'s confirmation page.`,
            },
          },
        }
      : {}),
  });

  return NextResponse.json({ url: session.url });
}
