"use client";

/**
 * THE PRIMITIVES — eight, closed.
 *
 * These are the only components allowed to contain styling. Everything else in
 * the app composes from them. That is the layer that was missing before: tokens
 * without bound components are suggestions, and 190 inline styles is what
 * "suggestions" looks like six hours in.
 *
 * Rules enforced by `npm run guard`:
 *   - no raw hex, px, or font names anywhere outside tokens.css / themes.css
 *   - anything not on this list is COMPOSED, never invented
 *
 * Behaviour (focus traps, escape, portals, aria) comes from Radix so we never
 * hand-roll it again — we did today, and got it subtly wrong.
 */

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { X } from "lucide-react";

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

/* ── Text ────────────────────────────────────────────────── */

type TextVariant = "display" | "h1" | "h2" | "h3" | "body" | "meta" | "mono";

const TEXT: Record<TextVariant, string> = {
  display: "font-[family-name:var(--font-display)] text-[length:var(--text-4xl)] leading-[1.03] tracking-[var(--tracking-display)]",
  h1: "font-[family-name:var(--font-display)] text-[length:var(--text-3xl)] leading-[1.05] tracking-[var(--tracking-display)]",
  h2: "font-[family-name:var(--font-display)] text-[length:var(--text-2xl)] leading-[1.12] tracking-[var(--tracking-display)]",
  h3: "font-[family-name:var(--font-display)] text-[length:var(--text-lg)] leading-[1.2] tracking-[var(--tracking-display)]",
  body: "font-[family-name:var(--font-body)] text-[length:var(--text-base)] leading-[1.6]",
  meta: "font-[family-name:var(--font-body)] text-[length:var(--text-xs)] leading-[1.5]",
  mono: "font-[family-name:var(--font-mono)] text-[length:var(--text-2xs)] uppercase tracking-[0.14em]",
};

const TONE = {
  default: "text-fg",
  dim: "text-fg-dim",
  faint: "text-fg-faint",
  accent: "text-accent",
  good: "text-good",
  warn: "text-warn",
  bad: "text-bad",
} as const;

export function Text({
  as: Tag = "p",
  variant = "body",
  tone = "default",
  className,
  ...rest
}: {
  as?: React.ElementType;
  variant?: TextVariant;
  tone?: keyof typeof TONE;
} & React.HTMLAttributes<HTMLElement>) {
  return <Tag className={cx(TEXT[variant], TONE[tone], className)} {...rest} />;
}

/* ── Stack ───────────────────────────────────────────────── */

export function Stack({
  row = false,
  gap = 4,
  align,
  justify,
  wrap = false,
  className,
  ...rest
}: {
  row?: boolean;
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  align?: "start" | "center" | "end" | "baseline";
  justify?: "start" | "center" | "end" | "between";
  wrap?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx("flex", row ? "flex-row" : "flex-col", wrap && "flex-wrap", className)}
      style={{
        gap: `var(--space-${gap})`,
        alignItems: align === "start" ? "flex-start" : align === "end" ? "flex-end" : align,
        justifyContent:
          justify === "between" ? "space-between" : justify === "start" ? "flex-start" : justify === "end" ? "flex-end" : justify,
      }}
      {...rest}
    />
  );
}

/* ── Button ──────────────────────────────────────────────── */

const BTN_BASE =
  "inline-flex items-center justify-center gap-[var(--space-2)] font-semibold " +
  "font-[family-name:var(--font-body)] cursor-pointer select-none " +
  "transition-[opacity,transform] duration-[var(--dur-fast)] " +
  "disabled:opacity-40 disabled:cursor-not-allowed";

const BTN_VARIANT = {
  primary: "bg-fg text-fg-invert hover:opacity-88",
  accent: "bg-accent text-accent-fg hover:opacity-88",
  ghost: "bg-transparent text-fg-dim border border-line hover:text-fg",
  danger: "bg-transparent text-bad border border-bad/30 hover:opacity-80",
} as const;

const BTN_SIZE = {
  sm: "h-9 px-[var(--space-4)] text-[length:var(--text-sm)] rounded-[var(--radius-sm)]",
  md: "h-11 px-[var(--space-6)] text-[length:var(--text-base)] rounded-[var(--radius-md)]",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  full = false,
  className,
  ...rest
}: {
  variant?: keyof typeof BTN_VARIANT;
  size?: keyof typeof BTN_SIZE;
  full?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cx(BTN_BASE, BTN_VARIANT[variant], BTN_SIZE[size], full && "w-full", className)}
      {...rest}
    />
  );
}

