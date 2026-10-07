import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Uppercase section label, measured from the overview's "DOCS" eyebrow. */
export const eyebrowClass =
  "font-semibold text-[#b0b8c1] text-[13px] uppercase leading-4 tracking-[-0.03em]";

/**
 * A data section on a stub page: the overview's card (radius 20, panel, 1px
 * line) headed by an eyebrow. The heading stays put in every state (loading,
 * empty, error, success), so a failed section keeps its name. `headingId` is
 * focusable so focus has somewhere to land when the element that held it
 * disappears (a revoked row, a closed dialog).
 */
export function SectionCard({
  headingId,
  title,
  className,
  children,
}: {
  headingId: string;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "relative flex flex-col rounded-card border border-line bg-panel",
        className,
      )}
    >
      {/* An 18px line from 20px down: centred level with the corner Preview
          chip (CardPreviewChip, 24px tall at 17px). */}
      <h2
        id={headingId}
        tabIndex={-1}
        className={cn(eyebrowClass, "px-5 pt-5 leading-[18px] outline-none")}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
