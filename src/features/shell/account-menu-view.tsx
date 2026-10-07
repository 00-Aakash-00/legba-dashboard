"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { ChevronDownIcon, UserRoundIcon } from "lucide-react";
import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { account, links, search } from "@/content/copy";
import { topUpDialog, topUpForm } from "@/features/billing/top-up";
import { cn } from "@/lib/utils";
import type { ProfileDTO } from "@/server/services/profile";

/** What DropdownMenuItem adds to a Base UI item; the shadcn kit has no link item. */
const menuLinkBase =
  "relative flex cursor-default select-none items-center outline-hidden [&_svg]:pointer-events-none [&_svg]:shrink-0";

const itemClassName =
  "h-9 gap-2.5 rounded-[9px] px-2.5 py-0 font-medium text-[13.5px] text-ink-label tracking-[-0.01em] focus:bg-white/[0.06] focus:text-bone pointer-coarse:h-11";

/**
 * The account trigger and menu (spec overview.json header.account: 38px
 * avatar + chevron). The items are text: icons belong to the navigation.
 * `profile` is null when the account slot failed: the avatar turns generic,
 * the menu says so and offers a retry, and it can still sign out. Top up
 * lives here on phones (the header pill is ≥1024).
 */
export function AccountMenuView({
  profile,
  onRetry,
}: {
  profile: ProfileDTO | null;
  onRetry?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const signOutForm = useRef<HTMLFormElement>(null);
  const topUpAfterClose = useRef(false);

  // Activity hides the shell on some navigations: never return to an open menu.
  useLayoutEffect(() => () => setOpen(false), []);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // Phones reach top-up through this menu: opening it is the intent.
        if (next && window.matchMedia("(max-width: 1023.98px)").matches) {
          topUpForm.preload();
        }
      }}
      onOpenChangeComplete={(isOpen) => {
        // The dialog opens once the menu has closed and handed focus back.
        if (!isOpen && topUpAfterClose.current) {
          topUpAfterClose.current = false;
          topUpDialog.open(null);
        }
      }}
    >
      <DropdownMenuTrigger
        aria-label={account.menu}
        aria-busy={signingOut || undefined}
        className="group/account flex size-11 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-shell lg:h-[38px] lg:w-auto lg:gap-[7px]"
      >
        <Avatar profile={profile} />
        <ChevronDownIcon
          aria-hidden
          strokeWidth={2.25}
          className="-ml-[4.5px] -mr-[3.5px] hidden size-5 text-[#a5aab3] transition-[rotate,color] duration-200 ease-out-strong group-hover/account:text-bone group-aria-expanded/account:rotate-180 motion-reduce:transition-none lg:block"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        onKeyDown={(event) => {
          // ⌘K opens the palette over everything: don't leave this menu open beneath it.
          if (
            (event.metaKey || event.ctrlKey) &&
            event.key.toLowerCase() === "k"
          ) {
            setOpen(false);
          }
        }}
        className="w-64 rounded-[14px] bg-panel-raised p-1.5 shadow-[0_24px_60px_-16px_rgb(0_0_0/0.8)] ring-line-strong"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2.5 pt-2 pb-2.5">
            {profile ? (
              <>
                <span className="block truncate font-semibold text-[14px] text-bone tracking-[-0.01em]">
                  {profile.name}
                </span>
                <span className="mt-0.5 block truncate font-normal text-[12.5px] text-muted-foreground">
                  {profile.email}
                </span>
              </>
            ) : (
              <span className="block font-normal text-[13px] text-muted-foreground leading-snug">
                {account.unavailable}
              </span>
            )}
          </DropdownMenuLabel>
          {onRetry ? (
            <DropdownMenuItem className={itemClassName} onClick={onRetry}>
              {account.retry}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            className={cn(itemClassName, "lg:hidden")}
            onClick={() => {
              topUpAfterClose.current = true;
            }}
          >
            {account.topUp}
          </DropdownMenuItem>
          <MenuPrimitive.LinkItem
            closeOnClick
            href={links.support}
            className={cn(menuLinkBase, itemClassName)}
          >
            {account.support}
          </MenuPrimitive.LinkItem>
          <MenuPrimitive.LinkItem
            closeOnClick
            href={links.docs}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(menuLinkBase, itemClassName)}
          >
            {account.docs}
            <span className="sr-only">, {search.newTab}</span>
          </MenuPrimitive.LinkItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="-mx-1.5 my-1.5 bg-line" />
        {/* A native POST clears the demo state; the full page load leaves none of it in hidden routes. */}
        <form
          ref={signOutForm}
          method="post"
          action="/auth/sign-out"
          className="contents"
          onSubmit={(event) => {
            if (signingOut) event.preventDefault();
            else setSigningOut(true);
          }}
        >
          <DropdownMenuItem
            className={itemClassName}
            closeOnClick={false}
            aria-disabled={signingOut || undefined}
            onClick={() => signOutForm.current?.requestSubmit()}
          >
            {signingOut ? account.signingOut : account.signOut}
            {/* At the end, so the label never moves when the orb appears. */}
            {signingOut ? (
              <Spinner tone="accent" className="pending-delay ml-auto" />
            ) : null}
          </DropdownMenuItem>
        </form>
        <p role="status" className="sr-only">
          {signingOut ? account.signingOut : ""}
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Avatar({ profile }: { profile: ProfileDTO | null }) {
  const [failed, setFailed] = useState(false);
  const ring =
    "relative grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-chip after:absolute after:inset-0 after:rounded-full after:border after:border-line-ring lg:size-[38px]";

  if (profile?.avatarUrl && !failed) {
    return (
      <span className={ring}>
        <Image
          src={profile.avatarUrl}
          alt={account.avatarAlt(profile.name)}
          width={38}
          height={38}
          sizes="38px"
          loading="eager"
          // A broken image falls back to initials instead of a broken icon.
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      </span>
    );
  }
  if (profile) {
    return (
      <span
        role="img"
        aria-label={account.avatarAlt(profile.name)}
        className={cn(ring, "font-semibold text-[13px] text-bone")}
      >
        {profile.initials}
      </span>
    );
  }
  return (
    <span className={ring}>
      <UserRoundIcon aria-hidden className="size-[18px] text-ink-2" />
    </span>
  );
}
