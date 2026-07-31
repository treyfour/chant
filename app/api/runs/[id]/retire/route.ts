import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { permissionsFor, viewerRole } from "@/lib/seller";
import { SYSTEM_ACTOR } from "@/lib/palette";

const rid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 11)}`;

/**
 * Close a run early. Owner only, and deliberately irreversible — the unclaimed
 * remainder ceases to exist. This is what makes scarcity enforced rather than
 * decorative.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = await viewerRole(new URL(req.url).searchParams.get("role"));
  if (!permissionsFor(role).includes("coins:retire")) {
    return NextResponse.json(
      { error: "coins:retire not granted to this role" },
      { status: 403 },
    );
  }

  const { id } = await params;
  const updated = await sql`
    UPDATE runs SET retired = true WHERE id = ${id} AND retired = false
    RETURNING id, seller_id, name, size, claimed`;

  if (updated.length === 0) {
    return NextResponse.json({ error: "not found or already retired" }, { status: 404 });
  }

  const r = updated[0];
  const destroyed = Number(r.size) - Number(r.claimed);
  await sql`
    INSERT INTO activity (id, seller_id, kind, text, actor_initial, actor_color)
    VALUES (${rid("ev")}, ${r.seller_id}, 'run_retired',
            ${`<b>${r.name}</b> retired · ${destroyed} will never exist`}, ${SYSTEM_ACTOR.initial}, ${SYSTEM_ACTOR.color})`;

  return NextResponse.json({ id: r.id, retired: true, destroyed });
}
