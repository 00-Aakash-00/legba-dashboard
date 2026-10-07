/*
 * Code shown on the developer pages. None of it is live yet, and the pages
 * label it Preview (docs/design/decisions.md, "Preview content"): swap in the
 * real host, config and command before launch.
 *
 * The create-session samples are the website's API quickstart, verbatim
 * (Website/Legba/app/developers/api/quickstart/page.tsx, step 2). The MCP
 * config is the illustrative config the user approved; Legba does not
 * publish a public MCP server.
 */

export type CodeSampleId = "curl" | "javascript" | "python";

export const createSessionSamples: { id: CodeSampleId; code: string }[] = [
  {
    id: "curl",
    code: `curl -X POST "https://{your-api-host}/orgs/{org_uuid}/api/instances" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image": "ubuntu-20.04",
    "size": "small"
  }'`,
  },
  {
    id: "javascript",
    code: `const response = await fetch(
  'https://{your-api-host}/orgs/{org_uuid}/api/instances',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_TOKEN',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: 'ubuntu-20.04',
      size: 'small',
    }),
  }
);

const instance = await response.json();
console.log('Instance created:', instance);`,
  },
  {
    id: "python",
    code: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json',
}

data = {
    'image': 'ubuntu-20.04',
    'size': 'small',
}

response = requests.post(
    'https://{your-api-host}/orgs/{org_uuid}/api/instances',
    headers=headers,
    json=data
)

instance = response.json()
print('Instance created:', instance)`,
  },
];

export type McpClientId = "claudeCode" | "cursor";

/**
 * Claude Code takes a command; Cursor takes this JSON in its mcp.json (a
 * remote server by url and headers). Claude Desktop's config file takes local
 * (command) servers, not this shape, so it has no tab.
 */
export const mcpConfigs: { id: McpClientId; code: string }[] = [
  {
    id: "claudeCode",
    code: `claude mcp add --transport http legba https://{your-mcp-host}/mcp \\
  --header "Authorization: Bearer YOUR_API_KEY"`,
  },
  {
    id: "cursor",
    code: `{
  "mcpServers": {
    "legba": {
      "url": "https://{your-mcp-host}/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}`,
  },
];

/** Placeholder until the skill is published. */
export const INSTALL_COMMAND = "npx skills add legba/agent-skill";
