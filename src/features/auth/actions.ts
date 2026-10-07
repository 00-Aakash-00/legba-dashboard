"use server";

import { RedirectType, redirect } from "next/navigation";
import { scenarioForEmail, startDemo } from "@/server/demo";
import type { ForgotState } from "./schema";
import { text } from "./schema";

/*
 * The login screens are placeholders (user decision, 2026-10-07): there is no
 * authentication, so any username/password continues to the dashboard. The
 * only thing remembered is the demo state: typing one of the documented demo
 * emails (see AGENTS.md) shows the empty, error-then-retry or slow dashboard.
 */

export async function login(formData: FormData) {
  await startDemo(scenarioForEmail(formData.get("email")));
  // Outside any try/catch: redirect() throws to hand control to the router.
  redirect("/", RedirectType.replace);
}

export async function register(formData: FormData) {
  await startDemo(scenarioForEmail(formData.get("email")));
  redirect("/", RedirectType.replace);
}

export async function continueWithProvider() {
  await startDemo("normal");
  redirect("/", RedirectType.replace);
}

export async function continueWithSso(formData: FormData) {
  await startDemo(scenarioForEmail(formData.get("email")));
  redirect("/", RedirectType.replace);
}

/** No mail is sent: the confirmation simply echoes what was typed. */
export async function requestPasswordReset(
  formData: FormData,
): Promise<ForgotState> {
  const email = text(formData.get("email")).trim();
  return { fields: { email }, sentTo: email };
}
