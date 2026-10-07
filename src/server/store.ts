import "server-only";

import { hashPasswordSync, type PasswordHash } from "./crypto";
import { PERSONAS, type PersonaBehavior } from "./personas";

export type PlanId = "ghost" | "shield";
export type SubscriptionStatus = "active" | "paused" | "cancelled";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  password: PasswordHash;
  behavior: PersonaBehavior;
  createdAt: string;
};

export type SubscriptionRecord = {
  id: string;
  userId: string;
  plan: PlanId;
  status: SubscriptionStatus;
  vendor: "Legba";
  startedAt: string;
  renewsAt: string;
};

export type ApiKeyRecord = {
  id: string;
  userId: string;
  name: string;
  prefix: string;
  hash: string;
  createdAt: string;
  lastUsedAt: string | null;
};

type Store = {
  users: Map<string, UserRecord>;
  usersByEmail: Map<string, string>;
  subscriptions: Map<string, SubscriptionRecord[]>;
  apiKeys: Map<string, ApiKeyRecord[]>;
};

/**
 * The placeholder backend's whole database: an in-memory store. It lives on
 * `globalThis` so dev hot reloads keep it; a server restart wipes registered
 * users and created keys (single process only — swap for a real API later).
 */
function createStore(): Store {
  const store: Store = {
    users: new Map(),
    usersByEmail: new Map(),
    subscriptions: new Map(),
    apiKeys: new Map(),
  };
  for (const persona of PERSONAS) {
    const user: UserRecord = {
      id: persona.id,
      name: persona.name,
      email: persona.email,
      password: hashPasswordSync(persona.password),
      behavior: persona.behavior,
      createdAt: "2026-01-12T09:00:00.000Z",
    };
    store.users.set(user.id, user);
    store.usersByEmail.set(user.email, user.id);
    store.subscriptions.set(
      user.id,
      persona.plans.map((plan) => ({
        id: `sub_${plan}_${user.id}`,
        userId: user.id,
        plan,
        status: "active",
        vendor: "Legba",
        startedAt: "2026-03-02T10:00:00.000Z",
        renewsAt: "2026-11-02T10:00:00.000Z",
      })),
    );
    store.apiKeys.set(user.id, []);
  }
  return store;
}

const globalStore = globalThis as typeof globalThis & {
  __legbaStore?: Store;
};

export const store: Store = globalStore.__legbaStore ?? createStore();
globalStore.__legbaStore = store;
