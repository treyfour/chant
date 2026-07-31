# PLAN — Ovation

Ordered as **vertical slices**: each one is a user action working end to end, demoable on its own. Never layers — a layered plan means nothing is showable until the end.

**Authorities**
- Visual spec: `prototypes/flow-buy-v3.html`, `prototypes/flow-sell-v3.html` (open via `prototypes/index.html`)
- Data spec: `lib/types.ts` — frozen
- Scope: `DEMO.md` — if it isn't on screen in 90 seconds it doesn't get built
- Decisions + spike findings: `CONTEXT.md`

**Pre-decided, do not re-litigate:** Next.js 16.2.12 · React 19.2.4 · Tailwind v4 · TypeScript · `@auth0/nextjs-auth0` **v4.26.0** (`new Auth0Client()`, routes at `/auth/*`) · SQLite via `better-sqlite3`, one file, no ORM · no tests, no error boundaries, no abstraction before the third repetition.

---

## File tree

```
app/
  layout.tsx
  globals.css                    # Bone tokens + leather coin, the ONLY style file
  page.tsx                       # → redirect to /warrick
  [seller]/page.tsx              # 1 · Warrick pricing (Ovation invisible here)
  [seller]/welcome/page.tsx      # 3 · seller's own confirmation + reveal sheet
  @[handle]/page.tsx             # 4 · public collection (real URL, OG image)
  app/
    plans/page.tsx               # seller dashboard
    team/page.tsx                # Auth0 org, roles, invites
    billing/page.tsx             # Ovation's own tiers — monetization
  api/
    webhooks/stripe/route.ts     # THE only path that issues a coin
    checkout/route.ts            # create Stripe Checkout session
    coins/[id]/visibility/route.ts
    runs/route.ts                # create run
    runs/[id]/retire/route.ts
  auth/[auth0]/route.ts          # v4 SDK handler
components/
  Coin.tsx                       # leather material, one component, used everywhere
  CoinGrid.tsx                   # aligned grid + search
  RevealSheet.tsx                # the hero moment
  Sheet.tsx                      # generic modal shell
lib/
  types.ts                       # FROZEN
  mocks.ts                       # swapped out one function at a time
  db.ts                          # better-sqlite3, schema inline
  auth0.ts                       # export const auth0 = new Auth0Client()
  leather.ts                     # hex → dyed-leather CSS custom properties
  stripe.ts
```

---

## State shape

```ts
// Server-side, SQLite. Written out so a wrong assumption is caught cheap.
sellers(id, org_id, slug, name, tagline, location, stage, mark, tint,
        stripe_account_id, ovation_tier)
collectors(id, auth0_sub, handle, name, avatar_color, since, is_public)
plans(id, seller_id, stripe_product_id, stripe_price_id, name, price_label,
      unit_amount, interval, subscriber_count, run_id)
runs(id, seller_id, plan_id, name, size, claimed, glyph, tint, retired, created_at)
coins(id, run_id, seller_id, collector_id, serial, kind, is_public, acquired_at,
      stripe_event_id UNIQUE)          -- UNIQUE is the idempotency guarantee
activity(id, seller_id, kind, text, actor_initial, actor_color, at)
```

**Serial allocation is the one place with a real race.** Claiming must be a single transaction:
`BEGIN IMMEDIATE; SELECT claimed, size FROM runs WHERE id=?; UPDATE runs SET claimed=claimed+1 WHERE id=? AND claimed<size; INSERT INTO coins(...); COMMIT;`
Two simultaneous subscribers must never both get #35. `stripe_event_id UNIQUE` covers Stripe's at-least-once redelivery separately.

---

## Slice 1 — The collection renders · ~60 min

**Action:** visit `/@trey`, see the leather grid, search it, right-click a coin to toggle privacy.

Runs entirely on `mocks.ts`. No auth, no Stripe, no DB.

