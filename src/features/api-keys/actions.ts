"use server";

import { refresh } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { apiKeys } from "@/content/copy";
import { createApiKey, revokeApiKey } from "@/server/services/api-keys";
import { requireUser } from "@/server/session";
import { KeyIdSchema, KeyNameSchema } from "./schema";

export type CreateKeyResult =
  | {
      status: "created";
      key: { id: string; name: string; prefix: string };
      /** The full key. Returned once, never stored. */
      secret: string;
    }
  | { status: "invalid"; error: string }
  | { status: "failed"; reference?: string };

export type RevokeKeyResult = { ok: boolean };

/** The Ref id a ServiceError carries (its digest), for support. */
function referenceOf(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string"
    ? error.digest
    : undefined;
}

export async function createKey(formData: FormData): Promise<CreateKeyResult> {
  await requireUser();
  const parsed = KeyNameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    return {
      status: "invalid",
      error: parsed.error.issues[0]?.message ?? apiKeys.dialog.nameRequired,
    };
  }
  let created: Awaited<ReturnType<typeof createApiKey>>;
  try {
    created = await createApiKey(parsed.data);
  } catch (error) {
    unstable_rethrow(error);
    const reference = referenceOf(error);
    console.error("[createKey] failed", reference ?? "", error);
    return { status: "failed", reference };
  }
  refresh();
  const { id, name, prefix } = created.key;
  return {
    status: "created",
    key: { id, name, prefix },
    secret: created.secret,
  };
}

export async function revokeKey(id: string): Promise<RevokeKeyResult> {
  await requireUser();
  const parsed = KeyIdSchema.safeParse(id);
  if (!parsed.success) return { ok: false };
  try {
    await revokeApiKey(parsed.data);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[revokeKey] failed", referenceOf(error) ?? "", error);
    return { ok: false };
  }
  refresh();
  return { ok: true };
}
