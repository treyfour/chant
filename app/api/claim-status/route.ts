import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { stripe } from "@/lib/stripe";

/**
 * Polled by the welcome page while the webhook lands.
 *
 * The browser returns from Checkout before Stripe necessarily delivers the
 * event, so the reveal has to wait for the coin rather than assume it. Returns
 * `pending` until the webhook has actually claimed a serial — the UI never
 * invents a number.
 */
export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ status: "error", error: "session_id required" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) return NextResponse.json({ status: "pending" });

  const rows = await sql`
    SELECT co.serial, r.name AS run_name, r.size, r.glyph, r.tint, s.name AS seller_name,
           c.handle, c.email, (c.auth0_sub IS NOT NULL) AS claimed
    FROM coins co
    JOIN runs r ON r.id = co.run_id
    JOIN sellers s ON s.id = co.seller_id
    JOIN collectors c ON c.id = co.collector_id
    WHERE c.email = ${email}
    ORDER BY co.acquired_at DESC
    LIMIT 1`;

  if (rows.length === 0) return NextResponse.json({ status: "pending" });

  const r = rows[0];
  return NextResponse.json({
    status: "claimed",
    payload: {
      sellerName: String(r.seller_name),
      runName: String(r.run_name),
      serial: Number(r.serial),
      size: Number(r.size),
      glyph: String(r.glyph),
      tint: String(r.tint),
      // The sheet shows the collection URL so a buyer with no account still
      // leaves with a way back. `claimed` tells it whether to offer sign-in.
      handle: String(r.handle),
      email: String(r.email),
      claimed: Boolean(r.claimed),
    },
  });
}
