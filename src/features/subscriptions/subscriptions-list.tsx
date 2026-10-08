"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import styles from "./subscriptions.module.css";
import { useSubscriptions } from "./subscriptions-context";

export type SubscriptionItem = {
  id: string;
  /** The server-rendered card. */
  card: ReactNode;
};

/**
 * The streamed body of the panel: every plan's card in a native scroll-snap
 * row, with dots under it that mark the cards in view. Panels wide enough for
 * every card lay the same list out as one row, without the dots.
 */
export function SubscriptionsList({ items }: { items: SubscriptionItem[] }) {
  const { setRail, setEdges } = useSubscriptions();
  const railId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [inView, setInView] = useState([0]);
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
        // Every card as much in view as the most visible one: both cards of
        // a two-up row, the one card (not the peek) of a narrow row.
        const best = Math.max(...slides.map(ratio));
        setInView(
          slides.flatMap((slide, index) =>
            ratio(slide) >= best - 0.01 ? [index] : [],
          ),
        );
      },
      { root: list, threshold: [0, 0.25, 0.5, 0.75, 0.99, 1] },
    );
    for (const slide of slides) observer.observe(slide);
    setRail(list);
    return () => {
      observer.disconnect();
      setRail(null);
      setEdges({ start: true, end: true });
    };
  }, [ids, setRail, setEdges]);

  return (
    <div className={styles.body}>
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
              data-active={inView.includes(index) || undefined}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
