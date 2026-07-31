"use client";

import { useState } from "react";
import { Coin } from "@/components/Coin";
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
      <nav
        className="sticky top-0 z-40 flex h-[60px] items-center gap-3 px-8"
        style={{ background: "var(--raise)", borderBottom: "1px solid var(--rule)" }}
      >
        <span style={{ font: "400 18px/1 var(--display)" }}>Ovation</span>
        <span className="flex-1" />
        <a href="/app/plans" className="text-[12.5px]" style={{ color: "var(--dim)" }}>Plans</a>
        <a href="/app/team" className="text-[12.5px]" style={{ color: "var(--dim)" }}>Team</a>
      </nav>

      <main className="w-full mx-auto max-w-[1000px] px-11 pb-24 pt-14 text-center">
        <div className="t-eyebrow">Your Ovation plan</div>
        <h1 className="t-display mt-3">We use it too.</h1>
        <p className="mx-auto mt-3 max-w-[52ch] text-base" style={{ color: "var(--dim)" }}>
          Ovation is a subscription like any other. Which means our paid plans come with a
          coin, made the same way yours are.
        </p>

        <div className="mt-11 grid grid-cols-1 items-stretch gap-[18px] text-left md:grid-cols-3">
          {view.plans.map((p) => {
            const featured = p.name === "Studio";
            const isCurrent = p.name === CURRENT;
            return (
              <div
                key={p.id}
                className="relative flex flex-col rounded-2xl px-[26px] py-7"
                style={{
                  background: "var(--raise)",
                  border: `1px solid ${
                    isCurrent ? "rgba(74,124,89,.45)" : featured ? "rgba(33,31,27,.26)" : "var(--rule)"
                  }`,
                  boxShadow: featured ? "var(--lift)" : "none",
                }}
              >
                {(featured || isCurrent) && (
                  <span
                    className="absolute -top-[9px] left-[26px] rounded-full px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[.14em]"
                    style={{
                      background: isCurrent ? "var(--good)" : "var(--ink)",
                      color: "var(--ground)",
                    }}
                  >
                    {isCurrent ? "Current plan" : "Most popular"}
                  </span>
                )}

                <div style={{ font: "400 22px/1 var(--display)", letterSpacing: "-.02em" }}>
                  {p.name}
                </div>
                <div className="mt-3" style={{ font: "400 33px/1 var(--display)", letterSpacing: "-.03em" }}>
                  {p.unitAmount === 0 ? "$0" : `$${p.unitAmount / 100}`}
                  {p.unitAmount > 0 && (
                    <small className="text-sm" style={{ color: "var(--faint)" }}> / month</small>
                  )}
                </div>

                <ul className="mt-5 pt-[18px]" style={{ borderTop: "1px solid var(--rule)" }}>
                  {(FEATURES[p.name] ?? []).map((f) => (
                    <li key={f} className="flex gap-2.5 py-[5px] text-[13.5px]" style={{ color: "var(--dim)" }}>
                      <span style={{ color: "var(--faint)" }}>·</span>{f}
                    </li>
                  ))}
                </ul>

                {p.run && (
                  <div className="mt-[18px] flex items-center gap-3 pt-4" style={{ borderTop: "1px solid var(--rule)" }}>
                    <Coin glyph={p.run.glyph} tint={p.run.tint} size={40} />
                    <div>
                      <div className="text-[12.5px] font-semibold capitalize">{p.run.name} coin</div>
                      <div className="text-[11.5px]" style={{ color: "var(--faint)" }}>
                        No. {p.run.claimed + 1} of {p.run.size} · {p.run.size - p.run.claimed} left
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-6">
                  <button
                    disabled={isCurrent || busy !== null}
                    onClick={() => subscribe(p.id)}
                    className="w-full rounded-[11px] px-6 py-[14px] text-[13.5px] font-semibold disabled:opacity-40"
                    style={
                      featured
                        ? { background: "var(--ink)", color: "var(--ground)" }
                        : { background: "transparent", color: "var(--dim)", border: "1px solid var(--rule)" }
                    }
                  >
                    {isCurrent ? "Your plan" : busy === p.id ? "Opening Stripe…" : "Subscribe"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="mx-auto mt-9 max-w-[640px] rounded-[13px] px-5 py-4 text-left text-[13px]"
          style={{ background: "var(--paper)", color: "var(--dim)" }}
        >
          <b style={{ color: "var(--ink)" }}>The closer.</b> Warrick subscribes to Ovation through
          Stripe and gets an Ovation coin in the same reveal their own subscribers get. Same
          webhook, same run table, same object. We are our own first customer.
        </div>
      </main>
    </>
  );
}
