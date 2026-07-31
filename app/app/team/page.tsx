import { ROLE_PERMISSIONS } from "@/lib/types";
import { viewerRole } from "@/lib/seller";

export const dynamic = "force-dynamic";

/**
 * Auth0 Organizations. Members and invitations are pre-created in the Auth0
 * dashboard — creating them from the app needs Management API (M2M) credentials
 * we deliberately did not provision, and the demo needs org-scoped LOGIN and
 * ROLE ENFORCEMENT, not live org creation.
 */
const MEMBERS = [
  { email: "nadia@warrick.dev", name: "Nadia Okonkwo", color: "#8f6a45", role: "Owner", status: "active" },
  { email: "sam@warrick.dev", name: "Sam Reyes", color: "#4A7C59", role: "Member", status: "active" },
  { email: "jo@warrick.dev", name: null, color: "#a29a8c", role: "Member", status: "pending" },
];

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
      <nav className="sticky top-0 z-40 flex h-[60px] items-center gap-3 px-8"
        style={{ background: "var(--raise)", borderBottom: "1px solid var(--rule)" }}>
        <span style={{ font: "400 18px/1 var(--display)" }}>Ovation</span>
        <span className="flex-1" />
        <a href={`/app/plans${qs}`} className="text-[12.5px]" style={{ color: "var(--dim)" }}>Plans</a>
      </nav>

      <main className="w-full mx-auto max-w-[940px] px-11 pb-20 pt-10">
        <div className="t-eyebrow">Warrick</div>
        <h1 className="t-display mt-2.5">Team &amp; access</h1>
        <p className="mt-3 max-w-[56ch] text-sm" style={{ color: "var(--dim)" }}>
          Members of <b style={{ color: "var(--ink)" }}>org_warrick</b>. Roles come from Auth0
          and decide who can attach a coin, retire a run, or see money.
        </p>

        <div className="mt-6 rounded-2xl pb-1.5 pt-5"
          style={{ background: "var(--raise)", border: "1px solid var(--rule)" }}>
          {MEMBERS.map((m, i) => (
            <div key={m.email} className="grid items-center gap-4 px-[22px] py-[15px]"
              style={{
                gridTemplateColumns: "1fr 120px 92px",
                borderBottom: i < MEMBERS.length - 1 ? "1px solid var(--rule)" : "none",
              }}>
              <div className="flex items-center gap-3">
                <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                  style={{ background: m.color }}>{m.name ? m.name[0] : "?"}</span>
                <div>
                  <div className="text-[13.5px] font-semibold"
                    style={{ color: m.name ? "var(--ink)" : "var(--dim)" }}>
                    {m.name ?? m.email}
                  </div>
                  <div className="mt-1 text-xs" style={{ color: "var(--dim)" }}>
                    {m.name ? m.email : "Invited 2 minutes ago"}
                  </div>
                </div>
              </div>
              <span className="rounded-full px-2.5 py-1.5 text-center text-[9.5px] font-semibold uppercase tracking-[.12em]"
                style={
                  m.status === "pending"
                    ? { color: "var(--warn)", border: "1px solid rgba(181,101,29,.35)" }
                    : m.role === "Owner"
                      ? { color: "var(--accent)", border: "1px solid rgba(138,106,59,.35)" }
                      : { color: "var(--dim)", border: "1px solid var(--rule)" }
                }>
                {m.status === "pending" ? "Pending" : m.role}
              </span>
              <span />
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {(["owner", "member"] as const).map((r) => (
            <div key={r} className="rounded-2xl px-6 py-5"
              style={{ background: "var(--raise)", border: "1px solid var(--rule)" }}>
              <div className="text-[12.5px]" style={{ color: "var(--dim)" }}>
                <b style={{ color: "var(--ink)", textTransform: "capitalize" }}>{r}</b>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {ROLE_PERMISSIONS[r].map((p) => (
                  <span key={p} className="rounded-md px-2.5 py-1.5 text-[10.5px]"
                    style={{
                      fontFamily: "var(--mono)", background: "rgba(33,31,27,.05)",
                      border: "1px solid var(--rule)", color: "var(--dim)",
                    }}>{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[13px] px-5 py-4 text-[13px]"
          style={{ background: "var(--paper)", color: "var(--dim)" }}>
          <b style={{ color: "var(--ink)" }}>The ten-second Auth0 beat.</b> Switch to Member and
          every Add coin and Retire button on Plans goes dead. The API rejects them with 403 too,
          so the disabled button is a courtesy — the permission on the token is the boundary.
          <div className="mt-3 flex gap-2.5">
            <a href="/app/plans" className="rounded-[9px] px-4 py-2.5 text-xs"
              style={{ border: "1px solid var(--rule)", color: role === "owner" ? "var(--ink)" : "var(--dim)" }}>
              View as Owner
            </a>
            <a href="/app/plans?role=member" className="rounded-[9px] px-4 py-2.5 text-xs"
              style={{ border: "1px solid var(--rule)", color: role === "member" ? "var(--ink)" : "var(--dim)" }}>
              View as Member
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
