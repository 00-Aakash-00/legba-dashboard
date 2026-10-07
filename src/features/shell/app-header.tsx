import type { ReactNode } from "react";
import { LogoLockup } from "@/components/brand/logo";

/**
 * STUB (owned by the shell builder): the desktop header / mobile top bar.
 * Receives the Suspense-wrapped nav and account slots from the (app) layout.
 */
export function AppHeader({
  nav,
  account,
}: {
  nav: ReactNode;
  account: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-15 items-center gap-6 border-line border-b bg-shell px-4">
      <LogoLockup priority />
      <div className="hidden lg:block">{nav}</div>
      <div className="ml-auto">{account}</div>
    </header>
  );
}
