import "server-only";

export type ServiceErrorCode =
  | "SUBSCRIPTIONS_UNAVAILABLE"
  | "API_KEYS_UNAVAILABLE"
  | "DEPLOYMENTS_UNAVAILABLE"
  | "REGISTRIES_UNAVAILABLE"
  | "MODELS_UNAVAILABLE"
  | "PAYMENTS_UNAVAILABLE"
  | "EMAIL_TAKEN";

/**
 * A failure the UI can explain. Production redacts thrown messages, so the
 * public copy lives in `src/content/copy.ts`; the `digest` carries a reference
 * id the error card shows ("Ref LGB-…") and the server log repeats.
 */
export class ServiceError extends Error {
  readonly digest: string;

  constructor(readonly code: ServiceErrorCode) {
    const ref = `LGB-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    super(`${code} (${ref})`);
    this.name = "ServiceError";
    this.digest = ref;
  }

  get ref() {
    return this.digest;
  }
}
