import { Coin } from "@/components/Coin";

export const dynamic = "force-dynamic";

/**
 * The front door.
 *
 * A judge clicking the submission link must be able to walk the entire product
 * without being told how. This previously redirected to /@trey, which dropped
 * people into a wallet with no route to the purchase flow or the seller side.
 */

const ROUTES = [
  {
    step: "01",
    href: "/s/warrick",
    label: "Buy something",
    title: "Warrick's pricing page",
    body: "A pre-seed startup selling a $20/mo plan. Two of the three tiers include a coin. Nothing on this page mentions Ovation — that's the point.",
    cta: "Start here →",
    glyph: "▲",
    tint: "#C87137",
  },
  {
    step: "02",
    href: "/@trey",
    label: "See what you get",
    title: "A collection",
    body: "Numbered, limited-run leather coins from every company you've backed. Right-click one to hide it. Click a face on a seller's page to land in someone else's.",
    cta: "Open a collection →",
    glyph: "⬡",
    tint: "#4A7C59",
  },
  {
    step: "03",
    href: "/app/plans",
    label: "The seller side",
    title: "Where coins come from",
    body: "A founder's Stripe plans, one with a run attached. Attach a coin, retire a run. Add ?role=member to watch permissions disable the buttons.",
    cta: "Open the dashboard →",
    glyph: "◆",
    tint: "#3B5BA5",
  },
  {
    step: "04",
    href: "/app/billing",
    label: "How it's paid for",
    title: "Ovation's own plans",
    body: "Ovation is a seller row in its own schema, so our paid tiers go through the same checkout and the same webhook. We are our own first customer.",
    cta: "See the pricing →",
    glyph: "◈",
    tint: "#8a6a3b",
  },
];

export default function Home() {
  return (
    <main className="w-full mx-auto max-w-[960px] px-11 pb-24 pt-20">
      <div className="t-eyebrow">Ovation</div>
      <h1 className="t-display mt-4 max-w-[16ch]">A receipt you&rsquo;d actually keep.</h1>
      <p className="mt-4 max-w-[58ch] text-[17px]" style={{ color: "var(--dim)" }}>
        Every subscription you start generates a receipt you never look at again.
        Subscribe to an early-stage company through Ovation and you get a numbered,
        limited-run coin instead. Collections are browsable, which is how the next
        person finds the company.
      </p>

      <div
        className="mt-6 rounded-[13px] px-5 py-4 text-[13px]"
        style={{ background: "var(--paper)", color: "var(--dim)" }}
      >
        <b style={{ color: "var(--ink)" }}>Walk it in order.</b> Card{" "}
        <code style={{ fontFamily: "var(--mono)" }}>4242 4242 4242 4242</code>, any
        future expiry, any CVC. The coin is issued by the Stripe webhook, not by the
        browser — so it appears only once the payment actually lands.
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        {ROUTES.map((r) => (
          <a
            key={r.href}
            href={r.href}
            className="group flex flex-col rounded-2xl px-7 py-6 transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--raise)", border: "1px solid var(--rule)" }}
          >
            <div className="flex items-center gap-4">
              <Coin glyph={r.glyph} tint={r.tint} size={52} />
              <div>
                <div className="t-serial">
                  {r.step} · {r.label}
                </div>
                <div
                  className="mt-1.5"
                  style={{ font: "400 21px/1.15 var(--display)", letterSpacing: "-.02em" }}
                >
                  {r.title}
                </div>
              </div>
            </div>
            <p className="mt-4 flex-1 text-[13.5px] leading-relaxed" style={{ color: "var(--dim)" }}>
              {r.body}
            </p>
            <div className="mt-4 text-[12.5px] font-semibold" style={{ color: "var(--accent)" }}>
              {r.cta}
            </div>
          </a>
        ))}
      </div>

      <div
        className="mt-10 grid grid-cols-1 gap-6 pt-8 text-[12.5px] sm:grid-cols-3"
        style={{ borderTop: "1px solid var(--rule)", color: "var(--dim)" }}
      >
        <div>
          <div className="t-eyebrow mb-2">Identity</div>
          Auth0, provisioned through the Stripe Projects CLI. Collectors are plain
          users; sellers are Organizations with roles read off the token.
        </div>
        <div>
          <div className="t-eyebrow mb-2">Payments</div>
          Stripe Checkout and webhooks.{" "}
          <code style={{ fontFamily: "var(--mono)" }}>checkout.session.completed</code>{" "}
          is the only path that issues a coin.
        </div>
        <div>
          <div className="t-eyebrow mb-2">Data</div>
          Neon Postgres, also provisioned through Stripe Projects. Serial allocation
          is one atomic statement, so two buyers can never share a number.
        </div>
      </div>
    </main>
  );
}
