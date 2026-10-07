import { describe, expect, it } from "vitest";
import { safeNext } from "./safe-next";

describe("safeNext", () => {
  it.each([
    ["/api-keys", "/api-keys"],
    [
      "/subscriptions/sub_1?tab=billing#top",
      "/subscriptions/sub_1?tab=billing#top",
    ],
    ["/", "/"],
    ["/subscriptions/sub_1/../sub_2", "/subscriptions/sub_2"],
  ])("keeps same-origin path %s", (input, expected) => {
    expect(safeNext(input)).toBe(expected);
  });

  it.each([
    [null],
    [undefined],
    [""],
    ["https://evil.example/phish"],
    ["//evil.example"],
    ["/\\evil.example"],
    ["javascript:alert(1)"],
    ["/api-keys\r\nSet-Cookie: x=1"],
    ["/login"],
    ["/login?next=/x"],
    ["/register"],
    ["/auth/reset"],
    ["/_next/static/chunk.js"],
    [`/${"a".repeat(600)}`],
    // Dot segments that normalise to a protocol-relative "//host".
    ["/.//evil.example"],
    ["/..//evil.example"],
    ["/a/..//evil.example/path"],
    ["/%2e//evil.example"],
    ["/%2e%2e//evil.example"],
    ["/api-keys/../..//evil.example"],
    ["/..//evil.example/%2e%2e"],
  ])("falls back to / for %s", (input) => {
    expect(safeNext(input)).toBe("/");
  });
});
