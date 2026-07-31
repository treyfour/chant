/**
 * Seller-choosable dyes and marks.
 *
 * This is DATA, not theme. A seller picks a colour for their own coin the way
 * they'd pick a logo colour — it belongs to them, not to whatever theme the
 * page is rendered under. Living in lib/ is what keeps the guard honest:
 * flagging these as "untokenised" would just teach people to silence it.
 */
export const COIN_TINTS = [
  "#C87137", "#3B5BA5", "#4A7C59", "#A8324A",
  "#7B4B94", "#2E7D7B", "#B7410E", "#6F4E37",
] as const;

export const COIN_GLYPHS = ["▲", "◆", "⬡", "❈", "✦", "◐", "⬮", "≈"] as const;

/**
 * The colour on activity-feed dots written by the app itself (attach, retire).
 * One actor, one colour — these were two different browns before, which read
 * as two different people doing the work.
 */
export const SYSTEM_ACTOR = { initial: "N", color: "#8f6a45" } as const;
