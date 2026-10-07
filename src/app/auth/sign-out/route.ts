import { type NextRequest, NextResponse } from "next/server";
import { isCrossSite } from "@/lib/same-origin";
import { DEMO_COOKIE } from "@/server/demo";

/**
 * "Sign out" of the placeholder: clears the demo state and returns to the
 * login screen with a full page load. There is no session to end.
 */
export function POST(request: NextRequest) {
  if (isCrossSite(request)) return new Response(null, { status: 403 });
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.delete(DEMO_COOKIE);
  return response;
}
