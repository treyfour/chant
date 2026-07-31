"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RevealSheet, type RevealPayload } from "@/components/RevealSheet";

export function WelcomeClient({
  sellerName,
  sessionId,
}: {
  sellerName: string;
  sessionId: string | null;
}) {
  const router = useRouter();
  const [payload, setPayload] = useState<RevealPayload | null>(null);
  const [open, setOpen] = useState(false);
  const [waiting, setWaiting] = useState(Boolean(sessionId));

  // Poll until the webhook has actually claimed a serial. We never invent one.
  useEffect(() => {
    if (!sessionId) return;
    let alive = true;
    let tries = 0;

    const tick = async () => {
      if (!alive || tries++ > 25) {
        if (alive) setWaiting(false);
        return;
      }
      try {
        const res = await fetch(`/api/claim-status?session_id=${sessionId}`);
        const data = await res.json();
        if (!alive) return;
        if (data.status === "claimed") {
          setPayload(data.payload);
          setOpen(true);
          setWaiting(false);
          return;
        }
      } catch {
        /* retry */
      }
      setTimeout(tick, 700);
    };

    tick();
    return () => {
      alive = false;
    };
  }, [sessionId]);

  const reopen = useCallback(() => payload && setOpen(true), [payload]);

  return (
    <main className="w-full mx-auto max-w-[540px] px-11 py-24 text-center">
      <div
        className="mx-auto mb-6 grid h-[50px] w-[50px] place-items-center rounded-full text-[22px] text-white"
        style={{ background: "var(--good)" }}
      >
        ✓
      </div>
      <h1 className="t-h2">You&rsquo;re on Pro</h1>
      <p className="mt-3 text-base" style={{ color: "var(--dim)" }}>
        Welcome. Your {sellerName} subscription is active.
      </p>

      <div
        className="mt-8 rounded-2xl px-6 py-5 text-left"
        style={{ background: "var(--raise)", border: "1px solid var(--rule)" }}
      >
        {[
          ["Plan", "Pro · $20/mo"],
          ["Next invoice", "in 30 days"],
          ["Card", "•••• 4242"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 text-[13.5px]">
            <span style={{ color: "var(--dim)" }}>{k}</span>
            <b>{v}</b>
          </div>
        ))}
      </div>

      {waiting && (
        <p className="mt-6 text-xs" style={{ color: "var(--faint)" }}>
          Waiting for Stripe to confirm…
        </p>
      )}

      {payload && !open && (
        <button
          onClick={reopen}
          className="mt-6 rounded-[9px] px-4 py-2.5 text-xs"
          style={{ background: "transparent", color: "var(--dim)", border: "1px solid var(--rule)" }}
        >
          Show the coin again
        </button>
      )}

      <p className="mt-4 text-[12px]" style={{ color: "var(--faint)" }}>
        {sellerName}&rsquo;s own confirmation page. Ovation appears on top and can be ignored.
      </p>

      {open && payload && (
        <RevealSheet
          payload={payload}
          onClose={() => setOpen(false)}
          onAdd={() => {
            setOpen(false);
            router.push("/@trey");
          }}
        />
      )}
    </main>
  );
}
