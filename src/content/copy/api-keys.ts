// User-facing strings for this area. Owned by the api-keys/stubs builder.

export const apiKeys = {
  pageTitle: "API Keys",
  pageDescription:
    "Create and manage keys for the Legba API, MCP, and the agent skill.",
  create: "Create API key",
  loading: "Loading your API keys",
  section: "Active keys",
  note: "Full keys are shown once, when they're created. Lost one? Revoke it and create a new key.",
  columns: {
    name: "Name",
    key: "Key",
    created: "Created",
    lastUsed: "Last used",
    actions: "Actions",
  },
  neverUsed: "Never",
  usage: {
    created: (date: string) => `Created ${date}`,
    lastUsed: (date: string) => `Last used ${date}`,
    never: "Never used",
  },
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
    counter: (count: number, max: number) => `${count}/${max}`,
    counterLabel: (count: number, max: number) =>
      `${count} of ${max} characters`,
    submit: "Create key",
    pending: "Creating key",
    cancel: "Cancel",
    close: "Close",
    loading: "Loading",
    failed:
      "Couldn't create the key. No key was created. Try again in a moment.",
    loadFailed: "This dialog didn't load. Check your connection and try again.",
  },
  created: {
    title: "Save your API key",
    body: "This is the only time you'll see the full key. Copy it now and store it somewhere safe.",
    keyLabel: (name: string) => `API key for ${name}`,
    copy: "Copy key",
    copied: "Copied",
    copiedAnnouncement: "API key copied to the clipboard",
    copyFailed:
      "Couldn't copy automatically. The key is now selected, so you can copy it yourself.",
    done: "I've saved my key",
    toast: "API key created",
    toastAction: "View keys",
  },
  revoke: {
    label: "Revoke",
    action: (name: string) => `Revoke ${name}`,
    /** When two keys share a name, the label adds the key's prefix. */
    actionWithKey: (name: string, prefix: string) =>
      `Revoke ${name} (${prefix}…)`,
    title: (name: string) => `Revoke “${name}”?`,
    body: "Apps using this key will stop working immediately. This can't be undone.",
    keyLabel: "Key",
    confirm: "Revoke key",
    cancel: "Cancel",
    pending: (name: string) => `Revoking “${name}”`,
    failed: "Couldn't revoke this key. It's still active. Try again.",
    done: (name: string) => `Revoked “${name}”`,
  },
};

export const errorPages = {
  notFound: {
    title: "Page not found",
    eyebrow: "Error 404",
    heading: "This page doesn't exist",
    body: "Check the address, or head back to your overview.",
    action: "Go to overview",
  },
  app: {
    title: "Something went wrong",
    eyebrow: "Error",
    heading: "This page didn't load",
    body: "Something failed while loading it. Your data is safe. Try again, or head back to your overview.",
    action: "Go to overview",
  },
  global: {
    title: "Legba",
    eyebrow: "Error",
    heading: "Legba hit an unexpected error",
    body: "Your data is safe. Reload to try again.",
    action: "Reload",
  },
};
