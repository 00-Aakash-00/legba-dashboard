import "server-only";

export type PersonaBehavior = {
  /** Added to every list-service call, in ms. */
  latencyMs: number;
  /** List services fail for this long after sign-in, in ms (0 = never). */
  failWindowMs: number;
};

export const NORMAL: PersonaBehavior = { latencyMs: 0, failWindowMs: 0 };

/**
 * Seeded demo accounts for the placeholder backend. They exist so every UI
 * state can be reached through the real interface (documented in AGENTS.md
 * and the README). All use the mockup's demo password.
 */
export const PERSONAS = [
  {
    id: "usr_jane",
    name: "Jane Doe",
    email: "jane@demo.gmail.com",
    password: "1234567",
    plans: ["ghost", "shield"] as const,
    behavior: NORMAL,
  },
  {
    id: "usr_flaky",
    name: "Flaky Demo",
    email: "flaky@demo.legba.app",
    password: "1234567",
    plans: ["ghost", "shield"] as const,
    behavior: { latencyMs: 0, failWindowMs: 6000 },
  },
  {
    id: "usr_slow",
    name: "Slow Demo",
    email: "slow@demo.legba.app",
    password: "1234567",
    plans: ["ghost", "shield"] as const,
    behavior: { latencyMs: 2500, failWindowMs: 0 },
  },
];
