import { cn } from "@/lib/utils";

/**
 * A plan's features. Icons live only in the nav bar and red square markers
 * nowhere (AGENTS.md), so each row has a CSS bullet: the small neutral round
 * dot /plans uses, centred in the mockup's 24px icon column so the text keeps
 * its place.
 */
export function PlanFeatures({
  features,
  className,
}: {
  features: readonly string[];
  className?: string;
}) {
  return (
    // biome-ignore lint/a11y/noRedundantRoles: list-style: none drops list semantics in Safari/VoiceOver.
    <ul role="list" className={cn("flex flex-col", className)}>
      {features.map((feature) => (
        <li
          key={feature}
          className="flex min-h-[33px] items-center gap-[13.7px] font-semibold text-[#8d9398] text-[12.5px] leading-[15.5px] tracking-[-0.03em] before:mx-[10px] before:size-1 before:shrink-0 before:rounded-full before:bg-ink-subtle before:content-['']"
        >
          <span className="min-w-0 leading-3">{feature}</span>
        </li>
      ))}
    </ul>
  );
}
