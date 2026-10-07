import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { extensionPlan, plansPage } from "@/content/copy";
import { cn } from "@/lib/utils";
import { BillingPeriod } from "./billing-period";
import {
  ButtonSkeleton,
  ChipSkeleton,
  Included,
  planNameClass,
  SectionHeading,
  TierMark,
} from "./parts";
import styles from "./plans.module.css";
import { ExtensionActionSlot, ExtensionStatusSlot } from "./slots";

const HEADING_ID = "extension-plan-heading";
const NAME_ID = "extension-plan-name";

/**
 * The Chrome extension plan (Ghost and Shield): an agent column turned on
 * its side, the card beside its feature list from 1024px. The price switch
 * is static; the status chip and the plan action stream in.
 */
export function ExtensionPlan() {
  const copy = plansPage.extension;
  return (
    <section
      aria-labelledby={HEADING_ID}
      className={cn(styles.plans, "flex flex-col gap-5")}
    >
      <SectionHeading id={HEADING_ID} title={copy.heading} />
      <article
        aria-labelledby={NAME_ID}
        className={cn(
          styles.column,
          "flex flex-col border border-line bg-panel px-(--pad-column) pt-(--pad-column)",
          "lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start lg:pb-(--pad-column)",
        )}
      >
        <div
          className={cn(
            styles.card,
            "flex flex-col border border-line-ring bg-[linear-gradient(180deg,#18191b,#141516)] p-(--pad-card) shadow-[inset_0_1px_0_rgb(255_255_255/0.035)]",
          )}
        >
          {/* Below 640px the chip always sits on its own line under the name,
              so its skeleton and every status (whatever its width) share one place. */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 max-sm:flex-col max-sm:items-start">
            <div className="flex items-center gap-3">
              <TierMark tier="extension" />
              <h3 id={NAME_ID} className={planNameClass}>
                {extensionPlan.modes}
              </h3>
            </div>
            <Suspense fallback={<ChipSkeleton />}>
              <ExtensionStatusSlot />
            </Suspense>
          </div>
          <p className="mt-3 max-w-[64ch] text-pretty font-medium text-[15px] text-ink-2 leading-[21.5px] tracking-[-0.025em]">
            {extensionPlan.description}
          </p>
          <div aria-hidden className={cn(styles.dash, "my-6")} />
          <BillingPeriod />
          <p className="mt-2 font-medium text-[14.5px] text-ink-2 leading-5 tracking-[-0.02em]">
            {extensionPlan.trial}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Suspense fallback={<ButtonSkeleton className="sm:w-44" />}>
              <ExtensionActionSlot />
            </Suspense>
            <a
              href={extensionPlan.chromeWebStore}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "wine", size: "pill-lg" }),
                "max-sm:w-full",
              )}
            >
              {extensionPlan.addToChrome}
              <span className="sr-only"> {plansPage.newTab}</span>
            </a>
          </div>
        </div>
        <Included
          features={extensionPlan.features}
          className="px-(--inset-included) pt-6 pb-8 lg:px-10 lg:pt-(--inset-card) lg:pb-0"
        />
      </article>
    </section>
  );
}
