import { ROLE_PERMISSIONS } from "@/lib/types";
import { viewerRole } from "@/lib/seller";
import { TEAM_ROSTER as MEMBERS } from "@/lib/mocks";
import { Avatar, Badge, ButtonLink, Card, Row, Stack, Text } from "@/components/ui";

/** Header and body share one column template. */
const ROW = "1fr 120px 92px";

export const dynamic = "force-dynamic";


export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role: roleParam } = await searchParams;
  const role = await viewerRole(roleParam);
  const qs = role === "member" ? "?role=member" : "";

  return (
    <>
      <nav className="sticky top-0 z-40 flex h-[var(--h-nav-app)] items-center gap-[var(--space-3)] border-b border-line bg-bg-raise px-[var(--space-8)]">
        <Text as="span" variant="h3">Ovation</Text>
        <span className="flex-1" />
        <a href={`/app/plans${qs}`}>
          <Text as="span" variant="meta" tone="dim">Plans</Text>
        </a>
        <a href="/app/billing">
          <Text as="span" variant="meta" tone="dim">Billing</Text>
        </a>
        <a href="/demo">
          <Text as="span" variant="meta" tone="accent">Demo home</Text>
        </a>
      </nav>

      <main className="mx-auto w-full max-w-[var(--w-app)] px-[var(--space-12)] pb-[var(--space-20)] pt-[var(--space-10)]">
        <Text variant="mono" tone="faint">Warrick</Text>
        <Text as="h1" variant="h1" className="mt-[var(--space-3)]">Team &amp; access</Text>
        <Text variant="body" tone="dim" className="mt-[var(--space-3)] max-w-[56ch]">
          Members of <b className="text-fg">org_warrick</b>. Roles come from Auth0 and
          decide who can attach a coin, retire a run, or see money.
        </Text>

        <Card pad={0} className="mt-[var(--space-6)] pb-[var(--space-2)] pt-[var(--space-5)]">
          <Row cols={ROW} className="px-[var(--space-6)] pb-[var(--space-3)]">
            <Text as="span" variant="mono" tone="faint">Member</Text>
            <Text as="span" variant="mono" tone="faint">Role</Text>
            <span />
          </Row>

          {MEMBERS.map((m, i) => (
            <Row
              key={m.email}
              cols={ROW}
              className={[
                "items-center px-[var(--space-6)] py-[var(--space-4)]",
                i < MEMBERS.length - 1 ? "border-b border-line" : "",
              ].join(" ")}
            >
              <Stack row gap={3} align="center">
                <Avatar color={m.color} size="lg">{m.name ? m.name[0] : "?"}</Avatar>
                <div>
                  <Text variant="meta" tone={m.name ? "default" : "dim"} className="font-semibold">
                    {m.name ?? m.email}
                  </Text>
                  <Text variant="meta" tone="dim" className="mt-[var(--space-1)]">
                    {m.name ? m.email : "Invited 2 minutes ago"}
                  </Text>
                </div>
              </Stack>
              <Badge
                tone={m.status === "pending" ? "warn" : m.role === "Owner" ? "accent" : "default"}
              >
                {m.status === "pending" ? "Pending" : m.role}
              </Badge>
              <span />
            </Row>
          ))}
        </Card>

        <div className="mt-[var(--space-5)] grid gap-[var(--space-4)] md:grid-cols-2">
          {(["owner", "member"] as const).map((r) => (
            <Card key={r}>
              <Text variant="meta" tone="dim">
                <b className="capitalize text-fg">{r}</b>
              </Text>
              <Stack row gap={2} wrap className="mt-[var(--space-3)]">
                {ROLE_PERMISSIONS[r].map((p) => (
                  <span
                    key={p}
                    className="rounded-[var(--radius-sm)] border border-line bg-fg/5 px-[var(--space-2)] py-[var(--space-1)] font-[family-name:var(--font-mono)] text-[length:var(--text-2xs)] text-fg-dim"
                  >
                    {p}
                  </span>
                ))}
              </Stack>
            </Card>
          ))}
        </div>

        <div className="mt-[var(--space-5)] rounded-[var(--radius-md)] bg-bg-sink px-[var(--space-5)] py-[var(--space-4)]">
          <Text variant="meta" tone="dim">
            <b className="text-fg">The ten-second Auth0 beat.</b> Switch to Member and every
            Add coin and Retire button on Plans goes dead. The API rejects them with 403
            too, so the disabled button is a courtesy — the permission on the token is
            the boundary.
          </Text>
          <Stack row gap={3} className="mt-[var(--space-3)]">
            <ButtonLink
              href="/app/plans"
              size="sm"
              variant={role === "owner" ? "primary" : "ghost"}
            >
              View as Owner
            </ButtonLink>
            <ButtonLink
              href="/app/plans?role=member"
              size="sm"
              variant={role === "member" ? "primary" : "ghost"}
            >
              View as Member
            </ButtonLink>
          </Stack>
        </div>
      </main>
    </>
  );
}
