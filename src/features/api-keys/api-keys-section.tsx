import { listApiKeys } from "@/server/services/api-keys";
import { type ApiKeyItem, ApiKeysList } from "./api-keys-list";

// UTC so the date never depends on where the server runs.
const date = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Reads the signed-in user's keys (session read below the page's Suspense
 * boundary). listApiKeys throws ServiceError on failure, which the section's
 * boundary renders with a retry; it never turns a failure into [].
 */
export async function ApiKeysSection({ headingId }: { headingId: string }) {
  const keys = await listApiKeys();
  const items: ApiKeyItem[] = keys.map((key) => ({
    id: key.id,
    name: key.name,
    prefix: key.prefix,
    createdAt: key.createdAt,
    created: date.format(new Date(key.createdAt)),
    lastUsedAt: key.lastUsedAt,
    lastUsed: key.lastUsedAt ? date.format(new Date(key.lastUsedAt)) : null,
  }));
  return <ApiKeysList keys={items} headingId={headingId} />;
}
