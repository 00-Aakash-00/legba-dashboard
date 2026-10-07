"use client";

import { BookOpenIcon, HeadsetIcon } from "lucide-react";
import { useId } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { links, nav, search } from "@/content/copy";
import { cn } from "@/lib/utils";

const linkClassName = cn(
  buttonVariants({ variant: "icon-ghost", size: "icon-lg" }),
  "active:scale-[0.97]",
);

/**
 * Support (mailto) and docs (new tab) in the desktop header, labelled by
 * tooltips that open after a beat, then instantly while moving between them.
 * Both also live in the account menu, which is where phones find them.
 */
export function HeaderLinks() {
  const newTabId = useId();
  return (
    <div className="hidden shrink-0 lg:flex xl:ml-[30px]">
      <Tooltip>
        <TooltipTrigger
          delay={500}
          render={
            <a
              href={links.support}
              className={cn(linkClassName, "text-[#cdd0d6]")}
            />
          }
        >
          <HeadsetIcon aria-hidden strokeWidth={2.25} className="size-[18px]" />
          <span className="sr-only">{nav.support}</span>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={6}
          className="data-instant:animate-none"
        >
          {nav.support}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          delay={500}
          render={
            <a
              href={links.docs}
              target="_blank"
              rel="noopener noreferrer"
              aria-describedby={newTabId}
              className={cn(linkClassName, "text-[#c3cad3]")}
            />
          }
        >
          <BookOpenIcon
            aria-hidden
            strokeWidth={2.25}
            className="size-[18px]"
          />
          <span className="sr-only">{nav.docs}</span>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={6}
          className="data-instant:animate-none"
        >
          {nav.docs}
        </TooltipContent>
      </Tooltip>
      <span id={newTabId} hidden>
        {search.newTab}
      </span>
    </div>
  );
}
