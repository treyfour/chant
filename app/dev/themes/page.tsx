import { Coin } from "@/components/Coin";
import {
  Badge, Button, Card, Field, Input, Stack, Stat, Text,
} from "@/components/ui";

export const dynamic = "force-static";

/**
 * /dev/themes — the swap test, rendered.
 *
 * Every primitive under every theme, side by side. This existed as
 * `prototypes/skins.html` and made visual decisions fast because you could
 * compare instantly instead of imagining. It belongs in the real app, not just
 * the prototypes — the moment a component stops theming, it shows up here.
 *
 * If a component looks wrong in one column, it has a hardcoded value.
 */

const THEMES = ["ovation", "warrick"] as const;

function Specimen() {
  return (
    <Stack gap={8} className="p-[var(--space-8)]">
      {/* type ladder */}
      <Stack gap={3}>
        <Text variant="mono" tone="faint">Type</Text>
        <Text variant="display">Agents that don&rsquo;t stall</Text>
        <Text variant="h2">A receipt you&rsquo;d keep</Text>
        <Text variant="body" tone="dim">
          Body copy at the base step. The scale is shared across themes — only
          the family and tracking change, so components never need per-theme sizing.
        </Text>
        <Text variant="meta" tone="faint">Meta · secondary information</Text>
        <Text variant="mono" tone="faint">MONO · FIRST 50 PRO · #21</Text>
      </Stack>

      {/* buttons */}
      <Stack gap={3}>
        <Text variant="mono" tone="faint">Button</Text>
        <Stack row gap={2} wrap align="center">
          <Button variant="primary">Primary</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </Stack>
      </Stack>

      {/* badges */}
      <Stack gap={3}>
        <Text variant="mono" tone="faint">Badge</Text>
        <Stack row gap={2} wrap>
          <Badge>Default</Badge>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="good">Live</Badge>
          <Badge tone="warn">Pending</Badge>
          <Badge tone="bad">Retired</Badge>
        </Stack>
      </Stack>

      {/* surfaces */}
      <Stack gap={3}>
        <Text variant="mono" tone="faint">Card &amp; Stat</Text>
        <Stack row gap={3} wrap>
          <Stat label="Subscribers" value="455" sub="across three plans" />
          <Stat label="Coins claimed" value="34 / 50" sub="1 run live" />
        </Stack>
        <Card raised>
          <Text variant="h3">Raised card</Text>
          <Text variant="meta" tone="dim" className="mt-[var(--space-2)]">
            Elevation is a token. Ovation lifts, Warrick sits flush — same component.
          </Text>
        </Card>
      </Stack>

      {/* form */}
      <Stack gap={3}>
        <Text variant="mono" tone="faint">Field</Text>
        <Field label="Run name">
          <Input defaultValue="first 50 pro" />
        </Field>
        <Field label="Email" error="That address is already claimed">
          <Input placeholder="you@example.com" />
        </Field>
      </Stack>

      {/* the material */}
      <Stack gap={3}>
        <Text variant="mono" tone="faint">Coin</Text>
        <Stack row gap={5} wrap align="center">
          <Coin glyph="S" tint="#635BFF" size={84} />
          <Coin glyph="PH" tint="#F54E00" size={84} />
          <Coin glyph="SB" tint="#3ECF8E" size={84} />
          <Coin glyph="Z" tint="#FF4A00" size={84} kind="backed" />
          <Coin glyph="A" tint="#FF5A5F" size={84} missing />
        </Stack>
        <Text variant="meta" tone="faint">
          Grain comes from the theme&rsquo;s --texture, so a flat theme yields a flat coin.
        </Text>
      </Stack>
    </Stack>
  );
}

export default function ThemeGallery() {
  return (
    <main className="min-h-screen" data-theme="ovation">
      <div className="border-b border-line px-[var(--space-8)] py-[var(--space-6)]">
        <Text variant="mono" tone="faint">Ovation · design system</Text>
        <Text as="h1" variant="h1" className="mt-[var(--space-2)]">The swap test</Text>
        <Text variant="body" tone="dim" className="mt-[var(--space-3)] max-w-[60ch]">
          The same components under every theme. Nothing below is re-implemented per
          brand — each column is one file of token values. If something looks wrong in
          one column, it contains a hardcoded value.
        </Text>
      </div>

      <div className="grid md:grid-cols-2">
        {THEMES.map((t) => (
          <section
            key={t}
            data-theme={t}
            className="bg-bg border-line md:border-r [&:last-child]:border-r-0"
          >
            <div className="sticky top-0 z-10 border-b border-line bg-bg/90 px-[var(--space-8)] py-[var(--space-4)] backdrop-blur">
              <Text variant="mono" tone="faint">{t}</Text>
            </div>
            <Specimen />
          </section>
        ))}
      </div>
    </main>
  );
}
