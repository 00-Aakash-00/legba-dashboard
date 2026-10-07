"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { unstable_rethrow } from "next/navigation";
import {
  type FormEvent,
  startTransition,
  useActionState,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { apiKeys, states } from "@/content/copy";
import { cn } from "@/lib/utils";
import { type CreateKeyResult, createKey } from "./actions";
import { KEY_NAME_COUNTER_FROM, KEY_NAME_MAX, keyNameError } from "./key-name";
import {
  sheetButton,
  sheetDescription,
  sheetFooter,
  sheetTitle,
} from "./sheet";

/** Where the flow is, so the dialog knows whether closing is safe. */
export type Phase = "form" | "pending" | "created";

type FormResult = {
  error?: string;
  failure?: "failed" | "offline";
  reference?: string;
};

type CreatedKey = { name: string; secret: string };

export function CreateKeyFlow({
  onPhase,
  onCreated,
}: {
  onPhase: (phase: Phase) => void;
  onCreated: (name: string) => void;
}) {
  // The one-time key lives outside the action state, so hiding the route can
  // drop it with a plain update instead of a queued action (which would mark
  // the form pending and block the next submit for a moment).
  const [created, setCreated] = useState<CreatedKey | null>(null);
  const done = useRef(false);
  // Bumped when the route is hidden or the dialog unmounts: a request that
  // finishes afterwards must not put the key back on screen.
  const session = useRef(0);

  const [result, dispatch, pending] = useActionState(
    async (previous: FormResult, payload: FormData): Promise<FormResult> => {
      // A second submit queued behind a successful one must not create another key.
      if (done.current) return previous;
      const started = session.current;
      onPhase("pending");
      let response: CreateKeyResult;
      try {
        response = await createKey(payload);
      } catch (error) {
        unstable_rethrow(error);
        onPhase("form");
        // The request didn't complete (network down or dropped).
        const offline = !navigator.onLine || error instanceof TypeError;
        return { failure: offline ? "offline" : "failed" };
      }
      if (response.status === "created") {
        onCreated(response.key.name);
        if (session.current === started) {
          done.current = true;
          onPhase("created");
          setCreated({ name: response.key.name, secret: response.secret });
        }
        return {};
      }
      onPhase("form");
      return response.status === "invalid"
        ? { error: response.error }
        : { failure: "failed", reference: response.reference };
    },
    {},
  );

  // Activity keeps this mounted while the route is hidden: drop the one-time key.
  useLayoutEffect(
    () => () => {
      session.current += 1;
      done.current = false;
      setCreated(null);
    },
    [],
  );

  if (created) {
    return <SaveKey name={created.name} secret={created.secret} />;
  }
  return (
    <NameForm
      result={result}
      pending={pending}
      submit={(data) => startTransition(() => dispatch(data))}
    />
  );
}

function NameForm({
  result,
  pending,
  submit,
}: {
  result: FormResult;
  pending: boolean;
  submit: (data: FormData) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The server result the user has since moved past (edited or resubmitted).
  const [seen, setSeen] = useState<FormResult | null>(null);
  const inputId = useId();
  const errorId = useId();
  const counterId = useId();

  const fresh = result !== seen;
  const fieldError = error ?? (fresh ? result.error : undefined);
  const failure = fresh ? result.failure : undefined;
  const length = name.trim().length;
  const showCounter = length >= KEY_NAME_COUNTER_FROM;
  const describedBy =
    [fieldError ? errorId : null, showCounter ? counterId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  // The dialog opens on this field however it was opened (pointer, touch or
  // keyboard): naming the key is its only job. The form can also arrive after
  // the dialog (this chunk loads on first open, or on "Try again"), when the
  // dialog itself holds focus; Base UI may park focus there once more on the
  // next frame, hence the second try. preventScroll: the phone sheet is
  // still sliding in.
  useLayoutEffect(() => {
    const field = inputRef.current;
    const popup = field?.closest<HTMLElement>('[role="dialog"]');
    if (!field || !popup) return;
    const focusField = () => {
      const active = document.activeElement;
      // Not while closing, and not once focus has moved on inside the dialog.
      if (!popup.hasAttribute("data-open")) return;
      if (active && active !== popup && popup.contains(active)) return;
      field.focus({ preventScroll: true });
    };
    focusField();
    const frame = requestAnimationFrame(focusField);
    return () => cancelAnimationFrame(frame);
  }, []);

  // A rejection from the server moves focus back to the field it is about.
  useEffect(() => {
    if (result.error) inputRef.current?.focus();
  }, [result]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setTouched(true);
    const message = keyNameError(name);
    if (message) {
      setError(message);
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setSeen(result);
    submit(new FormData(event.currentTarget));
  }

  return (
    <form noValidate onSubmit={onSubmit} aria-busy={pending || undefined}>
      <DialogPrimitive.Title className={sheetTitle}>
        {apiKeys.dialog.title}
      </DialogPrimitive.Title>
      <DialogPrimitive.Description className={sheetDescription}>
        {apiKeys.dialog.description}
      </DialogPrimitive.Description>

      <div className="mt-6 flex flex-col gap-2">
        <label
          htmlFor={inputId}
          className="w-fit font-medium text-[13.5px] text-auth-label leading-[18px] tracking-[-0.02em]"
        >
          {apiKeys.dialog.name}
        </label>
        <Input
          ref={inputRef}
          id={inputId}
          name="name"
          value={name}
          placeholder={apiKeys.dialog.namePlaceholder}
          autoComplete="off"
          enterKeyHint="done"
          aria-required
          aria-invalid={fieldError ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => {
            const next = event.currentTarget.value;
            setName(next);
            setTouched(true);
            setSeen(result);
            // Clear on fix; flag an over-long name as soon as it happens.
            const message = keyNameError(next);
            if (error !== null || next.trim().length > KEY_NAME_MAX) {
              setError(message);
            }
          }}
          onBlur={() => {
            if (touched) setError(keyNameError(name));
          }}
          className="h-11 rounded-field border-auth-field-line bg-field px-3.5 font-medium text-[15px] text-ink tracking-[-0.02em] placeholder:text-ink-subtle focus-visible:border-signal/70 focus-visible:ring-signal/25 aria-invalid:border-signal/80 aria-invalid:ring-signal/20 md:pointer-fine:text-[14.5px] dark:bg-field dark:aria-invalid:border-signal/80"
        />
        {/* Reserved line, so a message never pushes the buttons around. */}
        <div className="flex min-h-5 items-start gap-3">
          {fieldError ? (
            <p
              id={errorId}
              role="alert"
              className="font-medium text-[13px] text-signal leading-5"
            >
              {fieldError}
            </p>
          ) : null}
          {showCounter ? (
            <p
              id={counterId}
              className={cn(
                "ml-auto font-medium text-[12.5px] tabular-nums leading-5",
                length > KEY_NAME_MAX ? "text-signal" : "text-ink-subtle",
              )}
            >
              <span aria-hidden>
                {apiKeys.dialog.counter(length, KEY_NAME_MAX)}
              </span>
              <span className="sr-only">
                {apiKeys.dialog.counterLabel(length, KEY_NAME_MAX)}
              </span>
            </p>
          ) : null}
        </div>
      </div>

      {failure ? (
        <div
          role="alert"
          className="mt-3 rounded-[12px] border border-signal/25 bg-signal/[0.06] px-3.5 py-3 font-medium text-[13.5px] text-ink leading-5"
        >
          <div>
            <p>
              {failure === "offline" ? states.offline : apiKeys.dialog.failed}
            </p>
            {result.reference ? (
              <p className="mt-1 font-mono text-[12px] text-ink-subtle">
                {states.reference(result.reference)}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={sheetFooter}>
        <DialogPrimitive.Close
          disabled={pending}
          render={
            <Button
              variant="outline-pill"
              size="pill-md"
              className={sheetButton}
            />
          }
        >
          {apiKeys.dialog.cancel}
        </DialogPrimitive.Close>
        <Button
          type="submit"
          variant="pill"
          size="pill-md"
          disabled={pending}
          focusableWhenDisabled
          aria-busy={pending || undefined}
          className={cn(
            sheetButton,
            "px-6 data-disabled:opacity-90 sm:min-w-44",
          )}
        >
          {pending ? <Spinner className="pending-delay" /> : null}
          {pending ? apiKeys.dialog.pending : apiKeys.dialog.submit}
        </Button>
      </div>
    </form>
  );
}

function SaveKey({ name, secret }: { name: string; secret: string }) {
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");
  const fieldId = useId();
  const noteId = useId();
  const failedId = useId();

  // The submit button that held focus is gone: move focus to the key, which
  // selects itself, so ⌘C works straight away.
  useEffect(() => {
    fieldRef.current?.focus();
  }, []);

  useEffect(() => {
    if (copy !== "copied") return;
    const timer = window.setTimeout(() => setCopy("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [copy]);

  async function copyKey() {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(secret);
      setCopy("copied");
    } catch {
      // Blocked or unavailable (permissions, insecure origin): select the key
      // so copying it by hand is one keystroke or one tap away.
      fieldRef.current?.focus();
      fieldRef.current?.select();
      setCopy("failed");
    }
  }

  return (
    <div>
      <DialogPrimitive.Title className={sheetTitle}>
        {apiKeys.created.title}
      </DialogPrimitive.Title>
      <DialogPrimitive.Description id={noteId} className={sheetDescription}>
        {apiKeys.created.body}
      </DialogPrimitive.Description>

      <div className="mt-6 rounded-[14px] border border-auth-field-line bg-field px-3.5 pt-3 pb-3.5 sm:px-4">
        <label
          htmlFor={fieldId}
          className="block font-semibold text-[12.5px] text-ink-subtle leading-4 tracking-[-0.01em]"
        >
          {apiKeys.created.keyLabel(name)}
        </label>
        <textarea
          ref={fieldRef}
          id={fieldId}
          readOnly
          value={secret}
          rows={2}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          translate="no"
          data-1p-ignore
          aria-describedby={
            copy === "failed" ? `${noteId} ${failedId}` : noteId
          }
          onFocus={(event) => event.currentTarget.select()}
          className="mt-2 block w-full field-sizing-content resize-none overflow-hidden break-all bg-transparent font-mono font-medium text-[14px] text-ink leading-6 outline-none selection:bg-signal/40"
        />
        <div className="mt-3 flex items-center gap-3">
          <Button
            variant="outline-pill"
            size="pill-md"
            onClick={copyKey}
            className="max-sm:h-11 max-sm:w-full"
          >
            {copy === "copied" ? apiKeys.created.copied : apiKeys.created.copy}
          </Button>
          <output aria-live="polite" className="sr-only">
            {copy === "copied" ? apiKeys.created.copiedAnnouncement : ""}
          </output>
        </div>
      </div>

      {copy === "failed" ? (
        <p
          id={failedId}
          role="alert"
          className="mt-3 font-medium text-[13.5px] text-ink leading-5"
        >
          {apiKeys.created.copyFailed}
        </p>
      ) : null}

      <div className={sheetFooter}>
        <DialogPrimitive.Close
          render={
            <Button
              variant="pill"
              size="pill-md"
              className={cn(sheetButton, "px-6")}
            />
          }
        >
          {apiKeys.created.done}
        </DialogPrimitive.Close>
      </div>
    </div>
  );
}
