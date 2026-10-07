import type { ReactNode } from "react";
import {
  HairlineFigure,
  type HairlineKind,
} from "@/components/hairline/hairline-figure";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

/**
 * First-use empty state (ux-guidelines: say what belongs here and offer the
 * action that creates it). shadcn Empty with the page's own hairline figure,
 * decorative because the title and body already say everything. No icons:
 * they appear only in the nav bar and on the login screens.
 */
export function EmptyState({
  figure,
  title,
  body,
  action,
  className,
}: {
  /** The figure drawn for this one place (every figure is used once). */
  figure?: HairlineKind;
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Empty
      className={cn("flex-none gap-7 border-0 px-6 py-12 sm:py-16", className)}
    >
      <EmptyHeader className="max-w-[440px] gap-0">
        {figure ? (
          <EmptyMedia className="mb-5">
            <HairlineFigure kind={figure} decorative className="h-40 w-50" />
          </EmptyMedia>
        ) : null}
        <h3
          data-slot="empty-title"
          className="font-semibold text-[19px] text-ink leading-6 tracking-[-0.03em]"
        >
          {title}
        </h3>
        <EmptyDescription className="mt-2 font-medium text-[15px] text-ink-2 leading-[21.5px] tracking-[-0.025em]">
          {body}
        </EmptyDescription>
      </EmptyHeader>
      {action ? (
        <EmptyContent className="w-auto max-w-none max-sm:w-full max-sm:*:w-full">
          {action}
        </EmptyContent>
      ) : null}
    </Empty>
  );
}
