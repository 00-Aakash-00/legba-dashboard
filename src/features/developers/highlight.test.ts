import { describe, expect, it } from "vitest";
import { highlight, type Token, type TokenKind } from "./highlight";
import { createSessionSamples, INSTALL_COMMAND, mcpConfigs } from "./samples";

const join = (lines: Token[][]) =>
  lines.map((tokens) => tokens.map(([, text]) => text).join("")).join("\n");

const kindsOf = (code: string, kind: TokenKind) =>
  highlight(code)
    .flat()
    .filter(([k]) => k === kind)
    .map(([, text]) => text);

describe("highlight", () => {
  const samples = [
    ...createSessionSamples,
    ...mcpConfigs,
    { id: "install", code: INSTALL_COMMAND },
  ];

  it.each(samples)("gives $id back unchanged", ({ code }) => {
    expect(join(highlight(code))).toBe(code);
  });

  it("marks every placeholder, inside URLs and strings too", () => {
    const [curl] = createSessionSamples;
    expect(kindsOf(curl.code, "placeholder")).toEqual([
      "{your-api-host}",
      "{org_uuid}",
      "YOUR_API_TOKEN",
    ]);
    const [claudeCode, json] = mcpConfigs;
    expect(kindsOf(claudeCode.code, "placeholder")).toEqual([
      "{your-mcp-host}",
      "YOUR_API_KEY",
    ]);
    expect(kindsOf(json.code, "placeholder")).toEqual([
      "{your-mcp-host}",
      "YOUR_API_KEY",
    ]);
  });

  it("tells keys, strings, commands and continuations apart", () => {
    const [curl] = createSessionSamples;
    expect(kindsOf(curl.code, "command")).toEqual(["curl"]);
    expect(kindsOf(curl.code, "key")).toEqual(['"image"', '"size"']);
    expect(kindsOf(curl.code, "continuation")).toHaveLength(3);
    expect(kindsOf(INSTALL_COMMAND, "command")).toEqual(["npx"]);
    expect(kindsOf('print("a: b")', "key")).toEqual([]);
    expect(kindsOf('print("a: b")', "string")).toEqual(['"a: b"']);
  });
});
