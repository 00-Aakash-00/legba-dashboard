"use client";

import { catchError, type ErrorInfo } from "next/error";
import { SectionError } from "@/components/patterns/section-boundary";
import { cn } from "@/lib/utils";
import { PlanFigure } from "./plan-figure";

type SubscriptionsBoundaryProps = {
  /** What failed, in the section's own words (from copy.ts). */
  title: string;
  /** Why, and what happens to the user's plans. */
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
function renderSubscriptionsError(
  { className, ...props }: SubscriptionsBoundaryProps,
  { error, retry }: ErrorInfo,
) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-[inherit] px-6 py-8",
        className,
      )}
    >
      <PlanFigure plan="shield" />
      <SectionError
        {...props}
        reference={digestOf(error)}
        retry={retry}
        className="h-auto min-h-0 p-0"
      />
    </div>
  );
}

/**
 * The area's section error boundary: the shared SectionError (message, Ref,
 * Try again) under a hairline figure, which AGENTS.md asks of every error
 * state. SectionBoundary has no figure slot yet; once it has one, this file
 * goes and its callers pass the figure to SectionBoundary instead.
 */
export const SubscriptionsBoundary = catchError(renderSubscriptionsError);
