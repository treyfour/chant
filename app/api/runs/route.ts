import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { permissionsFor, viewerRole } from "@/lib/seller";
import { SYSTEM_ACTOR } from "@/lib/palette";

const rid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 11)}`;

/** Attach a coin run to one of the seller's Stripe plans. Owner only. */
export async function POST(req: Request) {
  const role = await viewerRole(new URL(req.url).searchParams.get("role"));
  if (!permissionsFor(role).includes("coins:create")) {
    return NextResponse.json(
      { error: "coins:create not granted to this role" },
      { status: 403 },
    );
  }

  const { planId, name, size, glyph, tint } = (await req.json()) as {
    planId?: string; name?: string; size?: number; glyph?: string; tint?: string;
  };

  if (!planId || !name || !size || size < 1 || !glyph || !tint) {
    return NextResponse.json({ error: "planId, name, size, glyph, tint required" }, { status: 400 });
  }

  const plans = await sql`SELECT id, seller_id, run_id FROM plans WHERE id = ${planId} LIMIT 1`;
  if (plans.length === 0) return NextResponse.json({ error: "unknown plan" }, { status: 404 });
  if (plans[0].run_id) {
    return NextResponse.json({ error: "plan already has a coin" }, { status: 409 });
  }

  const runId = rid("run");
  await sql`
    INSERT INTO runs (id, seller_id, plan_id, name, size, claimed, glyph, tint)
    VALUES (${runId}, ${plans[0].seller_id}, ${planId}, ${name}, ${size}, 0, ${glyph}, ${tint})`;
  await sql`UPDATE plans SET run_id = ${runId} WHERE id = ${planId}`;
  await sql`
    INSERT INTO activity (id, seller_id, kind, text, actor_initial, actor_color)
    VALUES (${rid("ev")}, ${plans[0].seller_id}, 'coin_claimed',
            ${`Run <b>${name}</b> attached · ${size} will ever exist`}, ${SYSTEM_ACTOR.initial}, ${SYSTEM_ACTOR.color})`;

  return NextResponse.json({ id: runId, name, size });
}
