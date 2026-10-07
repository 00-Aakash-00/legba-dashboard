import "server-only";

import { createHash, randomBytes } from "node:crypto";

const API_KEY_PREFIX = "lgba_";
const DISPLAY_PREFIX_LENGTH = 11; // "lgba_" + 6 characters

export type GeneratedApiKey = { secret: string; hash: string; prefix: string };

/** `lgba_` + 32 random bytes (base64url). Only the hash and prefix are kept. */
export function generateApiKey(): GeneratedApiKey {
  const secret = API_KEY_PREFIX + randomBytes(32).toString("base64url");
  return {
    secret,
    hash: createHash("sha256").update(secret).digest("hex"),
    prefix: secret.slice(0, DISPLAY_PREFIX_LENGTH),
  };
}
