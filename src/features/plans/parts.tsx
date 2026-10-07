import type { ReactNode } from "react";
import { eyebrowClass } from "@/components/patterns/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { plansPage } from "@/content/copy";
import { cn } from "@/lib/utils";
import styles from "./plans.module.css";

export type Tier = "free" | "pro" | "scale" | "enterprise" | "extension";

/**
 * Lit cells of a small dot lattice, like the loader's (the S1 orb), one more
 * per tier: Free two, Pro three, Scale four, Enterprise five. The extension's
 * pair is its two modes, Ghost and Shield. Decorative: the name is the text.
 */
const MARKS: Record<Tier, { cols: number; cells: number; lit: number[] }> = {
  free: { cols: 2, cells: 4, lit: [0, 3] },
  pro: { cols: 2, cells: 4, lit: [0, 2, 3] },
  scale: { cols: 2, cells: 4, lit: [0, 1, 2, 3] },
  enterprise: { cols: 3, cells: 9, lit: [0, 2, 4, 6, 8] },
  extension: { cols: 2, cells: 2, lit: [0, 1] },
};

export function TierMark({
  tier,
  className,
}: {
  tier: Tier;
  className?: string;
}) {
  const mark = MARKS[tier];
  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 gap-[2.5px]", className)}
      style={{ gridTemplateColumns: `repeat(${mark.cols}, 4px)` }}
    >
      {Array.from({ length: mark.cells }, (_, cell) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed lattice cells, never reordered
          key={cell}
          className={cn(
            "size-1 rounded-full",
            mark.lit.includes(cell)
              ? "bg-signal shadow-[0_0_6px_rgb(244_26_68/0.6)]"
              : "bg-white/[0.09]",
          )}
        />
      ))}
    </span>
  );
}

/** Plan names: JetBrains Mono, uppercase, wide tracking. */
export const planNameClass =
  "font-medium font-mono text-[14px] text-ink uppercase leading-5 tracking-[0.18em]";

const chipClass =
  "inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 font-mono text-[10.5px] uppercase leading-none tracking-[0.14em]";

/** "POPULAR": inverted, bone on near-black text. */
export function PopularChip() {
  return (
    <span
      data-popular
      className={cn(
        styles.chip,
        chipClass,
        "bg-bone font-semibold text-canvas",
      )}
    >
      {plansPage.agent.popular}
    </span>
  );
}

const DOT = {
  ok: "bg-ok shadow-[0_0_6px_rgb(102_224_119/0.55)]",
  off: "bg-ink-subtle",
  unknown: "bg-[#d9a441] shadow-[0_0_6px_rgb(217_164_65/0.5)]",
};

