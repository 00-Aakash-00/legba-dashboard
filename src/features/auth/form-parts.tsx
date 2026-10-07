"use client";

import { CircleAlertIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  type ComponentProps,
  type ReactNode,
  Suspense,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
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
  "aria-invalid:border-[#d92446] aria-invalid:ring-0 dark:aria-invalid:border-[#d92446] dark:aria-invalid:ring-0",
  "focus-visible:aria-invalid:ring-3 dark:focus-visible:aria-invalid:ring-destructive/40",
);

type AuthFieldProps = Omit<ComponentProps<"input">, "id"> & {
  id: string;
  label: string;
  error?: string;
  /** Extra ids for aria-describedby (e.g. a requirements list). */
  describedBy?: string;
  /** A control inside the field's right edge (the reveal toggle). */
  trailing?: ReactNode;
  inputClassName?: string;
};

export function AuthField({
  id,
  label,
  error,
  describedBy,
  trailing,
  className,
  inputClassName,
  ...input
}: AuthFieldProps) {
  const errorId = `${id}-error`;
  const describedByIds =
    [error ? errorId : null, describedBy].filter(Boolean).join(" ") ||
    undefined;
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
          aria-invalid={error ? true : undefined}
          aria-describedby={describedByIds}
          className={cn(FIELD_INPUT, trailing ? "pr-12" : null, inputClassName)}
          {...input}
        />
        {trailing}
      </div>
      {error ? (
        <FieldError
          id={errorId}
          className="mt-1.5 flex gap-1.5 text-[#ff5a73] text-[13px] leading-[17px] tracking-[-0.02em]"
        >
          <CircleAlertIcon aria-hidden className="mt-px size-[15px] shrink-0" />
          <span>{error}</span>
        </FieldError>
      ) : null}
    </Field>
  );
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
  // the value is visible); the label names the action.
  const Icon = revealed ? EyeIcon : EyeOffIcon;
  return (
    <button
      type="button"
      aria-pressed={revealed}
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
 * A form-level message under the submit button. The live region is always
 * mounted so the message is announced when it appears.
 */
export function FormMessage({
  message,
  tone = "error",
  className,
}: {
  message?: string;
  tone?: "error" | "notice";
  className?: string;
}) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={className}>
      {message ? (
        <p
          className={cn(
            "mt-4 flex gap-2.5 rounded-[10px] border px-3.5 py-3 text-[13.5px] leading-[19px] tracking-[-0.02em]",
            tone === "error"
              ? "border-[#f41a44]/30 bg-[#f41a44]/[0.08] text-[#ffb3bf]"
              : "border-line-strong bg-white/[0.03] text-[#d6d8db]",
          )}
        >
          <CircleAlertIcon
            aria-hidden
            className={cn(
              "mt-0.5 size-4 shrink-0",
              tone === "error" ? "text-[#ff5a73]" : "text-[#a0a2a4]",
            )}
          />
          <span>{message}</span>
        </p>
      ) : null}
    </div>
  );
}

function NextParam() {
  const next = useSearchParams().get("next");
  return next ? <input type="hidden" name="next" value={next} /> : null;
}

/** Carries `?next=` into the login action; read on the client (static page). */
export function NextField() {
  return (
    <Suspense fallback={null}>
      <NextParam />
    </Suspense>
  );
}

type Rules<K extends string> = Record<K, (value: string) => string | undefined>;

/**
 * On-blur validation with the shared zod field checks: a field is checked
 * when the user leaves it (once they've typed in it), re-checked on every
 * change while it shows an error so the message clears the moment it's
 * fixed, and all fields are checked on submit.
 */
export function useFieldErrors<K extends string>(rules: Rules<K>) {
  const [errors, setErrors] = useState<Partial<Record<K, string>>>({});
  const touched = useRef(new Set<K>());
  const keys = Object.keys(rules) as K[];

  return {
    errors,
    change(name: K, value: string) {
      touched.current.add(name);
      if (errors[name]) {
        setErrors((current) => ({ ...current, [name]: rules[name](value) }));
      }
    },
    blur(name: K, value: string) {
      if (!touched.current.has(name) && !errors[name]) return;
      setErrors((current) => ({ ...current, [name]: rules[name](value) }));
    },
    /** Checks every field; returns the first invalid one, in field order. */
    validate(values: Record<K, string>) {
      const next: Partial<Record<K, string>> = {};
      for (const key of keys) next[key] = rules[key](values[key]);
      setErrors(next);
      return keys.find((key) => next[key]);
    },
    /** Server-side field errors (first message per field). */
    show(fieldErrors: Partial<Record<K, string[]>> | undefined) {
      const next: Partial<Record<K, string>> = {};
      for (const key of keys) next[key] = fieldErrors?.[key]?.[0];
      setErrors(next);
      return keys.find((key) => next[key]);
    },
    reset() {
      touched.current.clear();
      setErrors({});
    },
  };
}

/** Focuses a named control in a form (the first invalid field). */
export function focusField(form: HTMLFormElement | null, name: string) {
  const control = form?.elements.namedItem(name);
  if (control instanceof HTMLElement) control.focus();
}

/**
 * What to tell the user when a Server Action call rejects (it never returns
 * a result): the network failed, or the server threw. Either way nothing
 * changed, and the form keeps everything they typed.
 */
export function actionFailure(error: unknown) {
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
