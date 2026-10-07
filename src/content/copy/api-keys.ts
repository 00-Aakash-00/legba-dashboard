// User-facing strings for this area. Owned by the api-keys/stubs builder.

export const apiKeys = {
  pageTitle: "API Keys",
  pageDescription:
    "Create and manage API keys to access Legba's AI infrastructure and services.",
  create: "Create API key",
  loading: "Loading your API keys",
  columns: {
    name: "Name",
    key: "Key",
    created: "Created",
    lastUsed: "Last used",
  },
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
