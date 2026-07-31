/**
 * Fake data satisfying lib/types.ts.
 *
 * The UI runs on this from minute one, so there is always something to show.
 * Replace one function at a time with a real query — never all at once.
 *
 * Company names are fictional but YC-shaped on purpose: attaching invented
 * collector counts and purchase history to real companies would misrepresent them.
 */

import type {
  ActivityEvent, Coin, CoinRun, CollectionItem, CollectionView, Collector,
  Member, Permission, Plan, PublicCollectionView, Seller, SellerDashboardView,
  SellerPublicView,
} from "./types";

// ─────────────────────────────────────────────────────────────
// Collectors
// ─────────────────────────────────────────────────────────────

export const TREY: Collector = {
  id: "col_trey", handle: "trey", name: "Trey Schulte",
  avatarColor: "#8f6a45", since: "2025-10-04", isPublic: true,
};

export const DANA: Collector = {
  id: "col_dana", handle: "dana", name: "Dana Okoro",
  avatarColor: "#3B5BA5", since: "2025-03-11", isPublic: true,
};

// ─────────────────────────────────────────────────────────────
// Seller: Warrick
// ─────────────────────────────────────────────────────────────

export const WARRICK: Seller = {
  id: "sel_warrick", orgId: "org_warrick", slug: "warrick", name: "Warrick",
  tagline: "The orchestration layer for AI agents. Durable runs, replay, and stall detection.",
  location: "San Francisco · three engineers", stage: "Pre-seed",
  mark: "▲", tint: "#C87137",
  stripeAccountId: "acct_1QxWarrick", ovationTier: "starter",
};

export const WARRICK_MEMBERS: Member[] = [
  { id: "mem_nadia", email: "nadia@warrick.dev", name: "Nadia Okonkwo",
    avatarColor: "#8f6a45", role: "owner", status: "active", invitedAt: null },
  { id: "mem_sam", email: "sam@warrick.dev", name: "Sam Reyes",
    avatarColor: "#4A7C59", role: "member", status: "active", invitedAt: null },
  { id: "mem_jo", email: "jo@warrick.dev", name: null,
    avatarColor: "#a29a8c", role: "member", status: "pending", invitedAt: "2026-07-30T22:58:00Z" },
];

export const WARRICK_RUNS: CoinRun[] = [
  { id: "run_founding", sellerId: "sel_warrick", planId: "plan_pro",
    name: "founding user", size: 50, claimed: 35, glyph: "▲", tint: "#C87137",
    retired: false, createdAt: "2026-03-02T10:00:00Z" },
  { id: "run_charter", sellerId: "sel_warrick", planId: "plan_team",
    name: "charter member", size: 25, claimed: 3, glyph: "◆", tint: "#3B5BA5",
    retired: false, createdAt: "2026-05-14T10:00:00Z" },
];

export const WARRICK_PLANS: Plan[] = [
  { id: "plan_free", sellerId: "sel_warrick", stripeProductId: "prod_free",
    stripePriceId: "price_free", name: "Free", priceLabel: "$0",
    unitAmount: 0, interval: "month", subscriberCount: 412, runId: null },
  { id: "plan_pro", sellerId: "sel_warrick", stripeProductId: "prod_pro",
    stripePriceId: "price_pro", name: "Pro", priceLabel: "$20/mo",
    unitAmount: 2000, interval: "month", subscriberCount: 35, runId: "run_founding" },
  { id: "plan_team", sellerId: "sel_warrick", stripeProductId: "prod_team",
    stripePriceId: "price_team", name: "Team", priceLabel: "$99/mo",
    unitAmount: 9900, interval: "month", subscriberCount: 8, runId: "run_charter" },
];

// ─────────────────────────────────────────────────────────────
// Trey's collection
// ─────────────────────────────────────────────────────────────

type Seed = [seller: string, slug: string, run: string, serial: number, size: number,
  tint: string, glyph: string, kind: "owned" | "backed", isPublic: boolean, at: string];

