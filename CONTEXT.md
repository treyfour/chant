# Ovation — Context

Raw input. Nothing downstream reads this directly. `DEMO.md` is the scope authority.

## The hackathon

**Built Different: Auth0 x Stripe** — in person, Okta office, 100 1st St Floor 13, SF. Teams of 1–3.

Brief: build a **monetized, multi-user SaaS app from scratch** using **Stripe** and **Auth0**, provisioned via **Stripe Projects** (CLI workflow — you or your agent provision Auth0, DB, hosting, get credentials, manage usage/billing from the terminal).

Judges: an **AI Product Manager @ Auth0** and a **Staff Engineer @ Stripe**.

### Hard gates (missing any of these = not judged)

- [ ] Auth **powered by Auth0, provisioned via Stripe Projects CLI** — mandatory, not optional
- [ ] Payments **powered by Stripe**
- [ ] Registered on the **Stripe Leaderboard**, code `autho-sanfrancisco-2026`

### Scoring (1–5 each) — this is the entire score

- Innovative use case
- Clear and appealing visual design
- Engaging presentation

**Strategic implication:** the hard gates are table stakes — they earn zero points, they only disqualify. Two thirds of the score is visual design + presentation. Get Auth0 + Stripe to the minimum credible bar, then pour everything into how it looks and how it demos. Polish beats feature count.

### Links

- Participant guide: https://projects.dev/hackathon-participants
- Submit team: a0.to/034
- Walkthrough video: https://www.youtube.com/watch?v=nG3Gxrtn6Uo
- Example repo / notes: https://github.com/mtliendo/auth0-hackathon-project-and-notes
- Getting started: a0.to/bxw

---

## The product

**Ovation — a receipt you'd actually keep.**

Every payment already generates a receipt. It's the most universal artifact in commerce and it's garbage: a PDF nobody opens, in an email nobody reads, about a purchase you were proud of thirty seconds earlier.

Ovation replaces it with an object. Buy from an indie founder or an early-stage startup and you get a **coin** — brushed metal, their logo engraved, numbered out of a limited run. It lands in your **collection**. Your collection is browsable, and browsing someone else's is how you find companies you'd never have heard of.

### The reference points

**Gumroad** — the transaction is terminal. Buy, file, receipt email, done. The buyer has no persistent identity. Purchase history is a dashboard nobody opens. Discovery is zero; the seller brings the audience and Gumroad is a cash register.

**Bandcamp** — the transaction is generative. Buy, and the album lands in *your collection*, a public page with your face on it. Every album page shows a grid of buyer avatars → click one → their whole collection → you find three more artists. Fans become distribution. "Supporter #14" is displayed forever and can't be faked.

**Ovation = Bandcamp's collection, unbundled from the marketplace.** Bandcamp only works because it's one walled garden — one identity, one catalog. Ovation is that collection layer made portable across independent sellers. This framing is load-bearing for the judging: portable identity across tenants *is* Auth0's product thesis, wearing a better outfit.

**Challenge coin** — the anchor for the object itself. Given for being somewhere. Carried, shown to people who'd get it, never explained to people who wouldn't. Covert clout, already invented, zero crypto.

### Tone

Covert, not loud. Clout is possessed, not announced. **No share prompts anywhere.** The coin is the shareable object and sharing is one quiet affordance; OG images make it render beautifully when someone chooses to paste a link. People who back pre-seed founders find "look what I did!" cringe but will absolutely let you notice their collection.

Collections are **found, not sent** — you land on one by clicking someone's face on a seller page. Discovery is sideways by construction.

---

## Decisions locked

