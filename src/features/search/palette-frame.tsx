"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type { ReactNode } from "react";
import { search } from "@/content/copy";

/** Shared by the eager frame (loading, error) and the lazy cmdk body. 16px on touch: iOS zooms into smaller inputs. */
export const paletteInputClassName =
  "h-full min-w-0 flex-1 bg-transparent font-medium text-base text-bone tracking-[-0.01em] outline-none placeholder:text-[#898c90] pointer-fine:text-[15px]";

/** The list area keeps one height in every state, so nothing jumps as the body loads. */
export const paletteBodyClassName =
  "min-h-0 flex-1 lg:h-[min(432px,62dvh)] lg:flex-none";

export function PaletteInputRow({ children }: { children: ReactNode }) {
  return (
    // pl-5 lines the typed text up with the results (list px-2 + item px-3).
    <div className="flex h-14 shrink-0 items-center gap-3 border-line border-b pr-2 pl-5 lg:pr-4">
      {children}
      <kbd
        aria-hidden
        className="hidden h-6 shrink-0 items-center rounded-md border border-line px-1.5 font-medium font-sans text-[11px] text-ink-subtle lg:inline-flex"
      >
        {search.closeHint}
      </kbd>
      <DialogPrimitive.Close className="press h-11 shrink-0 rounded-[10px] px-3 font-semibold text-[15px] text-ink-label outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-white/[0.06] lg:hidden">
        {search.close}
      </DialogPrimitive.Close>
    </div>
  );
}
