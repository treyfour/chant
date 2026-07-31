"use client";

import { useState } from "react";
import { CoinGrid } from "@/components/CoinGrid";
import type { CollectionView } from "@/lib/types";

export function CollectionClient({
  view,
  isOwner = false,
  signedIn = false,
}: {
  view: CollectionView;
  isOwner?: boolean;
  signedIn?: boolean;
}) {
  const [items, setItems] = useState(view.items);
  const [error, setError] = useState<string | null>(null);

  /** Optimistic, then reconciled. A failed PATCH rolls the coin back. */
  async function toggle(coinId: string, next: boolean) {
    const before = items;
    setItems((prev) => prev.map((i) => (i.coinId === coinId ? { ...i, isPublic: next } : i)));
    setError(null);
    try {
      const res = await fetch(`/api/coins/${coinId}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: next }),
      });
      if (!res.ok) throw new Error(res.status === 401 ? "Sign in to change this" : "Could not save");
    } catch (e) {
      setItems(before);
      setError((e as Error).message);
    }
  }

  const privateCount = items.filter((i) => !i.isPublic).length;
  const sellers = new Set(items.map((i) => i.sellerSlug)).size;

  return (
    <main className="w-full mx-auto max-w-[1000px] px-11 pb-24 pt-16">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <a href="/" className="t-eyebrow" style={{ color: "var(--accent)" }}>
            ← Ovation
          </a>
          <div className="t-eyebrow mt-2">Collection</div>
          <h1 className="t-display mt-3">
            <span style={{ color: "var(--faint)" }}>@</span>
            {view.collector.handle}
          </h1>
        </div>
        <div className="text-right text-[13px]" style={{ color: "var(--dim)" }}>
          <div>
            <b style={{ color: "var(--ink)", fontWeight: 600 }}>{items.length}</b> coins ·{" "}
            <b style={{ color: "var(--ink)", fontWeight: 600 }}>{sellers}</b> sellers
          </div>
          <div>
            since{" "}
            <b style={{ color: "var(--ink)", fontWeight: 600 }}>
              {new Date(view.collector.since).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </b>
          </div>
          {isOwner && privateCount > 0 && (
            <div className="t-serial mt-2">{privateCount} private</div>
          )}
          <div className="mt-2 text-[12px]">
            {signedIn ? (
              <a href="/auth/logout" style={{ color: "var(--accent)" }}>Sign out</a>
            ) : (
              <a href="/auth/login" style={{ color: "var(--accent)" }}>Sign in</a>
            )}
          </div>
        </div>
      </header>

      <div className="mt-10 pt-10" style={{ borderTop: "1px solid var(--rule)" }}>
        <CoinGrid items={items} owned={isOwner} onToggleVisibility={toggle} />
      </div>

      {error && (
        <p className="mt-6 text-[12px]" style={{ color: "var(--warn)" }}>{error}</p>
      )}

      <p className="mt-10 text-[11.5px]" style={{ color: "var(--faint)" }}>
        {isOwner
          ? "Right-click any coin to hide it or make it public."
          : `Showing only the coins @${view.collector.handle} has made public.`}
      </p>
    </main>
  );
}
