// User-facing strings for this area. Owned by the subscriptions builder.

/** Ghost and Shield, the Chrome extension plan's two modes, as their cards show them. */
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

/**
 * The overview's "Your subscriptions" panel: every plan, always listed, with
 * its status. Each card opens the plan on /plans. The agent card's body and
 * features are the catalog's own (plans.ts).
 */
export const subscriptions = {
  title: "Your subscriptions",
  /** Spoken with the count chip: the plans that are on, the Free plan aside. */
  activeCount: (n: number) => `${n} active`,
  previous: "Previous subscriptions",
  next: "Next subscriptions",
  previousShort: "Previous",
  nextShort: "Next",
  viewAll: "View All",
  vendor: "By: Legba",
  status: { active: "Active", inactive: "Inactive", free: "Free plan" },
  /** The card's bar: on a plan that is on, and on one that isn't (or is Free). */
  manage: "Manage plan",
  viewPlans: "View plans",
  agent: { title: "Agent plan" },
  loading: "Loading your subscriptions",
  error: {
    title: "Couldn't load your subscriptions",
    body: "The subscriptions service didn't respond. Your plans are unchanged. Try again in a moment.",
  },
};

/** Strings for the interactive hairline illustrations (src/components/hairline). */
export const hairline = {
  guidance:
    "Arrow keys adjust the figure. Home and End set the minimum and maximum. Escape restores the resting view.",
};
