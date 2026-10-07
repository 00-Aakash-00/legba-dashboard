/**
 * Form data shapes shared by the auth Server Actions and forms. There is no
 * validation: the screens are placeholders and accept any input (user
 * decision, 2026-10-07).
 */

/** FormData values are `string | File | null`; forms here only send text. */
export function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export type ForgotState = {
  fields?: { email: string };
  /** What was typed (possibly empty): the form gives way to a confirmation. */
  sentTo?: string;
};
