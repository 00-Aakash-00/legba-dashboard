import { ArrowUpRightIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { overview } from "@/content/copy";
import { cn } from "@/lib/utils";

/*
 * Shared pieces of the two DOCS cards (docs/design/spec/overview.json
 * docs.product.* / docs.api.*). Offsets are measured in CSS px from the card's
 * outer edge in the 1440 mockup; the card has a 1px border, so insets are 1px
 * smaller. The two cards differ by a pixel or two and a few colour steps in
 * the mockup, so each card has its own tone.
 */
const tones = {
  product: {
    // The min-heights are the mockup's card heights: the art and the code
    // panel are absolutely placed in the wide layout, so they add no height.
    // The cards' own offsets differ by 1-2px in the mockup; below xl the
    // cards can sit side by side (md), so they share one offset there.
    card: "min-h-[264.5px] pt-[20.7px] pb-[18px] xl:pt-[19.7px] xl:pb-[17.5px]",
    eyebrow: "tracking-[-0.03em] text-[#b0b8c1]",
    title: "text-[#f0f0f0]",
    body: "tracking-[-0.025em] text-[#9b9fa5]",
    cta: "text-[#e3dddc]",
  },
  api: {
    card: "min-h-[260px] pt-[20.7px] pb-[18px] xl:pt-[21.7px] xl:pb-[18.5px]",
    eyebrow: "tracking-[-0.02em] text-[#b4bbc1]",
    title: "text-[#f2f2f2]",
    body: "tracking-[-0.03em] text-[#a2a6ac]",
    cta: "text-[#dfd8da]",
  },
} as const;

type Tone = keyof typeof tones;

/** The card frame. `@container/docs` switches the layout at a 375px content
 * box (a 415px card, the narrowest that still fits the title beside the art or
 * the 190px tab bar): below it the artwork stacks under the text
 * (responsive.md), above it sits on the right as in the mockup. Children's
 * `cqw` lengths are content-box based too. No overflow clipping:
 * DocumentStack's grid and glow extend past its box. */
export function docsCardClass(tone: Tone) {
  return cn(
    "@container/docs relative flex flex-col rounded-card border border-line bg-panel px-[19px]",
    tones[tone].card,
  );
}

export function DocsCardIntro({
  tone,
  titleId,
  title,
  body,
  className,
}: {
  tone: Tone;
  titleId: string;
  title: string;
  body: string;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <div className={cn("relative z-10", className)}>
      <div className="flex items-center gap-[11px]">
        <span
          aria-hidden
          className="size-[18px] shrink-0 rounded-[4px] bg-signal-bullet"
        />
        <p
          className={cn(
            "font-semibold text-[13px] leading-4 [text-box:trim-both_cap_alphabetic]",
            t.eyebrow,
          )}
        >
          {overview.docs.eyebrow}
        </p>
      </div>
      {/* Boxes are trimmed to the ink (cap height to baseline or descent) so
          they measure like the spec; margins switch with the trim so browsers
          without text-box keep the same baselines. */}
      <h2
        id={titleId}
        className={cn(
          "mt-[29px] w-fit font-semibold text-[19px] leading-6 tracking-[-0.03em] [text-box:trim-both_cap_alphabetic] supports-[text-box:trim-both_cap_alphabetic]:mt-[33.5px]",
          t.title,
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "mt-[11.3px] text-pretty font-medium text-[15px] leading-[21.5px] [text-box:trim-both_cap_text] supports-[text-box:trim-both_cap_text]:mt-[23px]",
          t.body,
        )}
      >
        {body}
      </p>
    </div>
  );
}

/** Explore pill: an external link styled with the wine button variant, tuned
 * to the mockup (horizontal fill, border brightest at the caps, inner rim
 * glow). The fill and border live on a pseudo-element behind the label so the
 * border can carry a gradient on a fully rounded shape. */
export function ExploreLink({
  tone,
  href,
  label,
  context,
  className,
}: {
  tone: Tone;
  href: string;
  label: string;
  /** Spoken after the label so the link names its destination. */
  context: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({ variant: "wine", size: "pill-md" }),
        "relative isolate z-10 h-[42.5px] w-[137.5px] justify-between self-start border-transparent bg-none pr-[22.6px] pl-[27.7px] text-[14px] leading-[18px] tracking-[-0.03em] pointer-coarse:h-11 motion-reduce:active:not-aria-[haspopup]:scale-100",
        "before:absolute before:-inset-px before:-z-10 before:rounded-[inherit] before:border before:border-transparent before:shadow-[inset_0_0_10px_rgb(160_24_40/0.35)] before:[background:radial-gradient(22px_70%_at_0_50%,rgb(160_24_40/0.16),transparent)_padding-box,linear-gradient(90deg,#2f0f13_0%,#2f1013_20%,#2e1013_45%,#331114_60%,#361215_68%,#3c1315_80%,#421116_86%,#461117_90%,#471217_100%)_padding-box,linear-gradient(90deg,#b01b2c_0%,#a11c2b_15%,#971924_22%,#731720_50%,#73191f_64%,#9a1e2a_80%,#a4202d_88%,#a01e2c_100%)_border-box]",
        tones[tone].cta,
        className,
      )}
    >
      {/* Trimmed to cap height and descent; the top margin cancels the
          descent so the caps sit centred in the pill. */}
      <span className="[text-box:trim-both_cap_text] supports-[text-box:trim-both_cap_text]:mt-[3.5px]">
        {label}
      </span>
      <span className="sr-only">
        {` ${context} ${overview.docs.opensInNewTab}`}
      </span>
      <ArrowUpRightIcon
        aria-hidden
        strokeWidth={1.85}
        className="size-[26px] text-[#f4d5da]"
      />
    </a>
  );
}
