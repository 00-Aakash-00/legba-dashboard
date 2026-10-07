"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { nav } from "@/content/copy";
import { activeNavKey, NAV_ITEMS, type NavKey } from "./nav";

/** STUB (owned by the shell builder): the bottom tab bar below 1024px. */
function TabBar({ active }: { active: NavKey | null }) {
  return (
    <nav
      aria-label={nav.label}
      className="fixed inset-x-0 bottom-0 z-40 border-line border-t bg-shell pr-[env(safe-area-inset-right,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] lg:hidden"
    >
      <ul className="grid h-16 grid-cols-5">
        {NAV_ITEMS.map((item) => (
          <li key={item.key} className="flex">
            <Link
              href={item.href}
              aria-current={active === item.key ? "page" : undefined}
              className="flex flex-1 items-center justify-center text-muted-foreground text-xs aria-[current=page]:text-bone"
            >
              {item.short}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function MobileTabBar() {
  return <TabBar active={activeNavKey(useSelectedLayoutSegment())} />;
}

export function MobileTabBarFallback() {
  return <TabBar active={null} />;
}
