import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { plans, subscriptions } from "@/content/copy";
import { cn } from "@/lib/utils";
import type { SubscriptionDTO } from "@/server/services/subscriptions";
import { PlanArt } from "./plan-art";
import { PlanFeatures } from "./plan-features";
import styles from "./subscription-card.module.css";

const DOT: Record<SubscriptionDTO["status"], string> = {
  active: "bg-ok",
  paused: "bg-[#d9a441]",
  cancelled: "bg-ink-subtle",
};

/** The status chip ("● Active"). Its role makes a later change announce itself. */
export function StatusChip({
  status,
  className,
}: {
  status: SubscriptionDTO["status"];
  className?: string;
}) {
  const label = subscriptions.status[status];
  return (
    <Badge
      variant="status"
      role="status"
      aria-label={label}
      className={cn(
        "h-[32.5px] gap-[7.4px] rounded-[11px] border-[#222425] bg-[#191a1b] pr-[11.2px] pl-[9px] font-semibold text-[#c8c8c9] text-[11.5px] tracking-[-0.025em]",
        className,
      )}
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
export function VendorChip({
  vendor,
  className,
}: {
  vendor: string;
  className?: string;
}) {
  return (
    <Badge
      variant="chip"
      className={cn(
        "h-[33px] rounded-[11px] border-line-chip bg-[linear-gradient(180deg,#1a1b1c,#171819)] pr-[11.9px] pl-[10.8px] font-medium text-[#bdbfbe] text-[14.5px] leading-[18px] tracking-[-0.03em]",
        className,
      )}
    >
      {subscriptions.vendor(vendor)}
    </Badge>
  );
}

/**
 * One subscription, as drawn in the overview mockup: vendor and status chips,
 * the plan's hairline illustration, its copy and features, and the Manage bar.
 */
export function SubscriptionCard({
  subscription,
  scope,
}: {
  subscription: SubscriptionDTO;
  /** Keeps ids unique when two routes with cards stay mounted (Activity). */
  scope: string;
}) {
  const plan = plans[subscription.plan];
  const titleId = `${scope}-${subscription.id}-title`;
  return (
    <article
      aria-labelledby={titleId}
      data-plan={subscription.plan}
      className={styles.card}
    >
      <div className={styles.layout}>
        <div className={styles.chips}>
          <VendorChip vendor={subscription.vendor} />
          <StatusChip status={subscription.status} />
        </div>
        <PlanArt plan={subscription.plan} className={styles.art} />
        <div className={styles.text}>
          <h3
            id={titleId}
            className="w-fit font-semibold text-[#f6f5f5] text-[22px] leading-[17px] tracking-[-0.03em]"
          >
            {plan.title}
          </h3>
          <p className="mt-[12.3px] font-medium text-[#93999e] text-[14.5px] leading-5 tracking-[-0.03em]">
            {plan.body}
          </p>
          <PlanFeatures plan={subscription.plan} className={styles.features} />
        </div>
        <Link
          href={`/subscriptions/${subscription.id}`}
          aria-describedby={titleId}
          className={cn(
            buttonVariants({ variant: "bar", size: "bar" }),
            "h-[55px] w-auto rounded-[16px] border-[#1f2021] bg-manage pr-[20.9px] pl-[25.8px] text-[15px] text-ink-label tracking-[-0.03em] hover:border-line hover:bg-[#161719] pointer-coarse:h-[52px]",
            styles.manage,
          )}
        >
          <span className="relative top-px leading-[14px]">
            {subscriptions.manage}
          </span>
        </Link>
      </div>
    </article>
  );
}
