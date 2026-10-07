import { Skeleton } from "@/components/ui/skeleton";

export function AvatarSkeleton() {
  return (
    <span className="skeleton-delay block size-10">
      <Skeleton className="size-10 rounded-full" />
    </span>
  );
}
