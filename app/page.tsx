import { redirect } from "next/navigation";

/**
 * The demo opens on a seller's own site, not on a menu.
 *
 * You should land on what looks like an ordinary agentic-infra startup, scroll
 * to pricing, and only then discover the coin. A directory of links up front
 * gives the trick away and reads as a showcase rather than a product.
 *
 * The walkthrough index still exists at /demo for navigating between surfaces.
 */
export default function Home() {
  redirect("/s/warrick");
}
