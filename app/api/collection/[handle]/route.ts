import { NextResponse } from "next/server";
import { getCollection } from "@/lib/queries";

/**
 * Read a collection client-side, so it can be shown as a sheet OVER the
 * seller's page without navigating away. The public /@handle page uses the
 * server query directly — this exists only for the overlay.
 *
 * Always returns public coins only. The overlay is shown on a third party's
 * site, so it must never leak anything the owner marked private.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params;
  const view = await getCollection(decodeURIComponent(handle).replace(/^@/, ""));
  if (!view) return NextResponse.json({ error: "not found" }, { status: 404 });

  const items = view.items.filter((i) => i.isPublic);
  return NextResponse.json({
    collector: view.collector,
    items,
    stats: {
      coins: items.length,
      sellers: new Set(items.map((i) => i.sellerSlug)).size,
    },
  });
}
