/**
 * Prove AgentMail actually sends before any UI depends on it.
 *
 *   npx tsx scripts/test-email.ts you@example.com
 */

import "dotenv/config";
import { ensureInbox, sendCollectionLink } from "../lib/email";

const to = process.argv[2];
if (!to) {
  console.error("usage: npx tsx scripts/test-email.ts you@example.com");
  process.exit(1);
}

async function main() {
  console.log("  creating / fetching inbox…");
  const inbox = await ensureInbox();
  console.log(`  ✓ inbox ${inbox}`);

  console.log(`  sending to ${to}…`);
  await sendCollectionLink({
    to,
    url: "http://localhost:3000/@trey",
    sellerName: "Warrick",
    runName: "founding user",
    serial: 35,
    size: 50,
  });
  console.log("  ✓ sent — check the inbox (and spam)");
}

main().catch((e) => {
  console.error("  ✗", e.message ?? e);
  process.exit(1);
});
