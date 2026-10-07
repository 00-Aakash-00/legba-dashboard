import "server-only";

import { hashPassword, hashPasswordSync, verifyPassword } from "../crypto";
import { ServiceError } from "../errors";
import { NORMAL } from "../personas";
import { store, type UserRecord } from "../store";

// Compared against for unknown emails, so a miss costs the same as a hit.
const DUMMY_HASH = hashPasswordSync("legba-timing-equaliser");

export type AuthUser = Pick<UserRecord, "id" | "name" | "email">;

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const id = store.usersByEmail.get(email.toLowerCase());
  const user = id ? store.users.get(id) : undefined;
  const ok = await verifyPassword(password, user?.password ?? DUMMY_HASH);
  return user && ok
    ? { id: user.id, name: user.name, email: user.email }
    : null;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  const email = input.email.toLowerCase();
  if (store.usersByEmail.has(email)) throw new ServiceError("EMAIL_TAKEN");
  const user: UserRecord = {
    id: `usr_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`,
    name: input.name,
    email,
    password: await hashPassword(input.password),
    behavior: NORMAL,
    createdAt: new Date().toISOString(),
  };
  store.users.set(user.id, user);
  store.usersByEmail.set(email, user.id);
  store.subscriptions.set(user.id, []);
  store.apiKeys.set(user.id, []);
  return { id: user.id, name: user.name, email: user.email };
}
