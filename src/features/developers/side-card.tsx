import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./side-card.module.css";

/**
 * The next-step card beside a developer page's main card: the instances
 * card's wine surface, a title, one approved line and a text-only action. Stretched taller, the action stays at the bottom, as the
 * instances card's Launch pill does.
 */
export function SideCard({
  headingId,
  title,
  body,
  action,
  className,
}: {
  headingId: string;
  title: string;
  body: string;
  action: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        styles.surface,
        "relative isolate flex flex-col items-start overflow-hidden rounded-card px-6 pt-7 pb-6 xl:px-7",
        className,
      )}
    >
      <h2
        id={headingId}
        className="max-w-[16em] text-balance font-semibold text-[#fdfcfc] text-[22px] leading-7 tracking-[-0.03em]"
      >
        {title}
      </h2>
      <p className="mt-3 max-w-[24em] text-pretty font-medium text-[#c2bbba] text-[15px] leading-[22px] tracking-[-0.025em]">
        {body}
      </p>
      <div className="mt-auto pt-7 max-sm:w-full max-sm:*:w-full">{action}</div>
    </section>
  );
}
