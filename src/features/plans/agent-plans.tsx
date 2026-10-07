import { Suspense } from "react";
import { type AgentPlan, agentPlans, plansPage } from "@/content/copy";
import { cn } from "@/lib/utils";
import type { SwitchablePlanId } from "./actions";
import type { SwitchTarget } from "./agent-plan-cta";
import {
  AGENT_PLANS_HEADING_ID,
  ButtonSkeleton,
  Included,
  PopularChip,
  Price,
  planNameClass,
  SectionHeading,
  TierMark,
} from "./parts";
import styles from "./plans.module.css";
import { AgentPlanActionSlot, CurrentPlanSlot } from "./slots";

type SwitchablePlan = AgentPlan & { id: SwitchablePlanId };

function isSwitchable(plan: AgentPlan): plan is SwitchablePlan {
  return plan.id !== "enterprise";
}

/**
 * Agent plans (the Legba API, MCP and the agent skill): Free, Pro and Scale
 * side by side from 1024px, stacked below, then Enterprise across the full
 * width. The catalog is static and prerenders; only the current-plan chips
 * and the buttons stream in.
 */
export function AgentPlans() {
  const enterprise = agentPlans.find((plan) => plan.id === "enterprise");
  return (
    <section
      aria-labelledby={AGENT_PLANS_HEADING_ID}
      className={cn(styles.plans, "flex flex-col gap-5")}
    >
      <SectionHeading
        id={AGENT_PLANS_HEADING_ID}
        title={plansPage.agent.heading}
        description={plansPage.agent.description}
      />
      {/* From 1024px every column is a subgrid of the same nine rows, so the
          names, prices, boxes and buttons line up whatever wraps. */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-x-4 lg:gap-y-0">
        {agentPlans.filter(isSwitchable).map((plan) => (
          <PlanColumn key={plan.id} plan={plan} />
        ))}
      </div>
      {enterprise ? <EnterpriseBanner plan={enterprise} /> : null}
    </section>
  );
}

function PlanColumn({ plan }: { plan: SwitchablePlan }) {
  const nameId = `plan-${plan.id}-name`;
  const featured = plan.featured === true;
  const target: SwitchTarget = {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: plan.price,
    priceSuffix: plan.priceSuffix,
    featured,
  };
  return (
    <article
      aria-labelledby={nameId}
      className={cn(
        styles.column,
        "flex flex-col border px-(--pad-column) pt-(--pad-column) lg:row-span-9 lg:grid lg:grid-rows-subgrid",
        featured ? styles.featured : "border-line bg-panel",
      )}
    >
      <div
        className={cn(
          styles.card,
          "flex flex-col border p-(--pad-card) lg:row-span-7 lg:grid lg:grid-rows-subgrid lg:items-start",
          featured
            ? "border-[#3d1a20] bg-[linear-gradient(180deg,#19171a,#131314)] shadow-[0_20px_48px_-24px_rgb(0_0_0/0.9)]"
            : "border-line-ring bg-[linear-gradient(180deg,#18191b,#141516)] shadow-[inset_0_1px_0_rgb(255_255_255/0.035)]",
        )}
      >
        {/* As tall as a chip even without one, so every column's name sits on
            the same line. Chips that don't fit wrap under the name, at the start. */}
        <div className="flex min-h-6 flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex items-center gap-3">
            <TierMark tier={plan.id} />
            <h3 id={nameId} className={planNameClass}>
              {plan.name}
            </h3>
          </div>
          <div
            className={cn(styles.chips, "flex flex-wrap items-center gap-1.5")}
          >
            {/* No placeholder: three of the four slots resolve to no chip,
                and the button's skeleton already shows the column loading. */}
            <Suspense fallback={null}>
              <CurrentPlanSlot plan={plan.id} />
            </Suspense>
            {featured ? <PopularChip /> : null}
          </div>
        </div>
        <p className="mt-3 text-pretty font-medium text-[15px] text-ink-2 leading-[21.5px] tracking-[-0.025em]">
          {plan.description}
        </p>
        <div aria-hidden className={cn(styles.dash, "my-6 w-full")} />
        <Price price={plan.price} suffix={plan.priceSuffix} />
        <ul
          // biome-ignore lint/a11y/noRedundantRoles: list-style: none drops list semantics in Safari/VoiceOver.
          role="list"
          className={cn(
            styles.box,
            "mt-6 w-full border border-[#2e3033] border-dashed",
          )}
        >
          {plan.highlights.map((highlight, index) => (
            <li
              key={highlight}
              className={cn(
                // 44px rows: the text's ink sits about 17px from the top, left and bottom.
                "px-4 py-3 font-semibold text-[14.5px] text-ink-label leading-5 tracking-[-0.02em]",
                index > 0 && styles.dashTop,
              )}
            >
              {highlight}
            </li>
          ))}
        </ul>
        <div className="mt-5 w-full">
          <Suspense fallback={<ButtonSkeleton />}>
            <AgentPlanActionSlot plan={target} />
          </Suspense>
        </div>
        <p className="mt-3.5 w-full text-center font-medium text-[13.5px] text-ink-caption leading-5 tracking-[-0.01em]">
          {plansPage.agent.tagline[plan.id]}
        </p>
      </div>
      {/* The box already shows the highlights: list only the other features. */}
      <Included
        features={plan.features.filter(
          (feature) => !plan.highlights.includes(feature),
        )}
        onWine={featured}
        className="px-(--inset-included) pt-6 pb-8 lg:row-span-2 lg:grid lg:grid-rows-subgrid"
      />
    </article>
  );
}

/** Enterprise: contact only. Dashed, like the reference's open-ended tier. */
function EnterpriseBanner({ plan }: { plan: AgentPlan }) {
  const copy = plansPage.enterprise;
  const nameId = "plan-enterprise-name";
  return (
    <article
      aria-labelledby={nameId}
      className={cn(
        styles.banner,
        "flex flex-col gap-5 border border-[#34363a] border-dashed px-(--inset-included) py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-8",
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <TierMark tier="enterprise" />
          <h3 id={nameId} className={planNameClass}>
            {copy.label}
          </h3>
          <Suspense fallback={null}>
            <CurrentPlanSlot plan="enterprise" />
          </Suspense>
        </div>
        <p className="mt-3 font-semibold text-[34px] text-ink leading-10 tracking-[-0.035em] sm:text-[48px] sm:leading-[52px]">
          {copy.title}
        </p>
        <p className="mt-2.5 text-pretty font-medium text-[15px] text-ink-2 leading-[21.5px] tracking-[-0.025em]">
          {plan.description}
        </p>
      </div>
      <a
        href={copy.href}
        target="_blank"
        rel="noopener noreferrer"
        className="-mx-3 inline-flex h-11 w-fit shrink-0 items-center rounded-full px-3 font-semibold text-[16px] text-signal tracking-[-0.02em] underline-offset-4 outline-none transition-colors duration-150 hover:text-[#ff4566] hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 active:opacity-80"
      >
        {copy.action}
        <span className="sr-only"> {plansPage.newTab}</span>
      </a>
    </article>
  );
}
