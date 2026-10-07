import { plans } from "@/content/copy";
import { cn } from "@/lib/utils";

type Plan = keyof typeof plans;

/**
 * The plan's four features. Icons live only in the nav bar (AGENTS.md), so
 * each row has a CSS bullet: a small red square in the mockup's icon column,
 * the same pixel-square vocabulary as the section bullet.
 */
export function PlanFeatures({
  plan,
  className,
}: {
  plan: Plan;
  className?: string;
}) {
  return (
    // biome-ignore lint/a11y/noRedundantRoles: list-style: none drops list semantics in Safari/VoiceOver.
    <ul role="list" className={cn("flex flex-col", className)}>
      {plans[plan].features.map((feature) => (
        <li
          key={feature}
          className="flex min-h-[33px] items-center gap-[13.7px] font-semibold text-[#8d9398] text-[12.5px] leading-[15.5px] tracking-[-0.03em] before:mx-[8.5px] before:size-[7px] before:shrink-0 before:rounded-[2px] before:bg-signal-icon before:shadow-[0_0_6px_rgba(240,32,63,0.45)] before:content-['']"
        >
          <span className="min-w-0 leading-3">{feature}</span>
        </li>
      ))}
    </ul>
  );
}
