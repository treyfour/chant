import { auth0 } from "./auth0";
import { sql } from "./db";
import { ROLE_PERMISSIONS } from "./types";
import type { ActivityEvent, CoinRun, Hex, MemberRole, Permission, SellerDashboardView } from "./types";

/**
 * The viewer's role inside a seller Organization.
 *
 * Auth0 Organizations put `org_id` on the token and roles in a namespaced claim.
 * Creating orgs/invites programmatically needs Management API (M2M) credentials
 * we deliberately did not provision — orgs are pre-created in the dashboard.
 *
 * `?role=member` is a demo affordance for the RBAC beat: it can only ever REMOVE
 * permissions, never grant them, so it cannot be used to escalate.
 */
export async function viewerRole(demoOverride?: string | null): Promise<MemberRole> {
  if (demoOverride === "member") return "member";

  const session = await auth0.getSession();
  const claims = (session?.user ?? {}) as Record<string, unknown>;
  const roles =
    (claims["https://ovation.app/roles"] as string[] | undefined) ??
    (claims["org_roles"] as string[] | undefined) ??
    [];

  return roles.includes("owner") || roles.length === 0 ? "owner" : "member";
}

export function permissionsFor(role: MemberRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

export async function getSellerDashboard(
  slug: string,
  role: MemberRole,
): Promise<SellerDashboardView | null> {
  const ss = await sql`SELECT * FROM sellers WHERE slug = ${slug} LIMIT 1`;
  if (ss.length === 0) return null;
  const s = ss[0];

  const planRows = await sql`
    SELECT p.*, r.id AS r_id, r.name AS r_name, r.size, r.claimed, r.glyph AS r_glyph,
           r.tint AS r_tint, r.retired, r.created_at
    FROM plans p LEFT JOIN runs r ON r.id = p.run_id
    WHERE p.seller_id = ${s.id}
    ORDER BY p.unit_amount ASC`;

  const activityRows = await sql`
    SELECT * FROM activity WHERE seller_id = ${s.id} ORDER BY at DESC LIMIT 6`;

  const collectorRows = await sql`
    SELECT DISTINCT c.handle, c.avatar_color
    FROM coins co JOIN collectors c ON c.id = co.collector_id
    WHERE co.seller_id = ${s.id} AND co.is_public = true LIMIT 12`;

  const [{ revenue }] = await sql`
    SELECT COALESCE(SUM(p.unit_amount), 0)::int AS revenue
    FROM plans p WHERE p.seller_id = ${s.id}`;

  return {
    seller: {
      id: String(s.id), orgId: String(s.org_id), slug: String(s.slug), name: String(s.name),
      tagline: String(s.tagline), location: String(s.location), stage: String(s.stage),
      mark: String(s.mark), tint: String(s.tint) as Hex,
      stripeAccountId: s.stripe_account_id ? String(s.stripe_account_id) : null,
      ovationTier: s.ovation_tier as "starter" | "studio" | "scale",
    },
    plans: planRows.map((p) => ({
      id: String(p.id), sellerId: String(p.seller_id),
      stripeProductId: String(p.stripe_product_id), stripePriceId: String(p.stripe_price_id),
      name: String(p.name), priceLabel: String(p.price_label),
      unitAmount: Number(p.unit_amount), interval: p.interval as "month" | "year" | "once",
      subscriberCount: Number(p.subscriber_count),
      runId: p.run_id ? String(p.run_id) : null,
      run: p.r_id
        ? ({
            id: String(p.r_id), sellerId: String(p.seller_id), planId: String(p.id),
            name: String(p.r_name), size: Number(p.size), claimed: Number(p.claimed),
            glyph: String(p.r_glyph), tint: String(p.r_tint) as Hex,
            retired: Boolean(p.retired),
            createdAt: new Date(String(p.created_at)).toISOString(),
          } satisfies CoinRun)
        : null,
    })),
    activity: activityRows.map((a) => ({
      id: String(a.id), kind: a.kind as ActivityEvent["kind"], text: String(a.text),
      actorInitial: String(a.actor_initial), actorColor: String(a.actor_color) as Hex,
      at: new Date(String(a.at)).toISOString(),
    })),
    collectors: collectorRows.map((c) => ({
      handle: String(c.handle), avatarColor: String(c.avatar_color) as Hex,
    })),
    payoutCents: Number(revenue) * 7, // stand-in until Connect balance is wired
    viewerPermissions: permissionsFor(role),
  };
}
