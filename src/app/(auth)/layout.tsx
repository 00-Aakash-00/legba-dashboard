import type { ReactNode } from "react";
import { AuthShowcase } from "@/features/auth/auth-showcase";

// Auth pages are fully static: the form reads `next` on the client.
export const ensureStatic = "navigation";

/**
 * Split layout from the login mockup: the red showcase panel and the form
 * panel. Below 1024px the showcase becomes a compact banner above the form.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col gap-3 bg-[#090809] py-3 pr-[max(0.75rem,env(safe-area-inset-right))] pl-[max(0.75rem,env(safe-area-inset-left))] lg:grid lg:grid-cols-[44fr_56fr] lg:gap-4">
      <AuthShowcase />
      <main
        id="main"
        className="flex flex-1 flex-col rounded-[28px] border border-line-strong bg-[#0a0a0a]"
      >
        {children}
      </main>
    </div>
  );
}
