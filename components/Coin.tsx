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
  // A monogram is set as type; a symbol is set as a glyph. Same slot, different
  // optical treatment — the two need different size and weight to read right.
  const isLetter = /^[A-Za-z0-9]{1,2}$/.test(glyph);

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
        <span
          className="coin-glyph"
          style={
            isLetter
              ? {
                  // Letterforms need different treatment from symbols: heavier,
                  // tighter, and smaller relative to the coin, or they read as
                  // a typo rather than a mark.
                  fontSize: Math.round(size * (glyph.length > 1 ? 0.24 : 0.34)),
                  fontFamily: "var(--body)",
                  fontWeight: 700,
                  letterSpacing: glyph.length > 1 ? "-0.04em" : "-0.02em",
                }
              : { fontSize: Math.round(size * 0.335) }
          }
        >
          {glyph}
        </span>
      </div>
    </div>
  );
}
