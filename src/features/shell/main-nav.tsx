"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import type { CSSProperties } from "react";
import { nav } from "@/content/copy";
import { cn } from "@/lib/utils";
import { activeNavKey, NAV_ITEMS, type NavKey } from "./nav";
import { NavIcon } from "./nav-icon";

/**
 * Desktop primary navigation (spec overview.json header.nav.*). Each item is
 * a full-height slot of the 60px bar: the link box is the icon + label the
 * spec measures, its ::after widens the hit area to the whole slot, and the
 * active item carries the red underline on the bar's bottom edge.
 */
function NavList({ active }: { active: NavKey | null }) {
  return (
    <nav aria-label={nav.label} className="mt-[19.5px] flex h-[41px]">
      <ul className="flex h-full gap-x-[19px]">
        {NAV_ITEMS.map((item) => {
          const current = active === item.key;
          return (
            <li key={item.key} className="relative flex items-center pb-[25px]">
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                style={{ "--nav-ink": item.ink } as CSSProperties}
                className={cn(
                  "flex items-center gap-[5.5px] rounded-[6px] font-medium text-(--nav-ink) text-[13px] tracking-[-0.03em] outline-none transition-colors duration-150 ease-out-strong",
                  "after:-top-[19.5px] after:absolute after:inset-x-0 after:bottom-0",
                  "hover:not-aria-[current=page]:text-ink-label",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-[5px] focus-visible:ring-offset-shell",
                  // 600 at -0.04em is exactly as wide as 500 at -0.03em: the row never shifts.
                  "aria-[current=page]:font-semibold aria-[current=page]:text-ink aria-[current=page]:tracking-[-0.04em]",
                )}
              >
                <NavIcon
                  item={item}
                  active={current}
                  className="size-[17px] shrink-0"
                />
                <span className="whitespace-nowrap leading-3">
                  {item.label}
                </span>
                {current ? (
                  <span
                    aria-hidden
                    className="-right-0.5 absolute bottom-0 left-px h-[4.5px] rounded-t-[3px] bg-signal"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MainNav() {
  return <NavList active={activeNavKey(useSelectedLayoutSegment())} />;
}

/** Same markup without the active state, for the static shell. */
export function MainNavFallback() {
  return <NavList active={null} />;
}
