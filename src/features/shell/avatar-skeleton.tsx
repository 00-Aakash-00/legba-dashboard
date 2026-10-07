import { Skeleton } from "@/components/ui/skeleton";

/**
 * Holds the account trigger's exact footprint (avatar + chevron on desktop,
 * a 44px target on phones) while the session streams in; fades in only if
 * that takes longer than 300ms.
 */
export function AvatarSkeleton() {
  return (
    <span
      aria-hidden
      className="skeleton-delay flex size-11 shrink-0 items-center justify-center lg:h-[38px] lg:w-auto lg:gap-[7px]"
    >
      <Skeleton className="size-[34px] rounded-full lg:size-[38px]" />
      <span className="hidden h-5 w-3 lg:block" />
    </span>
  );
}
