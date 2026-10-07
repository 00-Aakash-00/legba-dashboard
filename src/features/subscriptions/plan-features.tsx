import {
  CircleArrowUpIcon,
  CircleDotIcon,
  GlobeIcon,
  HexagonIcon,
  LockKeyholeIcon,
  ShieldCheckIcon,
  ZapIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { plans } from "@/content/copy";
import { cn } from "@/lib/utils";

type Plan = keyof typeof plans;

/** A small glyph centred inside a hexagon frame (docs/design/spec/icons.json composites). */
function InHexagon({ children }: { children: ReactNode }) {
  return (
    <span className="inline-grid place-items-center [&>svg]:col-start-1 [&>svg]:row-start-1">
      <HexagonIcon className="size-[23px]" strokeWidth={2} />
      {children}
    </span>
  );
}

/** The red glyph for each feature row, per docs/design/spec/icons.json. */
const ICONS: Record<Plan, readonly ReactNode[]> = {
  ghost: [
    <CircleDotIcon key="anonymous" className="size-[23px]" strokeWidth={2} />,
    <LockKeyholeIcon key="logs" className="size-5" strokeWidth={2.25} />,
    <InHexagon key="global">
      <GlobeIcon className="size-[11px]" strokeWidth={2.75} />
    </InHexagon>,
    <InHexagon key="priority">
      <ZapIcon className="size-[11px]" strokeWidth={2.75} />
    </InHexagon>,
  ],
  shield: [
    <ShieldCheckIcon key="security" className="size-[21px]" strokeWidth={2} />,
    <ShieldCheckIcon key="threat" className="size-[21px]" strokeWidth={2} />,
    <ShieldCheckIcon
      key="compliance"
      className="size-[21px]"
      strokeWidth={2}
    />,
    <CircleArrowUpIcon key="support" className="size-[21px]" strokeWidth={2} />,
  ],
};

/** The plan's four features, each with its red icon. */
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
      {plans[plan].features.map((feature, index) => (
        <li
          key={feature}
          className="flex min-h-[33px] items-center gap-[13.7px] font-semibold text-[#8d9398] text-[12.5px] leading-[15.5px] tracking-[-0.03em]"
        >
          <span
            aria-hidden="true"
            className="relative -top-px grid size-6 shrink-0 place-items-center text-signal-icon"
          >
            {ICONS[plan][index]}
          </span>
          <span className="min-w-0 leading-3">{feature}</span>
        </li>
      ))}
    </ul>
  );
}
