import Image from "next/image";
import Link from "next/link";
import { brand } from "@/content/copy";
import { cn } from "@/lib/utils";

/** The stitched-doll mark. Locked asset: never redrawn or recoloured. */
export function Mark({
  size = 32,
  className,
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/mark.png"
      alt=""
      width={size}
      height={size}
      sizes={`${size}px`}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={cn("shrink-0 select-none", className)}
    />
  );
}

/** The locked LEGBA logotype (Permanent Marker, frozen as SVG). */
export function Wordmark({
  height = 22,
  className,
}: {
  height?: number;
  className?: string;
}) {
  // viewBox 276.35 × 64.66
  const width = Math.round((height * 276.35) / 64.66);
  return (
    <Image
      src="/brand/wordmark-bone.svg"
      alt={brand.name}
      width={width}
      height={height}
      unoptimized
      className={cn("shrink-0 select-none", className)}
    />
  );
}

/** Mark + wordmark, linking home. */
export function LogoLockup({
  markSize = 32,
  wordmarkHeight = 22,
  className,
  priority,
}: {
  markSize?: number;
  wordmarkHeight?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label={brand.homeLabel}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Mark size={markSize} priority={priority} />
      <Wordmark height={wordmarkHeight} />
    </Link>
  );
}
