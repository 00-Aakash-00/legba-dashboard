import { describe, expect, it } from "vitest";
import { generateApiKey, hashPassword, verifyPassword } from "./crypto";

describe("passwords", () => {
  it("verifies the right password and rejects others", async () => {
    const stored = await hashPassword("1234567");
    expect(await verifyPassword("1234567", stored)).toBe(true);
    expect(await verifyPassword("1234568", stored)).toBe(false);
    expect(await verifyPassword("", stored)).toBe(false);
  });

  it("salts every hash", async () => {
    const a = await hashPassword("same");
    const b = await hashPassword("same");
    expect(a.salt).not.toBe(b.salt);
    expect(a.hash).not.toBe(b.hash);
  });
});

describe("api keys", () => {
  it("mints lgba_ keys with a display prefix and a sha256 hash", () => {
    const key = generateApiKey();
    expect(key.secret).toMatch(/^lgba_[A-Za-z0-9_-]{43}$/);
    expect(key.prefix).toBe(key.secret.slice(0, 11));
    expect(key.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(generateApiKey().secret).not.toBe(key.secret);
  });
});
