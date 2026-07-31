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

        <div className="t-eyebrow">Ovation</div>

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
