import { type NextRequest, NextResponse } from "next/server";
import { safeNext } from "@/lib/safe-next";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";

const AUTH_PAGES = new Set(["/login", "/register", "/forgot-password", "/sso"]);

/**
 * Optimistic gate for navigations and prefetches. Server Actions POST to the
 * page URL and authorize themselves through requireUser(); redirecting them
 * here would break the action response, so only GET/HEAD are gated.
 */
export async function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;
  // Session route handlers (reset, sign-out) work in either state.
  if (pathname.startsWith("/auth/")) return NextResponse.next();

  const isAuthPage = AUTH_PAGES.has(pathname);
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (!session && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    if (pathname !== "/") url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }
  if (session && isAuthPage) {
    const target = new URL(
      safeNext(request.nextUrl.searchParams.get("next")),
      request.url,
    );
    // Defence in depth: never redirect off-origin, whatever safeNext returns.
    return NextResponse.redirect(
      target.origin === request.nextUrl.origin
        ? target
        : new URL("/", request.url),
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon|apple-icon|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|.*\\.(?:png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|txt|xml|map|json)$).*)",
  ],
};
