// User-facing strings for this area. Owned by the subscriptions builder.

import { WEBSITE } from "./common";

/** Where "Browse plans" leads: the website's pricing section. */
const PRICING = `${WEBSITE}/#pricing`;

export const plans = {
  ghost: {
    title: "Ghost Mode",
    body: "A private route for your browser.",
    features: [
      "Private browser route",
      "Location you choose",
      "Browser only",
      "Other apps unchanged",
    ],
    /** The illustration's name while it is a still picture. */
    art: "Ghost Mode illustration: a cloaked figure drawn in fine lines.",
    /** Its name once it answers the pointer and the arrow keys. */
    artLive:
      "Ghost Mode illustration: a cloaked figure that turns to look toward the pointer.",
  },
  shield: {
    title: "Shield Mode",
    body: "An isolated browser for pages you do not trust.",
    features: [
      "Isolated browser",
      "Off your device",
      "For untrusted pages",
      "Ends when you close it",
    ],
    art: "Shield Mode illustration: three nested shield plates standing in a ring.",
    artLive:
      "Shield Mode illustration: three nested shield plates. The plate under the pointer lights up and the others part.",
  },
} as const;

export const subscriptions = {
  title: "Your subscriptions",
  pageTitle: "Subscriptions",
  pageDescription: "Every plan on your account, and what it includes.",
  pageAction: "Browse plans",
  pricing: PRICING,
  count: (n: number) => `${n} subscription${n === 1 ? "" : "s"}`,
  shown: (n: number) =>
    n === 0
      ? "No subscriptions match this filter"
      : `Showing ${n} subscription${n === 1 ? "" : "s"}`,
  filterLabel: "Filter subscriptions",
  filters: {
    all: "All",
    active: "Active",
    paused: "Paused",
    cancelled: "Cancelled",
  },
  previous: "Previous subscriptions",
  next: "Next subscriptions",
  previousShort: "Previous",
  nextShort: "Next",
  viewAll: "View All",
  vendor: (vendor: string) => `By: ${vendor}`,
  status: { active: "Active", paused: "Paused", cancelled: "Cancelled" },
  manage: "Manage Subscription",
  loading: "Loading your subscriptions",
  newTab: "(opens in a new tab)",
  empty: {
    title: "No subscriptions yet",
    body: "Your Legba plan appears here once you subscribe.",
    action: "Browse plans",
  },
  filtered: {
    title: (status: string) => `No ${status.toLowerCase()} subscriptions`,
    body: "Try another filter, or show every plan.",
    action: "Show all",
  },
  error: {
    title: "Couldn't load your subscriptions",
    body: "The subscriptions service didn't respond. Your plans are unchanged. Try again in a moment.",
  },
  detail: {
    metaTitle: "Subscription",
    metaDescription:
      "One plan on your account. See what it includes and how to change it.",
    back: "Back to subscriptions",
    eyebrow: "Subscription",
    summaryTitle: "Summary",
    planLabel: "Plan",
    vendorLabel: "Provided by",
    statusLabel: "Status",
    startedLabel: "Started",
    renewsLabel: "Renews",
    includes: "What's included",
    historyTitle: "Billing history",
    historyEmpty: "No invoices yet",
    historyEmptyBody: "Invoices appear here after the first billing date.",
    changeTitle: "Need to change this plan?",
    changeBody:
      "Plan changes go through our team for now. Email us to change or cancel this plan.",
    contact: "Contact support",
    contactSubject: (plan: string) => `Change my ${plan} plan`,
    loading: "Loading this subscription",
    error: {
      title: "Couldn't load this subscription",
      body: "The subscriptions service didn't respond. Nothing on your plan changed. Try again in a moment.",
    },
    notFound: {
      title: "Subscription not found",
      body: "This subscription isn't on your account. The link may be old, or the plan may belong to another account.",
      action: "See your subscriptions",
    },
  },
};

/** Strings for the interactive hairline illustrations (src/components/hairline). */
export const hairline = {
  guidance:
    "Arrow keys adjust the figure. Home and End set the minimum and maximum. Escape restores the resting view.",
};
