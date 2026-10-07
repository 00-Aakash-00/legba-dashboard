"use client";

import { CheckIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { register } from "./actions";
import {
  AuthField,
  actionFailure,
  FormMessage,
  focusField,
  RevealToggle,
  SubmitButton,
  useFieldErrors,
} from "./form-parts";
import {
  emailField,
  fieldError,
  nameField,
  newPasswordField,
  passwordRules,
  type RegisterState,
  text,
} from "./schema";

const { register: copy } = auth;
const INITIAL: RegisterState = {};
const RULES_ID = "register-password-rules";

/**
 * Sign-up: name, work email, and a password whose requirements are listed up
 * front and check off as the user types. A taken email comes back from the
 * server as an inline error on the email field. Success signs the user in
 * and lands on the overview (the action redirects).
 */
export function RegisterForm() {
  const formRef = useRef<HTMLFormElement>(null);
  // Controlled, so no form reset can clear what the user typed.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const fields = useFieldErrors({
    name: (value) => fieldError(nameField, value),
    email: (value) => fieldError(emailField, value),
    password: (value) => fieldError(newPasswordField, value),
  });

  const [state, dispatch, pending] = useActionState(
    async (_previous: RegisterState, payload: FormData | null) => {
      if (payload === null) return INITIAL;
      try {
        const result = await register(payload);
        const invalid = fields.show(result.fieldErrors);
        if (invalid) focusField(formRef.current, invalid);
        return result;
      } catch (error) {
        unstable_rethrow(error); // the success redirect
        return { formError: actionFailure(error) } satisfies RegisterState;
      }
    },
    INITIAL,
  );

  // Hidden by Activity: clear the password, the reveal and stale results.
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
      name: text(data.get("name")),
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
      <AuthField
        id="register-name"
        name="name"
        label={copy.name}
        placeholder={copy.namePlaceholder}
        value={name}
        autoComplete="name"
        autoCapitalize="words"
        enterKeyHint="next"
        maxLength={80}
        required
        error={fields.errors.name}
        onChange={(event) => {
          setName(event.currentTarget.value);
          fields.change("name", event.currentTarget.value);
        }}
        onBlur={(event) => fields.blur("name", event.currentTarget.value)}
      />
      <AuthField
        id="register-email"
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
        enterKeyHint="next"
        required
        error={fields.errors.email}
        className="mt-4 lg:mt-3"
        onChange={(event) => {
          setEmail(event.currentTarget.value);
          fields.change("email", event.currentTarget.value);
        }}
        onBlur={(event) => fields.blur("email", event.currentTarget.value)}
      />
      <AuthField
        id="register-password"
        name="password"
        type={revealed ? "text" : "password"}
        label={copy.password}
        placeholder={copy.passwordPlaceholder}
        value={password}
        autoComplete="new-password"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        required
        error={fields.errors.password}
        describedBy={RULES_ID}
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
      <PasswordRules password={password} />

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

/** Requirements shown before the first submit, checked off live (FORMS.md). */
function PasswordRules({ password }: { password: string }) {
  const rules = [
    {
      key: "length",
      label: copy.rules.length,
      met: passwordRules.length(password),
    },
    { key: "mix", label: copy.rules.mix, met: passwordRules.mix(password) },
  ];
  return (
    <div id={RULES_ID} className="mt-2.5 lg:pl-0.5">
      <p className="text-[#8f9398] text-[13px] leading-[17px] tracking-[-0.02em]">
        {copy.rulesLabel}
      </p>
      <ul
        aria-live="polite"
        className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5"
      >
        {rules.map((rule) => (
          <li
            key={rule.key}
            className={cn(
              "flex items-center gap-1.5 text-[13px] leading-[17px] tracking-[-0.02em] transition-colors duration-150",
              rule.met ? "text-[#d9f5de]" : "text-[#a3a7ac]",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "grid size-4 place-items-center rounded-full border transition-colors duration-150",
                rule.met
                  ? "border-ok/40 bg-ok/15 text-ok"
                  : "border-[#3a3a3d] text-transparent",
              )}
            >
              <CheckIcon className="size-2.5" strokeWidth={3.5} />
            </span>
            {rule.label}
            <span className="sr-only">
              {": "}
              {rule.met ? copy.ruleMet : copy.ruleUnmet}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
