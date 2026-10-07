"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { subscriptions } from "@/content/copy";
import { cn } from "@/lib/utils";
import {
  FILTERS,
  type SubscriptionFilter,
  useSubscriptions,
} from "./subscriptions-context";

const ITEMS = FILTERS.map((value) => ({
  value,
  label: subscriptions.filters[value],
}));

/** The status filter ("All" in the mockup). Filters on the client. */
export function SubscriptionsFilter({ className }: { className?: string }) {
  const { filter, setFilter, filterRef } = useSubscriptions();
  // Opened from the keyboard, the list appears without animating (emil).
  const [instant, setInstant] = useState(false);

  return (
    <Select
      items={ITEMS}
      value={filter}
      onValueChange={(value: SubscriptionFilter | null) => {
        if (value) setFilter(value);
      }}
      onOpenChange={(open, details) => {
        if (open) setInstant(details.event instanceof KeyboardEvent);
      }}
    >
      <SelectTrigger
        ref={filterRef}
        aria-label={subscriptions.filterLabel}
        className={cn(
          "min-w-[96.5px] justify-between gap-3 rounded-[11px] border-0 bg-chip pr-[11.4px] pl-[15.6px] font-medium text-[#a7adb6] text-[14.5px] tracking-[-0.03em] transition-[background-color,scale] duration-150 ease-out-strong hover:bg-[#1b1c1e] active:scale-[0.97] data-popup-open:bg-[#1b1c1e] data-[size=default]:h-[37px] pointer-coarse:data-[size=default]:h-11 dark:bg-chip dark:hover:bg-[#1b1c1e] [&>svg]:size-5 [&>svg]:stroke-[2.25] [&>svg]:text-[#9aa1a8]",
          className,
        )}
      >
        <SelectValue className="flex-none leading-3" />
      </SelectTrigger>
      <SelectContent
        alignItemWithTrigger={false}
        align="start"
        sideOffset={6}
        data-instant={instant || undefined}
        className="w-auto min-w-(--anchor-width) rounded-[11px] bg-[#161718] p-1 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.7)] ring-line duration-150 ease-out-strong data-[side=bottom]:slide-in-from-top-1 data-instant:animate-none"
      >
        {ITEMS.map((item) => (
          <SelectItem
            key={item.value}
            value={item.value}
            className="min-h-9 rounded-[8px] pr-8 pl-2.5 font-medium text-[#a7adb6] text-[14.5px] tracking-[-0.03em] data-highlighted:bg-white/[0.06] data-highlighted:text-ink data-selected:text-ink pointer-coarse:min-h-11 [&_svg]:text-signal"
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
