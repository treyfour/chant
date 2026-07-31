import { notFound } from "next/navigation";
import { getSellerDashboard, viewerRole } from "@/lib/seller";
import { PlansClient } from "./PlansClient";

export const dynamic = "force-dynamic";

/**
 * Seller dashboard. Plans first — a founder thinks "I have a Pro plan, let me
 * add a collectible to it", not "let me create a coin and find somewhere for it".
 *
 * `?role=member` demonstrates the RBAC gate. It can only remove permissions.
 */
export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; seller?: string }>;
}) {
  const { role: roleParam, seller = "warrick" } = await searchParams;
  const role = await viewerRole(roleParam);
  const view = await getSellerDashboard(seller, role);
  if (!view) notFound();

  return <PlansClient view={view} role={role} />;
}
