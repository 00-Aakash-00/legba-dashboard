// User-facing strings for this area. Owned by the shell builder.

export const nav = {
  label: "Primary",
  items: {
    overview: "Overview",
    sessions: "Sessions",
    mcp: "MCP",
    agentSkill: "Agent Skill",
    apiKeys: "API Keys",
  },
  short: {
    overview: "Overview",
    sessions: "Sessions",
    mcp: "MCP",
    agentSkill: "Skill",
    apiKeys: "Keys",
  },
  // The logo link; distinct from "Overview" so voice control can tell them apart.
  home: "Legba home",
  searchPlaceholder: "Type to search...",
  searchLabel: "Search",
  shortcut: { mac: "⌘K", other: "Ctrl K" },
  support: "Contact support",
  docs: "Documentation",
  topUp: "Top-Up",
  skipToContent: "Skip to content",
} as const;

export const search = {
  title: "Search",
  description: "Go to a page, run an action, or open the documentation.",
  placeholder: "Search pages, actions, docs",
  empty: (query: string) => `No results for "${query}"`,
  emptyHint: "Try a page name, or an action like “top up”.",
  clear: "Clear search",
  close: "Cancel",
  closeHint: "Esc",
  groups: { pages: "Pages", actions: "Actions", docs: "Docs" },
  subscriptions: "Subscriptions",
  actions: { createKey: "Create API key", topUp: "Top up credits" },
  docs: { product: "Product documentation", api: "API documentation" },
  newTab: "Opens in a new tab",
  // Extra words each entry answers to (matched, never shown).
  keywords: {
    overview: ["home", "dashboard"],
    sessions: ["sessions", "instances", "browser", "isolated"],
    mcp: ["mcp", "model context protocol", "agent", "connect"],
    agentSkill: ["skill", "agent", "install", "routing"],
    apiKeys: ["keys", "tokens", "credentials"],
    subscriptions: ["plans", "ghost", "shield", "billing"],
    createKey: ["new key", "token"],
    topUp: ["credits", "billing", "payment", "balance", "add funds"],
    product: ["docs", "guides", "help"],
    api: ["docs", "reference", "endpoints"],
  },
  loading: "Loading search",
  loadFailed: "Search didn't load. Check your connection and try again.",
  retry: "Try again",
};

export const account = {
  menu: "Account menu",
  signedInAs: "Signed in as",
  topUp: "Top up credits",
  support: "Contact support",
  docs: "Documentation",
  signOut: "Sign out",
  signingOut: "Signing out",
  avatarAlt: (name: string) => `${name}'s avatar`,
  unavailable: "Your account details didn't load.",
  retry: "Try again",
};

export const billing = {
  title: "Top up credits",
  description: "Add credits to your balance to pay for usage.",
  amountLabel: "Amount",
  presets: [10, 25, 50, 100],
  defaultPreset: 25,
  other: "Other amount",
  otherPlaceholder: "Amount in USD",
  amountInvalid: "Enter an amount between $5 and $10,000.",
  amountFormat: "Enter dollars and cents, like 25 or 25.50.",
  amountRequired: "Choose an amount, or enter one between $5 and $10,000.",
  submit: (amount: string) => `Add ${amount}`,
  submitEmpty: "Add credits",
  pending: "Processing",
  cancel: "Cancel",
  loading: "Loading the top-up form",
  loadFailed:
    "The top-up form didn't load. Check your connection and try again.",
  retry: "Try again",
  success: (amount: string) => `Added ${amount} to your balance`,
  unavailable:
    "Payments aren't connected in this preview, so the top-up didn't go through. You weren't charged.",
  failed: "The top-up didn't go through. You weren't charged. Try again.",
  offline:
    "Couldn't reach the server, so the top-up didn't go through. You weren't charged. Check your connection and try again.",
};
