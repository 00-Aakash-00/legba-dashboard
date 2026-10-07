/** Top-up limits in cents ($5 to $10,000). */
export const MIN_CENTS = 500;
export const MAX_CENTS = 1_000_000;

export type AmountResult =
  | { ok: true; cents: number }
  | { ok: false; reason: "format" | "range" };

/**
 * Reads an amount the way people type it: "25", "$25", "25.00", "1,000",
 * "25 USD". Shared by the form (validation on blur) and the Server Action
 * (the server normalises whatever the field held).
 */
export function parseAmount(input: string): AmountResult {
  const cleaned = input
    .trim()
    .replace(/^\$\s*/, "")
    .replace(/\s*(\$|usd)$/i, "")
    .replaceAll(",", "");
  const match = /^(\d{1,7})(?:\.(\d{0,2}))?$/.exec(cleaned);
  if (!match) return { ok: false, reason: "format" };
  const cents =
    Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  if (cents < MIN_CENTS || cents > MAX_CENTS) {
    return { ok: false, reason: "range" };
  }
  return { ok: true, cents };
}

/** "$25" for whole dollars, "$25.50" otherwise. */
export function formatAmount(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
