import { notFound } from "next/navigation";
import { getSellerPublic } from "@/lib/queries";
import { BillingClient } from "./BillingClient";

export const dynamic = "force-dynamic";

/**
 * Ovation's own pricing — this is the "monetized" half of the brief.
 *
 * Ovation is a seller row like any other, so these tiers go through the same
 * Checkout and the same webhook that issue Warrick's coins. Subscribing to
 * Studio hands you an Ovation coin from the same code path. We are our own
 * first customer, and it isn't a metaphor.
 */
export default async function BillingPage() {
  const view = await getSellerPublic("ovation");
  if (!view) notFound();
  return <BillingClient view={view} />;
}
