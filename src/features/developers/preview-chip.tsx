import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { workspace } from "@/content/copy";
import { cn } from "@/lib/utils";

/**
 * "● Preview": the subscription status chip's shape, compact, with an amber
 * dot (the paused status colour: not live). Marks every value that isn't
 * public yet: the browser API host, the MCP config, the install command.
 */
export function PreviewChip({ className }: { className?: string }) {
  return (
    <Badge
      variant="status"
      className={cn(
        "h-6 gap-1.5 rounded-[8px] border-[#2a2b2c] bg-[#191a1b] pr-2 pl-[7px] font-semibold text-[#d0d0d1] text-[11.5px] leading-none tracking-[-0.01em]",
        className,
      )}
    >
      <span
        aria-hidden
        className="size-1.5 shrink-0 rounded-full bg-[#d9a441] shadow-[0_0_6px_rgb(217_164_65/0.6)]"
      />
      {workspace.preview}
    </Badge>
  );
}

/**
 * The chip in a section card's top-right corner, level with the card's
 * heading. Below 22rem the longest heading ("How a session starts") would run
 * under it, so there it sits in the flow under the heading instead.
 */
export function CardPreviewChip() {
  return (
    <PreviewChip className="absolute top-[17px] right-5 max-[22rem]:static max-[22rem]:mx-5 max-[22rem]:mt-3" />
  );
}

/** The chip with the sentence that explains it, right under a page's title. */
export function PreviewNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex w-fit max-w-full items-start gap-3 rounded-[14px] border border-line bg-panel py-2.5 pr-4 pl-2.5 font-medium text-[14px] text-ink-2 leading-6 tracking-[-0.02em] sm:items-center">
      <PreviewChip />
      <span className="min-w-0 text-pretty">{children}</span>
    </p>
  );
}
