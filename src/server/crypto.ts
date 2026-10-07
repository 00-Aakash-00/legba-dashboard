import "server-only";

import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 32;

export type PasswordHash = { salt: string; hash: string };

/** Used only to seed demo personas at startup. */
export function hashPasswordSync(password: string): PasswordHash {
  const salt = randomBytes(16);
  return {
    salt: salt.toString("base64"),
    hash: scryptSync(password, salt, KEY_LENGTH).toString("base64"),
  };
}

export async function hashPassword(password: string): Promise<PasswordHash> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEY_LENGTH);
  return { salt: salt.toString("base64"), hash: hash.toString("base64") };
}

export async function verifyPassword(
  password: string,
  stored: PasswordHash,
): Promise<boolean> {
  const expected = Buffer.from(stored.hash, "base64");
  const actual = await scrypt(
    password,
    Buffer.from(stored.salt, "base64"),
    KEY_LENGTH,
  );
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

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