const TREY_SEED: Seed[] = [
  ["Warrick",  "warrick",  "founding user",  35, 50,  "#C87137", "▲", "owned",  true,  "2026-07-28"],
  ["Cinder",   "cinder",   "design partner",  6, 25,  "#B7410E", "▰", "owned",  true,  "2026-07-21"],
  ["Halyard",  "halyard",  "beta",          112, 250, "#2E7D7B", "≈", "owned",  true,  "2026-07-14"],
  ["Kiln",     "kiln",     "founding user",   9, 50,  "#D4A017", "✦", "owned",  false, "2026-07-02"],
  ["Parity",   "parity",   "early access",   41, 100, "#3B5BA5", "◆", "owned",  true,  "2026-06-26"],
  ["Warrick",  "warrick",  "pro · year one", 12, 200, "#C87137", "▲", "owned",  true,  "2026-06-18"],
  ["Wick",     "wick",     "waitlist",       14, 50,  "#7B4B94", "✲", "backed", false, "2026-06-04"],
  ["Thresher", "thresher", "beta",           61, 150, "#6F4E37", "⬮", "owned",  true,  "2026-05-22"],
  ["Roost",    "roost",    "early access",  401, 500, "#356859", "❀", "owned",  true,  "2026-05-09"],
  ["Sable",    "sable",    "design partner",  3, 25,  "#8A8253", "◬", "owned",  true,  "2026-04-17"],
  ["Mica",     "mica",     "founding user",  88, 200, "#4A7C59", "⬡", "owned",  true,  "2026-03-30"],
  ["Bramble",  "bramble",  "beta",           19, 30,  "#5C6B73", "◐", "owned",  true,  "2026-02-11"],
  ["Perch",    "perch",    "founding user",   7, 50,  "#A8324A", "❈", "backed", false, "2026-01-08"],
  ["Loam",     "loam",     "early access",    2, 50,  "#2F6690", "❖", "owned",  true,  "2025-11-19"],
];

const toItem = (s: Seed, i: number): CollectionItem => ({
  coinId: `coin_${i}`,
  sellerSlug: s[1], sellerName: s[0], runName: s[2],
  serial: s[3], size: s[4], tint: s[5] as CollectionItem["tint"], glyph: s[6],
  kind: s[7], isPublic: s[8], retired: false, acquiredAt: s[9],
});

export const TREY_ITEMS: CollectionItem[] = TREY_SEED.map(toItem);

