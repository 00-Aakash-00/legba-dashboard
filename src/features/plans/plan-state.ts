import "server-only";

import { unstable_rethrow } from "next/navigation";
import { cache } from "react";
import { getPlanState, type PlanState } from "@/server/services/billing";

export type PlanStateRead =
  | { ok: true; state: PlanState }
  | { ok: false; reference?: string };

/** The Ref id a ServiceError carries (its digest), for support. */
export function referenceOf(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string"
    ? error.digest
    : undefined;
}

/**
 * The plans this account is on, read once per request: every per-user part
 * of the plans page (chips, buttons, the extension status, the error notice)
 * shares one read, so they always agree, and the slow demo waits once, not
 * once per slot. A failure is returned, not thrown: the slots keep their
 * places in an "unknown" state and <PlanStateNotice> says what happened,
 * once, with the retry. Every request reads again, so a refresh that reads
 * successfully clears the notice.
 * Reads the demo cookie: call it only below a <Suspense> boundary.
 */
export const readPlanState = cache(async (): Promise<PlanStateRead> => {
  try {
    return { ok: true, state: await getPlanState() };
  } catch (error) {
    unstable_rethrow(error);
    const reference = referenceOf(error);
    // The reference the notice shows ("Ref LGB-…") is the one support finds here.
    console.error("[plans] plan read failed", reference ?? "", error);
    return { ok: false, reference };
  }
});
