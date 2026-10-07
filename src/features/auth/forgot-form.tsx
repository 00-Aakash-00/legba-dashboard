"use client";

import { MailCheckIcon } from "lucide-react";
import { unstable_rethrow } from "next/navigation";
import {
  type FormEvent,
  startTransition,
  useActionState,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { auth } from "@/content/copy";
import { requestPasswordReset } from "./actions";
import {
  AuthField,
  actionFailure,
  FormMessage,
  focusField,
  SubmitButton,
  useFieldErrors,
} from "./form-parts";
import { emailField, type ForgotState, fieldError, text } from "./schema";

const { forgot: copy } = auth;
const INITIAL: ForgotState = {};

/**
 * Password reset request. The answer is the same whether or not an account
 * exists (no enumeration): a neutral confirmation replaces the form, and
 * focus moves to it so keyboard and screen-reader users land on the news.
 */
export function ForgotForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const sentRef = useRef<HTMLHeadingElement>(null);
  const refocusEmail = useRef(false);
  const [email, setEmail] = useState("");
  const fields = useFieldErrors({
    email: (value) => fieldError(emailField, value),
  });

  const [state, dispatch, pending] = useActionState(
    async (_previous: ForgotState, payload: FormData | null) => {
      if (payload === null) return INITIAL;
      try {
        const result = await requestPasswordReset(payload);
        const invalid = fields.show(result.fieldErrors);
        if (invalid) focusField(formRef.current, invalid);
        return result;
      } catch (error) {
        unstable_rethrow(error);
        return { formError: actionFailure(error) } satisfies ForgotState;
      }
    },
    INITIAL,
  );

  // The confirmation replaces the button the user just pressed (and the form
  // replaces the confirmation's button): move focus with the content instead
  // of letting it fall back to the page.
  useEffect(() => {
    if (state.sentTo) {
      sentRef.current?.focus();
    } else if (refocusEmail.current) {
      refocusEmail.current = false;
      focusField(formRef.current, "email");
    }
  }, [state.sentTo]);

  // Hidden by Activity: the next visit starts with the form again.
  const resetHidden = useEffectEvent(() => {
    fields.reset();
    startTransition(() => dispatch(null));
  });
  useLayoutEffect(() => () => resetHidden(), []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const invalid = fields.validate({ email: text(data.get("email")) });
    if (invalid) {
      focusField(form, invalid);
      return;
    }
    startTransition(() => dispatch(data));
  }

  function tryAnotherEmail() {
    refocusEmail.current = true;
    setEmail("");
    startTransition(() => dispatch(null));
  }

  if (state.sentTo) {
    return (
      <section
        aria-labelledby="forgot-sent-title"
        className="mt-8 rounded-[16px] border border-line-strong bg-white/[0.02] px-5 py-6 text-center lg:mt-[34px]"
      >
        <span className="mx-auto grid size-11 place-items-center rounded-full border border-ok/30 bg-ok/10 text-ok">
          <MailCheckIcon aria-hidden className="size-5" />
        </span>
        <h2
          id="forgot-sent-title"
          ref={sentRef}
          tabIndex={-1}
          aria-describedby="forgot-sent-body"
          className="mt-4 rounded-[4px] font-semibold text-[18px] text-white leading-6 tracking-[-0.03em] outline-none focus-visible:ring-2 focus-visible:ring-signal"
        >
          {copy.sentTitle}
        </h2>
        <p
          id="forgot-sent-body"
          className="mt-2 text-[#b5b8bc] text-[14px] leading-5 tracking-[-0.02em]"
        >
          {copy.sent(state.sentTo)}
        </p>
        <Button
          type="button"
          variant="outline-pill"
          onClick={tryAnotherEmail}
          className="mt-5 h-11 px-5 text-[14px] lg:h-10"
        >
          {copy.retry}
        </Button>
      </section>
    );
  }

  return (
    <form
      ref={formRef}
      aria-label={copy.form}
      action={dispatch}
      onSubmit={onSubmit}
      noValidate
      className="mt-8 lg:mt-[34px]"
    >
      <AuthField
        id="forgot-email"
        name="email"
        type="email"
        label={auth.login.email}
        placeholder={auth.login.emailPlaceholder}
        value={email}
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="send"
        required
        error={fields.errors.email}
        onChange={(event) => {
          setEmail(event.currentTarget.value);
          fields.change("email", event.currentTarget.value);
        }}
        onBlur={(event) => fields.blur("email", event.currentTarget.value)}
      />
      <SubmitButton
        pending={pending}
        label={copy.submit}
        pendingLabel={copy.pending}
        className="mt-6 lg:-mx-[1.75px] lg:mt-7 lg:w-[calc(100%+3.5px)]"
      />
      <FormMessage message={state.formError} />
    </form>
  );
}
