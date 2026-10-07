import "server-only";

export type PlanId = "ghost" | "shield";
export type SubscriptionStatus = "active" | "paused" | "cancelled";

export type SubscriptionRecord = {
  id: string;
  workspaceId: string;
  plan: PlanId;
  status: SubscriptionStatus;
  vendor: "Legba";
  startedAt: string;
  renewsAt: string;
};

export type ApiKeyRecord = {
  id: string;
  workspaceId: string;
  name: string;
  prefix: string;
  hash: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export type AgentPlanId = "free" | "pro" | "scale" | "enterprise";

/** Which plans the workspace is on. The extension plan covers Ghost and Shield. */
export type PlanState = {
  extension: "active" | "inactive";
  agent: AgentPlanId;
};

type Store = {
  subscriptions: Map<string, SubscriptionRecord[]>;
  apiKeys: Map<string, ApiKeyRecord[]>;
  planState: Map<string, PlanState>;
};

const SCENARIOS = ["normal", "flaky", "slow", "empty"] as const;

/**
 * The placeholder backend's whole database: an in-memory store with one
 * workspace per demo state. It lives on `globalThis` so dev hot reloads keep
 * it; a server restart resets it (single process only).
 */
function createStore(): Store {
  const store: Store = {
    subscriptions: new Map(),
    apiKeys: new Map(),
    planState: new Map(),
  };
  for (const scenario of SCENARIOS) {
    const workspaceId = `demo_${scenario}`;
    const plans: PlanId[] = scenario === "empty" ? [] : ["ghost", "shield"];
    store.subscriptions.set(
      workspaceId,
      plans.map((plan) => ({
        id: `sub_${plan}`,
        workspaceId,
        plan,
        status: "active",
        vendor: "Legba",
        startedAt: "2026-03-02T10:00:00.000Z",
        renewsAt: "2026-11-02T10:00:00.000Z",
      })),
    );
    store.apiKeys.set(workspaceId, []);
    store.planState.set(workspaceId, {
      extension: scenario === "empty" ? "inactive" : "active",
      agent: "free",
    });
  }
  return store;
}

const globalStore = globalThis as typeof globalThis & {
  __legbaStore?: Store;
};

// A store created by an older shape of this module (before the demo
// workspaces) is replaced rather than reused.
export const store: Store =
  globalStore.__legbaStore?.planState instanceof Map
    ? globalStore.__legbaStore
    : createStore();
globalStore.__legbaStore = store;
