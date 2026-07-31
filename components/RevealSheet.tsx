"use client";

import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { Coin } from "./Coin";
import { Button, Sheet, SheetContent, SheetTitle, Text } from "./ui";

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
 *
 * Always rendered under `theme="ovation"` so it stays warm even when the page
 * beneath it is Warrick's cold dark. A different company is speaking.
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

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent size="sm" theme="ovation" className="text-center">
        <div className="px-[var(--space-12)] pb-[var(--space-10)] pt-[var(--space-12)]">
          {/* A DIFFERENT company is talking. Warrick's checkout didn't change;
              Ovation was listening to the webhook and showed up. */}
          <div className="flex items-center justify-center gap-[var(--space-2)]">
            <span className="grid h-5 w-5 place-items-center rounded-[var(--radius-sm)] bg-fg text-[length:var(--text-2xs)] text-fg-invert">
              ◈
            </span>
            <Text as="span" variant="mono" tone="faint">Ovation</Text>
          </div>
          <Text variant="meta" tone="faint" className="mt-[var(--space-2)]">
            {payload.sellerName} included this with your subscription
          </Text>

          <div className="reveal-stage relative mb-[var(--space-8)] mt-[var(--space-4)] grid place-items-center">
            <div className="reveal-coin relative z-10">
              <Coin glyph={payload.glyph} tint={payload.tint} size={186} />
            </div>
          </div>

          <SheetTitle asChild>
            <Text as="h2" variant="h2">{payload.sellerName}</Text>
          </SheetTitle>
          <Text variant="mono" tone="faint" className="mt-[var(--space-3)]">
            {payload.runName} · {payload.serial} of {payload.size}
          </Text>

          <Button full onClick={onAdd} className="mt-[var(--space-8)]">
            Add to collection
          </Button>

          {/* You don't have an account and you don't need one. The collection
              already exists — this is just the way back to it. */}
          {payload.handle && (
            <div className="mt-[var(--space-5)] border-t border-line pt-[var(--space-5)]">
              <Text variant="meta" tone="faint">
                It&rsquo;s already yours. No account needed — keep the link.
              </Text>
              <div className="mt-[var(--space-3)] flex items-center gap-[var(--space-2)] rounded-[var(--radius-sm)] bg-bg-sink px-[var(--space-3)] py-[var(--space-2)]">
                <Text as="span" variant="mono" tone="dim" className="flex-1 truncate text-left normal-case tracking-normal">
                  /@{payload.handle}
                </Text>
                <Button size="sm" onClick={copy}>
                  {copied ? <Check size={14} strokeWidth={1.5} /> : <Copy size={14} strokeWidth={1.5} />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button size="sm" variant="ghost" onClick={emailIt} disabled={sending || sent}>
                  <Mail size={14} strokeWidth={1.5} />
                  {sent ? "Sent" : sending ? "Sending…" : "Email me"}
                </Button>
              </div>
              {sent && (
                <Text variant="meta" tone="good" className="mt-[var(--space-2)]">
                  Sent to {payload.email?.replace(/^(.).*(@.*)$/, "$1•••$2")}
                </Text>
              )}
              {sendError && (
                <Text variant="meta" tone="bad" className="mt-[var(--space-2)]">{sendError}</Text>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="mx-auto mt-[var(--space-4)] block bg-transparent font-[family-name:var(--font-body)] text-[length:var(--text-xs)] text-fg-faint hover:text-fg-dim"
          >
            No thanks
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
