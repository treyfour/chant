# DEMO.md — the 90 seconds

**Scope authority. If it is not on screen in these 90 seconds, it does not get built.**

Opening line: *"Every payment you make generates a receipt. Here's one you'd keep."*

---

## Shot list

**0:00 — A seller page.** Kettle & Co., two people, pre-seed. Real product: Early Access Pass, $20. Under the buy button, one quiet line:

> includes the pre-seed coin · 34 of 50 claimed

No hype, no countdown, no urgency copy. The number does the work.

**0:15 — Buy.** Stripe checkout. Fast, boring, over.

**0:25 — The moment.** Not an email. The coin arrives — brushed copper, Kettle's logo engraved, **#35 of 50**, dated. One toggle, no modal: *show in collection / keep private*. This is the hero animation and it gets more polish time than anything else in the build.

**0:40 — Your collection.** Twenty-odd coins. Startups you backed, plus a dive shop in Costa Rica and a coffee roaster — one screenshot, whole addressable idea. Scarcity legible at a glance: some numbered low, some sold out, a few hollow (backed, not bought), three private.

**0:55 — The loop.** Click a coin → Kettle's page → the collectors row → click a stranger's face → **their** collection → three companies you've never heard of. This is the Bandcamp move and it's the innovation beat. Say the line here: *"Nobody shared anything. You just found it."*

**1:10 — Seller side, fast.** Auth0 Organization: invite a teammate, they get the member role, they can create a coin run. Ten seconds, utilitarian on purpose, proves multi-user.

**1:20 — Close.**

> Stripe already generates a receipt for every payment. We just made one worth keeping — and it turns out a receipt worth keeping is also how someone finds you.

---

## The one screen that carries the idea

**The collection.** Not the coin, not the checkout.

A single coin is pretty but says nothing. The collection says the entire thesis at once: the coins look expensive (visual score), scarcity is legible (#7 of 50, sold out), and discovery is implied (all different sellers, one person's taste). It is also the screen with a real failure mode — a grid of circles can read as a settings page instead of a treasure. That's why it gets prototyped before anything is planned.

## Prototype first, in parallel

| Risk | Spike |
|---|---|
| "Does a grid of coins read as desirable or as a settings page?" — UX | 4 static HTML mocks of the collection, genuinely different structures |
| "Can Stripe Projects CLI actually provision Auth0?" — capability, and it's a **hard gate** | 30-line throwaway. Do not defer this. No Auth0-via-Projects = not judged. |

## Rehearsal

Non-optional, always the first thing cut, do it anyway. Run the 90 seconds three times against the real build with seeded data.
