"use client";

import {
  startTransition,
  useActionState,
  useEffectEvent,
  useLayoutEffect,
  useState,
} from "react";
import { auth } from "@/content/copy";
import { register } from "./actions";
import {
  type Attempt,
  AuthField,
  attempt,
  FormMessage,
  focusOnEnter,
  RevealToggle,
  SubmitButton,
  submitForm,
} from "./form-parts";

const { register: copy } = auth;

/**
 * Sign-up: name, work email and password. A placeholder like the login: any
 * input, even none, continues to the dashboard (the action redirects).
 */
export function RegisterForm() {
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [state, dispatch, pending] = useActionState<Attempt, FormData | null>(
    (_previous, data) => (data === null ? {} : attempt(() => register(data))),
    {},
  );

  // Hidden by Activity: clear the password, the reveal and any stale message.
  const resetHidden = useEffectEvent(() => {
    setPassword("");
    setRevealed(false);
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
        id="register-name"
        name="name"
        label={copy.name}
        placeholder={copy.namePlaceholder}
        autoComplete="name"
        autoCapitalize="words"
        enterKeyHint="next"
        onKeyDown={(event) => focusOnEnter(event, "register-email")}
      />
      <AuthField
        id="register-email"
        name="email"
        type="text"
        label={copy.email}
        placeholder={auth.login.emailPlaceholder}
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="next"
        className="mt-4 lg:mt-3"
        onKeyDown={(event) => focusOnEnter(event, "register-password")}
      />
      <AuthField
        id="register-password"
        name="password"
        type={revealed ? "text" : "password"}
        label={copy.password}
        placeholder={copy.passwordPlaceholder}
        value={password}
        onChange={(event) => setPassword(event.currentTarget.value)}
        autoComplete="new-password"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        className="mt-4 lg:mt-3"
        inputClassName="lg:pointer-fine:tracking-[-0.04em]"
        trailing={
          <RevealToggle
            revealed={revealed}
            onToggle={() => setRevealed((value) => !value)}
          />
        }
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
