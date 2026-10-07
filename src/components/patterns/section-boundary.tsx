"use client";

import { catchError, type ErrorInfo } from "next/error";
import { useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";
import { states } from "@/content/copy";
import { cn } from "@/lib/utils";

type SectionBoundaryProps = {
  /** What failed, in the section's own words (from copy.ts). */
  title: string;
  /** Why, and what happens to the user's data. */
  body: string;
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
  className,
  reference,
  retry,
}: SectionBoundaryProps & { reference?: string; retry: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <div
      role="alert"
      className={cn(
        "flex h-full min-h-40 flex-col items-center justify-center gap-3 rounded-[inherit] px-6 py-8 text-center",
        className,
      )}
    >
      <p className="font-semibold text-base text-foreground">{title}</p>
      <p className="max-w-sm text-muted-foreground text-sm leading-relaxed">
        {body}
      </p>
      {reference ? (
        <p className="font-mono text-muted-foreground/70 text-xs">
          {states.reference(reference)}
        </p>
      ) : null}
      <button
        type="button"
        disabled={pending}
        aria-busy={pending || undefined}
        onClick={() => startTransition(() => retry())}
        className="mt-1 inline-flex h-10 items-center gap-2 rounded-full border border-wine-line bg-wine-fill px-5 font-semibold text-foreground text-sm transition-[transform,background-color] duration-150 ease-out-strong active:scale-[0.97] disabled:opacity-80 hover:bg-wine-fill-hover"
      >
        {pending ? <Spinner decorative tone="accent" /> : null}
        {pending ? states.retrying : states.retry}
      </button>
    </div>
  );
}
