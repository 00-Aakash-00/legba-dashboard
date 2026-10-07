import Link from "next/link";
import type { ReactNode } from "react";
import { Mark, Wordmark } from "@/components/brand/logo";
import {
  HairlineFigure,
  type HairlineKind,
} from "@/components/hairline/hairline-figure";
import { brand, states } from "@/content/copy";
import { cn } from "@/lib/utils";
import { eyebrowClass } from "./section-card";

/**
 * A calm, centred message for errors and missing pages, in the overview's
 * vocabulary: the screen's own hairline figure (decorative; the copy says
 * everything), the eyebrow, one heading, what happened and what to do next,
 * and the way out.
 */
export function StatusScreen({
  figure,
  eyebrow,
  title,
  body,
  reference,
  actions,
  className,
}: {
  /** The figure drawn for this one screen (every figure is used once). */
  figure?: HairlineKind;
  eyebrow: string;
  title: string;
  body: string;
  /** Error digest, shown as "Ref …" for support. */
  reference?: string;
  actions: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center px-2 py-14 text-center sm:py-20",
        className,
      )}
    >
      {figure ? (
        <HairlineFigure kind={figure} decorative className="h-52 w-65" />
      ) : null}
      <p className={cn(figure ? "mt-6" : null, eyebrowClass)}>{eyebrow}</p>
      <h1 className="mt-4 max-w-[560px] text-balance font-semibold text-[28px] text-ink leading-8 tracking-[-0.03em] sm:text-[32px] sm:leading-[38px]">
        {title}
      </h1>
      <p className="mt-3 max-w-[440px] text-pretty font-medium text-[15px] text-ink-2 leading-[21.5px] tracking-[-0.025em]">
        {body}
      </p>
      {reference ? (
        <p className="mt-3 font-mono text-[12px] text-ink-subtle">
          {states.reference(reference)}
        </p>
      ) : null}
      <div className="mt-8 flex w-full max-w-[360px] flex-col-reverse gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
        {actions}
      </div>
    </div>
  );
}

/**
 * For pages that render outside the app shell (unknown URLs, a failed shell):
 * the header bar with the logo, so people still know where they are.
 */
export function StandaloneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas pr-[env(safe-area-inset-right,0px)] pl-[env(safe-area-inset-left,0px)]">
      <header className="border-line-header border-b bg-shell pt-[env(safe-area-inset-top,0px)]">
        <div className="flex h-14 items-center pl-[13.2px] lg:h-[60px] lg:pl-[12.8px]">
          <Link
            href="/"
            aria-label={brand.homeLabel}
            className="flex items-center gap-2 rounded-[8px] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-shell lg:gap-[9.5px]"
          >
            <Mark size={47} priority className="size-9 lg:size-[47px]" />
            <Wordmark
              height={21.75}
              className="h-[17px] w-auto lg:h-[21.75px]"
            />
          </Link>
        </div>
      </header>
      <main id="main" className="flex flex-1 flex-col px-4">
        {children}
      </main>
    </div>
  );
}
