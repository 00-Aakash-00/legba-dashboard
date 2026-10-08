import type { Route } from "next";
import Link from "next/link";
import type { InteractiveKind } from "@/components/hairline/hairline-figure";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { agentPlans, plans, plansPage, subscriptions } from "@/content/copy";
import { cn } from "@/lib/utils";
import type { SubscriptionDTO } from "@/server/services/subscriptions";
import { PlanArt } from "./plan-art";
import { PlanFeatures } from "./plan-features";
import styles from "./subscription-card.module.css";

type Plan = SubscriptionDTO["plan"];
type Status = SubscriptionDTO["status"];

/**
 * Each card's hairline figure: card figures only (InteractiveKind), so an
 * empty- or error-state figure can't be borrowed here. The agent plan's is a
 * switchboard; its atmosphere is in plan-art.tsx with the others'.
 */
const ART: Record<Plan, InteractiveKind> = {
  ghost: "ghost",
  shield: "shield",
  agent: "patchboard",
};

/** Where each card leads: its plan's section on /plans (the ids of that page's section headings). */
const HREF = {
  ghost: "/plans#extension-plan-heading",
  shield: "/plans#extension-plan-heading",
  agent: "/plans#agent-plans-heading",
} satisfies Record<Plan, Route>;

/** Active is green; Inactive a muted grey; Free plan neutral, the label's own ink. */
const DOT: Record<Status, string> = {
  active: "bg-ok",
  inactive: "bg-ink-subtle",
  free: "bg-[#c8c8c9]",
};

/** The status chip ("● Active"). Its role makes a later change announce itself. */
function StatusChip({ status, label }: { status: Status; label: string }) {
  return (
    <Badge
      variant="status"
      role="status"
      aria-label={label}
      className="h-[32.5px] gap-[7.4px] rounded-[11px] border-[#222425] bg-[#191a1b] pr-[11.2px] pl-[9px] font-semibold text-[#c8c8c9] text-[11.5px] tracking-[-0.025em]"
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative top-px size-[7.5px] shrink-0 rounded-full",
          DOT[status],
        )}
      />
      <span className="relative top-[1.5px] leading-[9px]">{label}</span>
    </Badge>
  );
}

/** The vendor chip ("By: Legba"). */
function VendorChip() {
  return (
    <Badge
      variant="chip"
      className="h-[33px] rounded-[11px] border-line-chip bg-[linear-gradient(180deg,#1a1b1c,#171819)] pr-[11.9px] pl-[10.8px] font-medium text-[#bdbfbe] text-[14.5px] leading-[18px] tracking-[-0.03em]"
    >
      {subscriptions.vendor}
    </Badge>
  );
}

/**
 * What a card says. Ghost and Shield are the extension plan's two modes; the
 * agent card names the agent plan the account is on, with that plan's
 * features from the catalog (the plans page's own copy).
 */
function contentOf(subscription: SubscriptionDTO) {
  if (subscription.plan === "agent") {
    const tier = agentPlans.find((plan) => plan.id === subscription.tier);
    return {
      title: subscriptions.agent.title,
      body: plansPage.agent.description,
      features: tier?.features ?? [],
      status:
        subscription.status === "free"
          ? subscriptions.status.free
          : (tier?.name ?? subscriptions.status.active),
    };
  }
  const plan = plans[subscription.plan];
  return {
    title: plan.title,
    body: plan.body,
    features: plan.features,
    status: subscriptions.status[subscription.status],
  };
}

/**
 * One plan, as drawn in the overview mockup: vendor and status chips, the
 * plan's hairline illustration, its copy and features, and the bar that
 * opens the plan on /plans ("Manage plan" when it's on, "View plans" when
 * it's inactive or Free).
 */
export function SubscriptionCard({
  subscription,
}: {
  subscription: SubscriptionDTO;
}) {
  const { plan, status } = subscription;
  const content = contentOf(subscription);
  const art = ART[plan];
  const titleId = `subscription-${plan}-title`;
  return (
    <article aria-labelledby={titleId} data-plan={plan} className={styles.card}>
      <div className={styles.layout}>
        <div className={styles.chips}>
          <VendorChip />
          <StatusChip status={status} label={content.status} />
        </div>
        <PlanArt plan={art} className={styles.art} />
        <div className={styles.text}>
          <h3
            id={titleId}
            className="w-fit font-semibold text-[#f6f5f5] text-[22px] leading-[17px] tracking-[-0.03em]"
          >
            {content.title}
          </h3>
          {/* Never one word alone on the last line: pretty where supported, balanced elsewhere. */}
          <p className="mt-[12.3px] text-balance font-medium text-[#93999e] text-[14.5px] leading-5 tracking-[-0.03em] supports-[text-wrap:pretty]:text-pretty">
            {content.body}
          </p>
          <PlanFeatures
            features={content.features}
            className={styles.features}
          />
        </div>
        <Link
          href={HREF[plan]}
          aria-describedby={titleId}
          className={cn(
            buttonVariants({ variant: "bar", size: "bar" }),
            "h-[55px] w-auto rounded-[16px] border-[#1f2021] bg-manage pr-[20.9px] pl-[25.8px] text-[15px] text-ink-label tracking-[-0.03em] hover:border-line hover:bg-[#161719] pointer-coarse:h-[52px]",
            styles.manage,
          )}
        >
          <span className="relative top-px leading-[14px]">
            {status === "active"
              ? subscriptions.manage
              : subscriptions.viewPlans}
          </span>
        </Link>
      </div>
    </article>
  );
}
