"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { nav } from "@/content/copy";
import { activeNavKey, NAV_ITEMS, type NavKey } from "./nav";
import { NavIcon } from "./nav-icon";

/**
 * The bottom tab bar below 1024px (docs/design/responsive.md): primary
 * navigation in thumb reach, labels always visible, a red bar with the
 * underline's glow over the active tab. 64px plus the home-indicator inset.
 */
function TabBar({ active }: { active: NavKey | null }) {
  return (
    <nav
      aria-label={nav.label}
      className="fixed inset-x-0 bottom-0 z-40 border-line border-t bg-shell pr-[env(safe-area-inset-right,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-xl grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const current = active === item.key;
          return (
            <li key={item.key} className="flex">
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className="press relative flex flex-1 flex-col items-center justify-center gap-1 rounded-[10px] font-semibold text-[11px] text-ink-2 leading-[14px] outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset aria-[current=page]:text-bone"
              >
                {current ? (
                  <span
                    aria-hidden
                    className="-top-px -translate-x-1/2 absolute left-1/2 h-0.5 w-8 rounded-b-[2px] bg-signal shadow-[0_0_10px_1px_rgb(244_26_68/0.55)]"
                  />
                ) : null}
                <NavIcon item={item} active={current} className="size-5" />
                <span>{item.short}</span>
              </Link>
            </li>
          );
        })}
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
