import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The overview's red square section marker (decor.sectionMarker: a CSS box, not an icon). */
export function SectionBullet({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-[18px] shrink-0 rounded-[4px] bg-signal-bullet",
        className,
      )}
    />
  );
}

/** Bullet + uppercase label, measured from the overview's "DOCS" eyebrow. */
export const eyebrowClass =
  "font-semibold text-[#b0b8c1] text-[13px] uppercase leading-4 tracking-[-0.03em]";

/**
 * A data section on a stub page: the overview's card (radius 20, panel, 1px
 * line) headed by the red bullet and an eyebrow. The heading stays put in
 * every state (loading, empty, error, success), so a failed section keeps its
 * name. `headingId` is focusable so focus has somewhere to land when the
 * element that held it disappears (a revoked row, a closed dialog).
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
      <div className="flex items-center gap-[13px] px-5 pt-5">
        <SectionBullet />
        <h2
          id={headingId}
          tabIndex={-1}
          className={cn(eyebrowClass, "outline-none")}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
