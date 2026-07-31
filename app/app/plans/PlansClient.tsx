"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coin } from "@/components/Coin";
import { AttachCoinSheet } from "@/components/AttachCoinSheet";
import type { MemberRole, Plan, CoinRun, SellerDashboardView } from "@/lib/types";

type PlanWithRun = Plan & { run: CoinRun | null };

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
      <nav
        className="sticky top-0 z-40 flex h-[60px] items-center gap-3 px-8"
        style={{ background: "var(--raise)", borderBottom: "1px solid var(--rule)" }}
      >
        <span style={{ font: "400 18px/1 var(--display)" }}>Ovation</span>
        <span
          className="ml-3 flex items-center gap-2 rounded-[9px] px-3 py-1.5 text-[12.5px] font-semibold"
          style={{ border: "1px solid var(--rule)" }}
        >
          <span
            className="grid h-5 w-5 place-items-center rounded-md text-[10px] text-white"
            style={{ background: "#8f6a45" }}
          >
            {view.seller.mark}
          </span>
          {view.seller.name}
          <small style={{ color: "var(--faint)", fontWeight: 400 }}>
            {role === "owner" ? "Owner" : "Member"}
          </small>
        </span>
        <span className="flex-1" />
        <a href={`/app/team${roleQS}`} className="text-[12.5px]" style={{ color: "var(--dim)" }}>
          Team
        </a>
        <a href="/app/billing" className="text-[12.5px]" style={{ color: "var(--dim)" }}>Billing</a>
        <a href="/" className="text-[12.5px]" style={{ color: "var(--accent)" }}>Demo home</a>
      </nav>

      <main className="w-full mx-auto max-w-[940px] px-11 pb-20 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="t-eyebrow">{view.seller.name}</div>
            <h1 className="t-display mt-2.5">Plans</h1>
          </div>
          <span
            className="rounded-full px-2.5 py-1.5 text-[9.5px] font-semibold uppercase tracking-[.12em]"
            style={{ color: "var(--good)", border: "1px solid rgba(74,124,89,.35)" }}
          >
            ● Stripe connected
          </span>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {[
            ["Subscribers", String(view.plans.reduce((a, p) => a + p.subscriberCount, 0)), "across three plans"],
            ["Coins claimed", capacity ? `${claimed} / ${capacity}` : "0", liveRuns.length ? `${liveRuns.length} run${liveRuns.length > 1 ? "s" : ""} live` : "no runs yet"],
            ["Ovation plan", "Starter", "1 run, 50 coins"],
          ].map(([k, v, s]) => (
            <div key={k} className="rounded-2xl px-5 py-[18px]"
              style={{ background: "var(--raise)", border: "1px solid var(--rule)" }}>
              <div className="t-eyebrow">{k}</div>
              <div className="mt-2.5" style={{ font: "400 27px/1 var(--display)", letterSpacing: "-.025em" }}>{v}</div>
              <div className="mt-1.5 text-[11.5px]" style={{ color: "var(--dim)" }}>{s}</div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="t-eyebrow">Your Stripe products</span>
            <span className="text-[11.5px]" style={{ color: "var(--faint)" }}>
              Synced from {view.seller.stripeAccountId ?? "Stripe"}
            </span>
          </div>

          <div className="rounded-2xl" style={{ background: "var(--raise)", border: "1px solid var(--rule)" }}>
            {view.plans.map((p, i) => (
              <div
                key={p.id}
                className="grid items-center gap-4 px-[22px] py-[18px]"
                style={{
                  gridTemplateColumns: "56px 1fr 170px 170px",
                  borderBottom: i < view.plans.length - 1 ? "1px solid var(--rule)" : "none",
                  background: p.run && !p.run.retired ? "rgba(138,106,59,.06)" : "transparent",
                }}
              >
                {p.run ? (
                  <Coin glyph={p.run.glyph} tint={p.run.tint} size={44} retired={p.run.retired} />
                ) : (
                  <div className="grid h-11 w-11 place-items-center rounded-full text-[17px]"
                    style={{ border: "1.5px dashed var(--rule)", color: "var(--faint)" }}>+</div>
                )}

                <div>
                  <div className="text-[15px] font-semibold">{p.name}</div>
                  <div className="mt-1 text-[12.5px]" style={{ color: "var(--dim)" }}>
                    {p.priceLabel} · {p.subscriberCount} subscribers
                  </div>
                </div>

                <div className="text-[12px]" style={{ color: "var(--dim)" }}>
                  {p.run ? (
                    <>
                      <b style={{ color: "var(--ink)" }}>{p.run.name}</b> · {p.run.claimed} of {p.run.size}
                      {p.run.retired && (
                        <span className="ml-1.5 rounded-full px-2 py-1 text-[9px] font-semibold uppercase"
                          style={{ color: "#a1341f", border: "1px solid rgba(161,52,31,.3)" }}>Retired</span>
                      )}
                      <div className="mt-2 h-1 overflow-hidden rounded-full" style={{ background: "rgba(33,31,27,.10)" }}>
                        <i className="block h-full" style={{
                          background: "var(--accent)", transformOrigin: "left",
                          transform: `scaleX(${(p.run.claimed / p.run.size).toFixed(3)})`,
                        }} />
                      </div>
                    </>
                  ) : (
                    <span style={{ color: "var(--faint)" }}>No coin attached</span>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  {p.run && !p.run.retired && (
                    <button
                      disabled={!can("coins:retire")}
                      title={can("coins:retire") ? undefined : "Members cannot retire runs"}
                      onClick={() => setConfirmRetire(p.run!)}
                      className="rounded-[9px] px-4 py-2.5 text-xs disabled:opacity-30"
                      style={{ border: "1px solid var(--rule)", color: "var(--dim)" }}
                    >Retire</button>
                  )}
                  {!p.run && (
                    <button
                      disabled={!can("coins:create")}
                      title={can("coins:create") ? undefined : "Members cannot attach coins"}
                      onClick={() => setAttaching(p)}
                      className="rounded-[9px] px-4 py-2.5 text-xs font-semibold disabled:opacity-30"
                      style={{ background: "var(--ink)", color: "var(--ground)" }}
                    >Add coin</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {liveRuns.length === 0 && (
            <p className="py-8 text-center text-[13.5px]" style={{ color: "var(--dim)" }}>
              Pick a plan above and attach your first coin. Your checkout stays exactly as it is.
            </p>
          )}
        </div>

        {role === "member" && (
          <div className="mt-6 rounded-[13px] px-5 py-4 text-[13px]"
            style={{ background: "var(--paper)", color: "var(--dim)" }}>
            Viewing as <b style={{ color: "var(--ink)" }}>Member</b>. Add coin and Retire are
            disabled by the permissions on the Auth0 token, not by a flag in our database.
            The API refuses them too — the button state is not the security boundary.
          </div>
        )}

        <div className="mt-5">
          <div className="t-eyebrow mb-3">Recent</div>
          <div className="rounded-2xl px-6 py-4" style={{ background: "var(--raise)", border: "1px solid var(--rule)" }}>
            {view.activity.length === 0 && (
              <p className="py-2 text-[13px]" style={{ color: "var(--faint)" }}>Nothing yet.</p>
            )}
            {view.activity.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3 py-2.5 text-[13px]"
                style={{ borderBottom: i < view.activity.length - 1 ? "1px solid var(--rule)" : "none" }}>
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] font-semibold text-white"
                  style={{ background: a.actorColor }}>{a.actorInitial}</span>
                <span dangerouslySetInnerHTML={{ __html: a.text }} />
                <span className="ml-auto whitespace-nowrap text-[11.5px]" style={{ color: "var(--faint)" }}>
                  {new Date(a.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(20,16,11,.7)", backdropFilter: "blur(6px)" }}
          onClick={(e) => e.target === e.currentTarget && setConfirmRetire(null)}>
          <div className="w-full max-w-[404px] rounded-[20px] p-9 text-center" style={{ background: "var(--ground)" }}>
            <h2 className="t-h2">Retire this run?</h2>
            <p className="mt-3 text-sm" style={{ color: "var(--dim)" }}>
              <b style={{ color: "var(--ink)" }}>{confirmRetire.name}</b> has{" "}
              {confirmRetire.size - confirmRetire.claimed} unclaimed coins. Retiring closes it
              forever — those will never exist, and the {confirmRetire.claimed} already out there
              become the only ones.
            </p>
            <div className="mt-6 flex gap-2.5">
              <button onClick={() => setConfirmRetire(null)}
                className="flex-1 rounded-[11px] px-6 py-3.5 text-[13.5px]"
                style={{ border: "1px solid var(--rule)", color: "var(--dim)" }}>Keep it open</button>
              <button onClick={retire} disabled={busy}
                className="flex-1 rounded-[11px] px-6 py-3.5 text-[13.5px] font-semibold disabled:opacity-50"
                style={{ color: "#a1341f", border: "1px solid rgba(161,52,31,.3)" }}>
                {busy ? "Retiring…" : "Retire run"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
