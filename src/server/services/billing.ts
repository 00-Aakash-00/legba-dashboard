import "server-only";

import { ServiceError } from "../errors";
import { requireUser } from "../session";

/**
 * Payments aren't connected in this preview. Fails before any charge could
 * happen, so the UI can say plainly that the user wasn't charged.
 */
export async function topUp(_amountCents: number): Promise<never> {
  await requireUser();
  throw new ServiceError("PAYMENTS_UNAVAILABLE");
}
