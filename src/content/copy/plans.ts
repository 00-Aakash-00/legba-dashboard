// Plans page strings and the plan catalog. Owned by the plans builder.
// Prices, plan names, descriptions and features are verbatim from the
// website's source of truth: Website/Legba/lib/pricing.ts
// (AGENT_PRICING_PLANS and the Chrome extension plan) and lib/site.ts.

import { WEBSITE } from "./common";

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

/** Listed from the smallest plan up: the plans page reads a move down the list as a downgrade. */
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
  preview: "Preview",
  previewNote:
    "Payments aren't connected in this preview. No payment is taken.",
  newTab: "(opens in a new tab)",
  /** Announced while the plans you're on load (the catalog is already shown). */
  loading: "Loading your plan",
  error: {
    title: "Couldn't load your plan",
    body: "The billing service didn't respond, so your current plan isn't marked. Your plans are unchanged. Try again in a moment.",
  },
  current: "Current plan",
  /** Spoken in place of "/mo", "/month" and "/year". */
  perMonth: "per month",
  perYear: "per year",

  agent: {
    heading: "Agent plans",
    description: "For the Legba API, MCP, and the agent skill.",
    popular: "Popular",
    included: "What's included:",
    /** In the dashboard every account already has a plan, so Free is a move too. */
    choose: (plan: string) => `Choose ${plan}`,
    /** One line under each plan's button, taken from its description. */
    tagline: {
      free: "Best for evaluating",
      pro: "Best for daily agents",
      scale: "Best for parallel work",
    } satisfies Record<Exclude<AgentPlanId, "enterprise">, string>,
  },

  enterprise: {
    label: "Go enterprise",
    title: "Custom pricing",
    action: "Contact us",
    href: `${WEBSITE}/contact`,
  },

  /** Confirmation before any agent plan change. Moving to Free cancels the paid plan. */
  switchPlan: {
    title: (plan: string) => `Switch to ${plan}?`,
    confirm: (plan: string) => `Switch to ${plan}`,
    pending: "Switching",
    cancel: "Cancel",
    note: "This is a preview. No payment is taken.",
    done: (plan: string) => `You're on ${plan}`,
    /**
     * A move to a smaller plan, from catalog values: the plan that ends and the
     * new plan's concurrency, its number kept on one line with its noun.
     */
    downgrade: (from: string, to: string, concurrency: string) =>
      `Your ${from} plan ends now. ${to} includes ${concurrency.replace(" ", "\u00a0")}.`,
    /** Cancel, on a downgrade's confirmation. */
    keep: (plan: string) => `Keep ${plan}`,
    failed: "Couldn't switch plans. You weren't charged. Try again.",
    offline:
      "Couldn't reach the server, so your plan didn't change. You weren't charged. Check your connection and try again.",
  },

  extension: {
    heading: "Chrome extension",
    period: {
      label: "Billing period",
      monthly: "Monthly",
      yearly: "Yearly",
      save: "Save $20",
    },
    statusLabel: "Plan status: ",
    status: {
      active: "Active",
      inactive: "Inactive",
      unknown: "Status unavailable",
    },
    startTrial: "Start free trial",
    cancel: "Cancel plan",
    trial: {
      title: "Start your free trial?",
      price: `${extensionPlan.monthly}${extensionPlan.monthlySuffix} or ${extensionPlan.yearly}${extensionPlan.yearlySuffix}`,
      priceSpoken: `${extensionPlan.monthly} per month or ${extensionPlan.yearly} per year`,
      confirm: "Start free trial",
      pending: "Starting",
      cancel: "Cancel",
      note: "This is a preview. No payment is taken.",
      done: "Free trial started",
      failed: "Couldn't start the free trial. You weren't charged. Try again.",
      offline:
        "Couldn't reach the server, so the trial didn't start. You weren't charged. Check your connection and try again.",
    },
    cancelPlan: {
      title: "Cancel the extension plan?",
      body: "Your Chrome extension plan becomes inactive. You can start it again from this page.",
      confirm: "Cancel plan",
      pending: "Cancelling",
      keep: "Keep plan",
      done: "Extension plan cancelled",
      failed: "Couldn't cancel the plan. It's still active. Try again.",
      offline:
        "Couldn't reach the server, so your plan is still active. Check your connection and try again.",
    },
  },
};
