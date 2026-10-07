"use client";

import Link from "next/link";
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
import { Checkbox } from "@/components/ui/checkbox";
import { auth } from "@/content/copy";
import { login } from "./actions";
import {
  AuthField,
  actionFailure,
  FormMessage,
  focusField,
  NextField,
  RevealToggle,
  SubmitButton,
  useFieldErrors,
} from "./form-parts";
import {
  currentPasswordField,
  emailField,
  fieldError,
  type LoginState,
  text,
} from "./schema";

const { login: copy } = auth;
const INITIAL: LoginState = {};

/**
 * Email + password sign-in (spec auth.form). Submits through a wrapped
 * dispatch: a rejected action (network down, server threw) becomes an inline
 * message instead of an error boundary, and nothing the user typed is lost.
 *
 * Every field is controlled, so React's automatic form reset can't clear it
 * (a controlled input's default tracks its value). The submit handler also
 * starts the transition itself (preventDefault + startTransition), which
 * skips that reset altogether: it would otherwise flip Base UI's hidden
 * Remember me input away from the checkbox's state.
 */
export function LoginForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [remember, setRemember] = useState(true);
  const fields = useFieldErrors({
    email: (value) => fieldError(emailField, value),
    password: (value) => fieldError(currentPasswordField, value),
  });

  const [state, dispatch, pending] = useActionState(
    async (_previous: LoginState, payload: FormData | null) => {
      // `null` resets the result when Activity hides this page.
      if (payload === null) return INITIAL;
      try {
        const result = await login(payload);
        const invalid = fields.show(result.fieldErrors);
        if (invalid) focusField(formRef.current, invalid);
        return result;
      } catch (error) {
        unstable_rethrow(error); // the success redirect
        return { formError: actionFailure(error) } satisfies LoginState;
      }
    },
    INITIAL,
  );

  // Next keeps this page alive (hidden) after navigating away: drop the
  // password, the reveal and any stale result; keep the email.
  const resetHidden = useEffectEvent(() => {
    setPassword("");
    setRevealed(false);
    fields.reset();
    startTransition(() => dispatch(null));
  });
  useLayoutEffect(() => () => resetHidden(), []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const invalid = fields.validate({
      email: text(data.get("email")),
      password: text(data.get("password")),
    });
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
      <NextField />
      <AuthField
        id="login-email"
        name="email"
        type="email"
        label={copy.email}
        placeholder={copy.emailPlaceholder}
        value={email}
        autoComplete="username"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="next"
        required
        error={fields.errors.email}
        onChange={(event) => {
          setEmail(event.currentTarget.value);
          fields.change("email", event.currentTarget.value);
        }}
        onBlur={(event) => fields.blur("email", event.currentTarget.value)}
      />
      <AuthField
        id="login-password"
        name="password"
        type={revealed ? "text" : "password"}
        label={copy.password}
        placeholder={copy.passwordPlaceholder}
        value={password}
        autoComplete="current-password"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        required
        error={fields.errors.password}
        className="mt-4 lg:mt-3"
        inputClassName="lg:pointer-fine:tracking-[-0.04em]"
        onChange={(event) => {
          setPassword(event.currentTarget.value);
          fields.change("password", event.currentTarget.value);
        }}
        onBlur={(event) => fields.blur("password", event.currentTarget.value)}
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
          <Checkbox
            name="remember"
            checked={remember}
            onCheckedChange={(checked) => setRemember(checked)}
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
      <FormMessage message={state.formError} />
    </form>
  );
}
