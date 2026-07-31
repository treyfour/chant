"use client";

import { useCallback, useEffect, useState } from "react";
import { RevealSheet, type RevealPayload } from "@/components/RevealSheet";
import { CollectionSheet } from "@/components/CollectionSheet";

/**
 * Warrick's own onboarding screen — still dark, still their brand.
 *
 * Ovation arrives on top of it as a warm sheet from a different company. The
 * visual whiplash is the point: nothing about this page changed, a third party
 * just handed you something.
 */
export function WelcomeClient({
  sellerName,
  sessionId,
}: {
  sellerName: string;
  sessionId: string | null;
}) {
  const [payload, setPayload] = useState<RevealPayload | null>(null);
  const [open, setOpen] = useState(false);
  const [waiting, setWaiting] = useState(Boolean(sessionId));
  const [collection, setCollection] = useState(false);

  // Poll until the webhook has actually claimed a serial. We never invent one.
  useEffect(() => {
    if (!sessionId) return;
    let alive = true;
    let tries = 0;

    const tick = async () => {
      if (!alive || tries++ > 25) { if (alive) setWaiting(false); return; }
      try {
        const res = await fetch(`/api/claim-status?session_id=${sessionId}`);
        const data = await res.json();
        if (!alive) return;
        if (data.status === "claimed") {
          setPayload(data.payload); setOpen(true); setWaiting(false); return;
        }
      } catch { /* retry */ }
      setTimeout(tick, 700);
    };

    tick();
    return () => { alive = false; };
  }, [sessionId]);

  const reopen = useCallback(() => payload && setOpen(true), [payload]);

  return (
    <div className="site">
      <nav
        className="flex h-16 items-center gap-2.5 px-6 md:px-12"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <span
          className="grid h-7 w-7 place-items-center rounded-lg text-xs"
          style={{ background: "var(--brand)", color: "#fff" }}
        >
          ▲
        </span>
        <span className="text-[17px] font-semibold tracking-tight">{sellerName}</span>
      </nav>

      <main className="site-grid" style={{ minHeight: "calc(100vh - 64px)" }}>
        <div className="mx-auto max-w-[520px] px-6 py-24 text-center">
          <div
            className="mx-auto grid h-12 w-12 place-items-center rounded-full text-[20px]"
            style={{ background: "rgba(184,242,74,.14)", color: "var(--lime)", border: "1px solid rgba(184,242,74,.3)" }}
          >
            ✓
          </div>

          <h1 className="site-h2 mt-6">You&rsquo;re on Pro</h1>
          <p className="mt-3 text-[16px]" style={{ color: "var(--fg-dim)" }}>
            Your workspace is ready. Install the SDK and your first run is on us.
          </p>

          <div className="site-term mt-8 p-4 text-left">
            <span className="c-dim">$</span> npm i <span className="c-str">@warrick/sdk</span>
          </div>

          <div className="site-card mt-4 p-5 text-left">
            {[
              ["Plan", "Pro · $20/mo"],
              ["Next invoice", "in 30 days"],
              ["Card", "•••• 4242"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 text-[13.5px]">
                <span style={{ color: "var(--fg-dim)" }}>{k}</span>
                <b>{v}</b>
              </div>
            ))}
          </div>

          <a href="#" className="site-btn site-btn--brand mt-6">Open the dashboard</a>

          {waiting && (
            <p className="mt-6 text-[12px]" style={{ color: "var(--fg-faint)" }}>
              Waiting for Stripe to confirm…
            </p>
          )}

          {payload && !open && (
            <button onClick={reopen} className="site-btn site-btn--ghost mt-6">
              Show the coin again
            </button>
          )}
        </div>
      </main>

      {open && payload && (
        <RevealSheet
          payload={payload}
          onClose={() => setOpen(false)}
          // Accepting opens the collection as a sheet OVER Warrick. No
          // navigation — Ovation is a layer on their product, not a destination.
          onAdd={() => { setOpen(false); setCollection(true); }}
        />
      )}

      {collection && (
        <CollectionSheet
          handle={payload?.handle ?? "trey"}
          justAdded="warrick"
          onClose={() => setCollection(false)}
        />
      )}
    </div>
  );
}
