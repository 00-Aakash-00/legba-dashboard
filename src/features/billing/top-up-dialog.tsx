"use client";

import { catchError, type ErrorInfo } from "next/error";
import { Suspense, use, useLayoutEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { billing } from "@/content/copy";
import { topUpDialog, topUpForm } from "./top-up";

/**
 * The top-up dialog root (mounted once, in the header). The frame and copy are
 * in the shell bundle; the form is a separate chunk loaded on first open (and
 * preloaded by every entry point). A slow chunk shows the form's skeleton, a
 * failed one says so and retries in place. Every state has a text Cancel
 * (icons belong to the navigation); Escape and the backdrop close it too.
 */
export function TopUpDialog() {
  const popupRef = useRef<HTMLDivElement>(null);
  // Activity hides the shell on some navigations: never return to an open dialog.
  useLayoutEffect(() => () => topUpDialog.close(), []);

  return (
    <Dialog
      handle={topUpDialog}
      onOpenChange={(open) => {
        // Starts the form (or retries one that failed before) as the dialog opens.
        if (open) topUpForm.preload();
      }}
    >
      <DialogContent
        ref={popupRef}
        showCloseButton={false}
        // Touch focuses the popup, Base UI's own touch default (no virtual keyboard).
        initialFocus={(openType) =>
          openType === "touch" ? popupRef.current : chosenAmount()
        }
        className="max-h-[calc(100dvh-2rem)] gap-6 overflow-y-auto rounded-[20px] bg-panel p-6 shadow-[0_32px_80px_-24px_rgb(0_0_0/0.85)] ring-line duration-[220ms] ease-out-strong data-closed:duration-150 sm:max-w-[420px]"
      >
        <DialogHeader className="gap-1.5">
          <DialogTitle className="font-semibold text-[19px] text-bone leading-6 tracking-[-0.03em]">
            {billing.title}
          </DialogTitle>
          <DialogDescription className="text-[14px] leading-5">
            {billing.description}
          </DialogDescription>
        </DialogHeader>
        <TopUpBoundary>
          <Suspense fallback={<TopUpFormSkeleton />}>
            <TopUpFormLoader />
          </Suspense>
        </TopUpBoundary>
      </DialogContent>
    </Dialog>
  );
}

/** Keyboard and mouse open on the chosen preset; before the form loads, the first control. */
function chosenAmount() {
  return (
    document.querySelector<HTMLElement>(
      "[data-amount-presets] [aria-pressed='true']",
    ) ?? true
  );
}

function TopUpFormLoader() {
  const { TopUpForm } = use(topUpForm.load());
  return <TopUpForm />;
}

/** The way out while the form is loading or failed; the form has its own. */
function CancelButton() {
  return (
    <DialogClose
      render={
        <Button
          variant="ghost"
          size="pill-md"
          className="rounded-full text-ink-label pointer-coarse:h-11"
        />
      }
    >
      {billing.cancel}
    </DialogClose>
  );
}

/**
 * Mirrors the form (presets, field, actions); the placeholders fade in only
 * if the chunk is slow. Cancel is real from the start, where the form's is.
 */
function TopUpFormSkeleton() {
  return (
    <div aria-busy className="grid gap-5">
      <p role="status" className="sr-only">
        {billing.loading}
      </p>
      <div className="skeleton-delay grid gap-2.5">
        <Skeleton className="h-4 w-16 rounded-[6px]" />
        <div className="mt-2.5 grid grid-cols-4 gap-2">
          {billing.presets.map((dollars) => (
            <Skeleton key={dollars} className="h-11 rounded-[12px]" />
          ))}
        </div>
        <Skeleton className="mt-2 h-4 w-28 rounded-[6px]" />
        <Skeleton className="h-11 rounded-[12px]" />
        <div className="min-h-5" />
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <CancelButton />
        <div className="skeleton-delay">
          <Skeleton className="h-10 rounded-full sm:w-36 pointer-coarse:h-11" />
        </div>
      </div>
    </div>
  );
}

// camelCase on purpose: catchError calls this as a function, not a component.
function renderFormError(_props: object, { reset }: ErrorInfo) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <p
        role="alert"
        className="max-w-xs text-[14px] text-muted-foreground leading-relaxed"
      >
        {billing.loadFailed}
      </p>
      <div className="flex items-center gap-2">
        <CancelButton />
        <Button
          variant="wine"
          size="pill-md"
          className="pointer-coarse:h-11"
          onClick={() => {
            topUpForm.retry();
            reset();
          }}
        >
          {billing.retry}
        </Button>
      </div>
    </div>
  );
}

const TopUpBoundary = catchError(renderFormError);
