"use client";

import { useEffect, useState } from "react";
import { Coin } from "./Coin";

export interface RevealPayload {
  sellerName: string;
  runName: string;
  serial: number;
  size: number;
  glyph: string;
  tint: string;
  /** Present once the coin is claimed — lets us show the collection URL. */
  handle?: string;
  email?: string;
  claimed?: boolean;
}

/**
 * The hero moment. One action, dismissible, no privacy question — that lives
 * on right-click later. Two competing buttons and a segmented control made
 * this read as an ad; a single action and a quiet decline reads as an object.
 */
export function RevealSheet({
  payload,
  onClose,
  onAdd,
}: {
  payload: RevealPayload;
  onClose: () => void;
  onAdd: () => void;
}) {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const url =
    payload.handle && typeof window !== "undefined"
      ? `${window.location.origin}/@${payload.handle}`
      : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setSendError("Couldn't copy — select the link instead");
    }
  }

  async function emailIt() {
    if (!payload.handle) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: payload.handle }),
      });
      if (!res.ok) throw new Error("Could not send");
      setSent(true);
    } catch (e) {
      setSendError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("keydown", esc);
    };
  }, [onClose]);

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 transition-opacity duration-300"
      style={{
        opacity: shown ? 1 : 0,
        background:
          "radial-gradient(120% 90% at 50% 45%, rgba(43,34,22,.62), rgba(20,16,11,.86))",
        backdropFilter: "blur(7px) saturate(.9)",
      }}
    >
      <div
        className="reveal-sheet relative w-full max-w-[404px] rounded-[22px] px-11 pb-10 pt-[52px] text-center"
        style={{
          background: "var(--raise)",
          boxShadow: "0 50px 90px -30px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.5)",
          transform: shown ? "none" : "translateY(22px) scale(.965)",
          opacity: shown ? 1 : 0,
          transition:
            "transform .62s cubic-bezier(.16,.86,.28,1), opacity .45s ease",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-base"
          style={{ color: "var(--faint)" }}
        >
          ✕
        </button>

        {/* This is a DIFFERENT company talking. Warrick's checkout didn't
            change; Ovation was listening to the webhook and showed up. */}
        <div className="flex items-center justify-center gap-2">
          <span
            className="grid h-5 w-5 place-items-center rounded-md text-[10px]"
            style={{ background: "var(--ink)", color: "var(--ground)" }}
          >
            ◈
          </span>
          <span className="t-eyebrow" style={{ letterSpacing: ".18em" }}>
            Ovation
          </span>
        </div>
        <p className="mt-2 text-[11.5px]" style={{ color: "var(--faint)" }}>
          Warrick included this with your subscription
        </p>

        <div className="reveal-stage relative mb-[34px] mt-4 grid place-items-center">
          <div className="reveal-coin relative z-10">
            <Coin glyph={payload.glyph} tint={payload.tint} size={186} />
          </div>
        </div>

        <div style={{ font: "400 30px/1.15 var(--display)", letterSpacing: "-.025em" }}>
          {payload.sellerName}
        </div>
        <div className="t-serial mt-3" style={{ letterSpacing: ".1em" }}>
          {payload.runName} · {payload.serial} of {payload.size}
        </div>

        <button
          onClick={onAdd}
          className="mt-8 w-full rounded-[11px] px-6 py-[15px] text-sm font-semibold"
          style={{ background: "var(--ink)", color: "var(--ground)" }}
        >
          Add to collection
        </button>

        {/* You don't have an account and you don't need one. The collection
            already exists — this is just the way back to it. */}
        {payload.handle && (
          <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--rule)" }}>
            <p className="text-[11.5px]" style={{ color: "var(--faint)" }}>
              It&rsquo;s already yours. No account needed — keep the link.
            </p>
            <div
              className="mt-2.5 flex items-center gap-2 rounded-[10px] px-3 py-2.5"
              style={{ background: "var(--paper)" }}
            >
              <span className="flex-1 truncate text-left text-[12px]" style={{ fontFamily: "var(--mono)" }}>
                /@{payload.handle}
              </span>
              <button
                onClick={copy}
                className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold"
                style={{ background: "var(--ink)", color: "var(--ground)" }}
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={emailIt}
                disabled={sending || sent}
                className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold disabled:opacity-50"
                style={{ border: "1px solid var(--rule)", color: "var(--dim)" }}
              >
                {sent ? "Sent ✓" : sending ? "Sending…" : "Email me"}
              </button>
            </div>
            {sent && (
              <p className="mt-2 text-[11px]" style={{ color: "var(--good)" }}>
                Sent to {payload.email?.replace(/^(.).*(@.*)$/, "$1•••$2")}
              </p>
            )}
            {sendError && (
              <p className="mt-2 text-[11px]" style={{ color: "var(--warn)" }}>{sendError}</p>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="mx-auto mt-4 block bg-transparent text-xs"
          style={{ color: "var(--faint)" }}
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
