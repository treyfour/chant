import { leather } from "@/lib/leather";
import type { CoinKind, Glyph, Hex } from "@/lib/types";

export interface CoinProps {
  glyph: Glyph;
  tint: Hex | string;
  /** Diameter in px. Glyph scales to ~1/3 of it. */
  size: number;
  kind?: CoinKind;
  retired?: boolean;
  /** Someone else owns this and you don't — renders as a faint outline. */
  missing?: boolean;
  className?: string;
}

/**
 * A single dyed-leather coin. The only place coin material is expressed.
 * Material lives in globals.css so a skin change never touches a component.
 */
export function Coin({
  glyph, tint, size, kind = "owned", retired = false, missing = false, className = "",
}: CoinProps) {
  const classes = [
    "coin",
    kind === "backed" ? "coin-backed" : "",
    retired ? "coin-retired" : "",
    missing ? "coin-missing" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div
      className={classes}
      style={{ ...leather(tint), width: size, height: size }}
      aria-hidden="true"
    >
      <div className="coin-face">
        <span className="coin-glyph" style={{ fontSize: Math.round(size * 0.335) }}>
          {glyph}
        </span>
      </div>
    </div>
  );
}
