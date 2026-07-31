import { Coin } from "@/components/Coin";
import {
  Avatar, AvatarRow, Badge, Button, Card, Field, Input, Meter, Stack, Stat, Swatch, Text,
} from "@/components/ui";

export const dynamic = "force-dynamic";

/** Candidate themes, previewable without replacing the real one. */
const CANDIDATES = [
  ["", "Ovation", "the shipping theme"],
  ["codedex", "Codédex", "measured off codedex.io"],
] as const;

/**
 * /dev/themes — THE SPECIMEN.
 *
 * Every type role and every primitive on one page, so a restyle can be judged
 * whole instead of screen by screen. This is the page to open when adopting a
 * new direction: edit app/theme.css, reload here, see all of it at once.
 *
 * It used to be a two-column swap test. One theme replaced two, so the useful
 * comparison is no longer theme-vs-theme — it is role-vs-role. Typography goes
 * wrong when the decisions are invisible: six properties across eleven roles is
 * impossible to hold in your head and trivial to judge on one screen.
 *
 * If something here has a hardcoded value it will not move when the theme
 * does, and this is where that shows up first.
 */

const ROLES = [
  ["display", "The one huge line on a landing page", "Agents that don’t stall."],
  ["h1", "Page titles", "Team & access"],
  ["h2", "Section and sheet titles", "Retire this run?"],
  ["h3", "Card titles and the wordmark", "Ovation"],
  ["name", "An object’s label — a nameplate, not a heading", "Stripe"],
  ["lead", "Intro copy under a headline", "Ovation is a subscription like any other, which means our paid plans come with a coin."],
  ["body", "Running prose", "Every role owns its own size, weight, tracking, leading and case, so none of them has to compromise for another."],
  ["meta", "Secondary information, table cells", "$20/mo · 35 subscribers"],
  ["eyebrow", "A section label — furniture you skip past", "Your Stripe products"],
  ["caption", "Data attached to an object", "first 50 pro · #21"],
  ["code", "Literal code, ids, terminal output", "run_8fk2 · 41 steps · resumed once"],
] as const;

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-[var(--space-10)] border-t border-line pt-[var(--space-10)]">
      <Text variant="eyebrow" tone="faint" className="mb-[var(--space-6)]">{label}</Text>
      {children}
    </section>
  );
}

