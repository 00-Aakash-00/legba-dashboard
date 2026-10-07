import "server-only";

import { getDemoUser } from "../demo";
import { ServiceError } from "../errors";
import { simulate } from "../simulate";
import { type AgentPlanId, type PlanState, store } from "../store";

export type { AgentPlanId, PlanState };

const DEFAULT_STATE: PlanState = { extension: "inactive", agent: "free" };

/** Which plans the workspace is on. Throws ServiceError like any list read. */
export async function getPlanState(): Promise<PlanState> {
  const user = await getDemoUser();
  await simulate(user, "SUBSCRIPTIONS_UNAVAILABLE");
  return store.planState.get(user.workspaceId) ?? DEFAULT_STATE;
}

/**
 * Placeholder subscribe: no payment provider is connected, so nothing is
 * charged; the plan simply becomes the workspace's plan. Enterprise is sold
 * by contract (the UI links to contact instead).
 */
export async function subscribeToPlan(
  plan: "extension" | Exclude<AgentPlanId, "enterprise">,
): Promise<PlanState> {
  const user = await getDemoUser();
  await simulate(user, "PAYMENTS_UNAVAILABLE");
  const current = store.planState.get(user.workspaceId) ?? DEFAULT_STATE;
  const next: PlanState =
    plan === "extension"
      ? { ...current, extension: "active" }
      : { ...current, agent: plan };
  store.planState.set(user.workspaceId, next);
  return next;
}

/** Placeholder cancel for the extension plan (the agent plan drops to Free). */
export async function cancelPlan(
  plan: "extension" | "agent",
): Promise<PlanState> {
  const user = await getDemoUser();
  await simulate(user, "PAYMENTS_UNAVAILABLE");
  const current = store.planState.get(user.workspaceId) ?? DEFAULT_STATE;
  const next: PlanState =
    plan === "extension"
      ? { ...current, extension: "inactive" }
      : { ...current, agent: "free" };
  store.planState.set(user.workspaceId, next);
  return next;
}

/**
 * Payments aren't connected in this preview. Fails before any charge could
 * happen, so the UI can say plainly that the user wasn't charged.
 */
export async function topUp(_amountCents: number): Promise<never> {
  throw new ServiceError("PAYMENTS_UNAVAILABLE");
}
