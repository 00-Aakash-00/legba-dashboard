"use client";

import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { Spinner } from "@/components/ui/spinner";

/**
 * Dark-only toaster. Toasts carry no icons (icons appear only in the nav bar
 * and on the login screens); sonner skips the icon slot when its entry is
 * null. Loading uses the orb, like every other loader.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      // Clear the mobile tab bar and the home indicator (--tabbar-h is set by the app shell).
      offset={{
        bottom:
          "calc(24px + var(--tabbar-h, env(safe-area-inset-bottom, 0px)))",
      }}
      mobileOffset={{
        bottom:
          "calc(16px + var(--tabbar-h, env(safe-area-inset-bottom, 0px)))",
        left: 16,
        right: 16,
      }}
      icons={{
        success: null,
        info: null,
        warning: null,
        error: null,
        loading: <Spinner size={18} tone="accent" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
