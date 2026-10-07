// User-facing strings for this area. Owned by the shell builder.

export const nav = {
  label: "Primary",
  items: {
    overview: "Overview",
    deployments: "Deployments",
    models: "Model Catalog",
    registries: "Registries",
    apiKeys: "API Keys",
  },
  short: {
    overview: "Overview",
    deployments: "Deploy",
    models: "Models",
    registries: "Registries",
    apiKeys: "Keys",
  },
  searchPlaceholder: "Type to search...",
  searchLabel: "Search",
  support: "Contact support",
  docs: "Documentation",
  topUp: "Top-Up",
  account: "Account",
  skipToContent: "Skip to content",
} as const;

export const search = {
  placeholder: "Search pages, actions and docs",
  empty: (query: string) => `No results for "${query}"`,
  clear: "Clear search",
  groups: { pages: "Pages", actions: "Actions", docs: "Docs" },
  actions: { createKey: "Create API key", topUp: "Top up credits" },
  docs: { product: "Product documentation", api: "API documentation" },
  loading: "Loading search",
  loadFailed: "Search didn't load. Check your connection and try again.",
  retry: "Try again",
};

export const account = {
  signedInAs: "Signed in as",
  topUp: "Top up credits",
  support: "Contact support",
  signOut: "Sign out",
  signingOut: "Signing out",
  avatarAlt: (name: string) => `${name}'s avatar`,
};

export const billing = {
  title: "Top up credits",
  description: "Add credits to your balance to pay for usage.",
  amountLabel: "Amount",
  presets: [10, 25, 50, 100],
  other: "Other amount",
  otherPlaceholder: "Amount in USD",
  amountInvalid: "Enter an amount between $5 and $10,000.",
  submit: (amount: string) => `Add ${amount}`,
  submitEmpty: "Add credits",
  pending: "Processing",
  cancel: "Cancel",
  unavailable:
    "Payments aren't connected in this preview, so the top-up didn't go through. You weren't charged.",
  failed: "The top-up didn't go through. You weren't charged. Try again.",
};
