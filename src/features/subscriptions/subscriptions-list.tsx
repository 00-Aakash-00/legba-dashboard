"use client";

import { ArrowUpRightIcon, LayersIcon, ListFilterIcon } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { links, subscriptions } from "@/content/copy";
import { cn } from "@/lib/utils";
import styles from "./subscriptions.module.css";
import {
  type SubscriptionStatus,
  useSubscriptions,
} from "./subscriptions-context";

export type SubscriptionItem = {
  id: string;
  status: SubscriptionStatus;
  /** The server-rendered card. */
  card: ReactNode;
};

type Layout = "carousel" | "grid";

/**
 * The streamed body of the subscriptions section: the cards for the current
 * filter, or the right empty state. Filtering happens here, on the client.
 */
export function SubscriptionsList({
  items,
  layout,
}: {
  items: SubscriptionItem[];
  layout: Layout;
}) {
  const { filter } = useSubscriptions();
  const visible =
    filter === "all" ? items : items.filter((item) => item.status === filter);

  let body: ReactNode;
  if (items.length === 0) body = <FirstUseEmpty />;
  else if (visible.length === 0) body = <FilteredEmpty />;
  else if (layout === "carousel") body = <Carousel items={visible} />;
  else body = <Grid items={visible} />;

  return (
    <div className={styles.body}>
      {/* Says what a filter change did; quiet until the filter moves off "All". */}
      <p role="status" className="sr-only">
        {filter === "all" || items.length === 0
          ? ""
          : subscriptions.shown(visible.length)}
      </p>
      {body}
    </div>
  );
}

function Carousel({ items }: { items: SubscriptionItem[] }) {
  const { setRail, setEdges } = useSubscriptions();
  const railId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const ids = items.map((item) => item.id).join(" ");

  // Which cards are in view, from an IntersectionObserver on the scroller:
  // no scroll listeners, no layout reads while scrolling.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !ids) return;
    const slides = Array.from(
      list.querySelectorAll<HTMLElement>("[data-slide]"),
    );
    const ratios = new Map<Element, number>();
    const ratio = (slide: Element | undefined) =>
      slide ? (ratios.get(slide) ?? 0) : 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target, entry.intersectionRatio);
        }
        setEdges({
          start: ratio(slides[0]) > 0.98,
          end: ratio(slides.at(-1)) > 0.98,
        });
        let best = 0;
        slides.forEach((slide, index) => {
          if (ratio(slide) > ratio(slides[best]) + 0.01) best = index;
        });
        setActive(best);
      },
      { root: list, threshold: [0, 0.25, 0.5, 0.75, 0.99, 1] },
    );
    for (const slide of slides) observer.observe(slide);
    setRail(list);
    // A new filter starts the row from its first card.
    if (list.scrollLeft !== 0) list.scrollTo({ left: 0, behavior: "instant" });
    return () => {
      observer.disconnect();
      setRail(null);
      setEdges({ start: true, end: true });
    };
  }, [ids, setRail, setEdges]);

  return (
    <>
      {/* biome-ignore lint/a11y/noRedundantRoles: list-style: none drops list semantics in Safari/VoiceOver; the list's item count is the spoken count. */}
      <ul id={railId} ref={listRef} role="list" className={styles.rail}>
        {items.map((item) => (
          <li key={item.id} data-slide="" className={styles.slide}>
            {item.card}
          </li>
        ))}
      </ul>
      {items.length > 1 ? (
        <div aria-hidden="true" className={styles.dots}>
          {items.map((item, index) => (
            <span
              key={item.id}
              className={styles.dot}
              data-active={index === active || undefined}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

function Grid({ items }: { items: SubscriptionItem[] }) {
  return (
    // biome-ignore lint/a11y/noRedundantRoles: list-style: none drops list semantics in Safari/VoiceOver; the list's item count is the spoken count.
    <ul role="list" className={styles.grid}>
      {items.map((item) => (
        <li key={item.id}>{item.card}</li>
      ))}
    </ul>
  );
}

const EMPTY =
  "min-h-72 flex-1 gap-5 rounded-[18px] border border-[#1e2021] border-dashed bg-panel-inner px-6 py-10";
const EMPTY_ICON =
  "size-11 rounded-[12px] border border-line-chip bg-panel-raised text-signal-icon [&_svg:not([class*='size-'])]:size-5";

/** First use: nothing subscribed yet. An invitation, with the way to subscribe. */
function FirstUseEmpty() {
  return (
    <Empty className={EMPTY}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className={EMPTY_ICON}>
          <LayersIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle className="font-semibold text-base text-ink tracking-[-0.02em]">
          {subscriptions.empty.title}
        </EmptyTitle>
        <EmptyDescription className="text-ink-2">
          {subscriptions.empty.body}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <a
          href={links.pricing}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "pill-red", size: "pill-md" }),
            "pointer-coarse:h-11",
          )}
        >
          {subscriptions.empty.action}
          <ArrowUpRightIcon aria-hidden="true" className="size-4" />
          <span className="sr-only">{subscriptions.newTab}</span>
        </a>
      </EmptyContent>
    </Empty>
  );
}

/** Filtered: plans exist, none match. Says so and offers every plan back. */
function FilteredEmpty() {
  const { filter, setFilter, filterRef } = useSubscriptions();
  const label = filter === "all" ? "" : subscriptions.filters[filter];
  return (
    <Empty className={EMPTY}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className={EMPTY_ICON}>
          <ListFilterIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle className="font-semibold text-base text-ink tracking-[-0.02em]">
          {subscriptions.filtered.title(label)}
        </EmptyTitle>
        <EmptyDescription className="text-ink-2">
          {subscriptions.filtered.body}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="wine"
          size="pill-md"
          className="pointer-coarse:h-11"
          onClick={() => {
            setFilter("all");
            // The button goes away with this state; focus returns to the filter.
            filterRef.current?.focus();
          }}
        >
          {subscriptions.filtered.action}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
