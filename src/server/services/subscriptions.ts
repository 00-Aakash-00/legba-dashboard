import "server-only";

import { requireUser } from "../session";
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

/** The signed-in user's subscriptions. Throws ServiceError; never returns [] on failure. */
export async function listSubscriptions(): Promise<SubscriptionDTO[]> {
  const user = await requireUser();
  await simulate(user, "SUBSCRIPTIONS_UNAVAILABLE");
  return (store.subscriptions.get(user.id) ?? []).map(toDTO);
}

/** One of the signed-in user's subscriptions, or null when it isn't theirs. */
export async function getSubscription(
  id: string,
): Promise<SubscriptionDTO | null> {
  const user = await requireUser();
  await simulate(user, "SUBSCRIPTIONS_UNAVAILABLE");
  const record = (store.subscriptions.get(user.id) ?? []).find(
    (subscription) => subscription.id === id,
  );
  return record ? toDTO(record) : null;
}
