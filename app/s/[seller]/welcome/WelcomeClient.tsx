"use client";

import { useCallback, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { RevealSheet, type RevealPayload } from "@/components/RevealSheet";
import { CollectionSheet } from "@/components/CollectionSheet";
import { Button, ButtonLink, Card, Stack, Text } from "@/components/ui";

/**
 * Warrick's own onboarding screen — still their theme, still their brand.
 *
 * Ovation arrives on top as a warm sheet from a different company. Nothing
 * about this page changes; a third party just hands you something. The sheets
 * force `theme="ovation"`, which is what produces the whiplash.
 */
export function WelcomeClient({
  sellerName,
  sessionId,
}: {
  sellerName: string;
  sessionId: string | null;
}) {
  const [payload, setPayload] = useState<RevealPayload | null>(null);
  const [open, setOpen] = useState(false);
  const [collection, setCollection] = useState(false);
  const [waiting, setWaiting] = useState(Boolean(sessionId));

  // Poll until the webhook has actually claimed a serial. We never invent one.
  useEffect(() => {
    if (!sessionId) return;
    let alive = true;
    let tries = 0;

    const tick = async () => {
      if (!alive || tries++ > 25) { if (alive) setWaiting(false); return; }
      try {
        const res = await fetch(`/api/claim-status?session_id=${sessionId}`);
        const data = await res.json();
        if (!alive) return;
        if (data.status === "claimed") {
          setPayload(data.payload); setOpen(true); setWaiting(false); return;
        }
      } catch { /* retry */ }
      setTimeout(tick, 700);
    };

    tick();
    return () => { alive = false; };
  }, [sessionId]);

  const reopen = useCallback(() => payload && setOpen(true), [payload]);

  return (
    <div data-brand="warrick" className="min-h-screen bg-bg text-fg">
      <nav className="flex h-[var(--h-nav)] items-center gap-[var(--space-3)] border-b border-line px-[var(--space-6)] md:px-[var(--space-12)]">
        <span className="grid h-7 w-7 place-items-center rounded-[var(--radius-card)] bg-accent text-[length:var(--meta-size)] text-accent-fg">
          ▲
        </span>
        <Text as="span" variant="h3" className="type-emphasis">
          {sellerName}
        </Text>
      </nav>

      <main className="surface-textured min-h-[calc(100vh-var(--h-nav))]">
        <div className="mx-auto max-w-[var(--w-col-sm)] px-[var(--space-6)] py-[var(--space-20)] text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border-[length:var(--border)] border-good/30 bg-good/14 text-good">
            <Check size={20} strokeWidth={1.5} />
          </div>

          <Text as="h1" variant="h1" className="mt-[var(--space-6)] type-emphasis">
            You&rsquo;re on Pro
          </Text>
          <Text variant="lead" tone="dim" className="mt-[var(--space-3)] ">
            Your workspace is ready. Install the SDK and your first run is on us.
          </Text>

          <Card pad={4} className="mt-[var(--space-8)] bg-bg-sink text-left font-[family-name:var(--font-mono)] text-[length:var(--meta-size)]">
            <span className="text-fg-faint">$</span> npm i <span className="text-good">@warrick/sdk</span>
          </Card>

          <Card pad={5} className="mt-[var(--space-4)] text-left">
            {[
              ["Plan", "Pro · $20/mo"],
              ["Next invoice", "in 30 days"],
              ["Card", "•••• 4242"],
            ].map(([k, v]) => (
              <Stack key={k} row justify="between" className="py-[var(--space-2)]">
                <Text as="span" variant="meta" tone="dim">{k}</Text>
                <Text as="span" variant="meta" className="type-emphasis">{v}</Text>
              </Stack>
            ))}
          </Card>

          <ButtonLink href="#" variant="accent" className="mt-[var(--space-6)]">
            Open the dashboard
          </ButtonLink>

          {waiting && (
            <Text variant="meta" tone="faint" className="mt-[var(--space-6)]">
              Waiting for Stripe to confirm…
            </Text>
          )}

          {payload && !open && (
            <div className="mt-[var(--space-6)]">
              <Button variant="ghost" size="sm" onClick={reopen}>Show the coin again</Button>
            </div>
          )}
        </div>
      </main>

      {open && payload && (
        <RevealSheet
          payload={payload}
          onClose={() => setOpen(false)}
          // Accepting opens the collection as a sheet OVER Warrick. No
          // navigation — Ovation is a layer on their product, not a destination.
          onAdd={() => { setOpen(false); setCollection(true); }}
        />
      )}

      {collection && (
        <CollectionSheet
          handle={payload?.handle ?? "trey"}
          justAdded="warrick"
          onClose={() => setCollection(false)}
        />
      )}
    </div>
  );
}
