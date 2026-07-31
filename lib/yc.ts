/**
 * Real Y Combinator companies for the demo collection.
 *
 * IMPORTANT — read before showing this to anyone:
 *
 * The serial numbers, run sizes, acquisition dates and collector counts
 * attached to these names are INVENTED. None of these companies has connected
 * Stripe to Ovation, created a coin run, or has any relationship with this
 * project. Marks are letterforms in each company's brand colour, NOT their
 * trademarked logos.
 *
 * If anyone asks whether these are real customers, the answer is no. Say so.
 *
 * ─────────────────────────────────────────────────────────────
 * On run names: a coin is minted by a PAYMENT, so the name has to describe a
 * purchase, not a relationship. "waitlist", "beta" and "design partner" all
 * described people who hadn't paid — nobody gets a coin for joining a list.
 *
 * The pattern is `first <n> <tier>`: your position among paying customers, and
 * which tier you bought. "first 50 pro · #21" says exactly what happened.
 * Premium tiers get smaller runs, which is what makes them worth more.
 */

export interface YcCompany {
  slug: string;
  name: string;
  mark: string;   // monogram, not a logo
  tint: string;   // the company's actual brand colour
  run: string;    // `first <n> <tier>`
  serial: number;
  size: number;
  website: string;
}

export const YC_COMPANIES: YcCompany[] = [
  { slug: "stripe",   name: "Stripe",   mark: "S",  tint: "#635BFF", run: "first 50 pro",    serial: 21,  size: 50,  website: "https://stripe.com" },
  { slug: "supabase", name: "Supabase", mark: "SB", tint: "#3ECF8E", run: "first 100 pro",   serial: 14,  size: 100, website: "https://supabase.com" },
  { slug: "posthog",  name: "PostHog",  mark: "PH", tint: "#F54E00", run: "first 25 team",   serial: 6,   size: 25,  website: "https://posthog.com" },
  { slug: "replit",   name: "Replit",   mark: "R",  tint: "#F26207", run: "first 250 pro",   serial: 112, size: 250, website: "https://replit.com" },
  { slug: "retool",   name: "Retool",   mark: "RT", tint: "#3D5AFE", run: "first 50 pro",    serial: 9,   size: 50,  website: "https://retool.com" },
  { slug: "vanta",    name: "Vanta",    mark: "V",  tint: "#6A46F5", run: "first 100 team",  serial: 41,  size: 100, website: "https://vanta.com" },
  { slug: "brex",     name: "Brex",     mark: "B",  tint: "#F46A35", run: "first 200 pro",   serial: 33,  size: 200, website: "https://brex.com" },
  { slug: "deel",     name: "Deel",     mark: "D",  tint: "#0B4FE4", run: "first 50 team",   serial: 14,  size: 50,  website: "https://deel.com" },
  { slug: "rippling", name: "Rippling", mark: "RP", tint: "#4B45E5", run: "first 150 pro",   serial: 61,  size: 150, website: "https://rippling.com" },
  { slug: "zapier",   name: "Zapier",   mark: "Z",  tint: "#FF4A00", run: "first 500 pro",   serial: 401, size: 500, website: "https://zapier.com" },
  { slug: "coinbase", name: "Coinbase", mark: "C",  tint: "#0052FF", run: "first 25 team",   serial: 3,   size: 25,  website: "https://coinbase.com" },
  { slug: "dropbox",  name: "Dropbox",  mark: "DB", tint: "#0061FF", run: "first 200 pro",   serial: 88,  size: 200, website: "https://dropbox.com" },
  { slug: "twitch",   name: "Twitch",   mark: "T",  tint: "#9146FF", run: "first 30 team",   serial: 19,  size: 30,  website: "https://twitch.tv" },
  { slug: "airbnb",   name: "Airbnb",   mark: "A",  tint: "#FF5A5F", run: "first 50 pro",    serial: 7,   size: 50,  website: "https://airbnb.com" },
  { slug: "doordash", name: "DoorDash", mark: "DD", tint: "#FF3008", run: "first 50 pro",    serial: 2,   size: 50,  website: "https://doordash.com" },
];

/** A second collector's set, for the discovery beat. */
export const YC_DANA: YcCompany[] = [
  { slug: "stripe",    name: "Stripe",    mark: "S",  tint: "#635BFF", run: "first 50 pro",   serial: 8,  size: 50,  website: "https://stripe.com" },
  { slug: "instacart", name: "Instacart", mark: "I",  tint: "#43B02A", run: "first 25 team",  serial: 4,  size: 25,  website: "https://instacart.com" },
  { slug: "gitlab",    name: "GitLab",    mark: "GL", tint: "#FC6D26", run: "first 120 pro",  serial: 41, size: 120, website: "https://gitlab.com" },
  { slug: "flexport",  name: "Flexport",  mark: "F",  tint: "#00C0E8", run: "first 50 pro",   serial: 11, size: 50,  website: "https://flexport.com" },
  { slug: "replit",    name: "Replit",    mark: "R",  tint: "#F26207", run: "first 250 pro",  serial: 88, size: 250, website: "https://replit.com" },
  { slug: "gusto",     name: "Gusto",     mark: "G",  tint: "#F45D48", run: "first 30 team",  serial: 2,  size: 30,  website: "https://gusto.com" },
  { slug: "faire",     name: "Faire",     mark: "FA", tint: "#111111", run: "first 200 pro",  serial: 63, size: 200, website: "https://faire.com" },
  { slug: "amplitude", name: "Amplitude", mark: "AM", tint: "#1F8CEB", run: "first 150 team", serial: 19, size: 150, website: "https://amplitude.com" },
];
