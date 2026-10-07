import { afterEach, describe, expect, it, vi } from "vitest";
import { signSessionToken, verifySessionToken } from "./session-token";

const user = { id: "usr_1", name: "Jane Doe", email: "jane@demo.gmail.com" };

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("session token", () => {
  it("round-trips the user claims", async () => {
    const token = await signSessionToken(user, 60);
    const claims = await verifySessionToken(token);
    expect(claims?.sub).toBe("usr_1");
    expect(claims?.email).toBe("jane@demo.gmail.com");
    expect(typeof claims?.iat).toBe("number");
  });

  it("rejects missing, tampered and foreign tokens", async () => {
    const token = await signSessionToken(user, 60);
    expect(await verifySessionToken(undefined)).toBeNull();
    expect(await verifySessionToken(`${token.slice(0, -2)}xx`)).toBeNull();
    vi.stubEnv("SESSION_SECRET", "another-secret-that-is-also-32-chars-long");
    expect(await verifySessionToken(token)).toBeNull();
  });

  it("rejects expired tokens", async () => {
    const token = await signSessionToken(user, 60);
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 61_000);
    expect(await verifySessionToken(token)).toBeNull();
  });

  it("refuses to sign without a strong secret", async () => {
    vi.stubEnv("SESSION_SECRET", "short");
    await expect(signSessionToken(user, 60)).rejects.toThrow(/SESSION_SECRET/);
  });
});
