"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Coin } from "./Coin";
import { AutoGrid, Input, Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger, Text } from "./ui";
import type { CollectionItem } from "@/lib/types";

type Item = CollectionItem & { viewerHasIt?: boolean };

interface Props {
  items: Item[];
  /** Owner view enables the right-click privacy menu. Visitors never see it. */
  owned?: boolean;
  onToggleVisibility?: (coinId: string, next: boolean) => void;
}

/**
 * Aligned grid. Deliberately NO nth-child offsets — the staggered "editorial"
 * version read as broken alignment, not as intent. Fixed-height coin stages
 * keep every row on the same baseline regardless of seller name length.
 *
 * The right-click menu is Radix ContextMenu now, not a hand-rolled
 * fixed-position div. Radix handles escape, outside clicks, focus and aria;
 * the hand-written version handled about half of that.
 */
export function CoinGrid({ items, owned = false, onToggleVisibility }: Props) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    if (!needle) return items;
    return items.filter(
      (i) =>
        i.sellerName.toLowerCase().includes(needle) ||
        i.runName.toLowerCase().includes(needle),
    );
  }, [items, q]);

  const heading = owned
    ? "Your collection"
    : items.some((i) => i.viewerHasIt === false)
      ? "Faded ones are new to you"
      : `${items.length} coin${items.length === 1 ? "" : "s"}`;

  return (
    <div>
      <div className="mb-[var(--space-6)] flex flex-wrap items-baseline justify-between gap-[var(--space-4)]">
        <Text variant="eyebrow" tone="faint">{heading}</Text>
        <div className="relative">
          <Search
            size={14}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 text-fg-faint"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sellers"
            autoComplete="off"
            className="w-[var(--w-search)] pl-[var(--space-8)]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Text variant="body" tone="dim" className="py-[var(--space-16)] text-center">
          Nothing matches &ldquo;{q}&rdquo;.
        </Text>
      ) : (
        <AutoGrid>
          {filtered.map((item) => {
            const isLead = item.viewerHasIt === false;
            // Every coin points somewhere: a lead to the seller page you could
            // buy from, an owned coin to the company itself. A collectible that
            // links nowhere is decoration.
            const href = isLead ? `/s/${item.sellerSlug}` : item.website ?? `/s/${item.sellerSlug}`;
            const external = href.startsWith("http");
            const destination = external
              ? new URL(href).host.replace(/^www\./, "")
              : `ovation.app/s/${item.sellerSlug}`;

            const cell = (
              <a
                href={href}
                // Always a new tab: clicking a coin should never cost you the
                // collection you were browsing.
                target="_blank"
                rel="noopener noreferrer"
                title={destination}
                className="group relative block text-center"
              >
                <div className="relative grid h-[var(--h-coin-stage)] place-items-center">
                  <Coin
                    glyph={item.glyph}
                    tint={item.tint}
                    size={104}
                    kind={item.kind}
                    retired={item.retired}
                    missing={isLead}
                    className="transition-transform duration-[var(--dur)] group-hover:-translate-y-1.5"
                  />
                  {!item.isPublic && <span className="coin-private-dot" />}
                </div>

                {/* The name carries the whole affordance: it gains weight and an
                    arrow appears beside it. Nothing below moves. */}
                <span
                  className={[
                    "type-name mt-[var(--space-4)] inline-flex max-w-full items-center justify-center gap-1",
                    "group-hover:[font-weight:var(--weight-emphasis)]",
                    item.isPublic ? "text-fg" : "text-fg-dim",
                  ].join(" ")}
                >
                  <span className="truncate">{item.sellerName}</span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-[length:var(--meta-size)] text-accent-ink opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    ↗
                  </span>
                </span>

                <Text
                  as="span"
                  variant="caption"
                  tone={isLead ? "accent" : "faint"}
                  className="mt-[var(--space-1)] block"
                >
                  {isLead ? "new to you →" : `${item.runName} · #${item.serial}`}
                </Text>
              </a>
            );

            if (!owned) return <div key={item.coinId}>{cell}</div>;

            return (
              <Menu key={item.coinId}>
                <MenuTrigger asChild>
                  <div>{cell}</div>
                </MenuTrigger>
                <MenuContent>
                  <MenuLabel>
                    {item.sellerName} · #{item.serial}
                  </MenuLabel>
                  <MenuItem onSelect={() => onToggleVisibility?.(item.coinId, !item.isPublic)}>
                    {item.isPublic ? "Hide from public" : "Make public"}
                  </MenuItem>
                </MenuContent>
              </Menu>
            );
          })}
        </AutoGrid>
      )}
    </div>
  );
}
