// Sessions, MCP and Agent Skill page strings. Owned by the developer-pages builder.

export const workspace = {
  sessions: {
    title: "Sessions",
    description: "Isolated browser sessions you start with the Legba API.",
    section: "All sessions",
    loading: "Loading your sessions",
    empty: {
      title: "No sessions yet",
      body: "Start a session with the Legba API and it appears here while it runs.",
      action: "Read the API quickstart",
    },
    error: {
      title: "Couldn't load your sessions",
      body: "The sessions service didn't respond. Running sessions are unaffected. Try again in a moment.",
    },
  },
  mcp: {
    title: "MCP",
    description:
      "Connect Legba to your agent through the Model Context Protocol.",
  },
  agentSkill: {
    title: "Agent Skill",
    description:
      "Give your agent Legba's private routing and isolated browsing.",
  },
};
