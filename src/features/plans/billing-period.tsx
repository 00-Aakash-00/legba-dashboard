"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { useState } from "react";
import { extensionPlan, plansPage } from "@/content/copy";
import { cn } from "@/lib/utils";
import { Price } from "./parts";
import styles from "./plans.module.css";

type Period = "monthly" | "yearly";

const segment = cn(
  styles.segment,
  "inline-flex h-9 cursor-pointer select-none items-center gap-2 border border-transparent px-4 font-semibold text-[13.5px] text-ink-2 tracking-[-0.02em] outline-none touch-manipulation pointer-coarse:h-11",
  "transition-[background-color,border-color,color] duration-150 ease-out-strong hover:text-bone",
  "focus-visible:ring-3 focus-visible:ring-ring/50",
  // The chosen period wears the top-up presets' wine.
  "data-checked:border-wine-line data-checked:bg-[linear-gradient(180deg,var(--color-wine-fill)_0%,var(--color-wine-fill-end)_100%)] data-checked:text-bone",
);

/**
 * The extension's price with a Monthly / Yearly switch: one radio group, so
 * Tab reaches the chosen period and the arrow keys change it. The price is a
 * polite live region, so the new price is read out after the change.
 */
export function BillingPeriod() {
  const copy = plansPage.extension.period;
  const [period, setPeriod] = useState<Period>("monthly");
  const yearly = period === "yearly";
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
      <div aria-live="polite">
        <Price
          price={yearly ? extensionPlan.yearly : extensionPlan.monthly}
          suffix={
            yearly ? extensionPlan.yearlySuffix : extensionPlan.monthlySuffix
          }
        />
      </div>
      <RadioGroup
        value={period}
        onValueChange={(value) => {
          if (value === "monthly" || value === "yearly") setPeriod(value);
        }}
        aria-label={copy.label}
        className={cn(
          styles.switch,
          "inline-flex items-center gap-1 border border-line bg-field",
        )}
      >
        <Radio.Root value="monthly" className={segment}>
          {copy.monthly}
        </Radio.Root>
        <Radio.Root value="yearly" className={segment}>
          {copy.yearly}
          <span className="rounded-full bg-signal/15 px-1.5 py-[3px] font-mono font-semibold text-[#ff7088] text-[10px] uppercase leading-none tracking-[0.08em]">
            {copy.save}
          </span>
        </Radio.Root>
      </RadioGroup>
    </div>
  );
}
