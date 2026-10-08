"use client";

import { catchError, type ErrorInfo } from "next/error";
import { useId, useTransition } from "react";
import {
  HairlineFigure,
  type HairlineKind,
} from "@/components/hairline/hairline-figure";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { states } from "@/content/copy";
import { cn } from "@/lib/utils";

type SectionBoundaryProps = {
  /** What failed, in the section's own words (from copy.ts). */
  title: string;
  /** Why, and what happens to the user's data. */
  body: string;
  /** The figure drawn for this section's failure (every figure is used once). */
  figure?: HairlineKind;
  className?: string;
};

function digestOf(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string"
    ? error.digest
    : undefined;
}

// camelCase on purpose: catchError calls this as a function, not a component.
function renderSectionError(
  props: SectionBoundaryProps,
  { error, retry }: ErrorInfo,
) {
  return <SectionError {...props} reference={digestOf(error)} retry={retry} />;
}

/**
 * Section-level error boundary (ux-guidelines: section independence). The
 * failed section renders an in-place card the size of its slot; the shell and
 * healthy sections keep working. `retry()` refreshes the route in a
 * transition, so only this box visibly changes.
 */
export const SectionBoundary = catchError(renderSectionError);

export function SectionError({
  title,
  body,
  figure,
  className,
  reference,
  retry,
}: SectionBoundaryProps & { reference?: string; retry: () => void }) {
  const [pending, startTransition] = useTransition();
  const labelId = useId();
  return (
    <div
      className={cn(
        "flex h-full min-h-40 flex-col items-center justify-center gap-3 rounded-[inherit] px-6 py-8 text-center",
        className,
      )}
    >
      {figure ? (
        <HairlineFigure
          kind={figure}
          decorative
          className="mb-1 h-32 shrink-0"
        />
      ) : null}
      {/* Only the message is live, so the button's label changes don't re-announce it. */}
      <div role="alert" className="flex flex-col items-center gap-2">
        <p className="font-semibold text-base text-foreground">{title}</p>
        <p className="max-w-sm text-muted-foreground text-sm leading-relaxed">
          {body}
        </p>
        {reference ? (
          <p className="font-mono text-muted-foreground text-xs">
            {states.reference(reference)}
          </p>
        ) : null}
      </div>
      <Button
        variant="wine"
        size="pill-md"
        className="mt-1 data-disabled:opacity-80 pointer-coarse:h-11"
        disabled={pending}
        focusableWhenDisabled
        aria-busy={pending || undefined}
        aria-labelledby={labelId}
        onClick={() => startTransition(retry)}
      >
        {pending ? <Spinner tone="accent" className="pending-delay" /> : null}
        <span id={labelId}>{pending ? states.retrying : states.retry}</span>
      </Button>
    </div>
  );
}
