import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * A loading region: skeletons that only fade in after 300ms (skeleton-delay,
 * so fast responses never flash) inside a persistent role="status" whose
 * visually hidden label tells assistive tech what is loading.
 */
export function LoadingRegion({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div role="status" className={cn("skeleton-delay", className)}>
      <span className="sr-only">{label}</span>
      <div aria-hidden>{children}</div>
    </div>
  );
}

/** Skeleton bar tuned for the panel surface. */
export function Bar({ className }: { className?: string }) {
  return (
    <Skeleton className={cn("h-3 rounded-full bg-[#1b1d1f]", className)} />
  );
}

const WIDTHS = ["w-44", "w-36", "w-52", "w-40"];

/** Row skeletons for a simple named list (deployments, models, registries). */
export function RowsSkeleton({
  label,
  rows = 3,
}: {
  label: string;
  rows?: number;
}) {
  return (
    <LoadingRegion label={label} className="px-2 pt-4 pb-2">
      {WIDTHS.slice(0, rows).map((width) => (
        <div
          key={width}
          className="flex h-16 items-center gap-4 border-line-soft border-t px-3"
        >
          <Skeleton className="size-9 shrink-0 rounded-[10px] bg-[#1b1d1f]" />
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <Bar className={cn("max-w-[60%]", width)} />
            <Bar className="h-2.5 w-24 bg-[#17191a]" />
          </div>
        </div>
      ))}
    </LoadingRegion>
  );
}
