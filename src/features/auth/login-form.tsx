"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffectEvent,
  useLayoutEffect,
  useState,
} from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { auth } from "@/content/copy";
import { login } from "./actions";
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

const { login: copy } = auth;

/**
 * Username + password (spec auth.form). A placeholder: there is no
 * authentication, so any input, even none, continues to the dashboard.
 * Typing a documented demo email switches the demo state (AGENTS.md).
 */
export function LoginForm() {
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [state, dispatch, pending] = useActionState<Attempt, FormData | null>(
    // `null` clears the last attempt (see the reset below).
    (_previous, data) => (data === null ? {} : attempt(() => login(data))),
    {},
  );

  // Next keeps this page alive (hidden) after navigating away: drop the
  // password, the reveal and any stale message; keep the username.
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
        id="login-email"
        name="email"
        type="text"
        label={copy.email}
        placeholder={copy.emailPlaceholder}
        autoComplete="username"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="next"
        onKeyDown={(event) => focusOnEnter(event, "login-password")}
      />
      <AuthField
        id="login-password"
        name="password"
        type={revealed ? "text" : "password"}
        label={copy.password}
        placeholder={copy.passwordPlaceholder}
        value={password}
        onChange={(event) => setPassword(event.currentTarget.value)}
        autoComplete="current-password"
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

      <div className="mt-3 flex items-center justify-between gap-3 lg:mt-[14.5px]">
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Base UI's Checkbox renders the labelled input inside. */}
        <label className="flex min-h-11 cursor-pointer select-none items-center gap-[7.5px] lg:pl-[0.75px] font-medium text-[14px] text-white leading-[17px] tracking-[-0.03em] lg:min-h-0 lg:text-[13px] lg:tracking-[-0.06em]">
          {/* Purely visual: there is no session to remember. */}
          <Checkbox
            defaultChecked
            className="size-[15.5px] rounded-[4px] border-[#3a3a3d] bg-auth-field data-checked:border-auth-check data-checked:bg-auth-check data-checked:text-white dark:bg-auth-field dark:data-checked:bg-auth-check [&_svg]:[stroke-width:2.5]"
          />
          {copy.remember}
        </label>
        <Link
          href="/forgot-password"
          className="relative rounded-[3px] font-semibold text-[#f62450] text-[14px] leading-[17px] tracking-[-0.03em] outline-none transition-opacity duration-150 after:absolute after:-inset-x-2 after:-inset-y-3.5 hover:underline focus-visible:ring-2 focus-visible:ring-signal active:opacity-70 lg:mr-1 lg:text-[13px] lg:tracking-[-0.05em]"
        >
          {copy.forgot}
        </Link>
      </div>

      <SubmitButton
        pending={pending}
        label={copy.submit}
        pendingLabel={copy.pending}
        className="mt-5 lg:-mx-[1.75px] lg:mt-[31px] lg:w-[calc(100%+3.5px)]"
      />
      <FormMessage message={state.failure} />
    </form>
  );
}
