"use client";

import { useState } from "react";
import { Coin } from "./Coin";
import { Button, Field, Input, Sheet, SheetContent, SheetTitle, Stack, Swatch, Text } from "./ui";
import { COIN_GLYPHS as GLYPHS, COIN_TINTS as TINTS } from "@/lib/palette";
import type { Plan } from "@/lib/types";

export function AttachCoinSheet({
  plan,
  roleQS,
  onClose,
  onCreated,
}: {
  plan: Plan;
  roleQS: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("first 50 pro");
  const [size, setSize] = useState("50");
  const [tint, setTint] = useState<string>(TINTS[0]);
  const [glyph, setGlyph] = useState<string>(GLYPHS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/runs${roleQS}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: plan.id, name, size: Number(size), glyph, tint }),
    });
    if (res.ok) onCreated();
    else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Could not create the run");
      setBusy(false);
    }
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent size="md">
        <div className="grid md:grid-cols-[1fr_286px]">
          <div className="p-[var(--space-8)]">
            <Text variant="eyebrow" tone="faint">Attach a coin</Text>
            <SheetTitle asChild>
              <Text as="h2" variant="h2" className="mt-[var(--space-2)]">
                {plan.name} · {plan.priceLabel}
              </Text>
            </SheetTitle>
            <Text variant="meta" tone="dim" className="mt-[var(--space-2)]">
              Everyone who subscribes to this plan gets one, free, at checkout. You
              don&rsquo;t change anything on your side.
            </Text>

            <div className="mt-[var(--space-5)] grid gap-[var(--space-3)] [grid-template-columns:1fr_112px]">
              <Field label="Run name">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="How many">
                <Input
                  value={size}
                  inputMode="numeric"
                  onChange={(e) => setSize(e.target.value.replace(/\D/g, ""))}
                />
              </Field>
            </div>
            <Text variant="meta" tone="warn" className="mt-[var(--space-2)]">
              Permanent. When the last one is claimed the run closes and no more can ever exist.
            </Text>

            <Text variant="eyebrow" tone="faint" className="mt-[var(--space-4)]">Mark</Text>
            <Stack row gap={2} wrap className="mt-[var(--space-2)]">
              {GLYPHS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGlyph(g)}
                  className={[
                    "grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] border text-[length:var(--lead-size)]",
                    g === glyph
                      ? "border-fg bg-bg-sink text-fg"
                      : "border-line bg-bg-raise text-fg-dim",
                  ].join(" ")}
                >
                  {g}
                </button>
              ))}
            </Stack>

            <Text variant="eyebrow" tone="faint" className="mt-[var(--space-4)]">Leather</Text>
            <Stack row gap={2} wrap className="mt-[var(--space-2)]">
              {TINTS.map((t) => (
                <Swatch key={t} color={t} selected={t === tint} onClick={() => setTint(t)} />
              ))}
            </Stack>

            {error && (
              <Text variant="meta" tone="bad" className="mt-[var(--space-3)]">{error}</Text>
            )}

            <Stack row gap={3} className="mt-[var(--space-6)]">
              <Button onClick={create} disabled={busy || !name || !size}>
                {busy ? "Attaching…" : "Attach to plan"}
              </Button>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
            </Stack>
          </div>

          <div className="flex flex-col items-center justify-center border-l border-line bg-bg-sink p-[var(--space-8)] text-center">
            <div className="mb-[var(--space-5)] grid place-items-center">
              <Coin glyph={glyph} tint={tint} size={152} />
            </div>
            <Text variant="h3">{plan.name}</Text>
            <Text variant="caption" tone="faint" className="mt-[var(--space-2)]">
              {name || "untitled"} · 1 of {size || "—"}
            </Text>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
