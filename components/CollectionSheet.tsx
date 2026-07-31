"use client";

import { useEffect, useState } from "react";
import { Coin } from "./Coin";
import type { CollectionItem, Collector } from "@/lib/types";

/**
 * The collection as an overlay on somebody else's site.
 *
 * This is Ovation appearing ON TOP of Warrick rather than replacing it — which
 * is literally what the product is. Warm bone over their dark page, so the two
 * companies never visually blur. Public coins only: we're rendering on a third
 * party's domain.
 *
 * The shareable /@handle page is a separate, fuller thing. Different jobs.
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
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    fetch(`/api/collection/${encodeURIComponent(handle)}`)
      .then((r) => r.json())
      .then((d) => !d.error && setData(d))
      .catch(() => {});
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("keydown", esc);
    };
  }, [handle, onClose]);

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[60] flex items-end justify-center transition-opacity duration-300 sm:items-center sm:p-6"
      style={{
        opacity: shown ? 1 : 0,
        background: "rgba(8,9,11,.72)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="relative flex w-full max-w-[860px] flex-col overflow-hidden rounded-t-[22px] sm:rounded-[22px]"
        style={{
          background: "var(--ground)",
          maxHeight: "86vh",
          boxShadow: "0 50px 90px -30px rgba(0,0,0,.7)",
          transform: shown ? "none" : "translateY(24px) scale(.98)",
          opacity: shown ? 1 : 0,
          transition: "transform .5s cubic-bezier(.16,.86,.28,1), opacity .4s ease",
        }}
      >
        {/* Ovation's own header — a different company's chrome */}
        <div
          className="flex flex-wrap items-center gap-3 px-7 py-5"
          style={{ background: "var(--raise)", borderBottom: "1px solid var(--rule)" }}
        >
          <span
            className="grid h-6 w-6 place-items-center rounded-md text-[11px]"
            style={{ background: "var(--ink)", color: "var(--ground)" }}
          >
            ◈
          </span>
          <span style={{ font: "400 17px/1 var(--display)", letterSpacing: "-.02em" }}>
            Ovation
          </span>
          <span className="t-serial">your collection</span>
          <span className="flex-1" />
          {data && (
            <span className="text-[12.5px]" style={{ color: "var(--dim)" }}>
              <b style={{ color: "var(--ink)", fontWeight: 600 }}>{data.stats.coins}</b> coins ·{" "}
              <b style={{ color: "var(--ink)", fontWeight: 600 }}>{data.stats.sellers}</b> companies
            </span>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-base"
            style={{ color: "var(--faint)" }}
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-7 py-7">
          {!data ? (
            <p className="py-16 text-center text-sm" style={{ color: "var(--faint)" }}>
              Loading…
            </p>
          ) : (
            <div
              className="grid gap-y-[30px] gap-x-[18px]"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(124px, 1fr))" }}
            >
              {data.items.map((item) => {
                const isNew = justAdded && item.sellerSlug === justAdded;
                return (
                  <div key={item.coinId} className="relative text-center">
                    {isNew && (
                      <span
                        className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 rounded-full px-2 py-0.5 text-[8.5px] font-semibold uppercase tracking-[.12em]"
                        style={{ background: "var(--accent)", color: "var(--ground)" }}
                      >
                        new
                      </span>
                    )}
                    <div className="grid h-[104px] place-items-center">
                      <Coin
                        glyph={item.glyph}
                        tint={item.tint}
                        size={isNew ? 100 : 94}
                        kind={item.kind}
                        retired={item.retired}
                      />
                    </div>
                    <span className="t-name mt-3 block truncate">{item.sellerName}</span>
                    <span className="t-serial mt-1 block">
                      {item.runName} · #{item.serial}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          className="flex flex-wrap items-center gap-3 px-7 py-4"
          style={{ background: "var(--raise)", borderTop: "1px solid var(--rule)" }}
        >
          <span className="text-[11.5px]" style={{ color: "var(--faint)" }}>
            Nobody was asked to share this. People find you by clicking your face on a
            company&rsquo;s page.
          </span>
          <span className="flex-1" />
          {data && (
            <a
              href={`/@${data.collector.handle}`}
              className="rounded-[9px] px-4 py-2.5 text-[12px] font-semibold"
              style={{ background: "var(--ink)", color: "var(--ground)" }}
            >
              Open full collection →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