/** A dark chip with a status dot ("● Current plan", "● Active"). */
export function StatusChip({
  dot,
  label,
  current = false,
  children,
}: {
  dot: keyof typeof DOT;
  /** Spoken before the visible text, when the text alone is ambiguous. */
  label?: string;
  /** Marks the current plan's chip, which takes the place of "Popular". */
  current?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      data-current={current || undefined}
      className={cn(
        styles.chip,
        chipClass,
        "border border-[#2b2c30] bg-[#18191b] font-medium text-ink-label",
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 shrink-0 rounded-full", DOT[dot])}
      />
      {label ? <span className="sr-only">{label}</span> : null}
      {children}
    </span>
  );
}

export function CurrentPlanChip() {
  return (
    <StatusChip dot="ok" current>
      {plansPage.current}
    </StatusChip>
  );
}

const PRICE_SIZE = {
  lg: {
    gap: "gap-1.5",
    price:
      "text-[44px] leading-[48px] tracking-[-0.035em] sm:text-[48px] sm:leading-[52px]",
    suffix: "text-[16px]",
  },
  md: {
    gap: "gap-1",
    price: "text-[22px] leading-7 tracking-[-0.03em]",
    suffix: "text-[14px]",
  },
};

/** "$500/mo", read as "$500 per month". */
export function Price({
  price,
  suffix,
  size = "lg",
  className,
}: {
  price: string;
  suffix?: string;
  size?: keyof typeof PRICE_SIZE;
  className?: string;
}) {
  const s = PRICE_SIZE[size];
  const spoken = suffix ? `${price} ${perPeriod(suffix)}` : price;
  return (
    <p className={cn("flex items-baseline", s.gap, className)}>
      <span
        aria-hidden
        className={cn("font-semibold text-ink tabular-nums", s.price)}
      >
        {price}
      </span>
      {suffix ? (
        <span
          aria-hidden
          className={cn("font-medium text-ink-2 tracking-[-0.02em]", s.suffix)}
        >
          {suffix}
        </span>
      ) : null}
      <span className="sr-only">{spoken}</span>
    </p>
  );
}

function perPeriod(suffix: string) {
  return suffix === "/year" ? plansPage.perYear : plansPage.perMonth;
}

/** "What's included:" and the plan's features, with small neutral CSS dots. */
export function Included({
  features,
  onWine = false,
  className,
}: {
  features: readonly string[];
  /** On the featured column's red: bone text, dimmed bone dots. */
  onWine?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p
        className={cn(
          "font-medium text-[14px] leading-5 tracking-[-0.02em]",
          onWine ? "text-bone/70" : "text-ink-2",
        )}
      >
        {plansPage.agent.included}
      </p>
      {/* biome-ignore lint/a11y/noRedundantRoles: list-style: none drops list semantics in Safari/VoiceOver. */}
      <ul role="list" className="mt-4 flex flex-col gap-3.5">
        {features.map((feature) => (
          <li
            key={feature}
            className={cn(
              // A 4px dot centred on the first 20px line, the text 18px in.
              "flex items-start gap-3.5 font-medium text-[15px] leading-5 tracking-[-0.02em]",
              "before:mt-2 before:size-1 before:shrink-0 before:rounded-full",
              onWine
                ? "text-bone before:bg-bone/40"
                : "text-ink-label before:bg-ink-subtle",
            )}
          >
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The agent plans' heading: where focus goes when the plan-read notice leaves with it. */
export const AGENT_PLANS_HEADING_ID = "agent-plans-heading";

/**
 * A section's eyebrow (the overview's vocabulary) and its line. Focusable
 * from script only (tabIndex -1), so focus has somewhere to land.
 */
export function SectionHeading({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <h2 id={id} tabIndex={-1} className={cn(eyebrowClass, "outline-none")}>
        {title}
      </h2>
      {description ? (
        <p className="font-medium text-[15px] text-ink-2 leading-[21.5px] tracking-[-0.025em]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

/**
 * "● Preview" and the sentence that explains it, under the page title: the
 * developer pages' preview note, in this page's concentric corners.
 */
export function PreviewNote({ children }: { children: ReactNode }) {
  return (
    <p
      className={cn(
        styles.note,
        "flex w-fit max-w-full items-start gap-3 border border-line bg-panel py-2.5 pr-4 pl-2.5 font-medium text-[14px] text-ink-2 leading-6 tracking-[-0.02em] sm:items-center",
      )}
    >
      <span
        className={cn(
          styles.noteChip,
          "inline-flex h-6 shrink-0 items-center gap-1.5 border border-[#2a2b2c] bg-[#191a1b] pr-2 pl-[7px] font-semibold text-[#d0d0d1] text-[11.5px] leading-none tracking-[-0.01em]",
        )}
      >
        <span
          aria-hidden
          className="size-1.5 shrink-0 rounded-full bg-[#d9a441] shadow-[0_0_6px_rgb(217_164_65/0.6)]"
        />
        {plansPage.preview}
      </span>
      <span className="min-w-0 text-pretty">{children}</span>
    </p>
  );
}

/*
 * Placeholders for the per-user parts while the plan read streams in. They
 * fade in only after 300ms (skeleton-delay) and are hidden from assistive
 * tech: the page announces "Loading your plan" once, not once per slot.
 */
/** The extension's status chip: as wide as "● Inactive" (96px; "● Active" is 81px). */
export function ChipSkeleton() {
  return (
    <span aria-hidden className="skeleton-delay flex">
      <Skeleton className={cn(styles.chip, "h-6 w-24 bg-[#1b1d1f]")} />
    </span>
  );
}

export function ButtonSkeleton({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("skeleton-delay flex", className)}>
      <Skeleton className="h-11 w-full rounded-full bg-[#1b1d1f]" />
    </span>
  );
}