/** Same styling, anchor semantics. Links that look like buttons are still links. */
export function ButtonLink({
  variant = "primary",
  size = "md",
  full = false,
  className,
  ...rest
}: {
  variant?: keyof typeof BTN_VARIANT;
  size?: keyof typeof BTN_SIZE;
  full?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cx(BTN_BASE, BTN_VARIANT[variant], BTN_SIZE[size], full && "w-full", className)}
      {...rest}
    />
  );
}

/* ── Card ────────────────────────────────────────────────── */

export function Card({
  raised = false,
  pad = 6,
  className,
  ...rest
}: {
  raised?: boolean;
  pad?: 0 | 4 | 5 | 6 | 8;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "bg-bg-raise border border-line rounded-[var(--radius-lg)]",
        raised && "shadow-[var(--shadow-md)]",
        className,
      )}
      style={pad ? { padding: `var(--space-${pad})` } : undefined}
      {...rest}
    />
  );
}

/* ── Badge ───────────────────────────────────────────────── */

export function Badge({
  tone = "default",
  className,
  ...rest
}: { tone?: "default" | "accent" | "good" | "warn" | "bad" } & React.HTMLAttributes<HTMLSpanElement>) {
  const tones = {
    default: "text-fg-dim border-line",
    accent: "text-accent border-accent/35",
    good: "text-good border-good/35",
    warn: "text-warn border-warn/35",
    bad: "text-bad border-bad/35",
  } as const;
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-[var(--space-2)] py-[var(--space-1)]",
        "font-[family-name:var(--font-body)] text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}

/* ── Field ───────────────────────────────────────────────── */

export function Field({
  label,
  error,
  children,
  className,
}: {
  label?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col gap-[var(--space-2)]", className)}>
      {label && (
        <Text as="label" variant="meta" tone="dim">
          {label}
        </Text>
      )}
      {children}
      {error && (
        <Text variant="meta" tone="bad">
          {error}
        </Text>
      )}
    </div>
  );
}

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "w-full bg-bg-raise border border-line rounded-[var(--radius-sm)] outline-none",
        "px-[var(--space-3)] py-[var(--space-3)]",
        "font-[family-name:var(--font-body)] text-[length:var(--text-base)] text-fg",
        "placeholder:text-fg-faint focus:border-line-strong",
        "transition-colors duration-[var(--dur-fast)]",
        className,
      )}
      {...rest}
    />
  );
}

/* ── Stat ────────────────────────────────────────────────── */

export function Stat({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <Text variant="mono" tone="faint">
        {label}
      </Text>
      <Text as="div" variant="h2" className="mt-[var(--space-3)]">
        {value}
      </Text>
      {sub && (
        <Text variant="meta" tone="dim" className="mt-[var(--space-2)]">
          {sub}
        </Text>
      )}
    </Card>
  );
}

/* ── Sheet (Radix Dialog) ────────────────────────────────── */

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;

export function SheetContent({
  children,
  size = "md",
  theme,
  className,
}: {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** Render the sheet under a different theme than the page beneath it. */
  theme?: "ovation" | "warrick";
  className?: string;
}) {
  const widths = {
    sm: "max-w-[var(--w-sheet-sm)]",
    md: "max-w-[var(--w-sheet-md)]",
    lg: "max-w-[var(--w-sheet-lg)]",
  } as const;
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 z-50 bg-[var(--overlay)] backdrop-blur-[var(--blur-overlay)] data-[state=open]:animate-in data-[state=open]:fade-in"
      />
      <DialogPrimitive.Content
        data-theme={theme}
        className={cx(
          "fixed left-1/2 top-1/2 z-50 w-[calc(100%-var(--space-8))] -translate-x-1/2 -translate-y-1/2",
          "bg-bg rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] overflow-hidden",
          widths[size],
          className,
        )}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Close"
          className="absolute right-[var(--space-4)] top-[var(--space-4)] grid h-8 w-8 place-items-center rounded-full text-fg-faint hover:text-fg hover:bg-fg/5"
        >
          <X size={16} strokeWidth={1.5} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;

/* ── ContextMenu (Radix) ─────────────────────────────────── */

export const Menu = ContextMenuPrimitive.Root;
export const MenuTrigger = ContextMenuPrimitive.Trigger;

export function MenuContent({ children }: { children: React.ReactNode }) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        className="z-50 min-w-[var(--w-tooltip)] rounded-[var(--radius-md)] border border-line bg-bg-raise p-[var(--space-1)] shadow-[var(--shadow-md)]"
      >
        {children}
      </ContextMenuPrimitive.Content>
    </ContextMenuPrimitive.Portal>
  );
}

