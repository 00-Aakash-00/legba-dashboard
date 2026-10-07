import "server-only";

import { generateApiKey } from "../crypto";
import { getDemoUser } from "../demo";
import { simulate } from "../simulate";
import { type ApiKeyRecord, store } from "../store";

export type ApiKeyDTO = Pick<
  ApiKeyRecord,
  "id" | "name" | "prefix" | "createdAt" | "lastUsedAt"
>;

function toDTO(record: ApiKeyRecord): ApiKeyDTO {
  const { id, name, prefix, createdAt, lastUsedAt } = record;
  return { id, name, prefix, createdAt, lastUsedAt };
}

export async function listApiKeys(): Promise<ApiKeyDTO[]> {
  const user = await getDemoUser();
  await simulate(user, "API_KEYS_UNAVAILABLE");
  return (store.apiKeys.get(user.workspaceId) ?? [])
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toDTO);
}

/** Creates a key; the full secret is returned once and never stored. */
export async function createApiKey(
  name: string,
): Promise<{ key: ApiKeyDTO; secret: string }> {
  const user = await getDemoUser();
  const { secret, hash, prefix } = generateApiKey();
  const record: ApiKeyRecord = {
    id: `key_${crypto.randomUUID().replaceAll("-", "").slice(0, 20)}`,
    workspaceId: user.workspaceId,
    name,
    prefix,
    hash,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  };
  store.apiKeys.set(user.workspaceId, [
    ...(store.apiKeys.get(user.workspaceId) ?? []),
    record,
  ]);
  return { key: toDTO(record), secret };
}

export async function revokeApiKey(id: string): Promise<void> {
  const user = await getDemoUser();
  // Idempotent and scoped to the workspace's own keys: revoking a key that
  // is already gone (another tab, a double submit) is a success, not an error.
  const keys = store.apiKeys.get(user.workspaceId) ?? [];
  store.apiKeys.set(
    user.workspaceId,
    keys.filter((key) => key.id !== id),
  );
}
