import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieJar = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieJar.has(name) ? { value: cookieJar.get(name) } : undefined,
  }),
}));
// React.cache is a passthrough outside a React server render.
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  cache: <T>(fn: T) => fn,
}));

const { getPlanState, subscribeToPlan, cancelPlan, topUp } = await import(
  "./billing"
);

beforeEach(() => cookieJar.clear());

describe("plans (placeholder billing)", () => {
  it("starts the normal dashboard on the extension plan and Free", async () => {
    cookieJar.set("legba_demo", `normal.${Date.now()}`);
    expect(await getPlanState()).toEqual({
      extension: "active",
      agent: "free",
    });
  });

  it("starts the empty demo with the extension inactive", async () => {
    cookieJar.set("legba_demo", `empty.${Date.now()}`);
    expect((await getPlanState()).extension).toBe("inactive");
  });

  it("subscribes and cancels without touching other workspaces", async () => {
    cookieJar.set("legba_demo", `empty.${Date.now()}`);
    expect(await subscribeToPlan("pro")).toEqual({
      extension: "inactive",
      agent: "pro",
    });
    expect((await subscribeToPlan("extension")).extension).toBe("active");
    expect((await cancelPlan("agent")).agent).toBe("free");
    cookieJar.set("legba_demo", `normal.${Date.now()}`);
    expect((await getPlanState()).agent).toBe("free");
  });

  it("fails top-ups before any charge", async () => {
    await expect(topUp(2500)).rejects.toMatchObject({
      code: "PAYMENTS_UNAVAILABLE",
    });
  });
});