| Decision | Choice | Why |
|---|---|---|
| Object | **Coin** | Metallic, bouncy, satisfying, best grid. Defused by the receipt/challenge-coin framing. |
| Container | **Collection** | Bandcamp's word. Zero baggage. |
| Coin art | **Auto-generated from brand** | Seller drops logo + hex; procedural metal/bevel/engrave. Every seller distinct, no art effort, nobody can make an ugly one. |
| How you get one | **Included with purchase** | It's the receipt. No extra decision at checkout, no friction. |
| Scarcity | **Fixed run** | Seller sets a number — "50 of these exist." Numbered, sells out, gone. Vinyl-pressing model. |
| Transaction | **Buy or back** | Product purchase mints a solid coin; backing (no product yet) gives a hollow/outline coin. Same grid, legible difference. |
| Coin utility | **Proof, not a key** | No unlockables, no entitlements, no gated surface. "Lightweight, a receipt." |
| Seller side | **Full Auth0 Organizations** | Org per seller, invites, owner/member roles. Real multi-user, and the Auth0 PM will check. |
| Seller UI polish | **Deliberately utilitarian** | Admin panels are supposed to look like that. Visual budget goes to buyer surfaces. |
| Collective "swell" | **Cut** | Replaced by scarcity. Broadcast mechanic in a covert product. "Ovation" now = what the seller receives (`1,204 ovations`); the coin is what you keep. Name and registered blurb stay honest. |
| Collection visibility | **Public by default** | Per-coin private toggle for the quiet ones. Strongest discovery graph — the 0:55 demo beat depends on it. Covertness comes from *no share prompts*, not from hiding. |
| Coin sides | **Two-sided, flips on click** | Face is pure brand art so the grid stays clean; back is the receipt (seller, serial, run size, date). The flip is a cheap, satisfying micro-interaction. |
| Amount paid | **Never shown** | When, not how much. No spending record, no comparison, no leaderboard energy. |
| Coin count | **One per run** | Kettle can do pre-seed, then launch, then v2 — three coins. Makes "collect them" literal and gives collections real density. Repeat sellers must read as a series, not a duplicate. |

### Language rules

Never say **mint / minted / token / issuance / holder**. Say **included, comes with, you got #7, collectible, limited run, owner, collector**. "Edition" is fine — that's print and vinyl language.

The moment a demo smells like crypto, Q&A becomes a defense of the premise instead of a look at the product.

---

## Open

Nothing blocking. Convergence complete 2026-07-30. Remaining structural questions about the
collection screen are deliberately left to the prototypes in `prototypes/` rather than settled
in prose — how coins are arranged, grouped, and browsed is exactly what the mocks exist to answer.

Demo seller mix is decided: mostly indie startups, plus a Costa Rica dive shop and a coffee
roaster seeded in. Shows the whole addressable idea in one screenshot for the price of two seed
rows, while the narrated story stays narrow and matches the registered blurb.

## Cut

