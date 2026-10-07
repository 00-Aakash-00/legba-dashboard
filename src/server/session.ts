import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import {
  SESSION_COOKIE,
  signSessionToken,
  verifySessionToken,
} from "@/lib/session-token";
import type { PersonaBehavior } from "./personas";
import { store } from "./store";

const SHORT_TTL_SECONDS = 12 * 60 * 60; // browser-session cookie, 12h token
const REMEMBER_TTL_SECONDS = 30 * 24 * 60 * 60;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  /** When this session was issued, in ms (drives persona behaviour). */
  signedInAt: number;
  behavior: PersonaBehavior;
};

/** Server Actions and Route Handlers only: cookies can't be set during render. */
export async function createSession(
  user: { id: string; name: string; email: string },
  remember: boolean,
) {
  const ttl = remember ? REMEMBER_TTL_SECONDS : SHORT_TTL_SECONDS;
  const token = await signSessionToken(user, ttl);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    // Without maxAge the cookie ends with the browser session.
    ...(remember ? { maxAge: REMEMBER_TTL_SECONDS } : {}),
  });
}

/** Request-memoised session read. Call only below a <Suspense> boundary. */
export const getSession = cache(async () =>
  verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value),
);

/**
 * The data-access gate. Every service and Server Action calls this itself
 * (the proxy is only an optimistic redirect for navigations).
 */
export const requireUser = cache(async (): Promise<SessionUser> => {
  const claims = await getSession();
  if (!claims) redirect("/login");
  const user = store.users.get(claims.sub);
  // A valid token for a user the in-memory store no longer has (the server
  // restarted): clear the cookie instead of bouncing between proxy and here.
  if (!user) redirect("/auth/reset");
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    signedInAt: claims.iat * 1000,
    behavior: user.behavior,
  };
});