export default async function SpecimenPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const active = CANDIDATES.find((c) => c[0] === (t ?? "")) ?? CANDIDATES[0];
  const themeFile = active[0] ? `app/theme-${active[0]}.css` : "app/theme.css";

  return (
    <main
      data-theme={active[0] || undefined}
      className="min-h-screen bg-bg px-[var(--space-8)] py-[var(--space-12)] text-fg"
    >
      <div className="mx-auto max-w-[var(--w-app)]">
        <Text variant="eyebrow" tone="faint">Ovation · design system</Text>
        <Text as="h1" variant="h1" className="mt-[var(--space-3)]">The specimen</Text>
        <Text variant="lead" tone="dim" className="mt-[var(--space-4)] max-w-[var(--w-col)]">
          Everything below reads its values from{" "}
          <span className="type-code">{themeFile}</span> — nothing is styled per
          screen. If a restyle looks wrong here it will look wrong everywhere,
          which is the entire reason this page exists.
        </Text>

        {/* Candidates preview under data-theme, so trying one on never means
            editing the theme the app actually ships. */}
        <Stack row gap={2} wrap className="mt-[var(--space-6)]">
          {CANDIDATES.map(([slug, name, note]) => (
            <a key={name} href={slug ? `?t=${slug}` : "?"}>
              <span
                className={[
                  "inline-flex items-center gap-[var(--space-2)] border px-[var(--space-4)] py-[var(--space-2)]",
                  "rounded-[var(--radius-card)]",
                  slug === active[0] ? "border-fg bg-bg-sink" : "border-line",
                ].join(" ")}
              >
                <Text as="span" variant="meta" className="type-emphasis">{name}</Text>
                <Text as="span" variant="meta" tone="faint">{note}</Text>
              </span>
            </a>
          ))}
        </Stack>

        {/* ── type roles ─────────────────────────────────────── */}
        <Section label="Type roles">
          <Stack gap={8}>
            {ROLES.map(([role, purpose, sample]) => (
              <div key={role} className="grid gap-[var(--space-4)] md:grid-cols-[184px_1fr]">
                <div>
                  <Text variant="code">{role}</Text>
                  <Text variant="meta" tone="faint" className="mt-[var(--space-1)]">
                    {purpose}
                  </Text>
                </div>
                <div className={`type-${role} max-w-[var(--w-col-lg)] text-fg`}>{sample}</div>
              </div>
            ))}
          </Stack>
        </Section>

        {/* ── colour ─────────────────────────────────────────── */}
        <Section label="Colour">
          <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-4">
            {[
              ["bg", "bg-bg"], ["bg-raise", "bg-bg-raise"], ["bg-sink", "bg-bg-sink"],
              ["accent", "bg-accent"], ["fg", "bg-fg"], ["good", "bg-good"],
              ["warn", "bg-warn"], ["bad", "bg-bad"],
            ].map(([name, cls]) => (
              <div key={name}>
                <div className={`h-16 rounded-[var(--radius-card)] border-[length:var(--border)] border-line ${cls}`} />
                <Text variant="caption" tone="faint" className="mt-[var(--space-2)]">{name}</Text>
              </div>
            ))}
          </div>
          <Stack row gap={6} wrap className="mt-[var(--space-6)]">
            <Text variant="body">Default ink</Text>
            <Text variant="body" tone="dim">Dim ink</Text>
            <Text variant="body" tone="faint">Faint ink</Text>
            <Text variant="body" tone="accent">Accent ink</Text>
          </Stack>
        </Section>

        {/* ── controls ───────────────────────────────────────── */}
        <Section label="Controls">
          <Stack row gap={3} wrap>
            <Button>Primary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button size="sm">Small</Button>
            <Button disabled>Disabled</Button>
          </Stack>
          <Stack row gap={2} wrap className="mt-[var(--space-6)]">
            <Badge>Default</Badge>
            <Badge tone="accent">Accent</Badge>
            <Badge tone="good">Live</Badge>
            <Badge tone="warn">Pending</Badge>
            <Badge tone="bad">Retired</Badge>
          </Stack>
          <div className="mt-[var(--space-6)] grid gap-[var(--space-4)] md:grid-cols-2">
            <Field label="Run name">
              <Input defaultValue="first 50 pro" />
            </Field>
            <Field label="Email" error="That address is already claimed">
              <Input placeholder="you@example.com" />
            </Field>
          </div>
        </Section>

        {/* ── surfaces ───────────────────────────────────────── */}
        <Section label="Surfaces & density">
          <div className="grid gap-[var(--space-4)] md:grid-cols-3">
            <Stat label="Subscribers" value="455" sub="across three plans" />
            <Stat label="Coins claimed" value="34 / 50" sub="1 run live" />
            <Card raised>
              <Text variant="h3">Raised card</Text>
              <Text variant="meta" tone="dim" className="mt-[var(--space-2)]">
                Elevation is a token.
              </Text>
            </Card>
          </div>
          <div className="mt-[var(--space-6)] max-w-[var(--w-col)]">
            <Text variant="meta" tone="dim" className="mb-[var(--space-2)]">Meter · 34 of 50</Text>
            <Meter value={0.68} />
          </div>
          <Stack row gap={6} align="center" wrap className="mt-[var(--space-6)]">
            <AvatarRow>
              {["#8a6a3b", "#4A7C59", "#3B5BA5"].map((c, i) => (
                <Avatar key={c} color={c} className="border-2 border-bg">{"TSD"[i]}</Avatar>
              ))}
            </AvatarRow>
            <Stack row gap={2}>
              {["#C87137", "#3B5BA5", "#4A7C59"].map((c, i) => (
                <Swatch key={c} color={c} selected={i === 0} />
              ))}
            </Stack>
          </Stack>
        </Section>

        {/* ── the coin ───────────────────────────────────────── */}
        <Section label="The coin">
          <Stack row gap={5} wrap align="center">
            <Coin glyph="S" tint="#635BFF" size={78} />
            <Coin glyph="PH" tint="#C87137" size={78} />
            <Coin glyph="▲" tint="#4A7C59" size={78} />
            <Coin glyph="Z" tint="#B7410E" size={78} retired />
            <Coin glyph="A" tint="#6F4E37" size={78} missing />
          </Stack>
          <Text variant="meta" tone="faint" className="mt-[var(--space-4)]">
            Grain comes from the theme’s <span className="type-code">--texture</span>, so a
            flat theme yields a flat coin. The dye is the seller’s data, not the theme’s.
          </Text>
        </Section>

        {/* ── guest brand ────────────────────────────────────── */}
        <Section label="Guest brand">
          <Text variant="body" tone="dim" className="mb-[var(--space-5)] max-w-[var(--w-col)]">
            A customer’s surface, painted over the same structure. It overrides
            colour, shape and elevation — never the type roles, never the density.
          </Text>
          <div
            data-brand="warrick"
            className="rounded-[var(--radius-card)] border-[length:var(--border)] border-line bg-bg p-[var(--space-8)] text-fg"
          >
            <Text variant="eyebrow" tone="faint">Pricing</Text>
            <Text as="h2" variant="h2" className="mt-[var(--space-3)]">
              Free while you’re figuring it out.
            </Text>
            <Text variant="lead" tone="dim" className="mt-[var(--space-3)]">
              Usage-based after that. No seat pricing, no sales call.
            </Text>
            <Stack row gap={3} wrap align="center" className="mt-[var(--space-6)]">
              <Button variant="accent">Start building free</Button>
              <Button variant="ghost">See pricing</Button>
              <Badge tone="accent">Durable runs are now GA</Badge>
            </Stack>
          </div>
        </Section>
      </div>
    </main>
  );
}
