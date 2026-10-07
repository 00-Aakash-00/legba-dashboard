"use server";

import { RedirectType, redirect } from "next/navigation";
import * as z from "zod";
import { auth } from "@/content/copy";
import { safeNext } from "@/lib/safe-next";
import { ServiceError } from "@/server/errors";
import { registerUser, verifyCredentials } from "@/server/services/auth";
import { createSession } from "@/server/session";
import {
  emailSchema,
  type ForgotState,
  type LoginState,
  loginSchema,
  type ProviderState,
  providerSchema,
  type RegisterState,
  registerSchema,
  type SsoState,
  text,
} from "./schema";

/*
 * The auth actions are public endpoints by design (nobody is signed in yet),
 * so each one validates everything it reads and trusts nothing from the
 * client. They return field values with every result so the email (and the
 * remember choice) survive a form reset.
 */

export async function login(formData: FormData): Promise<LoginState> {
  const fields = {
    email: text(formData.get("email")),
    remember: formData.get("remember") === "on",
  };
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fields, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  // One message for an unknown email and a wrong password: no enumeration.
  if (!user) return { fields, formError: auth.login.invalid };

  await createSession(user, fields.remember);
  // Outside any try/catch: redirect() throws to hand control to the router.
  redirect(safeNext(formData.get("next")), RedirectType.replace);
}

export async function register(formData: FormData): Promise<RegisterState> {
  const fields = {
    name: text(formData.get("name")),
    email: text(formData.get("email")),
  };
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fields, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  let user: Awaited<ReturnType<typeof registerUser>>;
  try {
    user = await registerUser(parsed.data);
  } catch (error) {
    if (error instanceof ServiceError && error.code === "EMAIL_TAKEN") {
      return { fields, fieldErrors: { email: [auth.register.emailTaken] } };
    }
    throw error;
  }

  // A new account gets a browser-session cookie; "Remember me" is a sign-in choice.
  await createSession(user, false);
  redirect("/", RedirectType.replace);
}

export async function requestPasswordReset(
  formData: FormData,
): Promise<ForgotState> {
  const fields = { email: text(formData.get("email")) };
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fields, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  // The placeholder backend has no mail service. The answer is the same
  // whether or not an account exists, so it never reveals who has one.
  return { fields, sentTo: parsed.data.email };
}

export async function findSsoConnection(formData: FormData): Promise<SsoState> {
  const fields = { email: text(formData.get("email")) };
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fields, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  // No organization has SSO configured in the placeholder backend.
  const domain = parsed.data.email.split("@")[1] ?? parsed.data.email;
  return { fields, notice: auth.sso.notConfigured(domain.toLowerCase()) };
}

export async function signInWithProvider(
  provider: unknown,
): Promise<ProviderState> {
  const parsed = providerSchema.safeParse(provider);
  if (!parsed.success) return {};
  const name = parsed.data === "google" ? auth.login.google : auth.login.github;
  return {
    provider: parsed.data,
    message: auth.login.providerUnavailable(name),
  };
}
