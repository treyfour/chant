import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { currentCollector } from "@/lib/session";

/**
 * Per-coin consent, revocable. This is the Auth0 scoped-consent story: the
 * decision is deliberately NOT at checkout (that made the reveal feel like a
 * form) — it lives here, on right-click, changeable forever.
 *
 * Ownership is checked server-side. The coin id alone must never be enough.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const me = await currentCollector();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const { id } = await params;
  const { isPublic } = (await req.json()) as { isPublic?: boolean };
  if (typeof isPublic !== "boolean") {
    return NextResponse.json({ error: "isPublic must be a boolean" }, { status: 400 });
  }

  const updated = await sql`
    UPDATE coins SET is_public = ${isPublic}
    WHERE id = ${id} AND collector_id = ${me.id}
    RETURNING id, is_public`;

  if (updated.length === 0) {
    // Either it doesn't exist or it isn't theirs — don't distinguish.
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ id: updated[0].id, isPublic: updated[0].is_public });
}
