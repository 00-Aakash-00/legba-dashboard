/*
 * Static, pre-tokenised code samples for the API Documentation card (no
 * Shiki: exact mockup colours, zero runtime; docs/design/decisions.md).
 * curl is the mockup's text verbatim (spec overview.json docs.api.code.line.*);
 * Python and JavaScript send the same request to the same placeholder endpoint.
 */

/** Token colours from the spec: command, flag/plain text, URL and header
 * text, string/punctuation red, line-continuation backslash. */
export type TokenKind = "command" | "plain" | "url" | "string" | "continuation";

export type Token = readonly [TokenKind, string];

/** `indent` is in spaces; they are real characters so a copy keeps them. */
export type CodeLine = { readonly indent: number; readonly tokens: Token[] };

export type CodeSampleId = "curl" | "python" | "javascript";

export const codeSamples: { id: CodeSampleId; lines: CodeLine[] }[] = [
  {
    id: "curl",
    lines: [
      {
        indent: 0,
        tokens: [
          ["command", "curl"],
          ["plain", " -X POST \\"],
        ],
      },
      {
        indent: 2,
        tokens: [
          ["url", "https://api.legba.ai/v1"],
          ["plain", " "],
          ["continuation", "\\"],
        ],
      },
      {
        indent: 2,
        tokens: [
          ["plain", "-H "],
          ["string", '"'],
          ["url", "Authorization: Bearer"],
          ["string", ' ..."'],
        ],
      },
      {
        indent: 2,
        tokens: [
          ["plain", "-d "],
          ["string", '"{"model": "ghost",'],
        ],
      },
      { indent: 5, tokens: [["string", '"prompt": ".."}"']] },
    ],
  },
  {
    id: "python",
    lines: [
      {
        indent: 0,
        tokens: [
          ["command", "import"],
          ["plain", " requests"],
        ],
      },
      {
        indent: 0,
        tokens: [
          ["plain", "r = requests."],
          ["command", "post"],
          ["plain", "("],
          ["string", '"'],
          ["url", "https://api.legba.ai/v1"],
          ["string", '"'],
          ["plain", ","],
        ],
      },
      {
        indent: 2,
        tokens: [
          ["plain", "headers={"],
          ["string", '"'],
          ["url", "Authorization"],
          ["string", '"'],
          ["plain", ": "],
          ["string", '"'],
          ["url", "Bearer"],
          ["string", ' ..."'],
          ["plain", "},"],
        ],
      },
      {
        indent: 2,
        tokens: [
          ["plain", "json={"],
          ["string", '"model": "ghost", "prompt": ".."'],
          ["plain", "})"],
        ],
      },
      {
        indent: 0,
        tokens: [
          ["command", "print"],
          ["plain", "(r."],
          ["command", "json"],
          ["plain", "())"],
        ],
      },
    ],
  },
  {
    id: "javascript",
    lines: [
      {
        indent: 0,
        tokens: [
          ["command", "await fetch"],
          ["plain", "("],
          ["string", '"'],
          ["url", "https://api.legba.ai/v1"],
          ["string", '"'],
          ["plain", ", {"],
        ],
      },
      {
        indent: 2,
        tokens: [
          ["plain", "method: "],
          ["string", '"POST"'],
          ["plain", ","],
        ],
      },
      {
        indent: 2,
        tokens: [
          ["plain", "headers: { Authorization: "],
          ["string", '"'],
          ["url", "Bearer"],
          ["string", ' ..."'],
          ["plain", " },"],
        ],
      },
      {
        indent: 2,
        tokens: [
          ["plain", "body: "],
          ["string", `'{"model": "ghost", "prompt": ".."}'`],
          ["plain", ","],
        ],
      },
      { indent: 0, tokens: [["plain", "});"]] },
    ],
  },
];
