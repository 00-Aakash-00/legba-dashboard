import "server-only";

import { setTimeout as sleep } from "node:timers/promises";
import { ServiceError, type ServiceErrorCode } from "./errors";
import type { SessionUser } from "./session";

/**
 * Applies the signed-in persona's behaviour to a list service: added latency,
 * and a failure window right after sign-in (so error states and retries can
 * be exercised through the real UI). Normal users pass straight through.
 */
export async function simulate(user: SessionUser, failure: ServiceErrorCode) {
  const { latencyMs, failWindowMs } = user.behavior;
  if (latencyMs > 0) await sleep(latencyMs);
  if (failWindowMs > 0 && Date.now() - user.signedInAt < failWindowMs) {
    throw new ServiceError(failure);
  }
}
