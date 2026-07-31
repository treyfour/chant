/**
 * Ovation — frozen contract.
 *
 * Derived from prototypes/flow-buy-v3.html and prototypes/flow-sell-v3.html.
 * Those files are the visual spec; this file is the data spec.
 *
 * RULE: nothing here changes inside a worktree or mid-slice. A contract change
 * comes back to main, gets made once, and both sides rebase.
 */

// ─────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────

/** Hex brand colour, e.g. "#C87137". Rendered as dyed leather client-side. */
export type Hex = `#${string}`;

/** A single unicode mark pressed into the coin face. Real artwork replaces this later. */
export type Glyph = string;

export type ISODate = string;

/** Auth0 Organization id, e.g. "org_warrick". */
export type OrgId = string;

// ─────────────────────────────────────────────────────────────
// Identity — two populations, one Auth0 tenant
// ─────────────────────────────────────────────────────────────

/** A plain Auth0 user. One identity across every seller. This is the product. */
export interface Collector {
  id: string;
  handle: string;              // "trey" → /@trey
  name: string;
  avatarColor: Hex;
  since: ISODate;
  /** Collection is public by default; per-coin privacy is on Coin.isPublic. */
  isPublic: boolean;
}

export type MemberRole = "owner" | "member";
export type MemberStatus = "active" | "pending";

/** A member of an Auth0 Organization. Roles come from the token, never the DB. */
export interface Member {
  id: string;
  email: string;
  name: string | null;         // null while status === "pending"
  avatarColor: Hex;
  role: MemberRole;
  status: MemberStatus;
  invitedAt: ISODate | null;
}

/** Permissions read off the Auth0 access token. Never persisted as booleans. */
export type Permission =
  | "coins:create"
  | "coins:retire"
  | "members:invite"
  | "billing:manage"
  | "payouts:view"
  | "plans:read"
  | "collectors:read";

export const ROLE_PERMISSIONS: Record<MemberRole, Permission[]> = {
  owner: ["coins:create", "coins:retire", "members:invite", "billing:manage", "payouts:view"],
  member: ["plans:read", "collectors:read"],
};

// ─────────────────────────────────────────────────────────────
// Seller
// ─────────────────────────────────────────────────────────────

export type OvationTier = "starter" | "studio" | "scale";

export interface Seller {
  id: string;
  orgId: OrgId;                // Auth0 Organization
  slug: string;                // "warrick"
  name: string;                // "Warrick"
  tagline: string;
  location: string;            // "San Francisco · three engineers"
  stage: string;               // "Pre-seed" — display only, not a state machine
  mark: Glyph;
  tint: Hex;
  /** Stripe Connect account. Null until Connect completes. */
  stripeAccountId: string | null;
  ovationTier: OvationTier;
}

// ─────────────────────────────────────────────────────────────
// Plans and runs
// ─────────────────────────────────────────────────────────────

/** A Stripe product the seller already sells. Read via Connect, never created by us. */
export interface Plan {
  id: string;
  sellerId: string;
  stripeProductId: string;
  stripePriceId: string;
  name: string;                // "Pro"
  priceLabel: string;          // "$20/mo" — display string, not for arithmetic
  unitAmount: number;          // cents
  interval: "month" | "year" | "once";
  subscriberCount: number;
  /** Null means no coin attached — the empty state on the dashboard. */
  runId: string | null;
}

/**
 * A limited run attached to a plan. `size` is permanent: when claimed === size
 * the run closes forever. Retiring early destroys the remainder deliberately.
 */
export interface CoinRun {
  id: string;
  sellerId: string;
  planId: string;
  name: string;                // "founding user"
  size: number;                // 50
  claimed: number;             // 35
  glyph: Glyph;
  tint: Hex;
  retired: boolean;
  createdAt: ISODate;
}

// ─────────────────────────────────────────────────────────────
// Coins
// ─────────────────────────────────────────────────────────────

