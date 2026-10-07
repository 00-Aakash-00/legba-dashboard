import type { Route } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { overview } from "@/content/copy";
import { PreviewChip } from "@/features/developers/preview-chip";
import { cn } from "@/lib/utils";

/*
 * Shared pieces of the two docs cards (docs/design/spec/overview.json
 * docs.product.* / docs.api.*). Offsets are measured in CSS px from the card's
 * outer edge in the 1440 mockup; the card has a 1px border, so insets are 1px
 * smaller. The mockup's "■ DOCS" eyebrow is gone (user, 2026-10-07): the
 * title takes its place, with its cap height 22px below the card's top edge.
 * The two cards differ by a pixel and a few colour steps in the mockup, so
 * each card has its own tone.
 */
const tones = {
  skill: {
    // The min-heights are the mockup's card heights: the art and the code
    // panel are absolutely placed in the wide layout, so they add no height.
    card: "min-h-[264.5px] pt-[21px] pb-[18px] xl:pb-[17.5px]",
    title: "text-[#f0f0f0]",
    body: "tracking-[-0.025em] text-[#9b9fa5]",
    cta: "text-[#e3dddc]",
  },
  api: {
    card: "min-h-[260px] pt-[21px] pb-[18px] xl:pb-[18.5px]",
    title: "text-[#f2f2f2]",
    body: "tracking-[-0.03em] text-[#a2a6ac]",
    cta: "text-[#dfd8da]",
  },
} as const;

type Tone = keyof typeof tones;

/** The card frame. `@container/docs` switches the layout at a 375px content
 * box (a 415px card, the narrowest that still fits the text beside the art or
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
  bodyClassName,
}: {
  tone: Tone;
  titleId: string;
  title: string;
  body: string;
  /** The body's measure in the wide layout (two lines, as in the mockup). */
  bodyClassName?: string;
}) {
  const t = tones[tone];
  return (
    <div className="relative z-10">
      {/* Boxes are trimmed to the ink (cap height to baseline or descent) so
          they measure like the spec; margins switch with the trim so browsers
          without text-box keep the same baselines. The Preview chip (the
          app's one chip for what isn't public yet) has negative margins that
          keep the row as tall as the title, centred on its caps. */}
      <div className="-mt-[5.5px] flex flex-wrap items-center gap-x-2.5 gap-y-3 supports-[text-box:trim-both_cap_alphabetic]:mt-0">
        <h2
          id={titleId}
          className={cn(
            "font-semibold text-[19px] leading-6 tracking-[-0.03em] [text-box:trim-both_cap_alphabetic]",
            t.title,
          )}
        >
          {title}
        </h2>
        <span className="-my-[5.35px] flex">
          <PreviewChip />
        </span>
      </div>
      <p
        className={cn(
          "mt-[12.2px] text-pretty font-medium text-[15px] leading-[21.5px] [text-box:trim-both_cap_text] supports-[text-box:trim-both_cap_text]:mt-[23px]",
          t.body,
          bodyClassName,
        )}
      >
        {body}
      </p>
    </div>
  );
}

/** Explore pill: a link styled with the wine button variant, tuned to the
 * mockup (horizontal fill, border brightest at the caps, inner rim glow). The
 * fill and border live on a pseudo-element behind the label so the border can
 * carry a gradient on a fully rounded shape. An app `route` opens in place; an
 * external `href` opens in a new tab. */
export function ExploreLink({
  tone,
  label,
  context,
  className,
  ...destination
}: {
  tone: Tone;
  label: string;
  /** Spoken after the label so the link names its destination. */
  context: string;
  className?: string;
} & ({ route: Route } | { href: string })) {
  const classes = cn(
    buttonVariants({ variant: "wine", size: "pill-md" }),
    "relative isolate z-10 h-[42.5px] w-[137.5px] justify-center self-start border-transparent bg-none px-0 text-[14px] leading-[18px] tracking-[-0.03em] pointer-coarse:h-11 motion-reduce:active:not-aria-[haspopup]:scale-100",
    "before:absolute before:-inset-px before:-z-10 before:rounded-[inherit] before:border before:border-transparent before:shadow-[inset_0_0_10px_rgb(160_24_40/0.35)] before:[background:radial-gradient(22px_70%_at_0_50%,rgb(160_24_40/0.16),transparent)_padding-box,linear-gradient(90deg,#2f0f13_0%,#2f1013_20%,#2e1013_45%,#331114_60%,#361215_68%,#3c1315_80%,#421116_86%,#461117_90%,#471217_100%)_padding-box,linear-gradient(90deg,#b01b2c_0%,#a11c2b_15%,#971924_22%,#731720_50%,#73191f_64%,#9a1e2a_80%,#a4202d_88%,#a01e2c_100%)_border-box]",
    tones[tone].cta,
    className,
  );
  // Text only: icons belong to the navigation (AGENTS.md). Trimmed to cap
  // height and descent; the top margin cancels the descent so the caps sit
  // centred in the pill.
  const text = (
    <span className="[text-box:trim-both_cap_text] supports-[text-box:trim-both_cap_text]:mt-[3.5px]">
      {label}
    </span>
  );
  if ("route" in destination) {
    return (
      <Link href={destination.route} className={classes}>
        {text}
        <span className="sr-only"> {context}</span>
      </Link>
    );
  }
  return (
    <a
      href={destination.href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
    >
      {text}
      <span className="sr-only">{` ${context} ${overview.docs.opensInNewTab}`}</span>
    </a>
  );
}
