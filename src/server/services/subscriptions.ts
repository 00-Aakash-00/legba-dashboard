import "server-only";

import { getDemoUser } from "../demo";
import { simulate } from "../simulate";
import { type SubscriptionRecord, store } from "../store";

export type SubscriptionDTO = Pick<
  SubscriptionRecord,
  "id" | "plan" | "status" | "vendor" | "startedAt" | "renewsAt"
>;

function toDTO(record: SubscriptionRecord): SubscriptionDTO {
  const { id, plan, status, vendor, startedAt, renewsAt } = record;
  return { id, plan, status, vendor, startedAt, renewsAt };
}

/** The workspace's subscriptions. Throws ServiceError; never returns [] on failure. */
export async function listSubscriptions(): Promise<SubscriptionDTO[]> {
  const user = await getDemoUser();
  await simulate(user, "SUBSCRIPTIONS_UNAVAILABLE");
  return (store.subscriptions.get(user.workspaceId) ?? []).map(toDTO);
}

/** One of the workspace's subscriptions, or null when it doesn't exist. */
export async function getSubscription(
  id: string,
): Promise<SubscriptionDTO | null> {
  const user = await getDemoUser();
  await simulate(user, "SUBSCRIPTIONS_UNAVAILABLE");
  const record = (store.subscriptions.get(user.workspaceId) ?? []).find(
    (subscription) => subscription.id === id,
  );
  return record ? toDTO(record) : null;
}
