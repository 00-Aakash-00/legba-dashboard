"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
} from "react";
import { auth } from "@/content/copy";
import { requestPasswordReset } from "./actions";
import {
  type Attempt,
  AuthField,
  attempt,
  FormMessage,
  SubmitButton,
  submitForm,
} from "./form-parts";
import type { ForgotState } from "./schema";

const { forgot: copy } = auth;
const EMAIL_ID = "forgot-email";

/**
 * Password reset request. A placeholder: any password works, so there is
 * nothing to reset and no mail is sent. Any input, even none, gets the same
 * confirmation saying so (it never says whether an account exists). Focus
 * moves to the confirmation so keyboard and screen-reader users land on it.
 */
export function ForgotForm() {
  const sentRef = useRef<HTMLHeadingElement>(null);
  const [state, dispatch, pending] = useActionState<
    Attempt<ForgotState>,
    FormData | null
  >(
    (_previous, data) =>
      data === null ? {} : attempt(() => requestPasswordReset(data)),
    {},
  );
  // What was typed, possibly "": only `undefined` means "not sent".
  const sentTo = state.result?.sentTo;

  // The confirmation replaces the button the user just pressed: move focus
  // with the content instead of letting it fall back to the page.
  useEffect(() => {
    if (sentTo !== undefined) sentRef.current?.focus();
  }, [sentTo]);

  // Hidden by Activity: the next visit starts with the form again.
  const resetHidden = useEffectEvent(() => {
    startTransition(() => dispatch(null));
  });
  useLayoutEffect(() => () => resetHidden(), []);

  if (sentTo !== undefined) {
    return (
      <section
        aria-labelledby="forgot-sent-title"
        className="mt-8 rounded-[16px] border border-line-strong bg-white/[0.02] px-5 py-6 text-center lg:mt-[34px]"
      >
        <h2
          id="forgot-sent-title"
          ref={sentRef}
          tabIndex={-1}
          aria-describedby="forgot-sent-body"
          className="rounded-[4px] font-semibold text-[18px] text-white leading-6 tracking-[-0.03em] outline-none focus-visible:ring-2 focus-visible:ring-signal"
        >
          {copy.sentTitle}
        </h2>
        <p
          id="forgot-sent-body"
          className="mt-2 text-[#b5b8bc] text-[14px] leading-5 tracking-[-0.02em]"
        >
          {copy.sent}
        </p>
      </section>
    );
  }

  return (
    <form
      aria-label={copy.form}
      action={dispatch}
      onSubmit={(event) => submitForm(event, pending, dispatch)}
      className="mt-8 lg:mt-[34px]"
    >
      <AuthField
        id={EMAIL_ID}
        name="email"
        type="text"
        label={auth.login.email}
        placeholder={auth.login.emailPlaceholder}
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="send"
      />
      <SubmitButton
        pending={pending}
        label={copy.submit}
        pendingLabel={copy.pending}
        className="mt-6 lg:-mx-[1.75px] lg:mt-7 lg:w-[calc(100%+3.5px)]"
      />
      <FormMessage message={state.failure} />
    </form>
  );
}
