import { Text } from "./ui";

/**
 * In-context theme preview.
 *
 * The specimen page proves a theme is COHERENT — every role and primitive
 * side by side. It cannot tell you whether a theme is any good, because a
 * design is judged in composition: a hero against a nav against a pricing
 * card, at real sizes, with real copy lengths.
 *
 * So the same candidates render over Warrick's landing page. That surface has
 * a sticky nav, a 62px headline, a terminal block, a logo strip, three pricing
 * cards with a featured variant, avatars and a footer — far more of the system
 * under load than a grid of specimens.
 *
 * Only appears when ?t= is in the URL, so the demo itself stays clean.
 */

export const THEME_CANDIDATES = [
  ["brand", "Warrick", "the guest brand"],
  ["", "Ovation", "the shipping theme"],
  ["codedex", "Codédex", "codedex.io"],
  ["mocha", "Mocha", "getmocha.com"],
] as const;

export function ThemeSwitcher({ active, base }: { active: string; base: string }) {
  return (
    <div
      // Deliberately NOT themed — it is chrome for judging the theme, and it
      // has to stay legible and identical no matter how radical the candidate
      // underneath gets. Fixed values here are correct, not drift.
      className="fixed bottom-4 left-1/2 z-[100] -translate-x-1/2 rounded-full border border-white/15 bg-black/85 px-2 py-2 backdrop-blur"
      style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
    >
      <div className="flex items-center gap-1">
        <span className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
          Theme
        </span>
        {THEME_CANDIDATES.map(([slug, name, note]) => {
          const on = slug === active;
          return (
            <a
              key={name}
              href={slug ? `${base}?t=${slug}` : base}
              title={note}
              className={[
                "rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                on ? "bg-white text-black" : "text-white/70 hover:text-white",
              ].join(" ")}
            >
              {name}
            </a>
          );
        })}
      </div>
    </div>
  );
}

/** Shared by every page that offers the preview. */
export function resolveTheme(t?: string) {
  const known = THEME_CANDIDATES.map(([s]) => s as string);
  const active = t && known.includes(t) ? t : null;
  return {
    active,
    /** The guest brand still applies unless a candidate theme is chosen. */
    brand: active === null || active === "brand" ? "warrick" : undefined,
    /** "" means the shipping theme, which lives on :root and needs no attr. */
    theme: active && active !== "brand" && active !== "" ? active : undefined,
  };
}
