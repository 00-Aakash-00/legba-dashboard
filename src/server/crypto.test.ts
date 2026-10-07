import { describe, expect, it } from "vitest";
import { generateApiKey } from "./crypto";

describe("api keys", () => {
  it("mints lgba_ keys with a display prefix and a sha256 hash", () => {
    const key = generateApiKey();
    expect(key.secret).toMatch(/^lgba_[A-Za-z0-9_-]{43}$/);
    expect(key.prefix).toBe(key.secret.slice(0, 11));
    expect(key.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(generateApiKey().secret).not.toBe(key.secret);
  });
});
