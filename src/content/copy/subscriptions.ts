// User-facing strings for this area. Owned by the subscriptions builder.

export const plans = {
  ghost: {
    title: "Ghost Mode",
    body: "Maximum privacy. No traces. Built for operators.",
    features: [
      "Anonymous inference",
      "No logs retained",
      "Global access",
      "Priority infrastructure",
    ],
    /** The illustration's name while it is a still picture. */
    art: "Ghost Mode illustration: a hooded figure drawn in fine lines.",
  },
  shield: {
    title: "Shield Mode",
    body: "Enterprise-grade protection for your AI workloads.",
    features: [
      "Enhanced security layer",
      "Threat monitoring",
      "Compliance ready",
      "Dedicated support",
    ],
    art: "Shield Mode illustration: three nested shield plates standing in a ring.",
  },
} as const;

export const subscriptions = {
  title: "Your subscriptions",
  pageTitle: "Subscriptions",
  pageDescription: "Every plan on your account, and what it includes.",
  pageAction: "Browse plans",
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
  viewAll: "View All",
  vendor: (vendor: string) => `By: ${vendor}`,
  status: { active: "Active", paused: "Paused", cancelled: "Cancelled" },
  manage: "Manage Subscription",
  loading: "Loading your subscriptions",
  newTab: "(opens in a new tab)",
  empty: {
    title: "No subscriptions yet",
    body: "Ghost Mode and Shield Mode plans appear here once you subscribe.",
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
    back: "All subscriptions",
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
    historyEmptyBody:
      "Invoices for this plan will be listed here after the first billing date.",
    changeTitle: "Need to change this plan?",
    changeBody:
      "Plan changes and cancellations go through our team for now. We usually reply within one business day.",
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
