"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Dialog } from "@base-ui/react/dialog";
import { unstable_rethrow } from "next/navigation";
import type { ReactNode, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { states } from "@/content/copy";
import { cn } from "@/lib/utils";
import type { PlanActionResult } from "./actions";
import styles from "./plans.module.css";

export type Failure = { message: string; reference?: string };

export type ActionOutcome = { ok: true } | { ok: false; failure: Failure };

/**
 * Calls a plan action and turns every way it can fail into a message that
 * says what happened to the user's money: the service answered with a
 * failure (with its Ref for support), or the request never completed.
 */
export async function callPlanAction(
  action: () => Promise<PlanActionResult>,
  copy: { failed: string; offline: string },
): Promise<ActionOutcome> {
  try {
    const result = await action();
    if (result.ok) return { ok: true };
    return {
      ok: false,
      failure: { message: copy.failed, reference: result.reference },
    };
  } catch (error) {
    unstable_rethrow(error);
    // The request didn't complete (network down or dropped).
    const offline = !navigator.onLine || error instanceof TypeError;
    return {
      ok: false,
      failure: { message: offline ? copy.offline : copy.failed },
    };
  }
}

/** True when an event came from the keyboard (Enter/Space/Escape). */
export function fromKeyboard(event: Event) {
  if (event instanceof KeyboardEvent) return true;
  // Enter or Space on a button dispatches a click whose detail (click count) is 0.
  return (
    event.type === "click" && event instanceof MouseEvent && event.detail === 0
  );
}

// Above the toaster (sonner: 999999999): a stale toast must not cover the buttons.
const LAYER = "z-[1000000000]";

const backdrop = cn(
  LAYER,
  "fixed inset-0 min-h-dvh bg-black/70 supports-[-webkit-touch-callout:none]:absolute",
  "transition-opacity duration-200 ease-out-strong data-ending-style:duration-150",
  "data-starting-style:opacity-0 data-ending-style:opacity-0 data-kbd:transition-none",
);

// Radius and padding come from styles.dialog (concentric with the boxes inside).
const popup = cn(
  LAYER,
  // Phone: a bottom sheet in thumb reach.
  "fixed inset-x-0 bottom-0 flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-y-auto overscroll-contain outline-none",
  "border-line border-t bg-panel text-ink shadow-[0_-24px_64px_-24px_rgb(0_0_0/0.9)]",
  // The hero CTA's light streak, along the top edge.
  "before:pointer-events-none before:absolute before:inset-x-16 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgb(240_32_63/0.85),transparent)] before:shadow-[0_0_10px_rgb(240_32_63/0.55)] sm:before:inset-x-24",
  "transition-[translate,scale,opacity] duration-[240ms] ease-drawer data-ending-style:duration-[180ms]",
  "data-starting-style:opacity-0 data-ending-style:opacity-0",
  "motion-safe:max-sm:data-starting-style:translate-y-full motion-safe:max-sm:data-ending-style:translate-y-full",
  // 640px and up: a centred card.
  "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[calc(100dvh-4rem)] sm:w-[min(468px,calc(100vw-3rem))] sm:-translate-x-1/2 sm:-translate-y-1/2",
  "sm:border sm:shadow-[0_32px_96px_-32px_rgb(0_0_0/0.9)]",
  "sm:duration-[220ms] sm:ease-out-strong sm:data-ending-style:duration-150",
  "motion-safe:sm:data-starting-style:scale-[0.96] motion-safe:sm:data-ending-style:scale-[0.96]",
  "data-kbd:transition-none",
);

/** Footer buttons: full-width 48px targets on phones. */
const footerButton = "max-sm:h-12 max-sm:w-full pointer-coarse:h-12";

type ConfirmDialogProps = {
  /** An alert dialog: for a confirmation that takes something away. */
  alert?: boolean;
  open: boolean;
  /** `keyboard` is true when the change came from the keyboard. */
  onOpenChange: (open: boolean, keyboard: boolean) => void;
  /** Opened or closed from the keyboard: no animation (emil-design-eng). */
  keyboard: boolean;
  pending: boolean;
  failure: Failure | null;
  /** Where focus lands on close: the button that opened the dialog. */
  finalFocus: RefObject<HTMLElement | null>;
  title: string;
  description: ReactNode;
  /** What is being confirmed, in a box at the dialog's inset. */
  summary?: ReactNode;
  note?: string;
  cancelLabel: string;
  confirmLabel: string;
  pendingLabel: string;
  onConfirm: () => void;
  /** After the dialog has finished closing (its exit animation included). */
  onClosed?: () => void;
};

/**
 * A confirmation for a plan change. While the request runs, the dialog can't
 * be dismissed (closing would hide its outcome): the confirm button shows the
 * orb and Cancel is disabled. A failure stays in the dialog, next to the
 * button that failed, with its Ref; the owner closes it on success and toasts.
 */
export function ConfirmDialog({
  alert = false,
  open,
  onOpenChange,
  keyboard,
  pending,
  failure,
  finalFocus,
  title,
  description,
  summary,
  note,
  cancelLabel,
  confirmLabel,
  pendingLabel,
  onConfirm,
  onClosed,
}: ConfirmDialogProps) {
  function handleOpenChangeComplete(next: boolean) {
    if (!next) onClosed?.();
  }

  function handleOpenChange(
    next: boolean,
    details: { cancel: () => void; event: Event },
  ) {
    if (!next && pending) {
      details.cancel();
      return;
    }
    onOpenChange(next, fromKeyboard(details.event));
  }

  // AlertDialog differs from Dialog only in its root (role, no outside press).
  const content = (
    <Dialog.Portal>
      <Dialog.Backdrop data-kbd={keyboard || undefined} className={backdrop} />
      <Dialog.Popup
        data-kbd={keyboard || undefined}
        aria-busy={pending || undefined}
        finalFocus={finalFocus}
        className={cn(styles.dialog, popup)}
      >
        <Dialog.Title className="font-semibold text-[20px] text-ink leading-7 tracking-[-0.03em]">
          {title}
        </Dialog.Title>
        <Dialog.Description className="mt-1.5 text-pretty font-medium text-[14.5px] text-ink-2 leading-[21px] tracking-[-0.02em]">
          {description}
        </Dialog.Description>
        {summary ? (
          <div
            className={cn(
              styles.dialogInset,
              "mt-5 border border-line-ring bg-[linear-gradient(180deg,#18191b,#141516)] px-4 py-3.5",
            )}
          >
            {summary}
          </div>
        ) : null}
        {note ? (
          <p className="mt-4 font-medium text-[13.5px] text-ink-subtle leading-5 tracking-[-0.01em]">
            {note}
          </p>
        ) : null}
        {failure ? (
          <div
            role="alert"
            className={cn(
              styles.dialogInset,
              "mt-4 flex gap-3 border border-signal/25 bg-signal/[0.06] px-4 py-3 font-medium text-[14px] text-ink leading-5",
            )}
          >
            <span
              aria-hidden
              className="mt-[7px] size-1.5 shrink-0 rounded-[1.5px] bg-signal shadow-[0_0_6px_rgb(244_26_68/0.6)]"
            />
            <div className="min-w-0">
              <p className="text-pretty">{failure.message}</p>
              {failure.reference ? (
                <p className="mt-1 font-mono text-[12px] text-ink-caption">
                  {states.reference(failure.reference)}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Dialog.Close
            disabled={pending}
            render={
              <Button
                variant="outline-pill"
                size="pill-md"
                className={footerButton}
              />
            }
          >
            {cancelLabel}
          </Dialog.Close>
          <Button
            variant="pill-red"
            size="pill-md"
            disabled={pending}
            focusableWhenDisabled
            aria-busy={pending || undefined}
            onClick={onConfirm}
            className={cn(
              footerButton,
              "px-6 data-disabled:opacity-90 sm:min-w-44",
            )}
          >
            {pending ? <Spinner className="pending-delay" /> : null}
            {pending ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </Dialog.Popup>
    </Dialog.Portal>
  );

  return alert ? (
    <AlertDialog.Root
      open={open}
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={handleOpenChangeComplete}
    >
      {content}
    </AlertDialog.Root>
  ) : (
    <Dialog.Root
      open={open}
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={handleOpenChangeComplete}
    >
      {content}
    </Dialog.Root>
  );
}
