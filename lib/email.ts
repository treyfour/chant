/**
 * AgentMail, provisioned through the Stripe Projects CLI.
 *
 * Note the env var name: AGENTMAIL_AGENTMAIL_API_KEY. The provider prefix is
 * doubled — not a typo, and not something you would ever guess. Provider
 * variable names are unpublished; this came from `stripe projects env` after
 * provisioning.
 *
 * Sending requires an inbox, so we create one lazily and cache the id. The
 * `client_id` makes creation idempotent, so a retry reuses the same inbox
 * rather than making a second one.
 */

const API = "https://api.agentmail.to";
const KEY = process.env.AGENTMAIL_AGENTMAIL_API_KEY ?? process.env.AGENTMAIL_API_KEY;
const CLIENT_ID = "ovation-collection-links";

let cachedInbox: string | null = null;

function headers() {
  if (!KEY) throw new Error("AGENTMAIL_AGENTMAIL_API_KEY missing — run: stripe projects env --pull");
  return { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
}

export async function ensureInbox(): Promise<string> {
  if (cachedInbox) return cachedInbox;

  const res = await fetch(`${API}/inboxes`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ client_id: CLIENT_ID }),
  });

  const body = await res.text();
  if (!res.ok) throw new Error(`create inbox ${res.status}: ${body.slice(0, 300)}`);

  const data = JSON.parse(body) as { inbox_id?: string; id?: string };
  const id = data.inbox_id ?? data.id;
  if (!id) throw new Error(`no inbox id in response: ${body.slice(0, 200)}`);

  cachedInbox = id;
  return id;
}

export async function sendCollectionLink(opts: {
  to: string;
  url: string;
  sellerName: string;
  runName: string;
  serial: number;
  size: number;
}): Promise<void> {
  const inbox = await ensureInbox();

  const text = [
    `You picked up the ${opts.runName} coin from ${opts.sellerName} — number ${opts.serial} of ${opts.size}.`,
    ``,
    `Your collection lives here:`,
    opts.url,
    ``,
    `It already exists and no account is needed. Keep this link and you can always get back to it.`,
    ``,
    `— Ovation`,
  ].join("\n");

  const html = `
    <div style="font-family:-apple-system,'Segoe UI',sans-serif;max-width:460px;color:#211f1b">
      <p style="font-size:15px;line-height:1.6;color:#6d675d">
        You picked up the <b style="color:#211f1b">${esc(opts.runName)}</b> coin from
        <b style="color:#211f1b">${esc(opts.sellerName)}</b> — number
        <b style="color:#211f1b">${opts.serial} of ${opts.size}</b>.
      </p>
      <p style="font-size:15px;line-height:1.6;color:#6d675d">Your collection lives here:</p>
      <p><a href="${esc(opts.url)}"
            style="display:inline-block;background:#211f1b;color:#f7f4ed;text-decoration:none;
                   padding:13px 22px;border-radius:11px;font-weight:600;font-size:14px">
        Open your collection
      </a></p>
      <p style="font-size:12.5px;line-height:1.6;color:#a29a8c">
        ${esc(opts.url)}<br><br>
        It already exists and no account is needed. Keep this link and you can always
        get back to it.
      </p>
      <p style="font-size:12.5px;color:#a29a8c">— Ovation</p>
    </div>`;

  // The inbox id IS an email address (e.g. stormywriter30@agentmail.to), so the
  // `@` must be percent-encoded in the path. Without this the API returns a
  // 404 "Inbox not found" that reads like a permissions problem and isn't.
  const res = await fetch(`${API}/inboxes/${encodeURIComponent(inbox)}/messages/send`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      to: opts.to,
      subject: `Your ${opts.sellerName} coin — no. ${opts.serial} of ${opts.size}`,
      text,
      html,
    }),
  });

  if (!res.ok) {
    throw new Error(`send ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
