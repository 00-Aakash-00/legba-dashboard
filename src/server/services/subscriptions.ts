import "server-only";

import { type AgentPlanId, getPlanState } from "./billing";

/**
 * One card on the overview's "Your subscriptions" panel. Every plan is always
 * listed, with its status: Ghost and Shield are both the Chrome extension
 * plan (active or inactive); every account has an agent plan, Free until it
 * moves to a paid one.
 */
export type SubscriptionDTO =
  | { plan: "ghost" | "shield"; status: "active" | "inactive" }
  | { plan: "agent"; status: "active" | "free"; tier: AgentPlanId };

/**
 * Every plan with the workspace's status on it, in the panel's order. Derived
 * from the plan state that /plans changes, so the panel always agrees with it.
 * Throws ServiceError; never returns [] on failure.
 */
export async function listSubscriptions(): Promise<SubscriptionDTO[]> {
  const { extension, agent } = await getPlanState();
  return [
    { plan: "ghost", status: extension },
    { plan: "shield", status: extension },
    {
      plan: "agent",
      status: agent === "free" ? "free" : "active",
      tier: agent,
    },
  ];
}
