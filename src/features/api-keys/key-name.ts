import { apiKeys } from "@/content/copy";

/** Longest key name the backend accepts. */
export const KEY_NAME_MAX = 64;

/** The live counter appears once a name is this long (near the limit). */
export const KEY_NAME_COUNTER_FROM = 48;

/**
 * The key-name rule, shared by the form (validate on blur, clear on fix) and
 * the createKey action's zod schema, so both judge the same trimmed value.
 * Returns the message to show, or null when the name is valid.
 */
export function keyNameError(raw: string): string | null {
  const name = raw.trim();
  if (name.length === 0) return apiKeys.dialog.nameRequired;
  if (name.length > KEY_NAME_MAX) return apiKeys.dialog.nameTooLong;
  return null;
}
