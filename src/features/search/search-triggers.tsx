"use client";

import { SearchIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { nav } from "@/content/copy";
import { cn } from "@/lib/utils";
import { paletteBody, paletteDialog } from "./palette";

// Intent preloads the palette body: most opens then find it already loaded.
const preloadOnIntent = {
  onPointerEnter: paletteBody.preload,
  onFocus: paletteBody.preload,
  onPointerDown: paletteBody.preload,
};

/** The header search pill, 1280px and up (spec overview.json header.search). */
export function SearchPill() {
  return (
    <DialogTrigger
      handle={paletteDialog}
      aria-keyshortcuts="Meta+K Control+K"
      {...preloadOnIntent}
      className="hidden h-10 w-[284px] min-w-40 shrink items-center gap-[9.25px] rounded-full border border-x-[#1d1f20] border-t-[#1f2122] border-b-[#1a1a1b] bg-[#151718] pr-4 pl-[14.4px] text-left outline-none transition-[background-color,border-color,scale] duration-150 ease-out-strong hover:border-[#2a2c2e] hover:bg-[#17191a] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97] xl:flex"
    >
      <SearchIcon
        aria-hidden
        className="-translate-y-[0.5px] size-5 shrink-0 text-[#a2a6ab]"
      />
      <span className="whitespace-nowrap font-medium text-[#898c90] text-[13.5px] leading-3 tracking-[-0.03em]">
        {nav.searchPlaceholder}
      </span>
    </DialogTrigger>
  );
}

/** Below 1280px, and in the phone top bar, search is an icon button. */
export function SearchButton() {
  return (
    <Tooltip>
      <TooltipTrigger
        delay={500}
        render={
          <DialogTrigger
            handle={paletteDialog}
            aria-label={nav.searchLabel}
            aria-keyshortcuts="Meta+K Control+K"
            {...preloadOnIntent}
            className={cn(
              buttonVariants({ variant: "icon-ghost", size: "icon-lg" }),
              "size-11 text-[#c4c6cd] active:scale-[0.97] lg:size-9 xl:hidden",
            )}
          />
        }
      >
        <SearchIcon aria-hidden className="size-5" />
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        sideOffset={6}
        className="data-instant:animate-none"
      >
        {nav.searchLabel}
        <ShortcutKey />
      </TooltipContent>
    </Tooltip>
  );
}

// Tooltip content renders only while open (on the client), so reading the platform is safe.
function ShortcutKey() {
  const mac =
    typeof navigator !== "undefined" &&
    /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);
  return <Kbd>{mac ? nav.shortcut.mac : nav.shortcut.other}</Kbd>;
}
