import "server-only";

import { setTimeout as sleep } from "node:timers/promises";
import type { DemoUser } from "./demo";
import { ServiceError, type ServiceErrorCode } from "./errors";

/**
 * Applies the demo state's behaviour to a list service: added latency, and a
 * failure window right after login (so error states and retries can be
 * exercised through the real UI). The normal dashboard passes straight through.
 */
export async function simulate(user: DemoUser, failure: ServiceErrorCode) {
  const { latencyMs, failWindowMs } = user.behavior;
  if (latencyMs > 0) await sleep(latencyMs);
  if (failWindowMs > 0 && Date.now() - user.startedAt < failWindowMs) {
    throw new ServiceError(failure);
  }
}
