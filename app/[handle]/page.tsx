import { notFound } from "next/navigation";
import { CollectionClient } from "./CollectionClient";
import { getCollection, sellerSlugsHeldBy } from "@/lib/queries";
import { currentCollector } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * OG metadata so a pasted collection link renders well. This is the ONLY
 * sharing affordance in the product — no prompts, no post button, no streak.
 * You get found because someone clicked your face, not because we nagged you.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const h = decodeURIComponent(handle).replace(/^@/, "");
  const view = await getCollection(h);
  if (!view) return { title: "Ovation" };
  return {
    title: `@${view.collector.handle} · Ovation`,
    description: `${view.stats.coins} coins across ${view.stats.sellers} early-stage companies. Collecting since ${new Date(view.collector.since).getFullYear()}.`,
    openGraph: {
      title: `@${view.collector.handle} on Ovation`,
      description: `${view.stats.coins} coins across ${view.stats.sellers} companies.`,
      type: "profile",
    },
  };
} // a new coin must show up immediately

/**
 * /@trey — a collector's public collection.
 *
 * NOTE: `app/@[handle]/` would NOT work. In the App Router an `@` folder prefix
 * declares a parallel-route slot, not a URL segment. The `@` here is just a
 * character inside a normal dynamic segment.
 *
 * `params` is a Promise in Next 16 and must be awaited.
 */
export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const decoded = decodeURIComponent(handle);
  if (!decoded.startsWith("@")) notFound();

  const view = await getCollection(decoded.slice(1));
  if (!view) notFound();

  // Only the owner gets the right-click privacy menu and sees private coins.
  const me = await currentCollector();
  const isOwner = me?.id === view.collector.id;
  let items = isOwner ? view.items : view.items.filter((i) => i.isPublic);

  // Browsing someone else's collection: mark the sellers you don't already hold.
  // Those faded cells are the discovery loop.
  if (!isOwner && me) {
    const held = await sellerSlugsHeldBy(me.id);
    items = items.map((i) => ({ ...i, viewerHasIt: held.has(i.sellerSlug) }));
  }

  return (
    <CollectionClient
      view={{ ...view, items }}
      isOwner={isOwner}
      signedIn={Boolean(me)}
    />
  );
}
