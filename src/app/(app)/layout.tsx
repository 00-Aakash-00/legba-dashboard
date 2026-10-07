import { type ReactNode, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { nav } from "@/content/copy";
import { AccountBoundary } from "@/features/shell/account-boundary";
import { AccountMenu } from "@/features/shell/account-menu";
import { AppHeader } from "@/features/shell/app-header";
import { AvatarSkeleton } from "@/features/shell/avatar-skeleton";
import { MainNav, MainNavFallback } from "@/features/shell/main-nav";
import {
  MobileTabBar,
  MobileTabBarFallback,
} from "@/features/shell/mobile-tab-bar";

// Default <Link>s fetch only the static App Shell; per-user data streams in.
export const ensureStatic = "shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <div
        data-app-shell
        className="flex min-h-dvh flex-col bg-canvas pr-[env(safe-area-inset-right,0px)] pl-[env(safe-area-inset-left,0px)] [--tabbar-h:calc(4rem+env(safe-area-inset-bottom,0px))] lg:[--tabbar-h:0px]"
      >
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-bone px-3 py-2 text-canvas focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-3 focus:py-2"
        >
          {nav.skipToContent}
        </a>
        <AppHeader
          // useSelectedLayoutSegment suspends under dynamic routes: keep a static fallback.
          nav={
            <Suspense fallback={<MainNavFallback />}>
              <MainNav />
            </Suspense>
          }
          account={
            <AccountBoundary>
              <Suspense fallback={<AvatarSkeleton />}>
                <AccountMenu />
              </Suspense>
            </AccountBoundary>
          }
        />
        <main
          id="main"
          className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:pb-0"
        >
          {children}
        </main>
        <Suspense fallback={<MobileTabBarFallback />}>
          <MobileTabBar />
        </Suspense>
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
