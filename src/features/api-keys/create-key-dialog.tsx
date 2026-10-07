"use client";

import type { ReactElement } from "react";

/**
 * STUB (owned by the api-keys builder). Contract used by the overview hero:
 *
 *   <CreateKeyDialog trigger={<button ...>Create API Key</button>} />
 *
 * Renders `trigger`; activating it opens the create-key dialog (lazy-loaded
 * on first open, preloaded on hover/focus). The dialog creates a key, shows
 * it once with copy, and confirms with a toast that links to /api-keys.
 */
export function CreateKeyDialog({ trigger }: { trigger: ReactElement }) {
  return trigger;
}
