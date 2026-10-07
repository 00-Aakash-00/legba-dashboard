import {
  HairlineFigure,
  type HairlineKind,
} from "@/components/hairline/hairline-figure";
import { cn } from "@/lib/utils";
import styles from "./plan-figure.module.css";

/**
 * A plan's hairline figure, cropped to its rest drawing, for the area's empty
 * and error states (AGENTS.md: they show a hairline figure, never an icon
 * tile). Decorative: the state's own copy says what it means, so the figure is
 * hidden from assistive tech and stays out of the tab order. It still answers
 * the pointer.
 */
export function PlanFigure({
  plan,
  className,
}: {
  plan: HairlineKind;
  className?: string;
}) {
  return (
    <HairlineFigure
      kind={plan}
      decorative
      className={cn(styles.figure, styles[plan], className)}
    />
  );
}
