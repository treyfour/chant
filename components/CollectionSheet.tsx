"use client";

import { useEffect, useState } from "react";
import { Coin } from "./Coin";
import { AutoGrid, ButtonLink, Sheet, SheetContent, SheetTitle, Text } from "./ui";
import type { CollectionItem, Collector } from "@/lib/types";

/**
 * The collection as an overlay on somebody else's site.
 *
 * Ovation appearing ON TOP of Warrick rather than replacing it — which is
 * literally what the product is. Forced to `theme="ovation"` so it stays warm
 * over their dark page and the two companies never visually blur.
 *
 * Public coins only: we're rendering on a third party's domain.
 */
export function CollectionSheet({
  handle,
  justAdded,
  onClose,
}: {
  handle: string;
  justAdded?: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<{
    collector: Collector;
    items: CollectionItem[];
    stats: { coins: number; sellers: number };
  } | null>(null);

  useEffect(() => {
    fetch(`/api/collection/${encodeURIComponent(handle)}`)
      .then((r) => r.json())
      .then((d) => !d.error && setData(d))
      .catch(() => {});
  }, [handle]);

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent size="lg" theme="ovation">
        {/* Ovation's own header — a different company's chrome */}
        <div className="flex flex-wrap items-center gap-[var(--space-3)] border-b border-line bg-bg-raise px-[var(--space-8)] py-[var(--space-5)]">
          <span className="grid h-6 w-6 place-items-center rounded-[var(--radius-sm)] bg-fg text-[length:var(--text-2xs)] text-fg-invert">
            ◈
          </span>
          <SheetTitle asChild>
            <Text as="span" variant="h3">Ovation</Text>
          </SheetTitle>
          <Text as="span" variant="mono" tone="faint">your collection</Text>
          <span className="flex-1" />
          {data && (
            <Text as="span" variant="meta" tone="dim" className="mr-[var(--space-8)]">
              <b className="font-semibold text-fg">{data.stats.coins}</b> coins ·{" "}
              <b className="font-semibold text-fg">{data.stats.sellers}</b> companies
            </Text>
          )}
        </div>

        <div className="max-h-[62vh] overflow-y-auto px-[var(--space-8)] py-[var(--space-8)]">
          {!data ? (
            <Text variant="body" tone="faint" className="py-[var(--space-16)] text-center">
              Loading…
            </Text>
          ) : (
            <AutoGrid min="var(--w-coin-cell-sm)">
              {data.items.map((item) => {
                const isNew = justAdded && item.sellerSlug === justAdded;
                return (
                  <div key={item.coinId} className="relative text-center">
                    {isNew && (
                      <span className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 rounded-full bg-accent px-[var(--space-2)] py-0.5 font-[family-name:var(--font-body)] text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.12em] text-accent-fg">
                        new
                      </span>
                    )}
                    <div className="grid h-[var(--h-coin-stage-sm)] place-items-center">
                      <Coin
                        glyph={item.glyph}
                        tint={item.tint}
                        size={isNew ? 100 : 94}
                        kind={item.kind}
                        retired={item.retired}
                      />
                    </div>
                    <Text
                      as="span"
                      variant="h3"
                      className="mt-[var(--space-3)] block truncate text-[length:var(--text-base)]"
                    >
                      {item.sellerName}
                    </Text>
                    <Text as="span" variant="mono" tone="faint" className="mt-[var(--space-1)] block">
                      {item.runName} · #{item.serial}
                    </Text>
                  </div>
                );
              })}
            </AutoGrid>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-[var(--space-3)] border-t border-line bg-bg-raise px-[var(--space-8)] py-[var(--space-4)]">
          <Text variant="meta" tone="faint" className="max-w-[54ch]">
            Nobody was asked to share this. People find you by clicking your face on a
            company&rsquo;s page.
          </Text>
          <span className="flex-1" />
          {data && (
            <ButtonLink size="sm" href={`/@${data.collector.handle}`}>
              Open full collection →
            </ButtonLink>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
