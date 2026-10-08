"use client";

import { Button } from "@/components/ui/button";
import { subscriptions } from "@/content/copy";
import { cn } from "@/lib/utils";
import { useSubscriptions } from "./subscriptions-context";

const ARROW =
  "h-[31px] border-[#18191b] bg-transparent px-3 font-semibold text-[#c9cdd1] text-[12.5px] tracking-[-0.03em] hover:bg-white/[0.05] disabled:opacity-80 data-disabled:cursor-default data-disabled:opacity-80 pointer-coarse:hidden";

/**
 * Previous / next for the subscriptions carousel: each scrolls by one card and
 * is disabled at its end. Text, not arrows (icons live only in the nav bar).
 * Hidden for coarse pointers, where the row swipes, and on panels wide enough
 * for every card (subscriptions.module.css). Not drawn while the cards load or
 * after they failed: there is nothing to scroll then.
 */
export function CarouselArrows({
  prevClassName,
  nextClassName,
}: {
  prevClassName?: string;
  nextClassName?: string;
}) {
  const { rail, edges } = useSubscriptions();
  if (rail === null) return null;
  // While a card is off screen, a disabled arrow keeps focus (so pressing it
  // to the end doesn't drop focus); with nothing to scroll it leaves the tab order.
  const scrollable = !(edges.start && edges.end);

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
        className={cn(ARROW, prevClassName)}
        aria-label={subscriptions.previous}
        aria-controls={rail.id}
        disabled={edges.start}
        focusableWhenDisabled={scrollable}
        onClick={() => step(-1)}
      >
        {subscriptions.previousShort}
      </Button>
      <Button
        variant="round"
        className={cn(ARROW, nextClassName)}
        aria-label={subscriptions.next}
        aria-controls={rail.id}
        disabled={edges.end}
        focusableWhenDisabled={scrollable}
        onClick={() => step(1)}
      >
        {subscriptions.nextShort}
      </Button>
    </>
  );
}
