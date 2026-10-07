import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-token";

/**
 * Sign-out is a native form POST so the browser does a full page load: no
 * client state from the signed-in session survives in hidden routes.
 */
export function POST(request: NextRequest) {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") {
    return new Response(null, { status: 403 });
  }
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
