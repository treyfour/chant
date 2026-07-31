"use client";

import { useMemo, useState } from "react";
import { Coin } from "./Coin";
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
 */
export function CoinGrid({ items, owned = false, onToggleVisibility }: Props) {
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState<{ x: number; y: number; item: Item } | null>(null);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    if (!needle) return items;
    return items.filter(
      (i) =>
        i.sellerName.toLowerCase().includes(needle) ||
        i.runName.toLowerCase().includes(needle),
    );
  }, [items, q]);

  return (
    <div onClick={() => setMenu(null)}>
      <div className="flex items-baseline justify-between gap-4 flex-wrap mb-6">
        <span className="t-eyebrow">
          {owned
            ? "Your collection"
            : items.some((i) => i.viewerHasIt === false)
              ? "Faded ones are new to you"
              : `${items.length} coin${items.length === 1 ? "" : "s"}`}
        </span>
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "var(--faint)" }}
          >
            ⌕
          </span>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sellers"
            autoComplete="off"
            className="w-[210px] rounded-[10px] py-[11px] pl-[34px] pr-[13px] text-[13px] outline-none"
            style={{
              background: "var(--ground)",
              border: "1px solid var(--rule)",
              color: "var(--ink)",
            }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm" style={{ color: "var(--dim)" }}>
          Nothing matches “{q}”.
        </p>
      ) : (
        <div
          className="grid gap-y-[34px] gap-x-[20px]"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(136px, 1fr))" }}
        >
          {filtered.map((item) => {
            const isLead = item.viewerHasIt === false;
            // Every coin points somewhere: a lead goes to the seller page you
            // could buy from, an owned coin goes to the company itself. A
            // collectible that links nowhere is decoration — this is what makes
            // browsing a collection worth something to the seller.
            const href = isLead
              ? `/s/${item.sellerSlug}`
              : item.website ?? `/s/${item.sellerSlug}`;
            const external = href.startsWith("http");
            const destination = external
              ? new URL(href).host.replace(/^www\./, "")
              : `ovation.app/s/${item.sellerSlug}`;
            const Cell = "a";
            return (
            <Cell
              key={item.coinId}
              href={href}
              // Always a new tab: clicking a coin should never cost you the
              // collection you were browsing.
              target="_blank"
              rel="noopener noreferrer"
              title={destination}
              className="group text-center relative block"
              style={{ cursor: "pointer" }}
              onContextMenu={
                owned
                  ? (e: React.MouseEvent) => {
                      e.preventDefault();
                      setMenu({ x: e.clientX, y: e.clientY, item });
                    }
                  : undefined
              }
            >
              <div className="grid place-items-center h-[112px] relative">
                <Coin
                  glyph={item.glyph}
                  tint={item.tint}
                  size={104}
                  kind={item.kind}
                  retired={item.retired}
                  missing={item.viewerHasIt === false}
                />
                {!item.isPublic && <span className="coin-private-dot" />}
              </div>
              {/* The name carries the whole affordance: it gains weight, an
                  arrow appears beside it, and a tooltip with the destination
                  fades in above after a sustained hover. Nothing below moves. */}
              <span
                className="t-name relative mt-[15px] inline-flex max-w-full items-center justify-center gap-1"
                style={{ color: item.isPublic ? "var(--ink)" : "var(--dim)" }}
              >
                <span className="coin-tip">{destination}</span>
                <span className="truncate">{item.sellerName}</span>
                <span
                  aria-hidden="true"
                  className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ color: "var(--accent)", fontSize: 11 }}
                >
                  ↗
                </span>
              </span>

              <span
                className="t-serial block mt-[5px]"
                style={isLead ? { color: "var(--accent)" } : undefined}
              >
                {isLead ? "new to you →" : `${item.runName} · #${item.serial}`}
              </span>
            </Cell>
            );
          })}
        </div>
      )}

      {menu && (
        <div
          className="fixed z-50 rounded-[11px] p-1.5 min-w-[186px]"
          style={{
            left: Math.min(menu.x, (globalThis.innerWidth ?? 800) - 200),
            top: Math.min(menu.y, (globalThis.innerHeight ?? 600) - 120),
            background: "var(--raise)",
            border: "1px solid var(--rule)",
            boxShadow: "0 20px 40px -16px rgba(60,48,30,.5)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="px-[11px] pt-2 pb-[7px] mb-[5px] t-eyebrow"
            style={{ borderBottom: "1px solid var(--rule)" }}
          >
            {menu.item.sellerName} · #{menu.item.serial}
          </div>
          <button
            className="flex w-full items-center gap-2 rounded-[7px] px-[11px] py-[9px] text-left text-[13px]"
            style={{ color: "var(--ink)" }}
            onClick={() => {
              onToggleVisibility?.(menu.item.coinId, !menu.item.isPublic);
              setMenu(null);
            }}
          >
            {menu.item.isPublic ? "Hide from public" : "Make public"}
          </button>
        </div>
      )}
    </div>
  );
}
