import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

/**
 * There is no authentication: the login screen is a placeholder and any
 * username/password continues to the dashboard (user decision, 2026-10-07).
 *
 * The only thing login remembers is a *demo state*, so every UX state stays
 * reachable for QA through the real interface. Typing one of the documented
 * demo emails switches it; anything else is the normal dashboard.
 */
export const DEMO_COOKIE = "legba_demo";

export type DemoScenario = "normal" | "flaky" | "slow" | "empty";

export type DemoBehavior = {
  /** Added to every list-service call, in ms. */
  latencyMs: number;
  /** List services fail for this long after login, in ms (0 = never). */
  failWindowMs: number;
};

const BEHAVIOR: Record<DemoScenario, DemoBehavior> = {
  normal: { latencyMs: 0, failWindowMs: 0 },
  flaky: { latencyMs: 0, failWindowMs: 6000 },
  slow: { latencyMs: 2500, failWindowMs: 0 },
  empty: { latencyMs: 0, failWindowMs: 0 },
};

/** Documented in AGENTS.md and the README. */
const SCENARIO_EMAILS: Record<string, DemoScenario> = {
  "flaky@demo.legba.app": "flaky",
  "slow@demo.legba.app": "slow",
  "empty@demo.legba.app": "empty",
};

export function scenarioForEmail(email: unknown): DemoScenario {
  if (typeof email !== "string") return "normal";
  return SCENARIO_EMAILS[email.trim().toLowerCase()] ?? "normal";
}

function isScenario(value: string): value is DemoScenario {
  return value in BEHAVIOR;
}

/** The placeholder account every visitor sees (the mockup's identity). */
export const DEMO_ACCOUNT = {
  name: "Jane Doe",
  email: "jane@demo.gmail.com",
  avatarUrl: "/images/avatars/default.webp",
} as const;

export type DemoUser = {
  /** Bucket for this demo state's data in the in-memory store. */
  workspaceId: string;
  scenario: DemoScenario;
  behavior: DemoBehavior;
  /** When the demo state started (login time), in ms; 0 when unknown. */
  startedAt: number;
};

/** Server Actions and Route Handlers only: cookies can't be set during render. */
export async function startDemo(scenario: DemoScenario) {
  (await cookies()).set(DEMO_COOKIE, `${scenario}.${Date.now()}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * The current demo state. Reads a cookie, so call it only below a
 * <Suspense> boundary. Never redirects: every visitor gets a dashboard.
 */
export const getDemoUser = cache(async (): Promise<DemoUser> => {
  const raw = (await cookies()).get(DEMO_COOKIE)?.value ?? "";
  const [name = "", stamp = ""] = raw.split(".");
  const scenario = isScenario(name) ? name : "normal";
  const startedAt = Number(stamp);
  return {
    workspaceId: `demo_${scenario}`,
    scenario,
    behavior: BEHAVIOR[scenario],
    startedAt: Number.isFinite(startedAt) && startedAt > 0 ? startedAt : 0,
  };
});