Unlockables and entitlements. The live swell / ovation threshold. Paid add-on flow. Discovery feed, search, directory. Comments and testimonials. Connect payout *flow* (show a balance number, don't build it). Stage-locked retiring. Analytics. Anything CRM-shaped.

## Stripe Projects CLI — spike findings (2026-07-30)

Run before demo day. Everything below is verified against the real CLI, not assumed.

**Versions:** Stripe CLI `1.45.0` (Homebrew: `brew install stripe/stripe-cli/stripe`), `projects` plugin `0.30.0` (`stripe plugin install projects`). The plugin is NOT bundled — before installing it, every `stripe projects <sub>` falls through to generic help, which looks like the subcommands don't exist.

### Auth0 is two provisioning steps, not one

`stripe projects catalog auth0 --json` returns six services from provider `Auth0` (`prvdr_61UVctyxfLOj4FpVw5Bmi`):

| service_id | kind | price |
|---|---|---|
| `free` | plan | free |
| `b2c-essentials` | plan | $35/mo |
| `b2b-essentials` | plan | $150/mo |
| `b2c-professional` | plan | $240/mo |
| `b2b-professional` | plan | $800/mo |
| `client` | **deployable** | component |

`client` (`prvsvc_61UW1Y47Lu4zOqmTG5AZs`) is a deployable whose `parent_services` are those five plans. **Provision a plan first, then the client.** Adding `client` alone returns `PLAN_REQUIRED`.

**Use `free`.** Our seller side depends on Auth0 **Organizations**, which reads as a B2B feature — and B2B starts at $150/mo. But Auth0's free tier includes **5 Organizations**, enough for Warrick, Bramble and spares. Do not provision `b2b-essentials`.

**Required config:** the Auth0 provider needs `locality` (enum `au|ca|eu|jp|us`, default `us`) and `naming_prefix` (`^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`, 3–50 chars — the tenant name, mildly permanent). The `client` service needs `name`.

### Two separate browser handoffs

1. **Stripe login.** `stripe login --non-interactive` prints `browser_url` + `verification_code` + a `next_step` command. Tokens expire in minutes. **You must already be signed into `dashboard.stripe.com` in that browser** or the confirm page fails with "Confirmation token could not be loaded."
2. **Provider OAuth.** `stripe projects link auth0` is a separate handoff from `stripe projects add`. Run `link` the night before so `add` runs clean on stage.

### A failed `link` permanently poisons the project — this is the big one

**`link auth0` works fine non-interactively.** It needs no browser. But if the *first* attempt fails, that project can never link again, and every subsequent error lies to you.

What happened: the first `link auth0` ran without config, creating a pending account request pinned to `naming_prefix: "ovation"` with `status: "needs_information"`. From then on:

- Every retry echoed `Sorry, "ovation" isn't available` **regardless of the prefix supplied** — including in the interactive TTY prompt, which accepted typed input and then re-displayed the same stale error in a loop.
- Four prefixes appeared "taken" that were never actually tested.
- The first error says re-run with `--config`; the second says `--provider-info`. **The CLI contradicts itself**, and on a poisoned project neither works.
- `stripe projects unlink auth0` does NOT clear it — it reports "No linked Auth0 account found", because the state is a pending *account request*, not a link.

**Recovery: abandon the project and make a new one.** There is no repair path.

```
stripe projects init <fresh-name> --accept-tos --yes --skip-skills
stripe projects link auth0 --yes --accept-tos --config '{"locality":"us","naming_prefix":"<prefix>"}'
# → OK: Connected Auth0 account
stripe projects pull <projectId> --yes    # move it into the real repo dir
```

**Always pass `--config` on the very first `link`.** Never run a bare `stripe projects link auth0`.

Note `pull` writes managed blocks into `AGENTS.md` and `CLAUDE.md` (between `stripe-projects-cli managed:` markers). It appends rather than overwrites, so existing rules survive — but `pull` has no `--skip-skills` flag.

### Account eligibility cannot be scripted

`ACCOUNT_NOT_ELIGIBLE` blocks `init` even with `--accept-tos --yes`. The only remedies are `stripe projects switch-account` (**requires a real TTY** — fails in Claude Code's shell and under `!`) or onboarding at https://projects.dev. Resolve this before demo day; it is unfixable from inside an agent.

### `init` overwrites your agent files

`stripe projects init` creates `.agents/`, `.claude/`, `.cursor/`, `.cursorignore`, `AGENTS.md`, `CLAUDE.md` by default. **This repo's `AGENTS.md` holds the Next.js-16 warning.** Pass `--skip-skills`, or back both files up first.

Side effect: merely running catalog commands creates `.projects/cache/` and appends `.env`, `.env.*`, `.projects/vault` etc. to `.gitignore`. Those additions are correct — keep them.

### DONE — the verified working chain

Completed 2026-07-30. Project `chant` (`project_61V8R8JqY0fW1o5eI16PIsrVJOSQC4gS1YGQGCXIu1cO`) on `acct_1M4KAZFLX7j6GBFO`.

```
brew install stripe/stripe-cli/stripe        # 1.45.0
stripe plugin install projects               # 0.30.0 — NOT bundled
stripe login --non-interactive               # be signed into dashboard.stripe.com first
stripe projects switch-account               # TTY ONLY — real terminal, not an agent shell
stripe projects init chant --accept-tos --yes --skip-skills
stripe projects link auth0 --yes --accept-tos --config '{"locality":"us","naming_prefix":"chant"}'
stripe projects add auth0/free   --yes --accept-tos          # parent PLAN
stripe projects add auth0/client --yes --accept-tos --config '{"name":"Ovation Web"}'
stripe projects env --json
```

Note the `provider/service` syntax: `auth0/free`, not `free`.

**Auth0 env variables written to `.env`** (the thing Stripe doesn't publish):

```
AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET
AUTH0_DOMAIN        # chant.us.auth0.com
```

Secrets live in `.projects/vault/vault.json`. Both `.env` and the vault are gitignored — verified with `git check-ignore`. Never hand-edit either; the CLI is authoritative.

Only `switch-account` truly required a TTY. Everything else is agent-drivable.

## Known risks

1. **The collection is the hero screen, and collections only look good full.** An empty grid is worse than an empty supporter wall. Mitigation: the post-purchase coin reveal is the hero *moment*, the grid is the second beat, and 3–4 collections get seeded before demoing.
2. **Stripe Projects CLI provisioning Auth0 is a hard gate on an unfamiliar workflow.** No Auth0-via-Projects = not judged, regardless of how good the product looks. De-risk with a throwaway spike in parallel with the UX prototypes, not later.
3. A grid of circles can read as a settings page instead of a treasure. This is what the prototypes exist to answer.

## Stack (pre-decided — do not re-litigate)

Next.js 16.2.12, React 19.2.4, Tailwind v4, TypeScript. Repo is `chant`. Per `AGENTS.md`: this Next version has breaking changes from training data — read `node_modules/next/dist/docs/` before writing code.
