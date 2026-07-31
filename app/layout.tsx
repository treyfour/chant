import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif, IBM_Plex_Mono, Press_Start_2P, Mulish } from "next/font/google";
import "./globals.css";

/**
 * Fonts are bound ONCE, here, as CSS variables — never named in a component.
 *
 * This is the fix for "what font?" reopening on every project. A theme picks a
 * ROLE (`--font-display`), the role resolves to one of these variables, and the
 * fallback chain is already written down in theme.css. There is no third place
 * to decide, and nothing to re-derive.
 *
 * Self-hosted by next/font: no CDN request, no FOUT, no offline failure.
 */
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

/* Loaded for the codedex preview at /dev/themes?t=codedex. Fonts must be bound
   here rather than in a theme file — self-hosting needs the build step — which
   is the one place "a restyle is only a CSS file" isn't literally true. */
const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start",
  display: "swap",
});

const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-mulish",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ovation",
  description: "A receipt you'd actually keep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // `data-theme` cascades. Any subtree can override it, which is how an
      // Ovation sheet renders warm on top of a cold Warrick page.
      className={`${instrumentSans.variable} ${instrumentSerif.variable} ${plexMono.variable} ${pressStart.variable} ${mulish.variable} h-full antialiased`}
    >
      {/* No flex here: `mx-auto` on a flex child beats align-items:stretch and
          shrink-wraps the page to its content. Plain block layout. */}
      <body className="min-h-full">{children}</body>
    </html>
  );
}
