import "server-only";

import { generateApiKey } from "../crypto";
import { ServiceError } from "../errors";
import { requireUser } from "../session";
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
  const user = await requireUser();
  await simulate(user, "API_KEYS_UNAVAILABLE");
  return (store.apiKeys.get(user.id) ?? [])
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toDTO);
}

/** Creates a key; the full secret is returned once and never stored. */
export async function createApiKey(
  name: string,
): Promise<{ key: ApiKeyDTO; secret: string }> {
  const user = await requireUser();
  const { secret, hash, prefix } = generateApiKey();
  const record: ApiKeyRecord = {
    id: `key_${crypto.randomUUID().replaceAll("-", "").slice(0, 20)}`,
    userId: user.id,
    name,
    prefix,
    hash,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  };
  store.apiKeys.set(user.id, [...(store.apiKeys.get(user.id) ?? []), record]);
  return { key: toDTO(record), secret };
}

export async function revokeApiKey(id: string): Promise<void> {
  const user = await requireUser();
  const keys = store.apiKeys.get(user.id) ?? [];
  if (!keys.some((key) => key.id === id))
    throw new ServiceError("KEY_NOT_FOUND");
  store.apiKeys.set(
    user.id,
    keys.filter((key) => key.id !== id),
  );
}
