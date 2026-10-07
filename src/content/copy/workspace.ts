// Sessions, MCP and Agent Skill page strings. Owned by the developer-pages builder.
// Wording comes from the website's approved messaging (Website/Legba/docs/brand-voice.md §7,
// lib/site.ts, the API quickstart). The browser API, the MCP config and the install
// command are not public yet, so each is marked Preview and never presented as live.

import { links, WEBSITE } from "./common";

export const workspace = {
  /** The chip on every value that isn't public yet. */
  preview: "Preview",
  newTab: "(opens in a new tab)",
  /** Spoken before a step's title, so heading navigation keeps the order. */
  step: (n: number) => `Step ${n}: `,
  createKey: "Create API key",
  /** The first setup step on the MCP and Agent Skill pages. */
  keyStep: "Create an API key",
  copy: {
    label: "Copy",
    copied: "Copied",
    /** Announced (politely) once the clipboard has the text. */
    done: (what: string) => `${what} copied to the clipboard`,
    failed: "Couldn't copy automatically.",
    failedHint: "The text is selected, so you can copy it yourself.",
  },

  sessions: {
    title: "Sessions",
    description:
      "Isolated browser sessions you start with the Legba browser API.",
    preview:
      "The browser API is a public preview. The production host is not published.",
    section: "All sessions",
    loading: "Loading your sessions",
    empty: {
      title: "No sessions yet",
      body: "Sessions you start with the browser API show here.",
      /** Opens the website's browser API preview (links.apiDocs). */
      action: "Review the browser API preview",
    },
    error: {
      title: "Couldn't load your sessions",
      /** The card's own "Try again" button is the next step. */
      body: "The sessions service didn't respond.",
    },
    apiPreview: links.apiDocs,
    start: {
      title: "How a session starts",
      body: "Review the proposed workflow. These commands are not runnable.",
      code: "Create a session",
      tabs: "Language",
      languages: { curl: "cURL", javascript: "JavaScript", python: "Python" },
      sample: (language: string) => `${language} sample`,
      response: {
        lead: "The proposed response returns an",
        field: "instance_uuid",
        tail: "for later requests.",
      },
    },
  },

  mcp: {
    title: "MCP",
    description: "Preview the Model Context Protocol setup for your agent.",
    preview:
      "Legba does not currently publish a public MCP server. The config here is illustrative.",
    section: "Connect your client",
    keyBody: "Your client sends it as a bearer token.",
    add: {
      title: "Add the server to your client",
      body: "Use this config once Legba publishes an MCP server.",
      placeholders: "{your-mcp-host} and YOUR_API_KEY are placeholders.",
    },
    ask: {
      title: "Once connected, ask your agent",
      body: "Try: “Open example.com in an isolated browser.”",
    },
    config: {
      label: "MCP client config",
      tabs: "MCP client",
      clients: { claudeCode: "Claude Code", cursor: "Cursor" },
      name: (client: string) => `${client} config`,
    },
    skill: {
      title: "Use the ready agent skill",
      body: "Agent builders reach the same routing and isolation through a ready skill.",
      action: "See the agent skill",
    },
  },

  agentSkill: {
    title: "Agent Skill",
    description:
      "Give your agent Legba's routing and isolated browser sessions.",
    install: {
      section: "Install the skill",
      name: "Install command",
      note: "Placeholder command until the skill is published.",
    },
    features: {
      section: "What it does",
      /** Approved lines only, verbatim (website capabilities and supporting lines). */
      items: [
        "Routing and isolated browser sessions, callable by your agent.",
        "Spawn a session. Do the work. Destroy it.",
        "Connect. Open the page. Finish the task.",
      ],
    },
    setup: {
      section: "Set up the skill",
      /** Step 1's line: the API Keys page's own note (apiKeys.note), verbatim. */
      keyBody: "Full keys are shown once, when they're created.",
      install: {
        title: "Install the skill",
        body: "Run the install command once the skill is published.",
      },
      ask: {
        title: "Ask your agent to use Legba",
        body: "Try: “Use Legba to open example.com in an isolated browser.”",
      },
    },
    contact: {
      title: "Your agents need routing and isolation.",
      body: "Legba provides both through a ready skill.",
      action: "Talk to us about the skill",
      href: `${WEBSITE}/contact`,
    },
  },
};
