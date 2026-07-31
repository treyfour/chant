"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Coin } from "@/components/Coin";
import { Avatar, AvatarRow, Badge, Button, ButtonLink, Card, Stack, Text } from "@/components/ui";
import type { SellerPublicView } from "@/lib/types";

/**
 * Warrick's own marketing site.
 *
 * Nothing here is bespoke any more — it's the same primitives as the wallet
 * under `data-brand="warrick"`. Cold near-black, grotesque, flush surfaces,
 * dot grid. That it looks nothing like Ovation is entirely a token file.
 *
 * The leather coin on these cold dark pricing cards looks like a foreign
 * object. It is one. That visual whiplash is the product working: you left one
 * company and arrived at another.
 */

const FEATURES: Record<string, string[]> = {
  Free: ["1 concurrent run", "500 steps / month", "7-day trace retention", "Community Discord"],
  Pro: ["Unlimited concurrency", "50k steps / month", "90-day traces + replay", "Shared Slack channel"],
  Team: ["Everything in Pro", "Self-hosted workers", "SSO and SAML", "99.9% uptime SLA"],
};

export function SellerSite({ view }: { view: SellerPublicView }) {
  const [busy, setBusy] = useState<string | null>(null);
  const { seller, plans, collectors, collectorCount } = view;

  async function subscribe(planId: string) {
    setBusy(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const { url, error } = await res.json();
      if (url) window.location.href = url;
      else { alert(error ?? "Could not start checkout"); setBusy(null); }
    } catch { setBusy(null); }
  }

  return (
    <div data-brand="warrick" className="min-h-screen bg-bg text-fg">
      {/* ---------- nav ---------- */}
      <nav className="sticky top-0 z-50 flex h-16 items-center gap-[var(--space-8)] border-b border-line bg-bg/85 px-[var(--space-6)] backdrop-blur md:px-[var(--space-12)]">
        <Stack row gap={3} align="center">
          <span className="grid h-7 w-7 place-items-center rounded-[var(--radius-md)] bg-accent text-[length:var(--meta-size)] text-accent-fg">
            ▲
          </span>
          <Text as="span" variant="h3" className="type-emphasis">
            {seller.name}
          </Text>
        </Stack>
        <Stack row gap={6} align="center" className="hidden md:flex">
          <Text as="span" variant="body" tone="dim">Product</Text>
          <Text as="span" variant="body" tone="dim">Docs</Text>
          <Text as="span" variant="body" tone="dim">Changelog</Text>
          <a href="#pricing"><Text as="span" variant="body">Pricing</Text></a>
        </Stack>
        <span className="flex-1" />
        <Text as="span" variant="body" tone="dim" className="hidden sm:inline">Sign in</Text>
        <ButtonLink href="#pricing" size="sm">Start free</ButtonLink>
      </nav>

      {/* ---------- hero ---------- */}
      <header className="surface-textured px-[var(--space-6)] pb-[var(--space-20)] pt-[var(--space-20)] md:px-[var(--space-12)]">
        <div className="mx-auto max-w-[var(--w-page)]">
          <Badge tone="accent">Durable runs are now GA</Badge>

          <Text as="h1" variant="display" className="mt-[var(--space-6)] max-w-[15ch] type-emphasis">
            Agents that don&rsquo;t stall.
          </Text>

          <Text variant="lead" tone="dim" className="mt-[var(--space-5)] max-w-[54ch] ">
            {seller.name} is the orchestration layer for AI agents. Durable runs, automatic
            retries, step-level replay, and a trace for every decision your agent made — so
            you stop rebuilding the same scaffolding on every project.
          </Text>

          <Stack row gap={3} wrap align="center" className="mt-[var(--space-8)]">
            <ButtonLink href="#pricing" variant="accent">Start building free</ButtonLink>
            <ButtonLink href="#pricing" variant="ghost">See pricing</ButtonLink>
          </Stack>

          <Card pad={5} className="mt-[var(--space-12)] max-w-[var(--w-col-lg)] bg-bg-sink font-[family-name:var(--font-mono)] text-[length:var(--meta-size)] leading-[1.85]">
            <Stack row gap={2} className="mb-[var(--space-3)]">
              {["bad", "warn", "good"].map((t) => (
                <span key={t} className={`h-2.5 w-2.5 rounded-full bg-${t}`} />
              ))}
            </Stack>
            <div><span className="text-fg-faint">$</span> npm i <span className="text-good">@warrick/sdk</span></div>
            <div className="mt-[var(--space-3)]">
              <span className="text-accent">await</span> run(researchAgent, {"{"}
            </div>
            <div>&nbsp;&nbsp;retries: <span className="text-good">5</span>,</div>
            <div>&nbsp;&nbsp;checkpoint: <span className="text-good">&quot;each-step&quot;</span>,</div>
            <div>&nbsp;&nbsp;onStall: <span className="text-good">&quot;resume&quot;</span></div>
            <div>{"})"}</div>
            <div className="mt-[var(--space-3)] text-fg-faint">
              → run_8fk2 · 41 steps · 2 retries · resumed once ✓
            </div>
          </Card>
        </div>
      </header>

      {/* ---------- logo strip ---------- */}
      <section className="border-y border-line px-[var(--space-6)] py-[var(--space-10)] md:px-[var(--space-12)]">
        <Stack row gap={10} wrap align="center" className="mx-auto max-w-[var(--w-page)]">
          <Text as="span" variant="eyebrow" tone="faint">Orchestrating agents at</Text>
          {["Cinder", "Halyard", "Parity", "Thresher", "Roost"].map((n) => (
            <Text key={n} as="span" variant="body" tone="faint" className="type-emphasis">{n}</Text>
          ))}
        </Stack>
      </section>

      {/* ---------- features ---------- */}
      <section className="px-[var(--space-6)] py-[var(--space-20)] md:px-[var(--space-12)]">
        <div className="mx-auto max-w-[var(--w-page)]">
          <Text variant="eyebrow" tone="faint">Why teams switch</Text>
          <Text as="h2" variant="h1" className="mt-[var(--space-4)] max-w-[20ch] type-emphasis">
            Your agent framework stops at the happy path.
          </Text>

          <div className="mt-[var(--space-12)] grid gap-[var(--space-4)] md:grid-cols-3">
            {[
              ["Durable by default", "Every step is checkpointed. A crashed worker, a rate limit, a 3am deploy — the run picks up where it stopped instead of starting over."],
              ["Replay any decision", "Step-level traces with the exact prompt, tool call, and response. Scrub back to step 14 and re-run it against a different model."],
              ["Stall detection", "Agents don't crash, they loop. Warrick notices when yours is going in circles and resumes, escalates, or halts on your rules."],
            ].map(([t, b]) => (
              <Card key={t}>
                <Text variant="h3" className="type-emphasis">{t}</Text>
                <Text variant="body" tone="dim" className="mt-[var(--space-3)]">{b}</Text>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- pricing ---------- */}
      <section id="pricing" className="border-t border-line px-[var(--space-6)] py-[var(--space-20)] md:px-[var(--space-12)]">
        <div className="mx-auto max-w-[var(--w-page)]">
          <Text variant="eyebrow" tone="faint">Pricing</Text>
          <Text as="h2" variant="h1" className="mt-[var(--space-4)] type-emphasis">
            Free while you&rsquo;re figuring it out.
          </Text>
          <Text variant="body" tone="dim" className="mt-[var(--space-3)] max-w-[52ch]">
            Usage-based after that. No seat pricing, no sales call.
          </Text>

          <div className="mt-[var(--space-12)] grid items-stretch gap-[var(--space-4)] md:grid-cols-3">
            {plans.map((p) => {
              const featured = p.name === "Pro";
              return (
                <Card
                  key={p.id}
                  pad={0}
                  className={`relative flex flex-col p-[var(--space-8)] ${featured ? "border-accent/50 bg-bg-raise" : ""}`}
                >
                  {featured && (
                    <span className="absolute -top-2.5 left-[var(--space-8)]">
                      <Badge tone="accent" className="bg-accent text-accent-fg">Most popular</Badge>
                    </span>
                  )}

                  <Text variant="body" className="type-emphasis">{p.name}</Text>
                  <Stack row gap={2} align="baseline" className="mt-[var(--space-3)]">
                    <Text as="span" variant="h1" className="type-emphasis">
                      {p.unitAmount === 0 ? "$0" : `$${p.unitAmount / 100}`}
                    </Text>
                    {p.unitAmount > 0 && (
                      <Text as="span" variant="body" tone="faint">/ month</Text>
                    )}
                  </Stack>

                  <Stack gap={3} className="mt-[var(--space-6)] border-t border-line pt-[var(--space-5)]">
                    {(FEATURES[p.name] ?? []).map((f) => (
                      <Stack key={f} row gap={2} align="start">
                        <Check size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-good" />
                        <Text as="span" variant="meta" tone="dim">{f}</Text>
                      </Stack>
                    ))}
                  </Stack>

                  {p.run && !p.run.retired && (
                    <Stack
                      row gap={3} align="center"
                      className="mt-[var(--space-6)] rounded-[var(--radius-md)] border border-line bg-fg/4 p-[var(--space-3)]"
                    >
                      <Coin glyph={p.run.glyph} tint={p.run.tint} size={42} />
                      <div>
                        <Text variant="meta" className="type-emphasis capitalize">
                          {p.run.name} coin included
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
                      variant={featured ? "accent" : "ghost"}
                      disabled={p.unitAmount === 0 || busy !== null}
                      onClick={() => subscribe(p.id)}
                    >
                      {busy === p.id
                        ? "Opening Stripe…"
                        : p.unitAmount === 0
                          ? "Start free"
                          : `Subscribe to ${p.name}`}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {collectors.length > 0 && (
            <Stack row gap={3} wrap align="center" className="mt-[var(--space-10)]">
              <AvatarRow>
                {collectors.map((c) => (
                  <Avatar
                    key={c.handle}
                    as="a"
                    color={c.avatarColor}
                    href={`/@${c.handle}`}
                    title={`${c.name} — open their collection`}
                    className="border-2 border-bg transition-transform hover:-translate-y-0.5"
                  >
                    {c.name[0]?.toUpperCase()}
                  </Avatar>
                ))}
              </AvatarRow>
              <Text as="span" variant="meta" tone="faint">
                {collectorCount} developers subscribe to {seller.name}
              </Text>
            </Stack>
          )}
        </div>
      </section>

      <footer className="border-t border-line px-[var(--space-6)] py-[var(--space-10)] md:px-[var(--space-12)]">
        <Stack row gap={4} wrap align="center" className="mx-auto max-w-[var(--w-page)]">
          <Text as="span" variant="meta" tone="faint">
            © {seller.name} · {seller.location}
          </Text>
          <span className="flex-1" />
          <a href="/demo">
            <Text as="span" variant="meta" tone="faint">Ovation demo ↗</Text>
          </a>
        </Stack>
      </footer>
    </div>
  );
}
