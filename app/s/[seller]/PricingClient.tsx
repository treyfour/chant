"use client";

import { useState } from "react";
import { Coin } from "@/components/Coin";
import type { SellerPublicView } from "@/lib/types";

const FEATURES: Record<string, string[]> = {
  Free: ["One repository", "100 reviews a month", "Community support"],
  Pro: ["Unlimited repositories", "Self-hosted runners", "Shared Slack channel"],
  Team: ["Everything in Pro", "SSO and SAML", "99.9% uptime SLA"],
};

export function PricingClient({ view }: { view: SellerPublicView }) {
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
      else {
        alert(error ?? "Could not start checkout");
        setBusy(null);
      }
    } catch {
      setBusy(null);
    }
  }

  return (
    <>
      {/* Warrick's own nav. No mention of Ovation anywhere on this page. */}
      <nav
        className="sticky top-0 z-40 flex h-[62px] items-center gap-7 px-11"
        style={{
          borderBottom: "1px solid var(--rule)",
          background: "rgba(247,244,237,.94)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="flex items-center gap-2.5 text-base font-semibold">
          <span
            className="grid h-[27px] w-[27px] place-items-center rounded-lg text-xs text-white"
            style={{ background: "#8f6a45" }}
          >
            {seller.mark}
          </span>
          {seller.name}
        </div>
        <span className="text-[13px]" style={{ color: "var(--dim)" }}>Product</span>
        <span className="text-[13px]" style={{ color: "var(--dim)" }}>Docs</span>
        <span className="text-[13px]" style={{ color: "var(--ink)" }}>Pricing</span>
        <span className="flex-1" />
        <a href="/" className="text-[12px]" style={{ color: "var(--faint)" }}>Ovation demo ↗</a>
      </nav>

      <main className="w-full mx-auto max-w-[1000px] px-11 pb-24 pt-16 text-center">
        <div className="t-eyebrow">Pricing</div>
        <h1 className="t-display mt-3.5">Free while you&rsquo;re figuring it out.</h1>
        <p className="mt-3 text-base" style={{ color: "var(--dim)" }}>{seller.tagline}</p>

        <div className="mt-12 grid grid-cols-1 items-stretch gap-[18px] text-left md:grid-cols-3">
          {plans.map((p) => {
            const featured = p.name === "Pro";
            return (
              <div
                key={p.id}
                className="relative flex flex-col rounded-2xl px-[26px] py-7"
                style={{
                  background: "var(--raise)",
                  border: `1px solid ${featured ? "rgba(33,31,27,.26)" : "var(--rule)"}`,
                  boxShadow: featured ? "var(--lift)" : "none",
                }}
              >
                {featured && (
                  <span
                    className="absolute -top-[9px] left-[26px] rounded-full px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[.14em]"
                    style={{ background: "var(--ink)", color: "var(--ground)" }}
                  >
                    Most popular
                  </span>
                )}

                <div style={{ font: "400 22px/1 var(--display)", letterSpacing: "-.02em" }}>
                  {p.name}
                </div>
                <div
                  className="mt-3"
                  style={{ font: "400 34px/1 var(--display)", letterSpacing: "-.03em" }}
                >
                  {p.unitAmount === 0 ? "$0" : `$${p.unitAmount / 100}`}
                  {p.unitAmount > 0 && (
                    <small className="text-sm" style={{ color: "var(--faint)" }}> / month</small>
                  )}
                </div>

                <ul className="mt-5 pt-[18px]" style={{ borderTop: "1px solid var(--rule)" }}>
                  {(FEATURES[p.name] ?? []).map((f) => (
                    <li key={f} className="flex gap-2.5 py-[5px] text-[13.5px]" style={{ color: "var(--dim)" }}>
                      <span style={{ color: "var(--faint)" }}>·</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {p.run && !p.run.retired && (
                  <div
                    className="mt-[18px] flex items-center gap-3 pt-4"
                    style={{ borderTop: "1px solid var(--rule)" }}
                  >
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
                    disabled={p.unitAmount === 0 || busy !== null}
                    onClick={() => subscribe(p.id)}
                    className="w-full rounded-[11px] px-6 py-[14px] text-[13.5px] font-semibold disabled:opacity-40"
                    style={
                      featured
                        ? { background: "var(--ink)", color: "var(--ground)" }
                        : { background: "transparent", color: "var(--dim)", border: "1px solid var(--rule)" }
                    }
                  >
                    {busy === p.id ? "Opening Stripe…" : p.unitAmount === 0 ? "Start free" : "Subscribe"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          {/* Every face opens that person's collection. This is how the next
              person finds you — no feed, no search, no share prompt. */}
          <div className="flex">
            {collectors.map((c, i) => (
              <a
                key={c.handle}
                href={`/@${c.handle}`}
                title={`${c.name} — open their collection`}
                className="grid h-6 w-6 place-items-center rounded-full text-[9.5px] font-semibold text-white transition-transform hover:-translate-y-0.5"
                style={{
                  background: c.avatarColor,
                  border: "1.5px solid var(--raise)",
                  marginLeft: i === 0 ? 0 : -7,
                }}
              >
                {c.name[0]?.toUpperCase()}
              </a>
            ))}
          </div>
          <span className="text-[12.5px]" style={{ color: "var(--faint)" }}>
            {collectorCount} developers subscribe to {seller.name}
          </span>
        </div>
      </main>
    </>
  );
}
