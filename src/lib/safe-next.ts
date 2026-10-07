import type { Route } from "next";

const BASE = "https://app.invalid";

/** Paths a post-login redirect must never land on (they would loop or leak). */
const BLOCKED = [
  "/login",
  "/register",
  "/forgot-password",
  "/sso",
  "/auth",
  "/_next",
];

/**
 * Turns an untrusted `next` value into a same-origin path, or `/`.
 * Rejects absolute and protocol-relative URLs, backslashes, control
 * characters, and auth pages.
 */
export function safeNext(raw: unknown): Route {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 512) {
    return "/";
  }
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  if (/[\\\p{Cc}]/u.test(raw)) return "/";

  let url: URL;
  try {
    url = new URL(raw, BASE);
  } catch {
    return "/";
  }
  if (url.origin !== BASE) return "/";
  if (
    BLOCKED.some(
      (path) => url.pathname === path || url.pathname.startsWith(`${path}/`),
    )
  ) {
    return "/";
  }
  return `${url.pathname}${url.search}${url.hash}` as Route;
}
