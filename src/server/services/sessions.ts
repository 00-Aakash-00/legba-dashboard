import "server-only";

import { getDemoUser } from "../demo";
import { simulate } from "../simulate";

/**
 * Browser sessions started through the Legba API. The placeholder backend
 * has none yet, so this returns an honest empty list (after the demo state's
 * latency/failure behaviour, so the page's states stay reachable).
 */
export type SessionDTO = { id: string; name: string };

export async function listSessions(): Promise<SessionDTO[]> {
  const user = await getDemoUser();
  await simulate(user, "SESSIONS_UNAVAILABLE");
  return [];
}
