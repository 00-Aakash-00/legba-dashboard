"use client";

import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { unstable_rethrow } from "next/navigation";
import {
  useActionState,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { billing, states } from "@/content/copy";
import { type TopUpState, topUpCredits } from "./actions";
import { type AmountResult, formatAmount, parseAmount } from "./amount";
import { topUpDialog } from "./top-up";

const idle: TopUpState = { status: "idle" };

type Choice = AmountResult | { ok: false; reason: "required" };

const choiceError = {
  format: billing.amountFormat,
  range: billing.amountInvalid,
  required: billing.amountRequired,
};

/** The amount the form would send: a typed amount wins over a preset. */
function resolve(preset: string | undefined, other: string): Choice {
  if (other.trim()) return parseAmount(other);
  if (preset) return parseAmount(preset);
  return { ok: false, reason: "required" };
}

/**
 * Runs the Server Action and delivers its outcome even if the dialog was
 * closed meanwhile: success always toasts (the dialog closes itself), and a
 * failure toasts when the inline message has nowhere left to render.
 */
async function submitTopUp(
  previous: TopUpState,
  formData: FormData,
): Promise<TopUpState> {
  let result: TopUpState;
  try {
    result = await topUpCredits(previous, formData);
  } catch (error) {
    unstable_rethrow(error);
    result = { status: "error", message: billing.offline };
  }
  // Text-only toasts: icons belong to the navigation.
  if (result.status === "success") {
    toast.success(billing.success(formatAmount(result.cents)), { icon: null });
    topUpDialog.close();
  } else if (result.status === "error" && !topUpDialog.isOpen) {
    toast.error(result.message, { icon: null });
  }
  return result;
}

/** The top-up form (lazy chunk): preset amounts or any amount from $5 to $10,000. */
export function TopUpForm() {
  const id = useId();
  const otherId = `${id}-other`;
  const errorId = `${id}-error`;
  const firstPresetRef = useRef<HTMLButtonElement>(null);
  const otherRef = useRef<HTMLInputElement>(null);

  const [preset, setPreset] = useState<string[]>([
    String(billing.defaultPreset),
  ]);
  const [other, setOther] = useState("");
  // Shown after the field is left or the form is sent; then kept live so it clears on fix.
  const [shownError, setShownError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(submitTopUp, idle);

  // A form that arrives after the dialog opened (slow chunk, or "Try again")
  // replaces the element that had focus, and Base UI parks focus on the popup
  // (again on the next frame). Move it to the chosen amount, as the dialog
  // does on open. Touch keeps the dialog's default.
  useLayoutEffect(() => {
    const popup =
      firstPresetRef.current?.closest<HTMLElement>('[role="dialog"]');
    if (!popup || !window.matchMedia("(pointer: fine)").matches) return;
    const focusChosen = () => {
      const active = document.activeElement;
      if (active !== document.body && active !== popup) return;
      popup
        .querySelector<HTMLElement>(
          "[data-amount-presets] [aria-pressed='true']",
        )
        ?.focus({ preventScroll: true });
    };
    focusChosen();
    const frame = requestAnimationFrame(focusChosen);
    return () => cancelAnimationFrame(frame);
  }, []);

  const choice = resolve(preset[0], other);
  const otherInvalid = shownError !== null && other.trim() !== "";

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={(event) => {
        if (choice.ok) return;
        event.preventDefault();
        setShownError(choiceError[choice.reason]);
        // Focus the first thing to fix: the typed amount, or the presets when nothing is chosen.
        (other.trim() ? otherRef : firstPresetRef).current?.focus();
      }}
      className="grid gap-5"
    >
      <input
        type="hidden"
        name="amount"
        value={other.trim() || preset[0] || ""}
      />
      <fieldset disabled={pending} className="grid min-w-0 gap-2.5">
        <legend className="mb-2.5 font-medium text-[13px] text-ink-label">
          {billing.amountLabel}
        </legend>
        <ToggleGroup
          value={preset}
          onValueChange={(value) => {
            setPreset(value);
            if (value.length > 0) {
              setOther("");
              setShownError(null);
            }
          }}
          // Named by the fieldset's legend ("Amount"), like the field below it.
          data-amount-presets
          aria-describedby={shownError && !other.trim() ? errorId : undefined}
          className="grid grid-cols-4 gap-2"
        >
          {billing.presets.map((dollars, index) => (
            <Toggle
              key={dollars}
              ref={index === 0 ? firstPresetRef : undefined}
              value={String(dollars)}
              className="press h-11 rounded-[12px] border border-line bg-field font-semibold text-[15px] text-ink-label tabular-nums outline-none transition-[background-color,border-color,color,scale] duration-150 ease-out-strong hover:border-line-strong hover:text-bone focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 data-pressed:border-wine-line data-pressed:bg-[linear-gradient(180deg,var(--color-wine-fill)_0%,var(--color-wine-fill-end)_100%)] data-pressed:text-bone pointer-coarse:h-12"
            >
              {formatAmount(dollars * 100)}
            </Toggle>
          ))}
        </ToggleGroup>

        <label
          htmlFor={otherId}
          className="mt-2 font-medium text-[13px] text-ink-label"
        >
          {billing.other}
        </label>
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-base text-ink-subtle pointer-fine:text-[15px]"
          >
            $
          </span>
          <input
            ref={otherRef}
            id={otherId}
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="done"
            placeholder={billing.otherPlaceholder}
            value={other}
            aria-invalid={otherInvalid || undefined}
            aria-describedby={shownError ? errorId : undefined}
            onChange={(event) => {
              const next = event.target.value;
              setOther(next);
              if (next.trim()) setPreset([]);
              if (shownError) {
                const check = resolve(undefined, next);
                setShownError(check.ok ? null : choiceError[check.reason]);
              }
            }}
            onBlur={() => {
              if (!other.trim()) return;
              const check = parseAmount(other);
              setShownError(check.ok ? null : choiceError[check.reason]);
            }}
            // 16px on touch: iOS zooms into smaller inputs.
            className="h-11 w-full rounded-[12px] border border-line-field bg-field pr-3.5 pl-7 font-medium text-base text-bone tabular-nums outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#6f7378] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-60 aria-invalid:border-signal pointer-coarse:h-12 pointer-fine:text-[15px]"
          />
        </div>
        <p
          id={errorId}
          aria-live="polite"
          className="min-h-5 text-[13px] text-signal leading-5"
        >
          {shownError}
        </p>
      </fieldset>

      {state.status === "error" ? (
        <div
          role="alert"
          className="-mt-2 rounded-[12px] border border-signal/30 bg-signal/10 px-3.5 py-3 text-[13px] text-bone leading-relaxed"
        >
          <p>{state.message}</p>
          {state.reference ? (
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              {states.reference(state.reference)}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
        <Button
          type="submit"
          variant="pill-red"
          size="pill-md"
          disabled={pending}
          focusableWhenDisabled
          aria-busy={pending || undefined}
          className="min-w-36 data-disabled:opacity-90 pointer-coarse:h-11"
        >
          {pending ? (
            <>
              <Spinner className="pending-delay" />
              {billing.pending}
            </>
          ) : choice.ok ? (
            billing.submit(formatAmount(choice.cents))
          ) : (
            billing.submitEmpty
          )}
        </Button>
      </div>
    </form>
  );
}
