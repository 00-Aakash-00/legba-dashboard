"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { nav } from "@/content/copy";
import { activeNavKey, NAV_ITEMS, type NavKey } from "./nav";

/** STUB (owned by the shell builder): desktop primary navigation. */
function NavList({ active }: { active: NavKey | null }) {
  return (
    <nav aria-label={nav.label}>
      <ul className="flex items-center gap-8">
        {NAV_ITEMS.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              aria-current={active === item.key ? "page" : undefined}
              className="text-muted-foreground text-sm aria-[current=page]:text-bone"
            >
              {item.label}
            </Link>
          </li>
        ))}
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
