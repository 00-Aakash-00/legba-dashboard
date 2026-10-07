"use server";

import { unstable_rethrow } from "next/navigation";
import * as z from "zod";
import { cancelPlan, subscribeToPlan } from "@/server/services/billing";
import { referenceOf } from "./plan-state";

export type PlanActionResult = { ok: true } | { ok: false; reference?: string };

const SwitchablePlan = z.enum(["free", "pro", "scale"]);

export type SwitchablePlanId = z.infer<typeof SwitchablePlan>;

/**
 * Runs one placeholder billing call. On success the caller refreshes the
 * page (router.refresh) in the transition that closes its dialog, so the
 * dialog closes onto the new plan. A refresh() here would render the page a
 * second time, and in a production build its payload never reaches the page
 * when the plan read is instant. On failure nothing changed: the service
 * fails before anything could be charged, so the dialog can say so.
 */
async function run(
  label: string,
  change: () => Promise<unknown>,
): Promise<PlanActionResult> {
  try {
    await change();
  } catch (error) {
    unstable_rethrow(error);
    const reference = referenceOf(error);
    // The reference the user sees ("Ref LGB-…") is the one support finds here.
    console.error(`[plans] ${label} failed`, reference ?? "", error);
    return { ok: false, reference };
  }
  return { ok: true };
}

/**
 * Moves the account to an agent plan. A public endpoint like any Server
 * Action, so the plan id is validated here. Free is the absence of a paid
 * plan, so moving to Free cancels the agent plan. Enterprise is sold by
 * contract and never switched to here.
 */
export async function switchAgentPlan(
  plan: SwitchablePlanId,
): Promise<PlanActionResult> {
  const parsed = SwitchablePlan.safeParse(plan);
  if (!parsed.success) return { ok: false };
  const id = parsed.data;
  return run(`switch to ${id}`, () =>
    id === "free" ? cancelPlan("agent") : subscribeToPlan(id),
  );
}

/** Starts the Chrome extension plan (Ghost and Shield) on its free trial. */
export async function startExtensionTrial(): Promise<PlanActionResult> {
  return run("extension trial", () => subscribeToPlan("extension"));
}

/** Cancels the Chrome extension plan. */
export async function cancelExtensionPlan(): Promise<PlanActionResult> {
  return run("extension cancel", () => cancelPlan("extension"));
}
