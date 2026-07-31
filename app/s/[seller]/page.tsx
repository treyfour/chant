import { notFound } from "next/navigation";
import { getSellerPublic } from "@/lib/queries";
import { PricingClient } from "./PricingClient";

/**
 * The seller's OWN pricing page. Ovation is invisible here — no logo, no nav,
 * no branding. The audience should think they're watching an ordinary B2B SaaS
 * signup, which is what makes the reveal land.
 */
export default async function SellerPage({
  params,
}: {
  params: Promise<{ seller: string }>;
}) {
  const { seller } = await params;
  const view = await getSellerPublic(seller);
  if (!view) notFound();
  return <PricingClient view={view} />;
}
