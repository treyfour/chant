/** Who is in the collectors table, and is their Auth0 account linked yet. */
import "dotenv/config";
import { sql } from "../lib/db";

async function main() {
  const rows = await sql`
    SELECT c.handle, c.email, (c.auth0_sub IS NOT NULL) AS linked,
           (SELECT count(*)::int FROM coins WHERE collector_id = c.id) AS coins
    FROM collectors c ORDER BY c.handle`;

  for (const c of rows) {
    console.log(
      `  @${String(c.handle).padEnd(14)} ${String(c.email).padEnd(28)} ` +
      `linked=${String(c.linked).padEnd(5)} coins=${c.coins}`,
    );
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
