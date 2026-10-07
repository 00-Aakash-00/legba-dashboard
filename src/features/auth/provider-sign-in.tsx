"use client";

import { KeyIcon } from "lucide-react";
import Link from "next/link";
import {
  type ReactNode,
  startTransition,
  useActionState,
  useEffectEvent,
  useLayoutEffect,
  useState,
} from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { auth } from "@/content/copy";
import { cn } from "@/lib/utils";
import { continueWithProvider } from "./actions";
import { type Attempt, attempt, FormMessage } from "./form-parts";
import { GitHubIcon, GoogleIcon } from "./provider-icons";

const { login: copy } = auth;

type Provider = "google" | "github";

// Spec auth.social.*: 42px (48px below 1024), radius 12, #161616 on a 1px
// #2c2c2e border, 13.5px semibold labels.
const SOCIAL = cn(
  "h-12 w-full min-w-0 gap-2 rounded-[12px] border-[#2c2c2e] bg-[#161616] px-2 font-semibold text-[14px] text-white tracking-[-0.03em] hover:border-[#38383b] hover:bg-[#1c1c1e] lg:h-[42px] lg:text-[13.5px] lg:tracking-[-0.04em]",
);

/**
 * "Or login with" and the SSO / Google / GitHub row. SSO is a page (/sso).
 * Google and GitHub are placeholders: either one continues straight to the
 * dashboard, with the orb in the button that was pressed.
 */
export function ProviderSignIn() {
  const [requested, setRequested] = useState<Provider | null>(null);
  const [state, dispatch, pending] = useActionState<Attempt, Provider | null>(
    (_previous, provider) =>
      provider === null ? {} : attempt(() => continueWithProvider()),
    {},
  );

  // Hidden by Activity: a stale message shouldn't greet the user on return.
  const resetHidden = useEffectEvent(() => {
    setRequested(null);
    startTransition(() => dispatch(null));
  });
  useLayoutEffect(() => () => resetHidden(), []);

  function request(provider: Provider) {
    if (pending) return;
    setRequested(provider);
    startTransition(() => dispatch(provider));
  }

  return (
    <>
      <div className="mt-6 flex items-center gap-[27px] lg:mt-[23px]">
        <span aria-hidden className="h-px flex-1 bg-auth-divider" />
        <p className="font-medium text-[#c1c3c5] text-[14px] leading-[18px] tracking-[-0.03em] lg:text-[13.5px] lg:tracking-[-0.055em]">
          {copy.divider}
        </p>
        <span aria-hidden className="h-px flex-1 bg-auth-divider" />
      </div>

      <fieldset
        aria-label={copy.providers}
        className="m-0 mt-5 grid min-w-0 grid-cols-3 gap-[9px] border-0 p-0 lg:mt-[22.5px] lg:grid-cols-[minmax(0,128.5fr)_minmax(0,130.5fr)_minmax(0,129.5fr)] lg:gap-[8.8px]"
      >
        <Link
          href="/sso"
          className={cn(buttonVariants({ variant: "social" }), SOCIAL)}
        >
          <KeyIcon
            aria-hidden
            size={16}
            strokeWidth={4}
            className="mr-px text-sso-key max-lg:size-[18px]"
          />
          {copy.sso}
        </Link>
        <ProviderButton
          label={copy.google}
          icon={<GoogleIcon className="size-[18.5px]" />}
          iconSize="size-[18.5px]"
          busy={pending && requested === "google"}
          disabled={pending}
          onClick={() => request("google")}
        />
        <ProviderButton
          label={copy.github}
          icon={<GitHubIcon className="size-[19px] text-[#f4f4f4]" />}
          iconSize="size-[19px]"
          busy={pending && requested === "github"}
          disabled={pending}
          onClick={() => request("github")}
        />
      </fieldset>

      <FormMessage message={state.failure} />
    </>
  );
}

function ProviderButton({
  label,
  icon,
  iconSize,
  busy,
  disabled,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  /** The icon's own box, so the gap to the label is the measured one. */
  iconSize: string;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="social"
      disabled={disabled}
      focusableWhenDisabled
      aria-busy={busy || undefined}
      onClick={onClick}
      className={SOCIAL}
    >
      <span
        className={cn(
          "grid place-items-center *:col-start-1 *:row-start-1",
          iconSize,
        )}
      >
        <span
          className={cn(
            "grid place-items-center transition-opacity duration-150 ease-out-strong",
            busy && "opacity-0 delay-200",
          )}
        >
          {icon}
        </span>
        {busy ? <Spinner size={20} className="pending-delay" /> : null}
      </span>
      {label}
    </Button>
  );
}
