import { type AgentPlanId, agentPlans, plansPage } from "@/content/copy";
import {
  AgentPlanCta,
  type Downgrade,
  type SwitchTarget,
} from "./agent-plan-cta";
import { ExtensionActions } from "./extension-actions";
import { CurrentPlanChip, StatusChip } from "./parts";
import { readPlanState } from "./plan-state";
import { PlanStateError } from "./plan-state-error";

/*
 * The per-user parts of the plans page. Each streams behind its own Suspense
 * boundary inside the prerendered catalog, and all of them share one plan
 * read per request. When that read fails, the slots keep their places in an
 * "unknown" state and <PlanStateNotice> reports the failure once, with the
 * retry.
 */

/**
 * The plan read's failure, said once for the whole page, with the retry.
 * Nothing when the read worked. It is rendered from the read on every
 * request, so any refresh that reads the plan (a retry, or the one that
 * follows a successful switch) clears it.
 */
export async function PlanStateNotice() {
  const read = await readPlanState();
  return read.ok ? null : <PlanStateError reference={read.reference} />;
}

/** "● Current plan" on the plan the account is on. */
export async function CurrentPlanSlot({ plan }: { plan: AgentPlanId }) {
  const read = await readPlanState();
  return read.ok && read.state.agent === plan ? <CurrentPlanChip /> : null;
}

/**
 * The column's button: "Current plan" (disabled) on the account's plan,
 * "Choose …" elsewhere, and on a smaller plan than the account's, what the
 * switch takes away. If the read failed, every plan stays choosable: a switch
 * sets the plan outright, so it is safe without knowing the current one, and
 * the confirmation names the price.
 */
export async function AgentPlanActionSlot({ plan }: { plan: SwitchTarget }) {
  const read = await readPlanState();
  const current = read.ok ? read.state.agent : undefined;
  return (
    <AgentPlanCta
      plan={plan}
      current={current === plan.id}
      downgrade={current ? downgradeTo(plan.id, current) : undefined}
    />
  );
}

/**
 * A move down the catalog (it lists the plans from the smallest up), in the
 * catalog's own words: the plan that ends and the new plan's concurrency,
 * its first highlight. Undefined for a move up or to the same plan.
 */
function downgradeTo(
  target: AgentPlanId,
  current: AgentPlanId,
): Downgrade | undefined {
  const ending = agentPlans.find((plan) => plan.id === current);
  const next = agentPlans.find((plan) => plan.id === target);
  if (
    !ending ||
    !next ||
    agentPlans.indexOf(next) >= agentPlans.indexOf(ending)
  ) {
    return undefined;
  }
  return {
    from: ending.name,
    consequence: plansPage.switchPlan.downgrade(
      ending.name,
      next.name,
      next.highlights[0],
    ),
  };
}

/** "● Active" / "● Inactive", or "Status unavailable" when the read failed. */
export async function ExtensionStatusSlot() {
  const read = await readPlanState();
  const status = read.ok ? read.state.extension : "unknown";
  const dot =
    status === "active" ? "ok" : status === "inactive" ? "off" : "unknown";
  return (
    <StatusChip dot={dot} label={plansPage.extension.statusLabel}>
      {plansPage.extension.status[status]}
    </StatusChip>
  );
}

/**
 * Start the trial or cancel the plan. Without a known status there is no
 * right action to offer, so only "Add to Chrome" (static) remains.
 */
export async function ExtensionActionSlot() {
  const read = await readPlanState();
  return read.ok ? <ExtensionActions status={read.state.extension} /> : null;
}
