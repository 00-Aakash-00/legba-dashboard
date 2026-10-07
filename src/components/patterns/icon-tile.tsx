import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The glowing red tile that anchors empty and error states: the instances
 * card's rack LED and pixel squares, scaled down. Decorative only.
 */
export function IconTile({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("relative inline-grid size-16 shrink-0", className)}
    >
      {/* Pixel squares stepping off the corners, as on the instances card. */}
      <span className="absolute -top-3 -right-3 size-3 rounded-[3px] bg-red-pixel" />
      <span className="absolute top-1 -right-[22px] size-2 rounded-[2px] bg-red-pixel/70" />
      <span className="absolute -bottom-3 -left-3 size-2.5 rounded-[2px] bg-red-pixel/80" />
      <span className="relative grid size-16 place-items-center rounded-[18px] border border-instances-edge bg-[linear-gradient(160deg,#3f1013_0%,#2a0d0f_55%,#1a0a0b_100%)] shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_18px_40px_-18px_rgb(244_26_68/0.65)]">
        <Icon
          className="size-[26px] text-signal-strong drop-shadow-[0_0_8px_rgb(253_30_67/0.55)]"
          strokeWidth={2}
        />
      </span>
    </span>
  );
}
