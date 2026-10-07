import type { ReactNode } from "react";
import { workspace } from "@/content/copy";
import { cn } from "@/lib/utils";

/** Numbered setup steps: the order is real, so the numbers stay visible. */
export function StepList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    // biome-ignore lint/a11y/noRedundantRoles: list-style: none drops list semantics in Safari/VoiceOver.
    <ol role="list" className={cn("flex flex-col", className)}>
      {children}
    </ol>
  );
}

/**
 * One step: a numbered tile (the overview's pixel-square vocabulary) joined
 * to the next by a hairline, the title (a heading, so "Step 2: …" is reachable
 * by heading), an optional line of detail and action, and optional content
 * such as a code panel, which spans the card's full width on phones.
 */
export function Step({
  number,
  title,
  body,
  action,
  children,
}: {
  number: number;
  title: string;
  body?: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <li className="group/step relative flex gap-4 pb-7 last:pb-0">
      {/* On phones a step's content spans the card, across the line's path,
          and the line (positioned) would paint over it. */}
      <span
        aria-hidden
        className={cn(
          "absolute top-10 bottom-2 left-4 w-px bg-[linear-gradient(180deg,#2c2e30,rgb(44_46_48/0.15))] group-last/step:hidden",
          children ? "max-sm:hidden" : null,
        )}
      />
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-[10px] border border-line-chip bg-[linear-gradient(180deg,#1b1c1e,#151617)] font-semibold text-[13px] text-bone tabular-nums shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]"
      >
        {number}
      </span>
      <div className="min-w-0 flex-1 pt-[5px]">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h3 className="text-balance font-semibold text-[15.5px] text-ink leading-[22px] tracking-[-0.02em]">
              <span className="sr-only">{workspace.step(number)}</span>
              {title}
            </h3>
            {body ? (
              <p className="mt-1 text-pretty font-medium text-[14px] text-ink-2 leading-5 tracking-[-0.015em]">
                {body}
              </p>
            ) : null}
          </div>
          {/* Centred on the title's line (and the number tile) beside it;
              under the text when it wraps on phones. */}
          {action ? <div className="sm:-my-[9px]">{action}</div> : null}
        </div>
        {children ? <div className="mt-4 max-sm:-ml-12">{children}</div> : null}
      </div>
    </li>
  );
}
