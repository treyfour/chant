import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { claimCoin } from "@/lib/claim";
import { stripe } from "@/lib/stripe";

/**
 * The coin is issued HERE and nowhere else.
 *
 * The receipt and the collectible are the same event: `checkout.session.completed`
 * is what mints the coin. No browser is involved and no user-reachable route can
 * create one.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    if (secret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, secret);
    } else {
      // `stripe listen` prints the secret on startup; until it's wired we accept
      // unsigned events in dev only so the loop can be tested end to end.
      if (process.env.NODE_ENV === "production") throw new Error("missing signature");
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    return NextResponse.json(
      { error: `signature verification failed: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const email =
    session.customer_details?.email ?? session.customer_email ?? "unknown@example.com";

  // Resolve the price: prefer the line item, fall back to plan metadata.
  let priceId: string | undefined;
  try {
    const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
    priceId = items.data[0]?.price?.id;
  } catch {
    /* fall through to metadata */
  }

  const result = await claimCoin({
    stripeEventId: event.id,
    stripePriceId: priceId ?? "",
    planId: session.metadata?.plan_id ?? undefined,
    collectorEmail: email,
    kind: "owned",
  });

  // Always 200 on a handled event — a non-2xx makes Stripe retry forever.
  return NextResponse.json({ received: true, result: result.status, ...( "serial" in result ? { serial: result.serial } : {}) });
}
