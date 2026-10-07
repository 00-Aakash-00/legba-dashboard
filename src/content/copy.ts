/**
 * Every user-facing string in the dashboard. Mockup copy is verbatim (the user
 * chose "mockup wins" on 2026-10-07); everything else follows the
 * ux-guidelines message anatomy: what happened, why, and what to do next.
 */

export const WEBSITE = "https://www.legba.app";
export const SUPPORT_EMAIL = "support@legba.app";

export const links = {
  docs: `${WEBSITE}/docs`,
  apiDocs: `${WEBSITE}/developers/api`,
  pricing: `${WEBSITE}/pricing`,
  terms: `${WEBSITE}/terms-of-service`,
  privacy: `${WEBSITE}/privacy-policy`,
  support: `mailto:${SUPPORT_EMAIL}`,
} as const;

export const brand = {
  name: "Legba",
  product: "Inference Box",
  homeLabel: "Legba overview",
};

export const meta = {
  titleTemplate: "%s · Legba",
  defaultTitle: "Legba",
  description:
    "Manage API keys, deployments, and subscriptions for Legba's AI infrastructure.",
};

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

export const auth = {
  showcase: {
    label: "Legba highlights",
    slides: [
      {
        lead: "Cloud, Edge, and ",
        accent: "AI Solutions",
        body: "Legba accelerates AI training, provides comprehensive cloud services, improves content delivery, and protects servers and applications.",
      },
      {
        lead: "Private by default with ",
        accent: "Ghost Mode",
        body: "Maximum privacy. No traces. Built for operators.",
      },
      {
        lead: "Protected workloads with ",
        accent: "Shield Mode",
        body: "Enterprise-grade protection for your AI workloads.",
      },
    ],
    goTo: (n: number, total: number) => `Show slide ${n} of ${total}`,
    slide: (n: number, total: number) => `${n} of ${total}`,
  },
  login: {
    title: "Login",
    headingLines: ["Welcome back to", "Inference Box!"],
    subtitle: "Enter your username and password to continue.",
    email: "Email",
    emailPlaceholder: "you@company.com",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    remember: "Remember me",
    forgot: "Forgot password?",
    submit: "Log in",
    pending: "Logging in",
    divider: "Or login with",
    sso: "SSO",
    google: "Google",
    github: "GitHub",
    noAccount: "Don't have an account?",
    register: "Register",
    legalLead: "By logging in, you agree to our ",
    msa: "Master Services Agreement",
    and: " and ",
    privacy: "Privacy Policy",
    invalid:
      "That email and password don't match. Check them and try again, or reset your password.",
    unreachable:
      "Couldn't reach the server. Check your connection and try again.",
    providerUnavailable: (provider: string) =>
      `${provider} sign-in isn't available yet. Use your email and password instead.`,
  },
  register: {
    title: "Create account",
    heading: "Create your account",
    subtitle: "Start building with Inference Box.",
    name: "Full name",
    namePlaceholder: "Jane Doe",
    email: "Work email",
    password: "Password",
    passwordPlaceholder: "Create a password",
    rulesLabel: "Your password needs",
    rules: {
      length: "At least 8 characters",
      mix: "A letter and a number",
    },
    submit: "Create account",
    pending: "Creating account",
    haveAccount: "Already have an account?",
    login: "Log in",
    legalLead: "By creating an account, you agree to our ",
    emailTaken:
      "That email is already registered. Log in instead, or use a different email.",
  },
  forgot: {
    title: "Reset password",
    heading: "Reset your password",
    subtitle: "Enter your email and we'll send you a reset link.",
    submit: "Send reset link",
    pending: "Sending",
    sent: (email: string) =>
      `If an account exists for ${email}, a reset link is on its way. Check your inbox.`,
    back: "Back to log in",
  },
  sso: {
    title: "Single sign-on",
    heading: "Log in with SSO",
    subtitle: "Enter your work email to find your organization's sign-in.",
    submit: "Continue",
    pending: "Checking",
    notConfigured: (domain: string) =>
      `SSO isn't set up for ${domain} yet. Ask your admin, or log in with your email and password.`,
    back: "Back to log in",
  },
  fields: {
    nameRequired: "Enter your name.",
    nameTooLong: "Use 80 characters or fewer.",
    emailRequired: "Enter your email address.",
    emailInvalid: "Enter a valid email address, like name@company.com.",
    passwordRequired: "Enter your password.",
    passwordWeak: "Use at least 8 characters, with a letter and a number.",
  },
};

