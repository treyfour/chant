# RUNBOOK — demo day

## T-minus, in order. Do not improvise this list.

### 1 · The night before (never on stage)

```bash
stripe login                              # if the 90-day key expired
stripe projects status --json             # Auth0 + Neon should both say complete
```

Both provider links are already done. **Never run a bare `stripe projects link`** —
a failed first attempt permanently poisons the project and no error message will
tell you that. Always pass `--config` on the first try. See `CONTEXT.md`.

### 2 · Register on the Stripe Leaderboard

Code: **`autho-sanfrancisco-2026`**. This is a hard gate. Without it the project
is not judged regardless of how well the demo goes.

### 3 · Thirty minutes before

Terminal 1 — webhook forwarding, leave it running:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
It prints `whsec_…`. Store it so signatures get verified rather than skipped:
```bash
stripe projects variables set stripe_webhook_secret \
  --env-key STRIPE_WEBHOOK_SECRET --value whsec_XXX --yes
stripe projects env --pull --yes
```

Terminal 2 — app:
```bash
npx tsx scripts/reset-demo.ts     # ALWAYS. rewinds Warrick to 34 → next buy is #35
npm run dev
```

Sign in at `/@trey` with **treyfour@gmail.com** before you present. A login prompt
mid-demo costs you fifteen seconds and your rhythm.

### 4 · Rehearse the 90 seconds three times

Non-optional and always the first thing cut. Run `reset-demo.ts` between each.

---

## The 90 seconds

Open: *"Every subscription you've ever started generated a receipt. You've never
looked at one of them again."*

| Time | Screen | Say |
|---|---|---|
| 0:00 | `/s/warrick` | Pre-seed startup, three tiers. Two carry a coin. **Ovation is nowhere on this page.** |
| 0:15 | Stripe Checkout | Card `4242 4242 4242 4242`, any future expiry, any CVC |
| 0:30 | `/s/warrick/welcome` | Warrick's own confirmation. The coin arrives **on top**, dismissible. "You're number 35 of 50." |
| 0:50 | `/@trey` | The collection. Grid gains a Warrick cell it didn't have. Right-click one → hide from public. |
| 1:10 | click **@dana**'s face | Six companies you've never heard of, faded, "new to you". *"Nobody shared anything."* |
| 1:30 | `/app/plans` | Where the coin came from. Plans from Stripe, one with a run attached. |
| 1:40 | `/app/plans?role=member` | **Add coin and Retire go dead.** "That's a permission on the Auth0 token — the API returns 403 too, the button is just a courtesy." |
| 1:50 | `/app/billing` | *"Ovation is a subscription too. Our paid plan comes with a coin, made the same way."* |

Close: *"Stripe already generates a receipt for every payment. We made one worth
keeping — and it turns out a receipt worth keeping is also how someone finds you."*

---

## The two judge-specific beats

**Auth0 PM** — `/app/plans?role=member`. Say: *"permission on the token, not a
boolean in our database."* Then `/app/team` for the org, roles and permission
strings. Be honest that members are pre-created: creating orgs from the app needs
Management API credentials we deliberately didn't provision.

**Stripe engineer** — `checkout.session.completed` is what issues the coin. Say:
*"The receipt and the collectible are the same event. Warrick never changed their
checkout — we were already listening."* Both Auth0 **and** the Postgres database
were provisioned through the Projects CLI.

Then **open the Stack Share page in a browser tab** (have it pre-loaded):

```
https://projects.dev/s#v1:Neon~postgres,Auth0~client
```

It renders a Stripe-branded card with the Neon and Auth0 logos and a **Clone**
button. Say: *"That's our whole stack. Hit Clone and you have it — Postgres and an
Auth0 tenant, credentials in your `.env`."*

Show the page, not the terminal. It's a designed artifact and it lands better than
CLI output. Produced by `stripe projects share`.

**Verified 2026-07-30** — this is safe to claim on stage. Tested in a scratch dir:

```
stripe projects init imported-stack --accept-tos --yes --from '<url>'
→ imported: Neon/postgres ✓ · Auth0/client ✓ · 9 env variables written
```

The share URL lists only the deployables, but the parent plans (`Neon~free`,
`Auth0~free`) resolve automatically — no `PLAN_REQUIRED`. A judge can go from URL
to a running stack with credentials in one command.

---

## If it breaks

| Symptom | Do this |
|---|---|
| Reveal spins forever | `stripe listen` died. Restart it. The page polls, it will catch up. |
| Coin claimed but wrong number | `npx tsx scripts/reset-demo.ts`, buy again |
| "sold_out" | Run hit its cap. `reset-demo.ts` rewinds to 34. |
| Auth0 redirect mismatch | Callback must be `http://localhost:3000/auth/callback`. Registered already; only breaks if the port moved. |
| Port 3000 taken | Do NOT just change it — `APP_BASE_URL` and the Auth0 callback both hardcode 3000. Kill the other process. |
| DB unreachable | `stripe projects env --pull --yes` — the Neon string may have rotated |

**Fallback if live payments fail:** the webhook accepts an unsigned event in dev.
```bash
curl -X POST localhost:3000/api/webhooks/stripe -H "Content-Type: application/json" \
  -d '{"id":"evt_manual_1","type":"checkout.session.completed","data":{"object":
      {"id":"cs_x","customer_details":{"email":"treyfour@gmail.com"},
       "metadata":{"plan_id":"plan_pro"}}}}'
```
Only as a rescue. It skips Checkout, which is half the point.

---

## Known limits — say these if asked, don't volunteer them

- Coin marks are unicode glyphs, not artwork. Next step is real engraved faces.
- Auth0 org members and invitations are pre-created in the dashboard.
- Stripe Connect is modelled but payouts show a stand-in figure.
- `?role=member` is a demo affordance. It can only ever *remove* permissions,
  never grant them, so it isn't an escalation path.
