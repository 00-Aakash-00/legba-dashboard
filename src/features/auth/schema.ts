import * as z from "zod";
import { auth } from "@/content/copy";

/**
 * Validation shared by the auth Server Actions (authoritative) and the forms'
 * on-blur checks (instant feedback). One schema per field, so a single field
 * can be checked when the user leaves it.
 */

const { fields: copy } = auth;

// `.trim()` before `.pipe(z.email())`: z.email().trim() validates first.
export const emailField = z
  .string({ error: copy.emailRequired })
  .trim()
  .min(1, { error: copy.emailRequired })
  .max(256, { error: copy.tooLong })
  .pipe(z.email({ error: copy.emailInvalid }));

/** Sign-in only checks presence: existing passwords predate today's rules. */
export const currentPasswordField = z
  .string({ error: copy.passwordRequired })
  .min(1, { error: copy.passwordRequired })
  .max(256, { error: copy.tooLong });

export const passwordRules = {
  length: (value: string) => value.length >= 8,
  mix: (value: string) => /\p{L}/u.test(value) && /\p{N}/u.test(value),
};

export const newPasswordField = z
  .string({ error: copy.passwordRequired })
  .min(1, { error: copy.passwordRequired })
  .max(256, { error: copy.tooLong })
  .refine((value) => passwordRules.length(value) && passwordRules.mix(value), {
    error: copy.passwordWeak,
  });

export const nameField = z
  .string({ error: copy.nameRequired })
  .trim()
  .min(1, { error: copy.nameRequired })
  .max(80, { error: copy.nameTooLong });

export const loginSchema = z.object({
  email: emailField,
  password: currentPasswordField,
});

export const registerSchema = z.object({
  name: nameField,
  email: emailField,
  password: newPasswordField,
});

export const emailSchema = z.object({ email: emailField });

export const providerSchema = z.enum(["google", "github"]);
export type Provider = z.infer<typeof providerSchema>;

export type FieldErrors<K extends string> = Partial<Record<K, string[]>>;

/** The first message of a single-field check, or undefined when valid. */
export function fieldError(schema: z.ZodType, value: unknown) {
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

/** FormData values are `string | File | null`; forms here only send text. */
export function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export type LoginState = {
  fields?: { email: string; remember: boolean };
  fieldErrors?: FieldErrors<"email" | "password">;
  formError?: string;
};

export type RegisterState = {
  fields?: { name: string; email: string };
  fieldErrors?: FieldErrors<"name" | "email" | "password">;
  formError?: string;
};

export type ForgotState = {
  fields?: { email: string };
  fieldErrors?: FieldErrors<"email">;
  formError?: string;
  /** Set once the request is accepted: the form gives way to a confirmation. */
  sentTo?: string;
};

export type SsoState = {
  fields?: { email: string };
  fieldErrors?: FieldErrors<"email">;
  formError?: string;
  /** The outcome of a lookup (not an error in the form). */
  notice?: string;
};

export type ProviderState = {
  provider?: Provider;
  message?: string;
};