export const overview = {
  title: "Overview",
  hero: {
    eyebrow: ["Secure", "Deploy", "Scale"],
    title: "Your API Keys",
    body: "Create and manage API keys to access Legba's AI infrastructure and services.",
    cta: "Create API Key",
    caption: "Integrate powerful AI capabilities into your applications.",
  },
  instances: {
    title: "View your instances",
    body: "Manage your deployed models, monitor usage, and scale as needed with Legba's secure infrastructure.",
    cta: "Launch",
  },
  docs: {
    eyebrow: "Docs",
    product: {
      title: "Product Documentation",
      body: "Explore our tutorials and use cases to get started.",
      cta: "Explore",
    },
    api: {
      title: "API Documentation",
      body: "Explore our API tutorials and examples for integration.",
      cta: "Explore",
      tabsLabel: "Code sample language",
    },
    opensInNewTab: "(opens in a new tab)",
  },
};

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
    art: "A hooded figure turns its head toward the pointer.",
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
    art: "Four shield plates separate in depth as the pointer rises.",
  },
} as const;

export const subscriptions = {
  title: "Your subscriptions",
  pageTitle: "Subscriptions",
  pageDescription: "Every plan on your account, and what it includes.",
  count: (n: number) => `${n} subscription${n === 1 ? "" : "s"}`,
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
    back: "All subscriptions",
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
    error: {
      title: "Couldn't load this subscription",
      body: "The subscriptions service didn't respond. Nothing on your plan changed. Try again in a moment.",
    },
  },
};

export const apiKeys = {
  pageTitle: "API Keys",
  pageDescription:
    "Create and manage API keys to access Legba's AI infrastructure and services.",
  create: "Create API key",
  loading: "Loading your API keys",
  columns: { name: "Name", key: "Key", created: "Created", lastUsed: "Last used" },
  neverUsed: "Never",
  empty: {
    title: "No API keys yet",
    body: "Create a key to call the Legba API from your applications.",
  },
  error: {
    title: "Couldn't load your API keys",
    body: "The keys service didn't respond. Your keys still work. Try again in a moment.",
  },
  dialog: {
    title: "Create API key",
    description:
      "Name the key after where you'll use it, like “production server”.",
    name: "Key name",
    namePlaceholder: "e.g. Production server",
    nameRequired: "Give the key a name.",
    nameTooLong: "Use 64 characters or fewer.",
    submit: "Create key",
    pending: "Creating key",
    cancel: "Cancel",
    failed:
      "Couldn't create the key. No key was created. Try again in a moment.",
    loadFailed: "This dialog didn't load. Check your connection and try again.",
  },
  created: {
    title: "Save your API key",
    body: "This is the only time you'll see the full key. Copy it now and store it somewhere safe.",
    copy: "Copy key",
    copied: "Copied",
    copyFailed: "Couldn't copy. Select the key and copy it manually.",
    done: "I've saved my key",
    toast: "API key created",
    toastAction: "View keys",
  },
  revoke: {
    action: (name: string) => `Revoke ${name}`,
    title: (name: string) => `Revoke “${name}”?`,
    body: "Apps using this key will stop working immediately. This can't be undone.",
    confirm: "Revoke key",
    cancel: "Cancel",
    failed: "Couldn't revoke this key. It's still active. Try again.",
    done: (name: string) => `Revoked “${name}”`,
  },
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

export const workspace = {
  deployments: {
    title: "Deployments",
    description: "Launch, monitor, and scale your deployed models.",
    loading: "Loading your deployments",
    empty: {
      title: "No deployments yet",
      body: "Deploy a model from the catalog and it appears here with its status and usage.",
      action: "Browse models",
    },
    error: {
      title: "Couldn't load your deployments",
      body: "The deployments service didn't respond. Running instances are unaffected. Try again in a moment.",
    },
  },
  models: {
    title: "Model Catalog",
    description: "Models you can deploy on Legba's infrastructure.",
    loading: "Loading the model catalog",
    empty: {
      title: "No models in your catalog yet",
      body: "Models available to your workspace will be listed here. The docs explain what's coming.",
      action: "Read the docs",
    },
    error: {
      title: "Couldn't load the model catalog",
      body: "The catalog service didn't respond. Try again in a moment.",
    },
  },
  registries: {
    title: "Registries",
    description: "Connect container registries to deploy your own images.",
    loading: "Loading your registries",
    empty: {
      title: "No registries connected",
      body: "Connect a container registry to deploy your own images. The docs walk through it.",
      action: "Read the registry guide",
    },
    error: {
      title: "Couldn't load your registries",
      body: "The registries service didn't respond. Try again in a moment.",
    },
  },
};

export const states = {
  retry: "Try again",
  retrying: "Trying again",
  reference: (ref: string) => `Ref ${ref}`,
  offline: "Couldn't reach the server. Check your connection and try again.",
};

export const errorPages = {
  notFound: {
    title: "Page not found",
    heading: "This page doesn't exist",
    body: "Check the address, or head back to your overview.",
    action: "Go to overview",
  },
  app: {
    heading: "This page didn't load",
    body: "Something failed while loading it. Your data is safe. Try again, or head back to your overview.",
    action: "Go to overview",
  },
  global: {
    title: "Legba",
    heading: "Legba hit an unexpected error",
    body: "Your data is safe. Reload to try again.",
    action: "Reload",
  },
};
