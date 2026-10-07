"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { subscriptions } from "@/content/copy";
import { cn } from "@/lib/utils";
import { useSubscriptions } from "./subscriptions-context";

const ARROW =
  "size-[31px] border-[#18191b] bg-transparent text-[#c9cdd1] hover:bg-white/[0.05] disabled:opacity-80 data-disabled:cursor-default data-disabled:opacity-80 pointer-coarse:hidden [&_svg]:size-4 [&_svg]:stroke-[2.5]";

/**
 * Previous / next for the subscriptions carousel: each scrolls by one card and
 * is disabled at its end. Hidden for coarse pointers, where the row swipes.
 */
export function CarouselArrows({
  prevClassName,
  nextClassName,
}: {
  prevClassName?: string;
  nextClassName?: string;
}) {
  const { rail, edges } = useSubscriptions();
  // While a card is off screen, a disabled arrow keeps focus (so pressing it
  // to the end doesn't drop focus); with nothing to scroll it leaves the tab order.
  const scrollable = rail !== null && !(edges.start && edges.end);

  function step(direction: 1 | -1) {
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>("[data-slide]");
    const gap = Number.parseFloat(getComputedStyle(rail).columnGap) || 0;
    const width = card?.getBoundingClientRect().width ?? rail.clientWidth;
    rail.scrollBy({ left: direction * (width + gap) });
  }

  return (
    <>
      <Button
        variant="round"
        size="icon"
        className={cn(ARROW, prevClassName)}
        aria-label={subscriptions.previous}
        aria-controls={rail?.id}
        disabled={rail === null || edges.start}
        focusableWhenDisabled={scrollable}
        onClick={() => step(-1)}
      >
        <ArrowLeftIcon aria-hidden />
      </Button>
      <Button
        variant="round"
        size="icon"
        className={cn(ARROW, nextClassName)}
        aria-label={subscriptions.next}
        aria-controls={rail?.id}
        disabled={rail === null || edges.end}
        focusableWhenDisabled={scrollable}
        onClick={() => step(1)}
      >
        <ArrowRightIcon aria-hidden />
      </Button>
    </>
  );
}
