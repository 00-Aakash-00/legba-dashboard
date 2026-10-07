import type { NextRequest } from "next/server";

/**
 * True when a request comes from a page on this site. Uses Fetch Metadata
 * (Sec-Fetch-Site) and falls back to the Origin header for browsers that
 * don't send it (Safari < 16.4). Requests with neither (direct navigation,
 * curl) are allowed for GET only by the callers that need it.
 */
export function isCrossSite(request: NextRequest) {
  const site = request.headers.get("sec-fetch-site");
  if (site) return site !== "same-origin" && site !== "none";
  const origin = request.headers.get("origin");
  if (origin === null) return false;
  const hosts = [
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim(),
    request.headers.get("host"),
  ];
  return !(URL.canParse(origin) && hosts.includes(new URL(origin).host));
}
