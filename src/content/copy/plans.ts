// Plans page strings and the plan catalog. Owned by the plans builder.
// Prices, plan names, descriptions and features are verbatim from the
// website's source of truth: Website/Legba/lib/pricing.ts
// (AGENT_PRICING_PLANS and the Chrome extension plan) and lib/site.ts.

export type AgentPlanId = "free" | "pro" | "scale" | "enterprise";

export type AgentPlan = {
  id: AgentPlanId;
  name: string;
  description: string;
  price: string;
  priceSuffix?: string;
  /** Shown in the plan's two highlighted rows. */
  highlights: [string, string];
  features: string[];
  cta: string;
  featured?: boolean;
};

export const agentPlans: AgentPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Evaluate with a real key. No card.",
    price: "$0",
    priceSuffix: "/mo",
    highlights: ["1 concurrent session", "Unlimited bandwidth"],
    features: ["Unlimited bandwidth", "1 concurrent session", "US exit"],
    cta: "Start free",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For agents that run every day.",
    price: "$500",
    priceSuffix: "/mo",
    highlights: ["10 concurrent sessions", "Unlimited bandwidth"],
    features: [
      "Unlimited bandwidth",
      "10 concurrent sessions",
      "Every location",
    ],
    cta: "Choose Pro",
    featured: true,
  },
  {
    id: "scale",
    name: "Scale",
    description: "More parallel work, same flat rate.",
    price: "$1,000",
    priceSuffix: "/mo",
    highlights: ["50 concurrent sessions", "Unlimited bandwidth"],
    features: [
      "Unlimited bandwidth",
      "50 concurrent sessions",
      "Every location",
    ],
    cta: "Choose Scale",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Manual invoice. Limits by contract.",
    price: "Custom",
    highlights: ["Custom concurrency", "Dedicated support"],
    features: [
      "Unlimited bandwidth",
      "Custom concurrency",
      "Dedicated support",
      "Custom regions and terms",
    ],
    cta: "Contact us",
  },
];

export const extensionPlan = {
  id: "extension" as const,
  name: "Chrome extension",
  modes: "Ghost and Shield",
  description:
    "Legba is a Chrome extension with two modes: Ghost gives your browser a private route, Shield opens a page in an isolated browser off your device.",
  monthly: "$10",
  monthlySuffix: "/month",
  yearly: "$100",
  yearlySuffix: "/year",
  priceSentence: "$10 a month, or $100 a year.",
  trial: "Free for 30 days. No card required.",
  features: [
    "Ghost, unlimited use",
    "Shield, unlimited use",
    "Every location",
    "Cancel any time",
  ],
  addToChrome: "Add to Chrome",
  chromeWebStore:
    "https://chromewebstore.google.com/detail/legba/haaekjlllongomddalipbeipmjpmcgbd",
};

export const plansPage = {
  pageTitle: "Plans",
  pageDescription: "Plans for agents. One price for the extension.",
};
