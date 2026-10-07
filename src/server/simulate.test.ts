import { describe, expect, it } from "vitest";
import type { DemoUser } from "./demo";
import { ServiceError } from "./errors";
import { simulate } from "./simulate";

const base: DemoUser = {
  workspaceId: "demo_normal",
  scenario: "normal",
  behavior: { latencyMs: 0, failWindowMs: 0 },
  startedAt: Date.now(),
};

describe("simulate", () => {
  it("passes the normal dashboard straight through", async () => {
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
      startedAt: Date.now() - 7000,
      behavior: { latencyMs: 0, failWindowMs: 6000 },
    };
    await expect(
      simulate(flaky, "SUBSCRIPTIONS_UNAVAILABLE"),
    ).resolves.toBeUndefined();
  });

  it("adds the demo state's latency", async () => {
    const slow = { ...base, behavior: { latencyMs: 120, failWindowMs: 0 } };
    const started = performance.now();
    await simulate(slow, "SUBSCRIPTIONS_UNAVAILABLE");
    expect(performance.now() - started).toBeGreaterThanOrEqual(110);
  });
});
