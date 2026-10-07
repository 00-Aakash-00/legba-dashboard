"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { unstable_rethrow } from "next/navigation";
import {
  type ComponentProps,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  startTransition,
} from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { auth, states } from "@/content/copy";
import { cn } from "@/lib/utils";

/*
 * Field styling from docs/design/spec/login.json (auth.email.*,
 * auth.password.*): #161617 fill, 1px #2c2c2e border, radius 10, 44.5px on
 * desktop, 48px below 1024px. Text is 13.5px with a fine pointer; touch
 * devices always get 16px (globals.css) so iOS never zooms.
 */
const FIELD_INPUT = cn(
  "h-12 rounded-[10px] border-auth-field-line bg-auth-field px-[15.5px] font-medium text-white tracking-[-0.02em] lg:h-[44.5px] lg:pt-[2.5px] lg:pb-[5.5px] lg:pl-[14.5px]",
  "dark:bg-auth-field md:pointer-fine:text-[14px] lg:pointer-fine:text-[13.5px] lg:pointer-fine:tracking-[-0.065em]",
  "placeholder:font-normal placeholder:text-[#6f7378] hover:border-[#3a3a3d]",
);

type AuthFieldProps = Omit<ComponentProps<"input">, "id"> & {
  id: string;
  label: string;
  /** A control inside the field's right edge (the reveal toggle). */
  trailing?: ReactNode;
  inputClassName?: string;
};

/** A labelled text field. Placeholder screens: nothing is required or checked. */
export function AuthField({
  id,
  label,
  trailing,
  className,
  inputClassName,
  ...input
}: AuthFieldProps) {
  return (
    <Field className={cn("gap-0", className)}>
      <FieldLabel
        htmlFor={id}
        className="font-medium text-[14px] text-auth-label leading-[18px] tracking-[-0.03em] lg:pl-0.5 lg:text-[13.5px] lg:tracking-[-0.055em]"
      >
        {label}
      </FieldLabel>
      <div className="relative mt-1.5 lg:mt-[3px]">
        <Input
          id={id}
          className={cn(FIELD_INPUT, trailing ? "pr-12" : null, inputClassName)}
          {...input}
        />
        {trailing}
      </div>
    </Field>
  );
}

/**
 * `enterKeyHint="next"` labels the keyboard's return key "next", so pressing
 * it moves to the next field instead of submitting the form early.
 */
export function focusOnEnter(
  event: KeyboardEvent<HTMLInputElement>,
  nextId: string,
) {
  if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
  event.preventDefault();
  document.getElementById(nextId)?.focus();
}

/** The eye toggle inside a password field (icons.json login.password.eye). */
export function RevealToggle({
  revealed,
  onToggle,
}: {
  revealed: boolean;
  onToggle: () => void;
}) {
  const label = revealed ? auth.login.hidePassword : auth.login.showPassword;
  // The glyph shows the current state (the mockup draws the open eye while
  // the value is visible); the label names the action. No aria-pressed: a
  // label that changes with the state already announces it.
  const Icon = revealed ? EyeIcon : EyeOffIcon;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onToggle}
      className="absolute top-1/2 right-[3.5px] grid size-11 -translate-y-1/2 place-items-center rounded-[8px] text-[#a0a2a4] outline-none transition-colors duration-150 hover:text-white focus-visible:ring-2 focus-visible:ring-signal active:text-white lg:right-[9.4px] lg:size-8"
    >
      <Icon aria-hidden size={24} strokeWidth={1.75} />
    </button>
  );
}

/**
 * The red pill submit (spec auth.submit: 40px, the measured 9-stop gradient,
 * a faint inner rim, no outer glow). While pending it stays focusable but
 * inert, and swaps to the orb + pending label after 200ms.
 */
export function SubmitButton({
  pending,
  label,
  pendingLabel,
  className,
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
  className?: string;
}) {
  return (
    <Button
      type="submit"
      variant="pill"
      disabled={pending}
      focusableWhenDisabled
      aria-busy={pending || undefined}
      className={cn(
        "h-12 w-full text-[15px] tracking-[-0.02em] lg:h-10 lg:text-[14.5px] lg:tracking-[-0.03em]",
        "bg-clip-border bg-[linear-gradient(180deg,#e84659_0%,#dd4356_5%,#d5374c_20%,#d22b42_35%,#c82239_50%,#bb1d33_65%,#af1b2e_80%,#a21928_95%,#9f1827_100%)]",
        "shadow-[inset_0_1px_0_rgb(255_140_155/0.25),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
        className,
      )}
    >
      <span className="grid place-items-center *:col-start-1 *:row-start-1">
        <span
          aria-hidden={pending || undefined}
          className="transition-opacity duration-150 ease-out-strong group-aria-busy/button:opacity-0 group-aria-busy/button:delay-200"
        >
          {label}
        </span>
        {pending ? (
          <span className="flex items-center gap-2 pending-delay">
            <Spinner size={20} />
            {pendingLabel}
          </span>
        ) : null}
      </span>
    </Button>
  );
}

/**
 * Why the last attempt failed, under the control that made it (text only:
 * no icons outside the nav bar). The live region is always mounted so the
 * message is announced when it appears.
 */
export function FormMessage({ message }: { message?: string }) {
  return (
    <div role="alert">
      {message ? (
        <p className="mt-4 rounded-[10px] border border-[#f41a44]/30 bg-[#f41a44]/[0.08] px-3.5 py-3 text-[#ffb3bf] text-[13.5px] leading-[19px] tracking-[-0.02em]">
          {message}
        </p>
      ) : null}
    </div>
  );
}

/** One call to a placeholder auth action. */
export type Attempt<R = unknown> = { result?: R; failure?: string };

/**
 * Calls one of the pass-through auth actions. Success is a redirect to the
 * dashboard, rethrown so the router finishes it. The call can still reject
 * (the network dropped, or the server failed): that comes back as an inline
 * message instead of an error page, and the form keeps what was typed.
 */
export async function attempt<R>(call: () => Promise<R>): Promise<Attempt<R>> {
  try {
    return { result: await call() };
  } catch (error) {
    unstable_rethrow(error); // the success redirect
    return { failure: actionFailure(error) };
  }
}

/**
 * A form's submit handler: sends the fields through the action state inside
 * a transition. Letting React run the form action instead would reset the
 * form afterwards, clearing what was typed when an attempt fails. A repeat
 * submit (Enter in a field) while one is pending is ignored.
 */
export function submitForm(
  event: FormEvent<HTMLFormElement>,
  pending: boolean,
  dispatch: (data: FormData) => void,
) {
  event.preventDefault();
  if (pending) return;
  const data = new FormData(event.currentTarget);
  startTransition(() => dispatch(data));
}

/** The user-facing message for a rejected Server Action call. */
function actionFailure(error: unknown) {
  const offline =
    error instanceof TypeError ||
    (typeof navigator !== "undefined" && navigator.onLine === false);
  if (offline) return states.offline;
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String(error.digest)
      : null;
  return digest ? `${auth.failed} ${states.reference(digest)}` : auth.failed;
}
