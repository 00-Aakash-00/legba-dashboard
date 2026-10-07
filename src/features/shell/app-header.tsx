import Link from "next/link";
import type { ReactNode } from "react";
import { Mark, Wordmark } from "@/components/brand/logo";
import { nav as navCopy } from "@/content/copy";
import { TopUpButton } from "@/features/billing/top-up-button";
import { TopUpDialog } from "@/features/billing/top-up-dialog";
import { CommandPalette } from "@/features/search/command-palette";
import { SearchButton, SearchPill } from "@/features/search/search-triggers";
import { HeaderLinks } from "./header-links";

/**
 * The app header. ≥1024 it is the mockup's 60px bar (spec overview.json
 * header.*; content centred on y 27.5, the active underline on the bottom
 * edge); 1024–1279 shows the mark alone and collapses search to an icon.
 * Below 1024 it is the 56px phone top bar (docs/design/responsive.md):
 * logo, search, avatar; navigation moves to the bottom tab bar.
 *
 * `nav` and `account` arrive wrapped in Suspense from the (app) layout.
 */
export function AppHeader({
  nav,
  account,
}: {
  nav: ReactNode;
  account: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 border-line-header border-b bg-shell pt-[env(safe-area-inset-top,0px)]">
      <div className="flex h-14 items-center pr-[11px] pl-[13.2px] lg:h-[60px] lg:pr-[14.5px] lg:pb-[5px] lg:pl-[12.8px]">
        <Link
          href="/"
          aria-label={navCopy.home}
          className="flex shrink-0 items-center gap-2 rounded-[8px] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-shell lg:gap-[9.5px]"
        >
          {/* The mark's ink sits low in its square: lift it onto the bar's centre line. */}
          <Mark
            size={47}
            priority
            className="-translate-y-[0.8px] size-9 lg:-translate-y-[1.1px] lg:size-[47px]"
          />
          <Wordmark
            height={21.75}
            className="h-[17px] w-auto lg:h-[21.75px] lg:max-xl:hidden"
          />
        </Link>
        <span
          aria-hidden
          className="mr-5 ml-6 hidden h-[25px] w-px shrink-0 bg-[#242627] lg:block xl:mr-[27.5px] xl:ml-[32.2px]"
        />
        <div className="-mb-[5px] hidden self-stretch lg:flex">{nav}</div>
        <div className="min-w-6 flex-1" />
        <SearchPill />
        <SearchButton />
        <HeaderLinks />
        <span
          aria-hidden
          className="mr-[14.5px] ml-[12.5px] hidden h-[25px] w-px shrink-0 bg-[#1f2122] lg:block"
        />
        <TopUpButton />
        <div className="flex shrink-0 lg:ml-3">{account}</div>
      </div>
      <CommandPalette />
      <TopUpDialog />
    </header>
  );
}
