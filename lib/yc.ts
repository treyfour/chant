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
 */

export interface YcCompany {
  slug: string;
  name: string;
  mark: string;   // monogram, not a logo
  tint: string;   // the company's actual brand colour
  run: string;
  serial: number;
  size: number;
}

/** Ordered oldest-backed last, so the grid reads as a history. */
export const YC_COMPANIES: YcCompany[] = [
  { slug: "stripe",    name: "Stripe",      mark: "S",  tint: "#635BFF", run: "founding user",  serial: 21,  size: 50 },
  { slug: "supabase",  name: "Supabase",    mark: "SB", tint: "#3ECF8E", run: "early access",   serial: 14,  size: 100 },
  { slug: "posthog",   name: "PostHog",     mark: "PH", tint: "#F54E00", run: "design partner", serial: 6,   size: 25 },
  { slug: "replit",    name: "Replit",      mark: "R",  tint: "#F26207", run: "beta",           serial: 112, size: 250 },
  { slug: "retool",    name: "Retool",      mark: "RT", tint: "#3D5AFE", run: "founding user",  serial: 9,   size: 50 },
  { slug: "vanta",     name: "Vanta",       mark: "V",  tint: "#6A46F5", run: "early access",   serial: 41,  size: 100 },
  { slug: "brex",      name: "Brex",        mark: "B",  tint: "#F46A35", run: "founding user",  serial: 33,  size: 200 },
  { slug: "deel",      name: "Deel",        mark: "D",  tint: "#0B4FE4", run: "waitlist",       serial: 14,  size: 50 },
  { slug: "rippling",  name: "Rippling",    mark: "RP", tint: "#4B45E5", run: "beta",           serial: 61,  size: 150 },
  { slug: "zapier",    name: "Zapier",      mark: "Z",  tint: "#FF4A00", run: "early access",   serial: 401, size: 500 },
  { slug: "coinbase",  name: "Coinbase",    mark: "C",  tint: "#0052FF", run: "design partner", serial: 3,   size: 25 },
  { slug: "dropbox",   name: "Dropbox",     mark: "DB", tint: "#0061FF", run: "founding user",  serial: 88,  size: 200 },
  { slug: "twitch",    name: "Twitch",      mark: "T",  tint: "#9146FF", run: "beta",           serial: 19,  size: 30 },
  { slug: "airbnb",    name: "Airbnb",      mark: "A",  tint: "#FF5A5F", run: "founding user",  serial: 7,   size: 50 },
  { slug: "doordash",  name: "DoorDash",    mark: "DD", tint: "#FF3008", run: "early access",   serial: 2,   size: 50 },
];

/** A second collector's set, for the discovery beat. */
export const YC_DANA: YcCompany[] = [
  { slug: "stripe",    name: "Stripe",      mark: "S",  tint: "#635BFF", run: "founding user",  serial: 8,  size: 50 },
  { slug: "instacart", name: "Instacart",   mark: "I",  tint: "#43B02A", run: "design partner", serial: 4,  size: 25 },
  { slug: "gitlab",    name: "GitLab",      mark: "GL", tint: "#FC6D26", run: "beta",           serial: 41, size: 120 },
  { slug: "flexport",  name: "Flexport",    mark: "F",  tint: "#00C0E8", run: "founding user",  serial: 11, size: 50 },
  { slug: "replit",    name: "Replit",      mark: "R",  tint: "#F26207", run: "beta",           serial: 88, size: 250 },
  { slug: "gusto",     name: "Gusto",       mark: "G",  tint: "#F45D48", run: "early access",   serial: 2,  size: 30 },
  { slug: "faire",     name: "Faire",       mark: "FA", tint: "#111111", run: "waitlist",       serial: 63, size: 200 },
  { slug: "amplitude", name: "Amplitude",   mark: "AM", tint: "#1F8CEB", run: "design partner", serial: 19, size: 150 },
];
