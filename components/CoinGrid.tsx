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
          {owned ? "Your collection" : "Faded ones are new to you"}
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
            const Cell = isLead ? "a" : "div";
            return (
            <Cell
              key={item.coinId}
              {...(isLead ? { href: `/s/${item.sellerSlug}` } : {})}
              className="text-center relative block"
              style={{ cursor: isLead ? "pointer" : owned ? "context-menu" : "default" }}
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
              <span
                className="t-name block mt-[15px] truncate"
                style={{ color: item.isPublic ? "var(--ink)" : "var(--dim)" }}
              >
                {item.sellerName}
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
