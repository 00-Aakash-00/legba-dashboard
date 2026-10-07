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

const { listSubscriptions } = await import("./subscriptions");
const { subscribeToPlan, cancelPlan } = await import("./billing");

beforeEach(() => cookieJar.clear());

describe("subscriptions (every plan, with its status)", () => {
  it("lists the normal demo's plans in order: two active, the agent plan on Free", async () => {
    cookieJar.set("legba_demo", `normal.${Date.now()}`);
    expect(await listSubscriptions()).toEqual([
      { plan: "ghost", status: "active" },
      { plan: "shield", status: "active" },
      { plan: "agent", status: "free", tier: "free" },
    ]);
  });

  it("follows the plans the workspace is on", async () => {
    // The flaky demo's workspace, past its failure window: no other test uses it.
    cookieJar.set("legba_demo", "flaky.1");
    await cancelPlan("extension");
    await cancelPlan("agent");
    expect(await listSubscriptions()).toEqual([
      { plan: "ghost", status: "inactive" },
      { plan: "shield", status: "inactive" },
      { plan: "agent", status: "free", tier: "free" },
    ]);

    await subscribeToPlan("extension");
    await subscribeToPlan("scale");
    expect(await listSubscriptions()).toEqual([
      { plan: "ghost", status: "active" },
      { plan: "shield", status: "active" },
      { plan: "agent", status: "active", tier: "scale" },
    ]);

    // Back to the demo's starting plans.
    await cancelPlan("agent");
  });

  it("fails like the plan read, never with an empty list", async () => {
    cookieJar.set("legba_demo", `flaky.${Date.now()}`);
    await expect(listSubscriptions()).rejects.toMatchObject({
      code: "SUBSCRIPTIONS_UNAVAILABLE",
    });
  });
});