/** "owned" = bought a plan. "backed" = supported with nothing to sell yet (outline coin). */
export type CoinKind = "owned" | "backed";

/**
 * One issued coin. Created ONLY by the Stripe webhook claiming the next serial.
 * There is no other write path — a coin without a payment cannot exist.
 */
export interface Coin {
  id: string;
  runId: string;
  sellerId: string;
  collectorId: string;
  serial: number;              // 35, 1-indexed
  kind: CoinKind;
  /** Per-coin consent, revocable. Right-click to toggle. Never shown at checkout. */
  isPublic: boolean;
  acquiredAt: ISODate;
  /** Idempotency key — the Stripe event that minted it. Unique. */
  stripeEventId: string;
}

// ─────────────────────────────────────────────────────────────
// View models — what each screen actually reads
// ─────────────────────────────────────────────────────────────

/** One cell in the collection grid. Denormalised so the grid needs no joins. */
export interface CollectionItem {
  coinId: string;
  sellerSlug: string;
  sellerName: string;
  /** Where the coin points. This is what makes it a promotional object rather
   *  than decoration — every browse of a collection is a lead for the seller. */
  website: string | null;
  runName: string;             // "founding user"
  serial: number;
  size: number;
  glyph: Glyph;
  tint: Hex;
  kind: CoinKind;
  isPublic: boolean;
  retired: boolean;
  acquiredAt: ISODate;
}

export interface CollectionView {
  collector: Collector;
  items: CollectionItem[];
  stats: { coins: number; sellers: number; privateCount: number };
}

/** Someone else's collection. `viewerHasIt` drives the faded "new to you" cells. */
export interface PublicCollectionView {
  collector: Collector;
  items: (CollectionItem & { viewerHasIt: boolean })[];
  stats: { coins: number; sellers: number };
}

/** The seller-facing pricing page a buyer lands on. Ovation is invisible here. */
export interface SellerPublicView {
  seller: Seller;
  plans: (Plan & {
    run: Pick<CoinRun, "name" | "size" | "claimed" | "glyph" | "tint" | "retired"> | null;
  })[];
  collectors: Array<Pick<Collector, "handle" | "name" | "avatarColor">>;
  collectorCount: number;
}

export type ActivityKind =
  | "coin_claimed"
  | "coin_made_private"
  | "coin_made_public"
  | "member_invited"
  | "stripe_connected"
  | "run_retired";

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  /** Pre-rendered so the feed needs no i18n or lookup logic. */
  text: string;
  actorInitial: string;
  actorColor: Hex;
  at: ISODate;
}

export interface SellerDashboardView {
  seller: Seller;
  plans: (Plan & { run: CoinRun | null })[];
  activity: ActivityEvent[];
  collectors: Array<Pick<Collector, "handle" | "avatarColor">>;
  /** Seller's own Stripe balance. Ovation never holds it. */
  payoutCents: number;
  /** Permissions of the *current viewer*, from their Auth0 token. */
  viewerPermissions: Permission[];
}

// ─────────────────────────────────────────────────────────────
// Write commands
// ─────────────────────────────────────────────────────────────

export interface CreateRunInput {
  planId: string;
  name: string;
  size: number;
  glyph: Glyph;
  tint: Hex;
}

export interface SetCoinVisibilityInput {
  coinId: string;
  isPublic: boolean;
}

/**
 * The only way a coin comes into existence.
 * Called from the Stripe webhook handler, never from a route the user can hit.
 */
export interface ClaimCoinInput {
  stripeEventId: string;       // idempotency
  stripePriceId: string;       // → plan → run
  /** Fallback when the session's line item can't be read. Set from session metadata. */
  planId?: string;
  collectorEmail: string;
  kind: CoinKind;
}

export type ClaimResult =
  | { status: "claimed"; coin: Coin; serial: number }
  | { status: "duplicate"; coin: Coin }        // event already processed
  | { status: "no_run" }                       // plan has no coin attached
  | { status: "sold_out" }                     // claimed === size
  | { status: "retired" };
