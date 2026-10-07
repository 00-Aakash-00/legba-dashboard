"use client";

import {
  startTransition,
  useActionState,
  useEffectEvent,
  useLayoutEffect,
} from "react";
import { auth } from "@/content/copy";
import { continueWithSso } from "./actions";
import {
  type Attempt,
  AuthField,
  attempt,
  FormMessage,
  SubmitButton,
  submitForm,
} from "./form-parts";

const { sso: copy } = auth;

/**
 * Single sign-on from a work email. A placeholder: there is no identity
 * provider, so any input, even none, continues to the dashboard.
 */
export function SsoForm() {
  const [state, dispatch, pending] = useActionState<Attempt, FormData | null>(
    (_previous, data) =>
      data === null ? {} : attempt(() => continueWithSso(data)),
    {},
  );

  // Hidden by Activity: a stale message shouldn't greet the user on return.
  const resetHidden = useEffectEvent(() => {
    startTransition(() => dispatch(null));
  });
  useLayoutEffect(() => () => resetHidden(), []);

  return (
    <form
      aria-label={copy.form}
      action={dispatch}
      onSubmit={(event) => submitForm(event, pending, dispatch)}
      className="mt-8 lg:mt-[34px]"
    >
      <AuthField
        id="sso-email"
        name="email"
        type="text"
        label={copy.email}
        placeholder={auth.login.emailPlaceholder}
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
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
