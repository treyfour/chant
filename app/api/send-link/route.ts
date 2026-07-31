import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendCollectionLink } from "@/lib/email";
import { APP_BASE_URL } from "@/lib/stripe";

/**
 * Email someone their own collection link.
 *
 * The caller passes a handle, never an address — the recipient is looked up
 * from the collector row. Otherwise this endpoint would be an open relay:
 * anyone could POST an arbitrary `to` and have us send mail on their behalf.
 */
export async function POST(req: Request) {
  const { handle } = (await req.json()) as { handle?: string };
  if (!handle) {
    return NextResponse.json({ error: "handle required" }, { status: 400 });
  }

  const rows = await sql`
    SELECT c.id, c.email, c.handle,
           co.serial, r.name AS run_name, r.size, s.name AS seller_name
    FROM collectors c
    LEFT JOIN coins co ON co.collector_id = c.id
    LEFT JOIN runs r ON r.id = co.run_id
    LEFT JOIN sellers s ON s.id = co.seller_id
    WHERE c.handle = ${handle}
    ORDER BY co.acquired_at DESC
    LIMIT 1`;

  const row = rows[0];
  if (!row?.email) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  try {
    await sendCollectionLink({
      to: String(row.email),
      url: `${APP_BASE_URL}/@${row.handle}`,
      sellerName: String(row.seller_name ?? "a company"),
      runName: String(row.run_name ?? "collector"),
      serial: Number(row.serial ?? 1),
      size: Number(row.size ?? 1),
    });
  } catch (err) {
    console.error("send-link failed:", err);
    return NextResponse.json({ error: "could not send" }, { status: 502 });
  }

  // Never echo the address back — the caller only proved they know a handle.
  const masked = String(row.email).replace(/^(.).*(@.*)$/, "$1•••$2");
  return NextResponse.json({ sent: true, to: masked });
}
