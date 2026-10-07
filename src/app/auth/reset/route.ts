import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-token";

/**
 * Clears a session whose user no longer exists (the in-memory store was
 * reset) and sends the visitor to sign in again. Reading the request keeps
 * this handler dynamic under Cache Components.
 */
export function GET(request: NextRequest) {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") {
    return new Response(null, { status: 403 });
  }
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
