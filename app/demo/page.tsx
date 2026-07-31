import { Coin } from "@/components/Coin";
import { Card, Stack, Text } from "@/components/ui";
import { TOUR as ROUTES } from "@/lib/mocks";

export const dynamic = "force-dynamic";

/**
 * The walkthrough index. `/` opens on Warrick's own site — landing on a
 * directory gives the trick away — so this lives at /demo for navigating
 * between surfaces.
 */


const STACK: Array<[string, string]> = [
  ["Identity", "Auth0, provisioned through the Stripe Projects CLI. Collectors are plain users; sellers are Organizations with roles read off the token."],
  ["Payments", "Stripe Checkout and webhooks. checkout.session.completed is the only path that issues a coin."],
  ["Data", "Neon Postgres, also provisioned through Stripe Projects. Serial allocation is one atomic statement, so two buyers can never share a number."],
];

export default function DemoIndex() {
  return (
    <main className="mx-auto w-full max-w-[var(--w-app)] px-[var(--space-12)] pb-[var(--space-20)] pt-[var(--space-20)]">
      <Text variant="eyebrow" tone="faint">Ovation</Text>
      <Text as="h1" variant="display" className="mt-[var(--space-4)] max-w-[16ch]">
        A receipt you&rsquo;d actually keep.
      </Text>
      <Text variant="lead" tone="dim" className="mt-[var(--space-4)] max-w-[58ch] ">
        Every subscription you start generates a receipt you never look at again.
        Subscribe to an early-stage company through Ovation and you get a numbered,
        limited-run coin instead. Collections are browsable, which is how the next
        person finds the company.
      </Text>

      <div className="mt-[var(--space-6)] rounded-[var(--radius-card)] bg-bg-sink px-[var(--space-5)] py-[var(--space-4)]">
        <Text variant="meta" tone="dim">
          <b className="text-fg">Walk it in order.</b> Card{" "}
          <code className="font-[family-name:var(--font-mono)]">4242 4242 4242 4242</code>, any
          future expiry, any CVC. The coin is issued by the Stripe webhook, not by the
          browser — so it appears only once the payment actually lands.
        </Text>
      </div>

      <div className="mt-[var(--space-10)] grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
        {ROUTES.map((r) => (
          <a key={r.href} href={r.href} className="group">
            <Card className="flex h-full flex-col transition-transform duration-[var(--dur)] group-hover:-translate-y-0.5">
              <Stack row gap={4} align="center">
                <Coin glyph={r.glyph} tint={r.tint} size={52} />
                <div>
                  <Text variant="eyebrow" tone="faint">
                    {r.step} · {r.label}
                  </Text>
                  <Text variant="h3" className="mt-[var(--space-2)]">{r.title}</Text>
                </div>
              </Stack>
              <Text variant="meta" tone="dim" className="mt-[var(--space-4)] flex-1">
                {r.body}
              </Text>
              <Text variant="meta" tone="accent" className="mt-[var(--space-4)] type-emphasis">
                {r.cta}
              </Text>
            </Card>
          </a>
        ))}
      </div>

      <div className="mt-[var(--space-10)] grid grid-cols-1 gap-[var(--space-6)] border-t border-line pt-[var(--space-8)] sm:grid-cols-3">
        {STACK.map(([k, v]) => (
          <div key={k}>
            <Text variant="eyebrow" tone="faint" className="mb-[var(--space-2)]">{k}</Text>
            <Text variant="meta" tone="dim">{v}</Text>
          </div>
        ))}
      </div>

      <Text variant="meta" tone="faint" className="mt-[var(--space-8)]">
        <a href="/dev/themes" className="hover:text-fg">Design system · the swap test ↗</a>
      </Text>
    </main>
  );
}
