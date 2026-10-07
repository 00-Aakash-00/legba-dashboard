import Link from "next/link";
import type { ReactNode } from "react";
import { Mark, Wordmark } from "@/components/brand/logo";
import { auth, brand, links } from "@/content/copy";
import { cn } from "@/lib/utils";

/**
 * The form panel's frame, shared by every auth page. Desktop positions come
 * from docs/design/spec/login.json (auth.*): the content column is 405.5px,
 * and two flex spacers split the free height 62.5 : 120.5 on top of fixed
 * minimums, which puts the lockup at y≈98.5 and the legal line's baseline
 * at y≈878 at 1440 × 927, and keeps the same balance at other heights.
 */
export function AuthScreen({
  heading,
  subtitle,
  legalLead,
  children,
}: {
  /** One string per visual line. */
  heading: readonly string[];
  subtitle: string;
  /** The consent line's lead-in, naming the page's action. */
  legalLead: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div
        aria-hidden
        className="hidden shrink-0 grow-[625] basis-6 lg:block"
      />
      <div className="mx-auto w-full max-w-[405.5px] pt-7 lg:pt-0">
        <BrandLockup />
        <h1 className="font-semibold text-[26px] text-white leading-[30px] tracking-[-0.045em] sm:text-center lg:mt-6 lg:text-[27.5px] lg:leading-[31px] lg:tracking-[-0.055em]">
          {heading.map((line, index) => (
            <span key={line} className="block">
              {line}
              {/* Keeps the accessible name spaced: "Welcome back to Legba" */}
              {index < heading.length - 1 ? " " : null}
            </span>
          ))}
        </h1>
        <p className="mt-2 text-balance font-medium text-[14px] text-auth-ink-2 leading-[19px] tracking-[-0.04em] sm:text-center lg:mt-[9.5px] lg:text-[14.5px] lg:tracking-[-0.07em]">
          {subtitle}
        </p>
        {children}
      </div>
      <div
        aria-hidden
        className="min-h-8 flex-1 shrink-0 lg:min-h-0 lg:grow-[1205] lg:basis-10"
      />
      <LegalLine lead={legalLead} />
    </div>
  );
}

/**
 * Mark + LEGBA, sized per auth.brand (desktop only: the banner carries the
 * mark below 1024px). Both locked assets render exactly as provided.
 */
function BrandLockup() {
  return (
    <div
      role="img"
      aria-label={brand.name}
      className="hidden items-start justify-center lg:flex lg:pr-[4.8px]"
    >
      <Mark size={49} priority />
      <Wordmark height={26.5} className="mt-[13.5px] ml-[7.8px]" />
    </div>
  );
}

function LegalLine({ lead }: { lead: string }) {
  const { login } = auth;
  const linkClass =
    "rounded-[3px] underline decoration-1 underline-offset-[1.5px] outline-none transition-colors duration-150 hover:text-white focus-visible:ring-2 focus-visible:ring-signal";
  return (
    <p className="mx-auto max-w-[520px] text-balance pt-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] text-center text-[12px] text-auth-legal leading-[17px] tracking-[-0.03em] lg:pt-0 lg:pr-0.5 lg:pb-[33.5px] lg:font-medium lg:text-[13px] lg:tracking-[-0.055em]">
      {lead}
      <a
        href={links.terms}
        target="_blank"
        rel="noopener"
        className={linkClass}
      >
        {login.terms}
        <span className="sr-only"> {auth.newTab}</span>
      </a>
      {login.and}
      <a
        href={links.privacy}
        target="_blank"
        rel="noopener"
        className={linkClass}
      >
        {login.privacy}.<span className="sr-only"> {auth.newTab}</span>
      </a>
    </p>
  );
}

/** "Don't have an account? Register" and its siblings on the other pages. */
export function AuthSwitch({
  prompt,
  label,
  href,
  className,
}: {
  prompt: string;
  label: string;
  href: "/login" | "/register";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-center text-[15px] text-[#adb1b5] leading-[21px] tracking-[-0.04em] lg:pr-0.5 lg:font-medium lg:text-[16px] lg:tracking-[-0.075em]",
        className,
      )}
    >
      {prompt}{" "}
      <Link
        href={href}
        className="relative rounded-[3px] font-semibold text-auth-link outline-none transition-opacity duration-150 after:absolute after:-inset-x-2 after:-inset-y-3 hover:underline focus-visible:ring-2 focus-visible:ring-signal active:opacity-70"
      >
        {label}
      </Link>
    </p>
  );
}

/** "Back to log in" under the forgot-password and SSO forms (text only). */
export function BackToLogin({ label }: { label: string }) {
  return (
    <Link
      href="/login"
      className="relative mx-auto mt-8 block w-fit rounded-[4px] font-semibold text-[#d6d8db] text-[14px] leading-5 tracking-[-0.03em] outline-none transition-colors duration-150 after:absolute after:-inset-x-2 after:-inset-y-3 hover:text-white focus-visible:ring-2 focus-visible:ring-signal active:opacity-70"
    >
      {label}
    </Link>
  );
}
