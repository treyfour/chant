"use client";

import { useState } from "react";
import { Coin } from "@/components/Coin";
import type { SellerPublicView } from "@/lib/types";

/**
 * Warrick's own marketing site.
 *
 * Deliberately looks nothing like Ovation. Dark, technical, monospace — a
 * generic YC infra startup. When the coin lands and you end up in Ovation's
 * warm leather world, the visual whiplash IS the story: you left one company
 * and arrived at another.
 *
 * Note the coin on the pricing cards looks like a foreign object here. Good.
 * It IS a foreign object — it belongs to a different company.
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
    <div className="site">
      {/* ---------- nav ---------- */}
      <nav
        className="sticky top-0 z-50 flex h-16 items-center gap-8 px-6 md:px-12"
        style={{ borderBottom: "1px solid var(--line)", background: "rgba(10,11,13,.82)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight">
          <span
            className="grid h-7 w-7 place-items-center rounded-lg text-xs"
            style={{ background: "var(--brand)", color: "#fff" }}
          >
            ▲
          </span>
          {seller.name}
        </div>
        <div className="hidden items-center gap-7 text-[14px] md:flex" style={{ color: "var(--fg-dim)" }}>
          <span>Product</span><span>Docs</span><span>Changelog</span>
          <a href="#pricing" style={{ color: "var(--fg)" }}>Pricing</a>
        </div>
        <span className="flex-1" />
        <span className="hidden text-[14px] sm:inline" style={{ color: "var(--fg-dim)" }}>Sign in</span>
        <a href="#pricing" className="site-btn">Start free</a>
      </nav>

      {/* ---------- hero ---------- */}
      <header className="site-grid px-6 pb-24 pt-20 md:px-12 md:pt-28">
        <div className="mx-auto max-w-[1100px]">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px]"
            style={{ background: "var(--brand-soft)", color: "#c4b5ff", border: "1px solid rgba(124,92,255,.28)" }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--brand)" }} />
            Durable runs are now GA
          </div>

          <h1 className="site-h1 mt-6 max-w-[15ch]">Agents that don&rsquo;t stall.</h1>

          <p className="mt-5 max-w-[54ch] text-[18px] leading-relaxed" style={{ color: "var(--fg-dim)" }}>
            {seller.name} is the orchestration layer for AI agents. Durable runs, automatic
            retries, step-level replay, and a trace for every decision your agent made — so
            you stop rebuilding the same scaffolding on every project.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#pricing" className="site-btn site-btn--brand">Start building free</a>
            <a href="#pricing" className="site-btn site-btn--ghost">See pricing</a>
          </div>

          <div className="site-term mt-12 max-w-[720px] p-5">
            <div className="mb-3 flex gap-1.5">
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <span key={c} style={{ width: 10, height: 10, borderRadius: 99, background: c }} />
              ))}
            </div>
            <div>
              <span className="c-dim">$</span> npm i <span className="c-str">@warrick/sdk</span>
            </div>
            <div className="mt-3">
              <span className="c-key">import</span> {"{ run }"} <span className="c-key">from</span>{" "}
              <span className="c-str">&quot;@warrick/sdk&quot;</span>
            </div>
            <div className="mt-3">
              <span className="c-key">await</span> <span className="c-fn">run</span>(researchAgent, {"{"}
            </div>
            <div>&nbsp;&nbsp;retries: <span className="c-str">5</span>,</div>
            <div>&nbsp;&nbsp;checkpoint: <span className="c-str">&quot;each-step&quot;</span>,</div>
            <div>&nbsp;&nbsp;onStall: <span className="c-str">&quot;resume&quot;</span></div>
            <div>{"})"}</div>
            <div className="mt-3 c-dim">→ run_8fk2 · 41 steps · 2 retries · resumed once ✓</div>
          </div>
        </div>
      </header>

      {/* ---------- logo strip ---------- */}
      <section className="px-6 py-10 md:px-12" style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-x-10 gap-y-4">
          <span className="site-mono">Orchestrating agents at</span>
          {["Cinder", "Halyard", "Parity", "Thresher", "Roost"].map((n) => (
            <span key={n} className="text-[15px] font-semibold" style={{ color: "var(--fg-faint)" }}>{n}</span>
          ))}
        </div>
      </section>

      {/* ---------- features ---------- */}
      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-[1100px]">
          <span className="site-mono">Why teams switch</span>
          <h2 className="site-h2 mt-4 max-w-[20ch]">Your agent framework stops at the happy path.</h2>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              ["Durable by default", "Every step is checkpointed. A crashed worker, a rate limit, a 3am deploy — the run picks up where it stopped instead of starting over."],
              ["Replay any decision", "Step-level traces with the exact prompt, tool call, and response. Scrub back to step 14 and re-run it against a different model."],
              ["Stall detection", "Agents don't crash, they loop. Warrick notices when yours is going in circles and resumes, escalates, or halts on your rules."],
            ].map(([t, b]) => (
              <div key={t} className="site-card p-6">
                <div className="text-[16px] font-semibold">{t}</div>
                <p className="mt-2.5 text-[14px] leading-relaxed" style={{ color: "var(--fg-dim)" }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- pricing ---------- */}
      <section id="pricing" className="px-6 py-20 md:px-12" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="mx-auto max-w-[1100px]">
          <span className="site-mono">Pricing</span>
          <h2 className="site-h2 mt-4">Free while you&rsquo;re figuring it out.</h2>
          <p className="mt-3 max-w-[52ch] text-[16px]" style={{ color: "var(--fg-dim)" }}>
            Usage-based after that. No seat pricing, no sales call.
          </p>

          <div className="mt-12 grid items-stretch gap-4 md:grid-cols-3">
            {plans.map((p) => {
              const featured = p.name === "Pro";
              return (
                <div
                  key={p.id}
                  className="site-card relative flex flex-col p-7"
                  style={
                    featured
                      ? { borderColor: "rgba(124,92,255,.5)", background: "var(--bg-lift)" }
                      : undefined
                  }
                >
                  {featured && (
                    <span
                      className="absolute -top-2.5 left-7 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.12em]"
                      style={{ background: "var(--brand)", color: "#fff" }}
                    >
                      Most popular
                    </span>
                  )}

                  <div className="text-[15px] font-semibold">{p.name}</div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-[38px] font-semibold tracking-tight">
                      {p.unitAmount === 0 ? "$0" : `$${p.unitAmount / 100}`}
                    </span>
                    {p.unitAmount > 0 && (
                      <span className="text-[14px]" style={{ color: "var(--fg-faint)" }}>/ month</span>
                    )}
                  </div>

                  <ul className="mt-6 space-y-2.5 pt-5" style={{ borderTop: "1px solid var(--line)" }}>
                    {(FEATURES[p.name] ?? []).map((f) => (
                      <li key={f} className="flex gap-2.5 text-[13.5px]" style={{ color: "var(--fg-dim)" }}>
                        <span style={{ color: "var(--lime)" }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>

                  {/* The coin. A warm leather object on a cold dark site — it
                      visibly belongs to somebody else, which is accurate. */}
                  {p.run && !p.run.retired && (
                    <div
                      className="mt-6 flex items-center gap-3 rounded-xl p-3"
                      style={{ background: "rgba(255,255,255,.035)", border: "1px solid var(--line)" }}
                    >
                      <Coin glyph={p.run.glyph} tint={p.run.tint} size={42} />
                      <div>
                        <div className="text-[12.5px] font-semibold capitalize">
                          {p.run.name} coin included
                        </div>
                        <div className="text-[11.5px]" style={{ color: "var(--fg-faint)" }}>
                          No. {p.run.claimed + 1} of {p.run.size} · {p.run.size - p.run.claimed} left
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-6">
                    <button
                      disabled={p.unitAmount === 0 || busy !== null}
                      onClick={() => subscribe(p.id)}
                      className={`site-btn w-full ${featured ? "site-btn--brand" : "site-btn--ghost"} disabled:opacity-40`}
                    >
                      {busy === p.id
                        ? "Opening Stripe…"
                        : p.unitAmount === 0
                          ? "Start free"
                          : `Subscribe to ${p.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {collectors.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <div className="flex">
                {collectors.map((c, i) => (
                  <a
                    key={c.handle}
                    href={`/@${c.handle}`}
                    title={`${c.name} — open their collection`}
                    className="grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold text-white transition-transform hover:-translate-y-0.5"
                    style={{ background: c.avatarColor, border: "2px solid var(--bg)", marginLeft: i === 0 ? 0 : -8 }}
                  >
                    {c.name[0]?.toUpperCase()}
                  </a>
                ))}
              </div>
              <span className="text-[13px]" style={{ color: "var(--fg-faint)" }}>
                {collectorCount} developers subscribe to {seller.name}
              </span>
            </div>
          )}
        </div>
      </section>

      <footer className="px-6 py-10 md:px-12" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-4">
          <span className="text-[13px]" style={{ color: "var(--fg-faint)" }}>
            © {seller.name} · {seller.location}
          </span>
          <span className="flex-1" />
          <a href="/demo" className="text-[12px]" style={{ color: "var(--fg-faint)" }}>Ovation demo ↗</a>
        </div>
      </footer>
    </div>
  );
}
