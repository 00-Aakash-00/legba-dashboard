import { describe, expect, it } from "vitest";
import { agentPlans } from "@/content/copy";

/*
 * A plan's column shows its highlights in the box and its other features
 * under "What's included", matched by exact text, so each fact shows once
 * and every line on the page is the catalog's own.
 */
describe("agent plan catalog", () => {
  it.each(agentPlans.map((plan) => [plan.name, plan] as const))(
    "%s highlights two of its own features, with more left to include",
    (_, plan) => {
      const [first, second] = plan.highlights;
      expect(first).not.toBe(second);
      expect(plan.features).toContain(first);
      expect(plan.features).toContain(second);
      expect(plan.features.length).toBeGreaterThan(2);
    },
  );
});