export function mockCollection(): CollectionView {
  return {
    collector: TREY,
    items: TREY_ITEMS,
    stats: {
      coins: TREY_ITEMS.length,
      sellers: new Set(TREY_ITEMS.map((i) => i.sellerSlug)).size,
      privateCount: TREY_ITEMS.filter((i) => !i.isPublic).length,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Dana's collection — the discovery beat
// ─────────────────────────────────────────────────────────────

const DANA_SEED: Array<[...Seed, hasIt: boolean]> = [
  ["Warrick", "warrick", "founding user",   8, 50,  "#C87137", "▲", "owned", true, "2026-02-02", true],
  ["Tessera", "tessera", "design partner",  4, 25,  "#2F6690", "❖", "owned", true, "2026-06-11", false],
  ["Gravel",  "gravel",  "beta",           41, 120, "#B5651D", "▣", "owned", true, "2026-05-30", false],
  ["Almanac", "almanac", "founding user",  11, 50,  "#5D5FA8", "✎", "owned", true, "2026-04-22", false],
  ["Halyard", "halyard", "beta",           88, 250, "#2E7D7B", "≈", "owned", true, "2026-03-15", true],
  ["Ferrite", "ferrite", "early access",    2, 30,  "#7A3B3B", "✧", "owned", true, "2026-02-27", false],
  ["Ostrich", "ostrich", "waitlist",       63, 200, "#3C6E71", "◍", "backed", true, "2026-01-30", false],
  ["Quorum",  "quorum",  "design partner", 19, 150, "#6F4E37", "⬮", "owned", true, "2025-12-12", false],
];

export function mockPublicCollection(): PublicCollectionView {
  const items = DANA_SEED.map((s, i) => ({
    ...toItem(s.slice(0, 10) as Seed, i),
    coinId: `dana_coin_${i}`,
    viewerHasIt: s[10] as boolean,
  }));
  return {
    collector: DANA,
    items,
    stats: { coins: items.length, sellers: new Set(items.map((i) => i.sellerSlug)).size },
  };
}

// ─────────────────────────────────────────────────────────────
// Seller-facing views
// ─────────────────────────────────────────────────────────────

const AVATARS: Array<Pick<Collector, "handle" | "name" | "avatarColor">> = [
  { handle: "dana", name: "Dana Okoro", avatarColor: "#3B5BA5" },
  { handle: "marisol", name: "Marisol Vega", avatarColor: "#4A7C59" },
  { handle: "rui", name: "Rui Tanaka", avatarColor: "#A8324A" },
  { handle: "jae", name: "Jae Lin", avatarColor: "#2E7D7B" },
  { handle: "kofi", name: "Kofi Mensah", avatarColor: "#7B4B94" },
  { handle: "sasha", name: "Sasha Bell", avatarColor: "#8A8253" },
  { handle: "pia", name: "Pia Ferreira", avatarColor: "#B7410E" },
];

export function mockSellerPublic(): SellerPublicView {
  const runByPlan = new Map(WARRICK_RUNS.map((r) => [r.planId, r]));
  return {
    seller: WARRICK,
    plans: WARRICK_PLANS.map((p) => {
      const r = runByPlan.get(p.id);
      return {
        ...p,
        run: r
          ? { name: r.name, size: r.size, claimed: r.claimed, glyph: r.glyph, tint: r.tint, retired: r.retired }
          : null,
      };
    }),
    collectors: AVATARS,
    collectorCount: 34,
  };
}

export const MOCK_ACTIVITY: ActivityEvent[] = [
  { id: "ev1", kind: "coin_claimed", text: "Coin <b>#35</b> claimed by <b>@trey</b>",
    actorInitial: "T", actorColor: "#8f6a45", at: "2026-07-30T23:00:00Z" },
  { id: "ev2", kind: "coin_claimed", text: "Coin <b>#34</b> claimed by <b>@dana</b>",
    actorInitial: "D", actorColor: "#3B5BA5", at: "2026-07-30T19:00:00Z" },
  { id: "ev3", kind: "coin_made_private", text: "Coin <b>#33</b> claimed, kept <b>private</b>",
    actorInitial: "M", actorColor: "#4A7C59", at: "2026-07-30T17:00:00Z" },
  { id: "ev4", kind: "coin_made_public", text: "<b>@jae</b> made <b>#12</b> public",
    actorInitial: "J", actorColor: "#A8324A", at: "2026-07-29T12:00:00Z" },
  { id: "ev5", kind: "member_invited", text: "<b>jo@warrick.dev</b> invited as Member",
    actorInitial: "?", actorColor: "#a29a8c", at: "2026-07-29T09:00:00Z" },
];

/** Day one: Stripe connected, no coins yet. The real first-run state. */
export const MOCK_ACTIVITY_DAY_ONE: ActivityEvent[] = [
  { id: "ev_a", kind: "stripe_connected", text: "Stripe account <b>connected</b>",
    actorInitial: "S", actorColor: "#635bff", at: "2026-07-30T23:16:00Z" },
];

export function mockSellerDashboard(opts?: {
  dayOne?: boolean;
  viewerPermissions?: Permission[];
}): SellerDashboardView {
  const dayOne = opts?.dayOne ?? false;
  const runById = new Map(WARRICK_RUNS.map((r) => [r.id, r]));
  return {
    seller: WARRICK,
    plans: WARRICK_PLANS.map((p) => ({
      ...p,
      run: dayOne || !p.runId ? null : runById.get(p.runId) ?? null,
    })),
    activity: dayOne ? MOCK_ACTIVITY_DAY_ONE : MOCK_ACTIVITY,
    collectors: dayOne ? [] : AVATARS.map(({ handle, avatarColor }) => ({ handle, avatarColor })),
    payoutCents: dayOne ? 0 : 143800,
    viewerPermissions: opts?.viewerPermissions ?? [
      "coins:create", "coins:retire", "members:invite", "billing:manage", "payouts:view",
    ],
  };
}

/** The coin the reveal modal shows after checkout. */
export const MOCK_JUST_CLAIMED: Pick<Coin, "serial"> & {
  sellerName: string; runName: string; size: number; glyph: string; tint: string;
} = {
  serial: 35, sellerName: "Warrick", runName: "founding user",
  size: 50, glyph: "▲", tint: "#C87137",
};
