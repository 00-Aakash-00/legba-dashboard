import { type NextRequest, NextResponse } from "next/server";
import { isCrossSite } from "@/lib/same-origin";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";
import { store } from "@/server/store";

/**
 * Clears a session whose user no longer exists (the in-memory store was
 * reset) and sends the visitor to sign in again. A healthy session is never
 * cleared by a stray GET. Reading the request keeps this handler dynamic.
 */
export async function GET(request: NextRequest) {
  if (isCrossSite(request)) return new Response(null, { status: 403 });
  const claims = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  if (claims && store.users.has(claims.sub)) {
    return NextResponse.redirect(new URL("/", request.url), 303);
  }
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
