"use client";

import { useState } from "react";
import { Coin } from "./Coin";
import type { Plan } from "@/lib/types";

const TINTS = ["#C87137", "#3B5BA5", "#4A7C59", "#A8324A", "#7B4B94", "#2E7D7B", "#B7410E", "#6F4E37"];
const GLYPHS = ["▲", "◆", "⬡", "❈", "✦", "◐", "⬮", "≈"];

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
  const [name, setName] = useState("founding user");
  const [size, setSize] = useState("50");
  const [tint, setTint] = useState(TINTS[0]);
  const [glyph, setGlyph] = useState(GLYPHS[0]);
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(20,16,11,.72)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="grid w-full max-w-[760px] overflow-hidden rounded-[20px] md:grid-cols-[1fr_286px]"
        style={{ background: "var(--ground)" }}>
        <div className="px-9 py-8">
          <div className="t-eyebrow">Attach a coin</div>
          <h2 className="t-h2 mt-2">{plan.name} · {plan.priceLabel}</h2>
          <p className="mt-2 text-[13.5px]" style={{ color: "var(--dim)" }}>
            Everyone who subscribes to this plan gets one, free, at checkout. You don&rsquo;t
            change anything on your side.
          </p>

          <div className="mt-5 grid gap-3" style={{ gridTemplateColumns: "1fr 112px" }}>
            <div>
              <label className="t-eyebrow mb-1.5 block">Run name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-[10px] px-3.5 py-3 text-sm outline-none"
                style={{ background: "var(--raise)", border: "1px solid var(--rule)" }} />
            </div>
            <div>
              <label className="t-eyebrow mb-1.5 block">How many</label>
              <input value={size} onChange={(e) => setSize(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                className="w-full rounded-[10px] px-3.5 py-3 text-sm outline-none"
                style={{ background: "var(--raise)", border: "1px solid var(--rule)" }} />
            </div>
          </div>
          <p className="mt-2 text-[11.5px]" style={{ color: "var(--warn)" }}>
            Permanent. When the last one is claimed the run closes and no more can ever exist.
          </p>

          <label className="t-eyebrow mb-1.5 mt-4 block">Mark</label>
          <div className="flex flex-wrap gap-2">
            {GLYPHS.map((g) => (
              <button key={g} onClick={() => setGlyph(g)}
                className="grid h-[34px] w-[34px] place-items-center rounded-[9px] text-[15px]"
                style={{
                  background: g === glyph ? "var(--paper)" : "var(--raise)",
                  border: `1px solid ${g === glyph ? "var(--ink)" : "var(--rule)"}`,
                  color: g === glyph ? "var(--ink)" : "var(--dim)",
                }}>{g}</button>
            ))}
          </div>

          <label className="t-eyebrow mb-1.5 mt-4 block">Leather</label>
          <div className="flex flex-wrap gap-2">
            {TINTS.map((t) => (
              <button key={t} onClick={() => setTint(t)} aria-label={t}
                className="h-8 w-8 rounded-[9px]"
                style={{ background: t, border: `2.5px solid ${t === tint ? "var(--ink)" : "transparent"}` }} />
            ))}
          </div>

          {error && <p className="mt-3 text-[12px]" style={{ color: "var(--warn)" }}>{error}</p>}

          <div className="mt-6 flex gap-2.5">
            <button onClick={create} disabled={busy || !name || !size}
              className="rounded-[11px] px-6 py-3.5 text-[13.5px] font-semibold disabled:opacity-40"
              style={{ background: "var(--ink)", color: "var(--ground)" }}>
              {busy ? "Attaching…" : "Attach to plan"}
            </button>
            <button onClick={onClose}
              className="rounded-[11px] px-6 py-3.5 text-[13.5px]"
              style={{ border: "1px solid var(--rule)", color: "var(--dim)" }}>Cancel</button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-8 py-8 text-center"
          style={{ background: "var(--paper)", borderLeft: "1px solid var(--rule)" }}>
          <div className="mb-5 grid place-items-center">
            <Coin glyph={glyph} tint={tint} size={152} />
          </div>
          <div style={{ font: "400 19px/1.2 var(--display)" }}>{plan.name}</div>
          <div className="t-serial mt-2">{name || "untitled"} · 1 of {size || "—"}</div>
        </div>
      </div>
    </div>
  );
}
