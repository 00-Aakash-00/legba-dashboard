"use server";

import { unstable_rethrow } from "next/navigation";
import { billing } from "@/content/copy";
import { ServiceError } from "@/server/errors";
import { topUp } from "@/server/services/billing";
import { requireUser } from "@/server/session";
import { parseAmount } from "./amount";

export type TopUpState =
  | { status: "idle" }
  | { status: "error"; message: string; reference?: string }
  | { status: "success"; cents: number };

/**
 * Tops up the balance. A public endpoint like any Server Action: it checks
 * the session itself and re-reads the amount from the raw field. Every
 * failure is payment-grade: it says the top-up didn't happen and that the
 * user wasn't charged (the service fails before any charge is attempted).
 */
export async function topUpCredits(
  _previous: TopUpState,
  formData: FormData,
): Promise<TopUpState> {
  await requireUser();

  const raw = formData.get("amount");
  const amount = parseAmount(typeof raw === "string" ? raw : "");
  if (!amount.ok) {
    return {
      status: "error",
      message:
        amount.reason === "format"
          ? billing.amountFormat
          : billing.amountInvalid,
    };
  }

  try {
    await topUp(amount.cents);
    return { status: "success", cents: amount.cents };
  } catch (error) {
    unstable_rethrow(error);
    // The reference the user sees ("Ref LGB-…") is the one support finds here.
    console.error("[billing] top-up failed", error);
    if (error instanceof ServiceError) {
      return {
        status: "error",
        message:
          error.code === "PAYMENTS_UNAVAILABLE"
            ? billing.unavailable
            : billing.failed,
        reference: error.ref,
      };
    }
    return { status: "error", message: billing.failed };
  }
}