- `globals.css` with Bone tokens + leather material lifted from `flow-buy-v3.html`
- `Coin.tsx` — matte dye, SVG-turbulence grain, dashed stitch ring, blind-embossed glyph. **No conic gradients** (that's what read as crypto).
- `lib/leather.ts` — the hex → HSL desaturate/darken function, ported verbatim
- `CoinGrid.tsx` — aligned grid, **no `nth-child` offsets**, fixed-height coin stages
- Search filters seller + run name; right-click context menu toggles `isPublic` in local state

**Done when:** the page is visually indistinguishable from the prototype at the same viewport.
**Why first:** it's the hero screen, every later slice renders into it, and it's where all visual polish lands.

## Slice 2 — A real payment issues a real coin · ~2 hr · **riskiest**

**Action:** click Subscribe on `/warrick` → Stripe Checkout (test mode) → land on `/warrick/welcome` → the reveal sheet shows **your** serial → it appears at `/@trey`.

- `lib/db.ts` — schema above, seeded from `mocks.ts`
- `POST /api/checkout` → Checkout Session, `success_url` = `/warrick/welcome?session_id=…`
- `POST /api/webhooks/stripe` → `checkout.session.completed` → `claimCoin()` returning `ClaimResult`
- `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- `RevealSheet.tsx` — 1.25s settle, warm bloom, one action, dismissible, **no privacy choice**

**Done when:** two browsers subscribing get #35 and #36, never the same number.
**Do this second.** The webhook is the product; if it doesn't work there is no demo.

## Slice 3 — Auth0 login and real identity · ~90 min

**Action:** sign in, the collection is yours, the privacy toggle persists.

- `lib/auth0.ts` — `export const auth0 = new Auth0Client()` (**v4 pattern**, verified in the installed README)
- `middleware.ts` + `app/auth/[auth0]/route.ts`; callback is `/auth/callback` — already registered on the client
- Map `auth0_sub` → collector row on first login
- `PATCH /api/coins/[id]/visibility`, owner-checked server-side

**Done when:** two different logins see two different collections and privacy survives a reload.

## Slice 4 — Seller side: Organizations, plans, attach a run · ~2 hr

**Action:** sign in as Nadia → org → dashboard of Stripe plans → attach a coin to Pro → it's live.

- Auth0 **Organizations**; `ROLE_PERMISSIONS` read from the token, never a DB boolean
- `/app/plans` — plans-first dashboard, empty state on day one
- Attach-coin sheet with the live leather preview → `POST /api/runs`
- Retire → `POST /api/runs/[id]/retire`, confirm names the cost
- `/app/team` — invites, and the **Member view really disables** Add coin / Retire

**Done when:** signing in as Sam (Member) disables the buttons, and a run created here is claimable in Slice 2's flow.

## Slice 5 — Discovery · ~45 min

**Action:** click a collector's face on `/warrick` → their collection → three companies you've never heard of.

- Collector avatars on the seller page → `/@handle`
- `viewerHasIt` fades the ones you don't own, labelled "new to you →", linking back to that seller
- OG image on `/@handle` so a pasted link renders well. **No share prompts anywhere.**

## Slice 6 — Ovation's own billing · ~45 min · **requirement**

**Action:** Warrick subscribes to Ovation Studio and gets an Ovation coin.

- `/app/billing` — Starter $0 / Studio $29 / Scale $99, two carrying coins
- Real Stripe Checkout against Ovation's own account, reusing Slice 2's webhook path

**This is the "monetized" half of the brief and the demo closer.** Without it a hard requirement is unmet.

## Slice 7 — Seed, polish, rehearse · remaining time

- Seed 3–4 full collections; **an empty grid is the worst possible hero shot**
- Screenshot-diff against the prototypes, fix drift
- Run the 90 seconds **three times** on the real build

---

## Status — 2026-07-30

| Slice | State |
|---|---|
| 1 · Collection renders | **done** — leather, aligned grid, search, right-click |
| 2 · Payment issues a coin | **done** — race + redelivery tested, real Stripe prices |
| 3 · Auth0 login | **done** — v4 via `proxy.ts`, email-linked identity, persisted privacy |
| 4 · Seller side | **done** — plans dashboard, attach run, retire, RBAC enforced in API |
| 5 · Discovery | **done** — clickable avatars, `viewerHasIt` leads, OG metadata |
| 6 · Ovation billing | **done** — own tiers, real Stripe prices, same webhook |
| 7 · Seed, polish, rehearse | **not started** |

**Requirements:** Auth0-via-Projects ✅ · Stripe payments ✅ · multi-user ✅ ·
monetized ✅ · leaderboard registration ❌ **still not done** (`autho-sanfrancisco-2026`).

Discovery leads only render when signed in — `viewerHasIt` needs a collection to
compare against. Correct behaviour, but it means the beat must be demoed logged in.

## Demo data shaping — do in Slice 7, not before

**Warrick must NOT be pre-seeded into @trey's collection.** The demo purchase should
add the *first* Warrick coin, so the reveal lands on something genuinely new and the
grid visibly gains a cell. Right now @trey already holds two Warrick coins, which
makes the hero moment a duplicate rather than an arrival.

Fix is one line in `scripts/seed.ts`:
```ts
for (const [idx, item] of TREY_ITEMS.filter(i => i.sellerSlug !== "warrick").entries())
```
Then reset `run_founding.claimed = 34` so the demo purchase is #35.

Also for Slice 7: no seller should appear twice in the seeded set unless the second
run is deliberately a *series* beat we intend to narrate.

## Risk register

| Risk | Mitigation |
|---|---|
| Serial race gives two people #35 | `BEGIN IMMEDIATE` txn + `claimed<size` guard, tested with two browsers in Slice 2 |
| Stripe redelivers a webhook | `coins.stripe_event_id UNIQUE`; `ClaimResult.duplicate` returns 200 |
| Auth0 v4 ≠ training data | Pattern verified in the installed README; **re-read it before writing `lib/auth0.ts`** |
| Empty collection is the hero shot | Seed before demoing; the reveal (not the grid) is the emotional beat |
| Coin marks are unicode glyphs | Real artwork is the Claude Design handoff; ship glyphs if time runs out |
| Demo depends on live webhooks | Keep `stripe listen` running; have a seeded fallback account ready |

## Cut list — say no on sight

Unlockables · comments · the ovation-threshold swell · discovery feed or search across collectors · analytics · coin detail modal · custom artwork upload · email · retire-by-stage · anything CRM-shaped.

## Rejected directions, so they don't get re-proposed

- **Sanity design system** — rejected on look; its modal architecture survived into v3
- **Prototypes A/B/C** (Case, Ledger, Stacks) — D's hero-plus-grid won on cold-start
- **Shiny metal coins** — conic gradients read as crypto; leather replaced them
- **Public/private choice at the reveal** — made it feel like a form; moved to right-click
- **Coin-as-credential** — "lightweight, a receipt" settled it as proof, not a key
- **Coin-run-first seller model** — plans-first is how founders actually think
