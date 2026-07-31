"use client";

import { useState } from "react";
import { CoinGrid } from "@/components/CoinGrid";
import { Text } from "@/components/ui";
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
    <>
      {/* Ovation's own chrome. The collection is a different company's product
          from whatever site you arrived from, and it should look like it. */}
      <nav className="sticky top-0 z-40 flex h-[var(--h-nav-app)] items-center gap-[var(--space-3)] border-b border-line bg-bg/92 px-[var(--space-12)] backdrop-blur">
        <a href="/demo" className="flex items-center gap-[var(--space-3)]">
          <span className="grid h-6 w-6 place-items-center rounded-[var(--radius-mark)] bg-fg text-[length:var(--meta-size)] text-fg-invert">
            ◈
          </span>
          <Text as="span" variant="h3">Ovation</Text>
        </a>
        <Text as="span" variant="eyebrow" tone="faint" className="ml-[var(--space-2)] hidden sm:inline">
          a receipt you&rsquo;d keep
        </Text>
        <span className="flex-1" />
        <a
          href={signedIn ? "/auth/logout" : "/auth/login"}
          className="font-[family-name:var(--font-body)] text-[length:var(--meta-size)] text-fg-dim hover:text-fg"
        >
          {signedIn ? "Sign out" : "Sign in"}
        </a>
      </nav>

      <main className="mx-auto w-full max-w-[var(--w-app)] px-[var(--space-12)] pb-[var(--space-20)] pt-[var(--space-12)]">
        <header className="flex flex-wrap items-end justify-between gap-[var(--space-6)]">
          <div>
            <Text variant="eyebrow" tone="faint">Collection</Text>
            <Text as="h1" variant="h1" className="mt-[var(--space-3)]">
              <span className="text-fg-faint">@</span>
              {view.collector.handle}
            </Text>
          </div>
          <div className="text-right">
            <Text variant="body" tone="dim">
              <b className="type-emphasis text-fg">{items.length}</b> coins ·{" "}
              <b className="type-emphasis text-fg">{sellers}</b> sellers
            </Text>
            <Text variant="body" tone="dim">
              since{" "}
              <b className="type-emphasis text-fg">
                {new Date(view.collector.since).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </b>
            </Text>
            {isOwner && privateCount > 0 && (
              <Text variant="eyebrow" tone="faint" className="mt-[var(--space-2)]">
                {privateCount} private
              </Text>
            )}
          </div>
        </header>

        <div className="mt-[var(--space-10)] border-t border-line pt-[var(--space-10)]">
          <CoinGrid items={items} owned={isOwner} onToggleVisibility={toggle} />
        </div>

        {error && (
          <Text variant="meta" tone="bad" className="mt-[var(--space-6)]">
            {error}
          </Text>
        )}

        <Text variant="meta" tone="faint" className="mt-[var(--space-10)]">
          {isOwner
            ? "Right-click any coin to hide it or make it public."
            : `Showing only the coins @${view.collector.handle} has made public.`}
        </Text>
      </main>
    </>
  );
}