export function MenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <ContextMenuPrimitive.Label className="border-b border-line px-[var(--space-3)] pb-[var(--space-2)] pt-[var(--space-2)] font-[family-name:var(--font-body)] text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.13em] text-fg-faint">
      {children}
    </ContextMenuPrimitive.Label>
  );
}

export function MenuItem({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect?: () => void;
}) {
  return (
    <ContextMenuPrimitive.Item
      onSelect={onSelect}
      className="mt-[var(--space-1)] flex cursor-pointer items-center gap-[var(--space-2)] rounded-[var(--radius-sm)] px-[var(--space-3)] py-[var(--space-2)] font-[family-name:var(--font-body)] text-[length:var(--text-sm)] text-fg outline-none data-[highlighted]:bg-fg/6"
    >
      {children}
    </ContextMenuPrimitive.Item>
  );
}

/* ── Tooltip (Radix) ─────────────────────────────────────── */

export const TooltipProvider = TooltipPrimitive.Provider;

export function Tooltip({
  label,
  children,
  delay = 500,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <TooltipPrimitive.Root delayDuration={delay}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={6}
          className="z-50 rounded-[var(--radius-sm)] bg-fg px-[var(--space-2)] py-[var(--space-1)] font-[family-name:var(--font-mono)] text-[length:var(--text-2xs)] text-fg-invert"
        >
          {label}
          <TooltipPrimitive.Arrow className="fill-fg" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

/* ── Avatar ──────────────────────────────────────────────── */

const AVATAR_SIZE = {
  sm: "h-5 w-5 text-[length:var(--text-2xs)]",
  md: "h-7 w-7 text-[length:var(--text-2xs)]",
  lg: "h-9 w-9 text-[length:var(--text-sm)]",
} as const;

/**
 * A person, as a coloured initial.
 *
 * The colour is assigned per user and stored on their row — it is data, not
 * theme, so a theme swap must NOT reach it. That is exactly why it arrives as
 * a prop and becomes inline style here: this file is the one place allowed to
 * hold a raw value, and holding it here means the call sites stay clean.
 */
export function Avatar({
  color,
  size = "md",
  as: Tag = "span",
  className,
  ...rest
}: {
  color: string;
  size?: keyof typeof AVATAR_SIZE;
  /** `a` when the face links somewhere — a collector's page, say. */
  as?: "span" | "a";
} & React.HTMLAttributes<HTMLElement> & { href?: string }) {
  return (
    <Tag
      className={cx(
        "grid shrink-0 place-items-center rounded-full text-white",
        "font-[family-name:var(--font-body)] font-semibold",
        AVATAR_SIZE[size],
        className,
      )}
      style={{ background: color }}
      {...rest}
    />
  );
}

/** Overlapping avatars — a crowd, not a list. */
export function AvatarRow({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("flex -space-x-2", className)} {...rest} />;
}

/* ── Swatch ──────────────────────────────────────────────── */

/** A colour you can pick. Same reasoning as Avatar: the colour is the seller's. */
export function Swatch({
  color,
  selected,
  className,
  ...rest
}: {
  color: string;
  selected?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={color}
      aria-pressed={selected}
      className={cx(
        "h-8 w-8 cursor-pointer rounded-[var(--radius-sm)] border-2",
        selected ? "border-fg" : "border-transparent",
        className,
      )}
      style={{ background: color }}
      {...rest}
    />
  );
}

/* ── Meter ───────────────────────────────────────────────── */

/** A fraction of something finite. `value` is 0–1 and is clamped. */
export function Meter({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  return (
    <div className={cx("h-1 overflow-hidden rounded-full bg-fg/10", className)}>
      <i
        className="block h-full origin-left bg-accent transition-transform duration-[var(--dur-slow)]"
        style={{ transform: `scaleX(${pct.toFixed(3)})` }}
      />
    </div>
  );
}

/* ── Row / AutoGrid ──────────────────────────────────────── */

/**
 * A grid row with an explicit column template, so a header and its body share
 * one source of truth instead of two strings that drift apart.
 */
export function Row({
  cols,
  className,
  ...rest
}: { cols: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx("grid gap-[var(--space-4)]", className)}
      style={{ gridTemplateColumns: cols }}
      {...rest}
    />
  );
}

/** Coins on a shelf: as many per row as fit, every one the same width. */
export function AutoGrid({
  min = "var(--w-coin-cell)",
  className,
  ...rest
}: { min?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx("grid gap-x-[var(--space-5)] gap-y-[var(--space-8)]", className)}
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${min}, 1fr))` }}
      {...rest}
    />
  );
}
