"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Coin } from "@/components/Coin";
import { Badge, Button, Card, Stack, Text } from "@/components/ui";
import type { SellerPublicView } from "@/lib/types";

const FEATURES: Record<string, string[]> = {
  Starter: ["One live run", "Up to 50 coins", "Ovation mark on the back"],
  Studio: ["Unlimited runs", "Your own artwork", "No Ovation mark"],
  Scale: ["Everything in Studio", "Custom coin artwork", "Priority support"],
};

const CURRENT = "Starter";

export function BillingClient({ view }: { view: SellerPublicView }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function subscribe(planId: string) {
    setBusy(planId);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const { url, error } = await res.json();
    if (url) window.location.href = url;
    else {
      alert(error ?? "Could not start checkout");
      setBusy(null);
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-40 flex h-[var(--h-nav-app)] items-center gap-[var(--space-3)] border-b border-line bg-bg-raise px-[var(--space-8)]">
        <Text as="span" variant="h3">Ovation</Text>
        <span className="flex-1" />
        <a href="/app/plans"><Text as="span" variant="meta" tone="dim">Plans</Text></a>
        <a href="/app/team"><Text as="span" variant="meta" tone="dim">Team</Text></a>
        <a href="/demo"><Text as="span" variant="meta" tone="accent">Demo home</Text></a>
      </nav>

      <main className="mx-auto w-full max-w-[var(--w-app)] px-[var(--space-12)] pb-[var(--space-20)] pt-[var(--space-12)] text-center">
        <Text variant="mono" tone="faint">Your Ovation plan</Text>
        <Text as="h1" variant="h1" className="mt-[var(--space-3)]">We use it too.</Text>
        <Text variant="body" tone="dim" className="mx-auto mt-[var(--space-3)] max-w-[52ch] text-[length:var(--text-md)]">
          Ovation is a subscription like any other. Which means our paid plans come with
          a coin, made the same way yours are.
        </Text>

        <div className="mt-[var(--space-12)] grid items-stretch gap-[var(--space-4)] text-left md:grid-cols-3">
          {view.plans.map((p) => {
            const featured = p.name === "Studio";
            const isCurrent = p.name === CURRENT;
            return (
              <Card
                key={p.id}
                pad={0}
                raised={featured}
                className={[
                  "relative flex flex-col p-[var(--space-8)]",
                  isCurrent ? "border-good/45" : featured ? "border-line-strong" : "",
                ].join(" ")}
              >
                {(featured || isCurrent) && (
                  <span className="absolute -top-2.5 left-[var(--space-8)]">
                    <Badge tone={isCurrent ? "good" : "accent"}>
                      {isCurrent ? "Current plan" : "Most popular"}
                    </Badge>
                  </span>
                )}

                <Text variant="h3">{p.name}</Text>
                <Stack row gap={2} align="baseline" className="mt-[var(--space-3)]">
                  <Text as="span" variant="h1">
                    {p.unitAmount === 0 ? "$0" : `$${p.unitAmount / 100}`}
                  </Text>
                  {p.unitAmount > 0 && (
                    <Text as="span" variant="body" tone="faint">/ month</Text>
                  )}
                </Stack>

                <Stack gap={2} className="mt-[var(--space-5)] border-t border-line pt-[var(--space-5)]">
                  {(FEATURES[p.name] ?? []).map((f) => (
                    <Stack key={f} row gap={2} align="start">
                      <Check size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-good" />
                      <Text as="span" variant="meta" tone="dim">{f}</Text>
                    </Stack>
                  ))}
                </Stack>

                {p.run && (
                  <Stack
                    row gap={3} align="center"
                    className="mt-[var(--space-5)] border-t border-line pt-[var(--space-4)]"
                  >
                    <Coin glyph={p.run.glyph} tint={p.run.tint} size={40} />
                    <div>
                      <Text variant="meta" className="font-semibold capitalize">
                        {p.run.name} coin
                      </Text>
                      <Text variant="meta" tone="faint">
                        No. {p.run.claimed + 1} of {p.run.size} · {p.run.size - p.run.claimed} left
                      </Text>
                    </div>
                  </Stack>
                )}

                <div className="mt-auto pt-[var(--space-6)]">
                  <Button
                    full
                    variant={featured ? "primary" : "ghost"}
                    disabled={isCurrent || busy !== null}
                    onClick={() => subscribe(p.id)}
                  >
                    {isCurrent ? "Your plan" : busy === p.id ? "Opening Stripe…" : "Subscribe"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mx-auto mt-[var(--space-10)] max-w-[var(--w-col)] rounded-[var(--radius-md)] bg-bg-sink px-[var(--space-5)] py-[var(--space-4)] text-left">
          <Text variant="meta" tone="dim">
            <b className="text-fg">The closer.</b> Warrick subscribes to Ovation through
            Stripe and gets an Ovation coin in the same reveal their own subscribers get.
            Same webhook, same run table, same object. We are our own first customer.
          </Text>
        </div>
      </main>
    </>
  );
}
