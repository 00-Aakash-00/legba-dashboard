"use client";

import { XIcon } from "lucide-react";
import { catchError, type ErrorInfo } from "next/error";
import { Suspense, use, useLayoutEffect } from "react";
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
 * failed one says so and retries in place.
 */
export function TopUpDialog() {
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
        showCloseButton={false}
        initialFocus={focusChosenAmount}
        className="max-h-[calc(100dvh-2rem)] gap-6 overflow-y-auto rounded-[20px] bg-panel p-6 shadow-[0_32px_80px_-24px_rgb(0_0_0/0.85)] ring-line duration-[220ms] ease-out-strong data-closed:duration-150 sm:max-w-[420px]"
      >
        <DialogHeader className="gap-1.5 pr-10">
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
        {/* Last in the DOM: the dialog opens with focus on the amount, not on close. */}
        <DialogClose
          render={
            <Button
              variant="icon-ghost"
              size="icon-lg"
              className="absolute top-4 right-4 pointer-coarse:size-11"
            />
          }
        >
          <XIcon aria-hidden />
          <span className="sr-only">{billing.cancel}</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

/** Open on the chosen preset (keyboard and mouse); touch keeps Base UI's default. */
function focusChosenAmount(openType: string) {
  if (openType === "touch") return true;
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

/** Mirrors the form (presets, field, actions); fades in only if the chunk is slow. */
function TopUpFormSkeleton() {
  return (
    <div aria-busy className="skeleton-delay grid gap-5">
      <p role="status" className="sr-only">
        {billing.loading}
      </p>
      <div className="grid gap-2.5">
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
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-36 rounded-full" />
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
      <Button
        variant="wine"
        size="pill-md"
        onClick={() => {
          topUpForm.retry();
          reset();
        }}
      >
        {billing.retry}
      </Button>
    </div>
  );
}

const TopUpBoundary = catchError(renderFormError);
