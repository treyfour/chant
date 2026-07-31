"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Coin } from "@/components/Coin";
import { AttachCoinSheet } from "@/components/AttachCoinSheet";
import {
  Avatar, Badge, Button, ButtonLink, Card, Meter, Row, Sheet, SheetContent, SheetTitle,
  Stack, Stat, Text,
} from "@/components/ui";
import type { MemberRole, Plan, CoinRun, SellerDashboardView } from "@/lib/types";

type PlanWithRun = Plan & { run: CoinRun | null };

/** Plan rows share a column template between header and body. One source. */
const ROW = "56px 1fr 170px 170px";

export function PlansClient({
  view,
  role,
}: {
  view: SellerDashboardView;
  role: MemberRole;
}) {
  const router = useRouter();
  const [attaching, setAttaching] = useState<PlanWithRun | null>(null);
  const [confirmRetire, setConfirmRetire] = useState<CoinRun | null>(null);
  const [busy, setBusy] = useState(false);

  const can = (p: string) => view.viewerPermissions.includes(p as never);
  const roleQS = role === "member" ? "?role=member" : "";

  const liveRuns = view.plans.filter((p) => p.run && !p.run.retired);
  const claimed = liveRuns.reduce((a, p) => a + (p.run?.claimed ?? 0), 0);
  const capacity = liveRuns.reduce((a, p) => a + (p.run?.size ?? 0), 0);

  async function retire() {
    if (!confirmRetire) return;
    setBusy(true);
    await fetch(`/api/runs/${confirmRetire.id}/retire${roleQS}`, { method: "POST" });
    setConfirmRetire(null);
    setBusy(false);
    router.refresh();
  }

  return (
    <>
      <nav className="sticky top-0 z-40 flex h-[var(--h-nav-app)] items-center gap-[var(--space-3)] border-b border-line bg-bg-raise px-[var(--space-8)]">
        <Text as="span" variant="h3">Ovation</Text>
        <Stack
          row gap={2} align="center"
          className="ml-[var(--space-3)] rounded-[var(--radius-mark)] border-[length:var(--border)] border-line px-[var(--space-3)] py-[var(--space-2)]"
        >
          <span className="grid h-5 w-5 place-items-center rounded-[var(--radius-mark)] bg-accent text-[length:var(--eyebrow-size)] text-accent-fg">
            {view.seller.mark}
          </span>
          <Text as="span" variant="meta" className="type-emphasis">{view.seller.name}</Text>
          <Text as="span" variant="meta" tone="faint">
            {role === "owner" ? "Owner" : "Member"}
          </Text>
        </Stack>
        <span className="flex-1" />
        <a href={`/app/team${roleQS}`}><Text as="span" variant="meta" tone="dim">Team</Text></a>
        <a href="/app/billing"><Text as="span" variant="meta" tone="dim">Billing</Text></a>
        <a href="/demo"><Text as="span" variant="meta" tone="accent">Demo home</Text></a>
      </nav>

      <main className="mx-auto w-full max-w-[var(--w-app)] px-[var(--space-12)] pb-[var(--space-20)] pt-[var(--space-10)]">
        <Stack row justify="between" align="end" wrap gap={5}>
          <div>
            <Text variant="eyebrow" tone="faint">{view.seller.name}</Text>
            <Text as="h1" variant="h1" className="mt-[var(--space-3)]">Plans</Text>
          </div>
          <Badge tone="good">● Stripe connected</Badge>
        </Stack>

        <div className="mt-[var(--space-8)] grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-3">
          <Stat
            label="Subscribers"
            value={view.plans.reduce((a, p) => a + p.subscriberCount, 0)}
            sub="across three plans"
          />
          <Stat
            label="Coins claimed"
            value={capacity ? `${claimed} / ${capacity}` : "0"}
            sub={liveRuns.length ? `${liveRuns.length} run${liveRuns.length > 1 ? "s" : ""} live` : "no runs yet"}
          />
          <Stat label="Ovation plan" value="Starter" sub="1 run, 50 coins" />
        </div>

        <div className="mt-[var(--space-8)]">
          <Stack row justify="between" align="baseline" className="mb-[var(--space-3)]">
            <Text as="span" variant="eyebrow" tone="faint">Your Stripe products</Text>
            <Text as="span" variant="meta" tone="faint">
              Synced from {view.seller.stripeAccountId ?? "Stripe"}
            </Text>
          </Stack>

          <Card pad={0}>
            {view.plans.map((p, i) => (
              <Row
                key={p.id}
                cols={ROW}
                className={[
                  "items-center px-[var(--space-6)] py-[var(--space-5)]",
                  i < view.plans.length - 1 ? "border-b border-line" : "",
                  p.run && !p.run.retired ? "bg-accent-soft" : "",
                ].join(" ")}
              >
                {p.run ? (
                  <Coin glyph={p.run.glyph} tint={p.run.tint} size={44} retired={p.run.retired} />
                ) : (
                  <div className="grid h-11 w-11 place-items-center rounded-full border-[length:var(--border)] border-dashed border-line text-fg-faint">
                    <Plus size={16} strokeWidth={1.5} />
                  </div>
                )}

                <div>
                  <Text variant="body" className="type-emphasis">{p.name}</Text>
                  <Text variant="meta" tone="dim" className="mt-[var(--space-1)]">
                    {p.priceLabel} · {p.subscriberCount} subscribers
                  </Text>
                </div>

                <div>
                  {p.run ? (
                    <>
                      <Text as="span" variant="meta" tone="dim">
                        <b className="text-fg">{p.run.name}</b> · {p.run.claimed} of {p.run.size}
                      </Text>
                      {p.run.retired && (
                        <span className="ml-[var(--space-2)]">
                          <Badge tone="bad">Retired</Badge>
                        </span>
                      )}
                      <Meter value={p.run.claimed / p.run.size} className="mt-[var(--space-2)]" />
                    </>
                  ) : (
                    <Text as="span" variant="meta" tone="faint">No coin attached</Text>
                  )}
                </div>

                <Stack row gap={2} justify="end">
                  {p.run && !p.run.retired && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={!can("coins:retire")}
                      title={can("coins:retire") ? undefined : "Members cannot retire runs"}
                      onClick={() => setConfirmRetire(p.run!)}
                    >
                      Retire
                    </Button>
                  )}
                  {!p.run && (
                    <Button
                      size="sm"
                      disabled={!can("coins:create")}
                      title={can("coins:create") ? undefined : "Members cannot attach coins"}
                      onClick={() => setAttaching(p)}
                    >
                      Add coin
                    </Button>
                  )}
                </Stack>
              </Row>
            ))}
          </Card>

          {liveRuns.length === 0 && (
            <Text variant="meta" tone="dim" className="py-[var(--space-8)] text-center">
              Pick a plan above and attach your first coin. Your checkout stays exactly as it is.
            </Text>
          )}
        </div>

        {role === "member" && (
          <div className="mt-[var(--space-6)] rounded-[var(--radius-card)] bg-bg-sink px-[var(--space-5)] py-[var(--space-4)]">
            <Text variant="meta" tone="dim">
              Viewing as <b className="text-fg">Member</b> — read only. Add coin and Retire
              are disabled by the permissions on the Auth0 token, not by a flag in our
              database. The API refuses them with 403 too; the button state is not the
              security boundary.{" "}
              <a href="/auth/login" className="text-accent-ink">Sign in</a> to act as Owner.
            </Text>
          </div>
        )}

        <div className="mt-[var(--space-5)]">
          <Text variant="eyebrow" tone="faint" className="mb-[var(--space-3)]">Recent</Text>
          <Card>
            {view.activity.length === 0 && (
              <Text variant="meta" tone="faint" className="py-[var(--space-2)]">Nothing yet.</Text>
            )}
            {view.activity.map((a, i) => (
              <Stack
                key={a.id}
                row gap={3} align="center"
                className={[
                  "py-[var(--space-3)]",
                  i < view.activity.length - 1 ? "border-b border-line" : "",
                ].join(" ")}
              >
                <Avatar color={a.actorColor} size="sm">{a.actorInitial}</Avatar>
                <Text as="span" variant="meta" dangerouslySetInnerHTML={{ __html: a.text }} />
                <span className="flex-1" />
                <Text as="span" variant="meta" tone="faint" className="whitespace-nowrap">
                  {new Date(a.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </Text>
              </Stack>
            ))}
          </Card>
        </div>
      </main>

      {attaching && (
        <AttachCoinSheet
          plan={attaching}
          roleQS={roleQS}
          onClose={() => setAttaching(null)}
          onCreated={() => { setAttaching(null); router.refresh(); }}
        />
      )}

      {confirmRetire && (
        <Sheet open onOpenChange={(o) => !o && setConfirmRetire(null)}>
          <SheetContent size="sm">
            <div className="p-[var(--space-10)] text-center">
              <SheetTitle asChild>
                <Text as="h2" variant="h2">Retire this run?</Text>
              </SheetTitle>
              <Text variant="body" tone="dim" className="mt-[var(--space-3)]">
                <b className="text-fg">{confirmRetire.name}</b> has{" "}
                {confirmRetire.size - confirmRetire.claimed} unclaimed coins. Retiring
                closes it forever — those will never exist, and the {confirmRetire.claimed}{" "}
                already out there become the only ones.
              </Text>
              <Stack row gap={3} className="mt-[var(--space-6)]">
                <Button variant="ghost" full onClick={() => setConfirmRetire(null)}>
                  Keep it open
                </Button>
                <Button variant="danger" full disabled={busy} onClick={retire}>
                  {busy ? "Retiring…" : "Retire run"}
                </Button>
              </Stack>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
