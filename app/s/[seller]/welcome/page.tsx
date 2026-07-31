import { notFound } from "next/navigation";
import { getSellerPublic } from "@/lib/queries";
import { WelcomeClient } from "./WelcomeClient";

/**
 * The SELLER's own confirmation page. Ovation arrives on top of it as a sheet
 * and can be dismissed — which is the honest expression of being a layer over
 * someone else's checkout rather than a destination.
 */
export default async function WelcomePage({
  params,
  searchParams,
}: {
  params: Promise<{ seller: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { seller } = await params;
  const { session_id } = await searchParams;
  const view = await getSellerPublic(seller);
  if (!view) notFound();

  return <WelcomeClient sellerName={view.seller.name} sessionId={session_id ?? null} />;
}
