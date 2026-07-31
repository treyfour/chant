import { leather } from "@/lib/leather";
import type { CoinKind, Glyph, Hex } from "@/lib/types";

export interface CoinProps {
  glyph: Glyph;
  tint: Hex | string;
  /** Diameter in px. The mark scales optically from it. */
  size: number;
  kind?: CoinKind;
  retired?: boolean;
  /** Someone else owns this and you don't — renders as a faint outline. */
  missing?: boolean;
  className?: string;
}

/**
 * A single dyed-leather coin.
 *
 * The only component allowed to carry a bespoke material, because it IS one —
 * grain, stitching, and a blind-embossed mark. All of that lives in
 * `globals.css` under `.coin-*`, so the component holds structure only.
 *
 * `size` is the one legitimate raw number here: it's an input, not a style
 * decision, and the glyph scales optically from it. Everything else resolves
 * through tokens.
 */
export function Coin({
  glyph, tint, size, kind = "owned", retired = false, missing = false, className = "",
}: CoinProps) {
  // A monogram is set as type; a symbol is set as a glyph. Same slot, different
  // optical treatment — the two need different size and weight to read right.
  const isLetter = /^[A-Za-z0-9]{1,2}$/.test(glyph);

  const classes = [
    // `shrink-0` is not decoration — it is the whole contract of a component
    // that sets its own width AND height. Default `flex-shrink: 1` compresses
    // the MAIN axis only, so a 42px circle in a tight flex row becomes a 34x42
    // ellipse: the height holds, the width gives. Nothing warns you. A shape
    // with a fixed aspect ratio has to opt out of flex sizing here, in the
    // component, so no call site can ever get it wrong.
    "coin shrink-0",
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
                  fontSize: Math.round(size * (glyph.length > 1 ? 0.24 : 0.34)),
                  fontFamily: "var(--font-body)",
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
