/*
 * Static, pre-tokenised code samples for the API Documentation card (no
 * Shiki: exact mockup colours, zero runtime; docs/design/decisions.md).
 * Each language is the website's create-instance call, the request the
 * Sessions page shows in full (src/features/developers/samples.ts):
 * Website/Legba/app/developers/api/quickstart/page.tsx, "Step 2: Create a
 * Browser Instance", and the same request in app/developers/api/instances/
 * page.tsx. Condensed to the mockup's five lines; the endpoint, headers and
 * body are unchanged. The host and org are placeholders: the API is a preview.
 */

/** Token colours from the spec: command, flag/plain text, URL and header
 * text, string/punctuation red, line-continuation backslash. */
export type TokenKind = "command" | "plain" | "url" | "string" | "continuation";

export type Token = readonly [TokenKind, string];

/** `indent` is in spaces; they are real characters so a copy keeps them. */
export type CodeLine = { readonly indent: number; readonly tokens: Token[] };

export type CodeSampleId = "curl" | "python" | "javascript";

const ENDPOINT = "https://{your-api-host}/orgs/{org_uuid}/api/instances";
const TOKEN = "Bearer YOUR_API_TOKEN";
const JSON_TYPE = "application/json";

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
          ["string", '"'],
          ["url", ENDPOINT],
          ["string", '"'],
          ["plain", " "],
          ["continuation", "\\"],
        ],
      },
      {
        indent: 2,
        tokens: [
          ["plain", "-H "],
          ["string", '"'],
          ["url", `Authorization: ${TOKEN}`],
          ["string", '"'],
          ["plain", " "],
          ["continuation", "\\"],
        ],
      },
      {
        indent: 2,
        tokens: [
          ["plain", "-H "],
          ["string", '"'],
          ["url", `Content-Type: ${JSON_TYPE}`],
          ["string", '"'],
          ["plain", " "],
          ["continuation", "\\"],
        ],
      },
      {
        indent: 2,
        tokens: [
          ["plain", "-d "],
          ["string", `'{"image": "ubuntu-20.04", "size": "small"}'`],
        ],
      },
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
          ["plain", "response = requests."],
          ["command", "post"],
          ["plain", "("],
        ],
      },
      {
        indent: 2,
        tokens: [
          ["string", "'"],
          ["url", ENDPOINT],
          ["string", "'"],
          ["plain", ","],
        ],
      },
      {
        indent: 2,
        tokens: [
          ["plain", "headers={"],
          ["string", "'"],
          ["url", "Authorization"],
          ["string", "'"],
          ["plain", ": "],
          ["string", "'"],
          ["url", TOKEN],
          ["string", "'"],
          ["plain", ", "],
          ["string", "'"],
          ["url", "Content-Type"],
          ["string", "'"],
          ["plain", ": "],
          ["string", "'"],
          ["url", JSON_TYPE],
          ["string", "'"],
          ["plain", "},"],
        ],
      },
      {
        indent: 2,
        tokens: [
          ["plain", "json={"],
          ["string", "'image': 'ubuntu-20.04', 'size': 'small'"],
          ["plain", "})"],
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
          ["command", "const"],
          ["plain", " response = "],
          ["command", "await fetch"],
          ["plain", "("],
          ["string", "'"],
          ["url", ENDPOINT],
          ["string", "'"],
          ["plain", ", {"],
        ],
      },
      {
        indent: 2,
        tokens: [
          ["plain", "method: "],
          ["string", "'POST'"],
          ["plain", ","],
        ],
      },
      {
        indent: 2,
        tokens: [
          ["plain", "headers: { "],
          ["string", "'"],
          ["url", "Authorization"],
          ["string", "'"],
          ["plain", ": "],
          ["string", "'"],
          ["url", TOKEN],
          ["string", "'"],
          ["plain", ", "],
          ["string", "'"],
          ["url", "Content-Type"],
          ["string", "'"],
          ["plain", ": "],
          ["string", "'"],
          ["url", JSON_TYPE],
          ["string", "'"],
          ["plain", " },"],
        ],
      },
      {
        indent: 2,
        tokens: [
          ["plain", "body: JSON."],
          ["command", "stringify"],
          ["plain", "({ image: "],
          ["string", "'ubuntu-20.04'"],
          ["plain", ", size: "],
          ["string", "'small'"],
          ["plain", " }),"],
        ],
      },
      { indent: 0, tokens: [["plain", "});"]] },
    ],
  },
];
