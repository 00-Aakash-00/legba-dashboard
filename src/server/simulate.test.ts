import { describe, expect, it } from "vitest";
import { ServiceError } from "./errors";
import type { SessionUser } from "./session";
import { simulate } from "./simulate";

const base: SessionUser = {
  id: "usr_x",
  name: "X",
  email: "x@example.com",
  signedInAt: Date.now(),
  behavior: { latencyMs: 0, failWindowMs: 0 },
};

describe("simulate", () => {
  it("passes normal users straight through", async () => {
    await expect(
      simulate(base, "SUBSCRIPTIONS_UNAVAILABLE"),
    ).resolves.toBeUndefined();
  });

  it("fails inside the failure window with a referenced ServiceError", async () => {
    const flaky = { ...base, behavior: { latencyMs: 0, failWindowMs: 6000 } };
    const error = await simulate(flaky, "SUBSCRIPTIONS_UNAVAILABLE").catch(
      (e) => e,
    );
    expect(error).toBeInstanceOf(ServiceError);
    expect(error.code).toBe("SUBSCRIPTIONS_UNAVAILABLE");
    expect(error.digest).toMatch(/^LGB-[0-9A-F]{8}$/);
  });

  it("recovers once the window has passed", async () => {
    const flaky = {
      ...base,
      signedInAt: Date.now() - 7000,
      behavior: { latencyMs: 0, failWindowMs: 6000 },
    };
    await expect(
      simulate(flaky, "SUBSCRIPTIONS_UNAVAILABLE"),
    ).resolves.toBeUndefined();
  });

  it("adds the persona's latency", async () => {
    const slow = { ...base, behavior: { latencyMs: 120, failWindowMs: 0 } };
    const started = performance.now();
    await simulate(slow, "SUBSCRIPTIONS_UNAVAILABLE");
    expect(performance.now() - started).toBeGreaterThanOrEqual(110);
  });
});
