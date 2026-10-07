/**
 * Shared look for the create and revoke dialogs: a bottom sheet in thumb
 * reach below 640px (240ms drawer curve), a centred card above it (220ms).
 * Transform and opacity only; reduced motion keeps the fade and drops the
 * movement. `data-kbd` marks a dialog opened or closed from the keyboard,
 * which skips the animation (emil-design-eng).
 */

// Above the toaster (sonner: 999999999): a stale toast must not cover a modal's buttons.
const LAYER = "z-[1000000000]";

export const sheetBackdrop = [
  LAYER,
  "fixed inset-0 min-h-dvh bg-black/70 supports-[-webkit-touch-callout:none]:absolute",
  "transition-opacity duration-200 ease-out-strong data-ending-style:duration-150",
  "data-starting-style:opacity-0 data-ending-style:opacity-0 data-kbd:transition-none",
].join(" ");

export const sheetPopup = [
  // Phone: bottom sheet.
  LAYER,
  "fixed inset-x-0 bottom-0 flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-y-auto overscroll-contain outline-none",
  "rounded-t-[24px] border-line border-t bg-panel px-5 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-ink",
  "shadow-[0_-24px_64px_-24px_rgb(0_0_0/0.9)]",
  // The hero CTA's light streak, along the top edge.
  "before:pointer-events-none before:absolute before:inset-x-16 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgb(240_32_63/0.85),transparent)] before:shadow-[0_0_10px_rgb(240_32_63/0.55)] sm:before:inset-x-24",
  "transition-[translate,scale,opacity] duration-[240ms] ease-drawer data-ending-style:duration-[180ms]",
  "data-starting-style:opacity-0 data-ending-style:opacity-0",
  "motion-safe:max-sm:data-starting-style:translate-y-full motion-safe:max-sm:data-ending-style:translate-y-full",
  // 640px and up: centred card.
  "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[calc(100dvh-4rem)] sm:w-[min(512px,calc(100vw-3rem))] sm:-translate-x-1/2 sm:-translate-y-1/2",
  "sm:rounded-card sm:border sm:p-6 sm:shadow-[0_32px_96px_-32px_rgb(0_0_0/0.9)]",
  "sm:duration-[220ms] sm:ease-out-strong sm:data-ending-style:duration-150",
  "motion-safe:sm:data-starting-style:scale-[0.96] motion-safe:sm:data-ending-style:scale-[0.96]",
  "data-kbd:transition-none",
].join(" ");

export const sheetTitle =
  "pr-10 font-semibold text-[20px] text-ink leading-7 tracking-[-0.03em]";

export const sheetDescription =
  "mt-1.5 font-medium text-[14.5px] text-ink-2 leading-[21px] tracking-[-0.02em]";

export const sheetFooter =
  "mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end";

/** Footer buttons: full-width 48px targets on phones. */
export const sheetButton = "max-sm:h-12 max-sm:w-full";

export const sheetClose =
  "absolute top-3.5 right-3.5 pointer-coarse:h-11 sm:top-4 sm:right-4";

/** True when Base UI's change event came from the keyboard (Enter/Space/Escape). */
export function fromKeyboard(event: Event) {
  if (event instanceof KeyboardEvent) return true;
  // Enter or Space on a button dispatches a click whose detail (click count) is 0.
  return (
    event.type === "click" && event instanceof MouseEvent && event.detail === 0
  );
}
