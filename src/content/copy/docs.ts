// Docs-card strings. Owned by the overview builder.

export const overviewDocs = {
  skill: {
    title: "Install the agent skill",
    body: "Give your agent routing and isolated browser sessions.",
    /** The command panel's header label: the command (INSTALL_COMMAND in
     * features/developers/samples.ts) is not published yet. */
    label: "Placeholder command",
    /** Spoken after "Copy" so the button names what it copies, and in the
     * confirmation. Copy, Copied and the failure note are the app's shared
     * strings (workspace.copy). */
    copyName: "Install command",
    cta: "Explore",
    /** Spoken after "Explore": the link opens the Agent Skill page. */
    ctaContext: "the agent skill",
    art: "A stack of document cards that parts to reveal a folded page with ruled text.",
  },
  api: {
    title: "API Documentation",
    body: "Review the browser API preview and its examples.",
    cta: "Explore",
    codeLabel: "Code sample",
    tabsLabel: "Code sample language",
    languages: { curl: "curl", python: "Python", javascript: "JavaScript" },
  },
  opensInNewTab: "(opens in a new tab)",
};
