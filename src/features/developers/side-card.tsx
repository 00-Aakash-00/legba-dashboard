import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./side-card.module.css";

/**
 * The next-step card beside a developer page's main card: the instances
 * card's wine surface and pixel tiles, a title, one approved line and a
 * text-only action. Stretched taller, the action stays at the bottom, as the
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
      {/* Pixel tiles stepping off the top-right corner, as on the instances card. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute top-[22px] right-[46px] size-[26px] bg-[#e61e3c]/[0.2]" />
        <span className="absolute top-12 right-5 size-[26px] bg-[#e61e3c]/[0.16]" />
        <span className="absolute top-[84px] right-[86px] size-[15px] bg-white/[0.025]" />
        <span className="absolute top-[78px] right-[46px] size-[11px] bg-[#e61e3c]/[0.1]" />
      </span>
      <h2
        id={headingId}
        className="max-w-[16em] text-balance pr-16 font-semibold text-[#fdfcfc] text-[22px] leading-7 tracking-[-0.03em]"
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
