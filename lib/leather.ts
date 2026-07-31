/**
 * Brand hue → dyed leather.
 *
 * Pigment is plastic; dye is leather. Pulling saturation back and capping
 * lightness is what stops the coins reading as metal — which is what read
 * as crypto. Ported verbatim from prototypes/flow-buy-v3.html.
 */

import type { Hex } from "./types";

function toHsl(hex: string): [h: number, s: number, l: number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  let h = 0;
  let s = 0;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const hsl = (h: number, s: number, l: number) =>
  `hsl(${h.toFixed(0)} ${clamp(s, 0, 100).toFixed(0)}% ${clamp(l, 2, 96).toFixed(0)}%)`;

/**
 * CSS custom properties consumed by `.coin-face` in globals.css.
 *
 * Saturation is CAPPED, not just scaled. Scaling alone leaves brand colours
 * that start near 100% (Brex, DoorDash, Zapier, Stripe) sitting around 52,
 * which reads as plastic or rubber. Real dyed leather lives around 30–34 —
 * roughly where a mid-saturation colour like #C87137 already lands, which is
 * why that one looked right and the vivid ones didn't.
 *
 * Lightness is capped too: a saturated colour held bright reads as enamel.
 */
export function leather(hex: Hex | string): React.CSSProperties {
  const [h, s0, l0] = toHsl(hex);
  const s = Math.min(s0 * 0.52, 34);
  const l = Math.min(l0 * 0.72, 38);
  return {
    ["--lt" as string]: hsl(h, s * 0.9, l + 12),
    ["--md" as string]: hsl(h, s, l),
    ["--dk" as string]: hsl(h, s * 1.08, l - 13),
  };
}
