/**
 * Suite brand config. Swap these strings to rename the suite —
 * every tool, email and PDF reads from here.
 */
export const brand = {
  name: "Level",
  company: "ViLi",
  tagline: "Site paperwork, done on the level.",
  supportEmail: "help@vili.com.au", // TODO(config): real support address
} as const;

export type ToolId =
  | "variations"
  | "wallet"
  | "swms"
  | "claims"
  | "rate-calc"
  | "materials"
  | "margin";

export type ToolDef = {
  id: ToolId;
  name: string;
  blurb: string;
  paid: boolean;
  ready: boolean;
  href: string;
};

/** The suite's tool registry — the app shell builds navigation from this. */
export const tools: ToolDef[] = [
  { id: "variations", name: "Variations", blurb: "Get extras signed before you start them", paid: true, ready: true, href: "/variations" },
  { id: "wallet", name: "Compliance Wallet", blurb: "Licences, insurances and tickets in one place", paid: true, ready: false, href: "/wallet" },
  { id: "swms", name: "SWMS Builder", blurb: "A site-ready SWMS in minutes", paid: true, ready: false, href: "/swms" },
  { id: "claims", name: "Payment Claims", blurb: "BIF Act payment claims that stand up", paid: true, ready: false, href: "/claims" },
  { id: "rate-calc", name: "Rate Calculator", blurb: "What you actually need to charge", paid: false, ready: false, href: "/free/rate" },
  { id: "materials", name: "Material Calculators", blurb: "Concrete, sheets, pavers and more", paid: false, ready: false, href: "/free/materials" },
  { id: "margin", name: "Margin Checker", blurb: "Is this job actually making money?", paid: false, ready: false, href: "/free/margin" },
];
