import { overviewDocs } from "./docs";

// User-facing strings for this area. Owned by the overview builder (docs strings live in ./docs.ts).
// Wording follows the website's approved messaging (Website/Legba/docs/brand-voice.md); the layout and
// line lengths follow the mockup. Arrays hold hard line breaks; narrow cards rewrap them.

export const overview = {
  title: "Overview",
  hero: {
    eyebrow: ["Connect", "Open", "Finish"],
    title: "Your API Keys",
    body: [
      "Create and manage your API keys.",
      "Use them for the API, MCP, and agent skill.",
    ],
    cta: "Create API Key",
    caption: [
      "Routing and isolated browser sessions,",
      "callable by your agent.",
    ],
  },
  // The mockup's instances card, now the way into Sessions. One line per
  // preview operation (create, list, terminate), kept at every width.
  instances: {
    title: "View your sessions",
    body: [
      "Start an isolated browser session.",
      "See which sessions are running.",
      "End each one when you're done.",
    ],
    cta: "Launch",
  },
  docs: overviewDocs,
};
