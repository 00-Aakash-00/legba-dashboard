"use client";

/**
 * STUB (owned by the subscriptions builder). Contract:
 *
 *   <HairlineFigure kind="ghost" | "shield" className=... />
 *
 * Mounts the hairline figure module (src/components/hairline/figures/<kind>.js)
 * on the shared kernel after hydration, shows the static fallback SVG until
 * then, supports keyboard stepping, and cleans up on unmount/Activity hide.
 */
export function HairlineFigure({
  kind,
  className,
}: {
  kind: "ghost" | "shield";
  className?: string;
}) {
  return <div data-figure={kind} className={className} aria-hidden />;
}
