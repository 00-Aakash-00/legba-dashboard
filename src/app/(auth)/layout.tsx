import type { ReactNode } from "react";
import { AuthShowcase } from "@/features/auth/auth-showcase";
import { MarkFilters } from "@/features/auth/mark-filters";

// Auth pages are fully static: the form reads `next` on the client.
export const ensureStatic = "navigation";

/**
 * Split layout from the login mockup (docs/design/spec/login.json `page`):
 * the red showcase panel and the form panel, full height, on #080808 with
 * 12px side margins and a 12px gap (631 : 774 at 1440). Below 1024px the
 * showcase becomes a compact banner above the form and the form takes the
 * page.
 *
 * The form comes first in the DOM so screen readers and the Tab key reach it
 * before the marketing panel; CSS puts the showcase first visually.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-auth-panel pr-[env(safe-area-inset-right,0px)] pl-[env(safe-area-inset-left,0px)] lg:grid lg:grid-cols-[minmax(0,631fr)_minmax(0,774fr)] lg:gap-3 lg:bg-auth-page lg:px-3 lg:py-2.5">
      <MarkFilters />
      <main
        id="main"
        className="flex flex-1 flex-col px-4 lg:col-start-2 lg:row-start-1 lg:rounded-[28px] lg:border-2 lg:border-auth-line lg:bg-auth-panel lg:px-6"
      >
        {children}
      </main>
      <AuthShowcase />
    </div>
  );
}
