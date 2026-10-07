import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { subscriptions } from "@/content/copy";
import { cn } from "@/lib/utils";
import { listSubscriptions } from "@/server/services/subscriptions";
import { CarouselArrows } from "./carousel-arrows";
import { SubscriptionCard } from "./subscription-card";
import cardStyles from "./subscription-card.module.css";
import styles from "./subscriptions.module.css";
import { SubscriptionsBoundary } from "./subscriptions-boundary";
import { SubscriptionsProvider } from "./subscriptions-context";
import { SubscriptionsFilter } from "./subscriptions-filter";
import { SubscriptionsList } from "./subscriptions-list";

type Variant = "panel" | "page";

/**
 * "Your subscriptions": a frame that prerenders (bullet, title, filter, and on
 * the overview the arrows and View All) around one streamed part that reads
 * the session: the count and the cards, inside the section's own error
 * boundary and Suspense. Used by the overview panel and the /subscriptions page.
 */
export function SubscriptionsSection({
  variant,
  className,
}: {
  variant: Variant;
  className?: string;
}) {
  const titleId = `subscriptions-${variant}-title`;
  const layout = variant === "panel" ? "carousel" : "grid";
  return (
    <section
      aria-labelledby={titleId}
      // Below xl the page row can be taller than the cards: keep the panel to its content.
      className={cn(styles.panel, "max-xl:self-start", className)}
    >
      <SubscriptionsProvider>
        <div className={cn(styles.frame, variant === "page" && styles.page)}>
          <span aria-hidden="true" className={styles.bullet} />
          <h2
            id={titleId}
            className={cn(
              styles.title,
              "relative top-px font-semibold text-[#eceded] text-[18px] leading-[18px] tracking-[-0.03em]",
            )}
          >
            {subscriptions.title}
          </h2>
          <SubscriptionsFilter className={styles.filter} />
          {variant === "panel" ? (
            <>
              <CarouselArrows
                prevClassName={styles.prev}
                nextClassName={styles.next}
              />
              <Link
                href="/subscriptions"
                className={cn(
                  buttonVariants({ variant: "pill-red" }),
                  styles.view,
                  "h-[37.5px] w-[118.5px] justify-center bg-[linear-gradient(90deg,#8a1424_0%,#6a121c_50%,#b0182b_100%)] px-4 text-[12.5px] text-ink tracking-[-0.03em] shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] pointer-coarse:h-11",
                )}
              >
                <span className="leading-[11px]">{subscriptions.viewAll}</span>
              </Link>
            </>
          ) : null}
          <SubscriptionsBoundary
            title={subscriptions.error.title}
            body={subscriptions.error.body}
            className={cn(
              styles.body,
              "min-h-72 rounded-[18px] border border-[#1e2021] bg-panel-inner",
            )}
          >
            <Suspense fallback={<SubscriptionsSkeleton layout={layout} />}>
              <SubscriptionsData layout={layout} scope={variant} />
            </Suspense>
          </SubscriptionsBoundary>
        </div>
      </SubscriptionsProvider>
    </section>
  );
}

/** The per-user part: reads the session, so it streams. Throws ServiceError on failure. */
async function SubscriptionsData({
  layout,
  scope,
}: {
  layout: "carousel" | "grid";
  scope: Variant;
}) {
  const list = await listSubscriptions();
  return (
    <>
      {/* The list announces its own length; the badge is the visual count. */}
      <Badge
        variant="count"
        aria-hidden="true"
        className={cn(
          styles.count,
          "h-[23.5px] min-w-[28.5px] rounded-[8px] px-[9px] font-medium text-[#848d94] text-[14px] leading-[14px]",
        )}
      >
        {list.length}
      </Badge>
      <SubscriptionsList
        layout={layout}
        items={list.map((subscription) => ({
          id: subscription.id,
          status: subscription.status,
          card: <SubscriptionCard subscription={subscription} scope={scope} />,
        }))}
      />
    </>
  );
}

/** Two cards' worth of skeleton in the card layout, shown only after 300ms. */
export function SubscriptionsSkeleton({
  layout,
}: {
  layout: "carousel" | "grid";
}) {
  return (
    <>
      <span aria-hidden="true" className={cn(styles.count, "skeleton-delay")}>
        <Skeleton className="h-[23.5px] w-[28.5px] rounded-[8px] bg-badge" />
      </span>
      <div className={cn(styles.body, "skeleton-delay")} aria-busy="true">
        <p role="status" className="sr-only">
          {subscriptions.loading}
        </p>
        <div
          className={
            layout === "carousel"
              ? cn(styles.rail, "overflow-hidden")
              : styles.grid
          }
        >
          {["first", "second"].map((key) => (
            <div
              key={key}
              className={layout === "carousel" ? styles.slide : "flex"}
            >
              <CardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function CardSkeleton() {
  return (
    <div className={cardStyles.card} aria-hidden="true">
      <div className={cardStyles.layout}>
        <div className={cardStyles.chips}>
          <Skeleton className="h-[33px] w-[93px] rounded-[11px] bg-panel-raised" />
          <Skeleton className="h-[32.5px] w-[72.5px] rounded-[11px] bg-panel-raised" />
        </div>
        <div className={cardStyles.art}>
          <Skeleton className="absolute inset-[6%_10%_22%_8%] rounded-[46%_46%_18%_18%] bg-white/[0.035]" />
        </div>
        <div className={cardStyles.text}>
          <Skeleton className="h-[17px] w-32 rounded-md bg-panel-raised" />
          <Skeleton className="mt-[16px] h-3 w-[88%] rounded bg-white/[0.05]" />
          <Skeleton className="mt-2 h-3 w-[60%] rounded bg-white/[0.05]" />
          <div className={cn(cardStyles.features, "flex flex-col")}>
            {["one", "two", "three", "four"].map((key) => (
              <div
                key={key}
                className="flex min-h-[33px] items-center gap-[13.7px]"
              >
                <Skeleton className="mx-[8.5px] size-[7px] shrink-0 rounded-[2px] bg-white/[0.06]" />
                <Skeleton className="h-2.5 w-[58%] rounded bg-white/[0.05]" />
              </div>
            ))}
          </div>
        </div>
        <Skeleton
          className={cn(
            cardStyles.manage,
            "h-[55px] rounded-[16px] border border-[#1f2021] bg-manage pointer-coarse:h-[52px]",
          )}
        />
      </div>
    </div>
  );
}
