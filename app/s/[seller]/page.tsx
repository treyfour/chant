import { notFound } from "next/navigation";
import { getSellerPublic } from "@/lib/queries";
import { resolveTheme } from "@/components/ThemeSwitcher";
import { SellerSite } from "./SellerSite";

/**
 * The seller's OWN pricing page. Ovation is invisible here — no logo, no nav,
 * no branding. The audience should think they're watching an ordinary B2B SaaS
 * signup, which is what makes the reveal land.
 */
export default async function SellerPage({
  params,
  searchParams,
}: {
  params: Promise<{ seller: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { seller } = await params;
  const { t } = await searchParams;
  const view = await getSellerPublic(seller);
  if (!view) notFound();

  // ?t= previews a candidate theme over this whole landing page. A specimen
  // grid proves a theme is coherent; only a real composition — nav, 62px
  // headline, pricing cards, footer — shows whether it is any good.
  const { active, brand, theme } = resolveTheme(t);
  return (
    <SellerSite
      view={view}
      brand={brand}
      theme={theme}
      preview={active === null ? null : active}
      base={`/s/${seller}`}
    />
  );
}
