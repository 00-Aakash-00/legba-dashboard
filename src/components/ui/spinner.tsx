import type { ComponentProps, CSSProperties } from "react";
import { cn } from "@/lib/utils";
import styles from "./spinner.module.css";

/**
 * The app's only loading indicator: the AICSS "S1" orb lattice (MIT, see
 * spinner.module.css). Its 3×3 dots echo the pixel squares in the design.
 *
 * Always presentational (aria-hidden). Announce loading with the control's
 * visible text + aria-busy, or the region's persistent role="status" text.
 * Layout regions use skeletons instead.
 */

const STAGE = 28;
const CELLS = Array.from({ length: 9 }, (_, n) => {
  const x = n % 3;
  const y = Math.floor(n / 3);
  const dx = x - 1;
  const dy = y - 1;
  return {
    key: n,
    left: x * 6,
    top: y * 6,
    // The centre leads by a beat so the next swell doesn't sit behind the fade.
    delay: Math.hypot(dx, dy) * 700 - (dx === 0 && dy === 0 ? 180 : 0),
  };
});

type SpinnerProps = Omit<ComponentProps<"span">, "children"> & {
  /** Edge length in px. Keep it at 20 or more so the dots stay crisp. */
  size?: number;
  /** "current" inherits the text colour (white in red pills); "accent" is signal red. */
  tone?: "current" | "accent";
};

function Spinner({
  size = 20,
  tone = "current",
  className,
  style,
  ...props
}: SpinnerProps) {
  return (
    <span
      data-slot="spinner"
      data-tone={tone}
      aria-hidden
      className={cn(styles.root, className)}
      style={
        {
          width: size,
          height: size,
          "--orb-k": size / STAGE,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <span className={styles.lattice}>
        {CELLS.map((cell) => (
          <span
            key={cell.key}
            className={styles.cell}
            style={{
              left: cell.left,
              top: cell.top,
              animationDelay: `${cell.delay}ms`,
            }}
          />
        ))}
      </span>
    </span>
  );
}

export { Spinner };
