// User-facing strings for this area. Owned by the lead (frozen).

export const WEBSITE = "https://www.legba.app";

export const SUPPORT_EMAIL = "support@legba.app";

export const links = {
  docs: `${WEBSITE}/docs`,
  apiDocs: `${WEBSITE}/developers/api`,
  pricing: `${WEBSITE}/#pricing`,
  terms: `${WEBSITE}/terms-of-service`,
  privacy: `${WEBSITE}/privacy-policy`,
  support: `mailto:${SUPPORT_EMAIL}`,
} as const;

export const brand = {
  name: "Legba",
  homeLabel: "Legba overview",
};

export const meta = {
  titleTemplate: "%s · Legba",
  defaultTitle: "Legba",
  description:
    "API keys, sessions, and plans for the Legba API, MCP, and the agent skill.",
};

export const states = {
  retry: "Try again",
  retrying: "Trying again",
  reference: (ref: string) => `Ref ${ref}`,
  offline: "Couldn't reach the server. Check your connection and try again.",
};
