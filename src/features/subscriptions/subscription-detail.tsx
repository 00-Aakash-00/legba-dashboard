import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { links, plans, subscriptions } from "@/content/copy";
import { cn } from "@/lib/utils";
import { getSubscription } from "@/server/services/subscriptions";
import { PlanFeatures } from "./plan-features";
import { PlanFigure } from "./plan-figure";
import { StatusChip } from "./subscription-card";

const { detail } = subscriptions;

const DATE = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

const CARD = "rounded-[20px] border border-line bg-panel p-5 sm:p-6 min-w-0";
const CARD_TITLE =
  "font-semibold text-[18px] text-[#eceded] leading-[22px] tracking-[-0.03em]";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 border-line-soft border-b py-2 last:border-b-0">
      <dt className="text-[14px] text-ink-3">{label}</dt>
      <dd className="text-right font-medium text-[14.5px] text-ink">
        {children}
      </dd>
    </div>
  );
}

/**
 * One subscription's summary, what it includes, its billing history and how
 * to change it. Reads the route param and the session, so it streams; an id
 * that isn't on this account is a 404.
 */
export async function SubscriptionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subscription = await getSubscription(id);
  if (!subscription) notFound();
  const plan = plans[subscription.plan];
  const mailto = `${links.support}?subject=${encodeURIComponent(
    detail.contactSubject(plan.title),
  )}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <h2 className="font-semibold text-[30px] text-ink leading-9 tracking-[-0.03em]">
          {plan.title}
        </h2>
        <StatusChip status={subscription.status} />
      </div>
      <p className="-mt-2 max-w-xl font-medium text-[15px] text-ink-2 leading-[21.5px]">
        {plan.body}
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="grid gap-4">
          <section aria-labelledby="detail-summary" className={CARD}>
            <h3 id="detail-summary" className={CARD_TITLE}>
              {detail.summaryTitle}
            </h3>
            <dl className="mt-3">
              <Row label={detail.planLabel}>{plan.title}</Row>
              <Row label={detail.vendorLabel}>{subscription.vendor}</Row>
              <Row label={detail.statusLabel}>
                {subscriptions.status[subscription.status]}
              </Row>
              <Row label={detail.startedLabel}>
                <time dateTime={subscription.startedAt}>
                  {DATE.format(new Date(subscription.startedAt))}
                </time>
              </Row>
              <Row label={detail.renewsLabel}>
                <time dateTime={subscription.renewsAt}>
                  {DATE.format(new Date(subscription.renewsAt))}
                </time>
              </Row>
            </dl>
          </section>

          <section aria-labelledby="detail-includes" className={CARD}>
            <h3 id="detail-includes" className={CARD_TITLE}>
              {detail.includes}
            </h3>
            <PlanFeatures plan={subscription.plan} className="mt-3" />
          </section>
        </div>

        <div className="grid content-start gap-4">
          <section aria-labelledby="detail-history" className={CARD}>
            <h3 id="detail-history" className={CARD_TITLE}>
              {detail.historyTitle}
            </h3>
            <Empty className="mt-4 gap-3 rounded-[16px] border border-[#1e2021] border-dashed bg-panel-inner px-5 py-8">
              <EmptyHeader>
                <EmptyMedia>
                  <PlanFigure plan={subscription.plan} />
                </EmptyMedia>
                <EmptyTitle className="font-semibold text-[15px] text-ink">
                  {detail.historyEmpty}
                </EmptyTitle>
                <EmptyDescription className="text-ink-2">
                  {detail.historyEmptyBody}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </section>

          <section aria-labelledby="detail-change" className={CARD}>
            <h3 id="detail-change" className={CARD_TITLE}>
              {detail.changeTitle}
            </h3>
            <p className="mt-2 text-[14.5px] text-ink-2 leading-5">
              {detail.changeBody}
            </p>
            <a
              href={mailto}
              className={cn(
                buttonVariants({ variant: "wine", size: "pill-md" }),
                "mt-5 w-full sm:w-auto pointer-coarse:h-11",
              )}
            >
              {detail.contact}
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

/** Mirrors the detail layout; fades in only after 300ms. */
export function SubscriptionDetailSkeleton() {
  return (
    <div className="skeleton-delay flex flex-col gap-5" aria-busy="true">
      <p role="status" className="sr-only">
        {detail.loading}
      </p>
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-48 rounded-lg bg-panel-raised" />
        <Skeleton className="h-[32.5px] w-[72.5px] rounded-[11px] bg-panel-raised" />
      </div>
      <Skeleton className="-mt-2 h-4 w-80 max-w-full rounded bg-white/[0.05]" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="grid gap-4">
          <div className={cn(CARD, "h-[300px]")}>
            <Skeleton className="h-5 w-28 rounded bg-panel-raised" />
          </div>
          <div className={cn(CARD, "h-[200px]")}>
            <Skeleton className="h-5 w-36 rounded bg-panel-raised" />
          </div>
        </div>
        <div className="grid content-start gap-4">
          <div className={cn(CARD, "h-[250px]")}>
            <Skeleton className="h-5 w-32 rounded bg-panel-raised" />
          </div>
          <div className={cn(CARD, "h-[180px]")}>
            <Skeleton className="h-5 w-52 rounded bg-panel-raised" />
          </div>
        </div>
      </div>
    </div>
  );
}
