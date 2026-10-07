"use client";

import { unstable_rethrow } from "next/navigation";
import {
  type FormEvent,
  startTransition,
  useActionState,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { auth } from "@/content/copy";
import { findSsoConnection } from "./actions";
import {
  AuthField,
  actionFailure,
  FormMessage,
  focusField,
  SubmitButton,
  useFieldErrors,
} from "./form-parts";
import { emailField, fieldError, type SsoState, text } from "./schema";

const { sso: copy } = auth;
const INITIAL: SsoState = {};

/**
 * Finds the organization's SSO sign-in from a work email. The placeholder
 * backend has no SSO connections, so a valid email gets an inline notice
 * naming its domain; an invalid one gets a field error.
 */
export function SsoForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const fields = useFieldErrors({
    email: (value) => fieldError(emailField, value),
  });

  const [state, dispatch, pending] = useActionState(
    async (_previous: SsoState, payload: FormData | null) => {
      if (payload === null) return INITIAL;
      try {
        const result = await findSsoConnection(payload);
        const invalid = fields.show(result.fieldErrors);
        if (invalid) focusField(formRef.current, invalid);
        return result;
      } catch (error) {
        unstable_rethrow(error);
        return { formError: actionFailure(error) } satisfies SsoState;
      }
    },
    INITIAL,
  );

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
        id="sso-email"
        name="email"
        type="email"
        label={copy.email}
        placeholder={auth.login.emailPlaceholder}
        value={email}
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        required
        error={fields.errors.email}
        onChange={(event) => {
          setEmail(event.currentTarget.value);
          fields.change("email", event.currentTarget.value);
          // A notice names the domain that was checked: drop it once the
          // email changes, so it never describes a different address.
          if (state.notice) startTransition(() => dispatch(null));
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
      <FormMessage message={state.notice} tone="notice" />
    </form>
  );
}
