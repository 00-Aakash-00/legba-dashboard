import { overviewDocs } from "./docs";

// User-facing strings for this area. Owned by the hero/instances builder (docs strings live in ./docs.ts).
// Mockup copy is verbatim. Arrays hold the mockup's hard line breaks; narrow cards rewrap them.

export const overview = {
  title: "Overview",
  hero: {
    eyebrow: ["Secure", "Deploy", "Scale"],
    title: "Your API Keys",
    body: [
      "Create and manage API keys to access Legba’s",
      "AI infrastructure and services.",
    ],
    cta: "Create API Key",
    caption: ["Integrate powerful AI capabilities", "into your applications."],
  },
  instances: {
    title: "View your instances",
    body: [
      "Manage your deployed models,",
      "monitor usage, and scale as needed",
      "with Legba’s secure infrastructure.",
    ],
    cta: "Launch",
  },
  docs: overviewDocs,
};
