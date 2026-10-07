"use client";

import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { hairline } from "@/content/copy";
import { cn } from "@/lib/utils";
import type { HairlineFigureModule, HairlineKernel } from "./figures/figure";
import styles from "./hairline-figure.module.css";

export type HairlineKind = "ghost" | "shield";

type Point = readonly [number, number];

/**
 * Per figure: its module, its still rest drawing, and the line (viewBox units,
 * 400 x 320) the keyboard moves the pointer along, from the figure's least
 * answer to its most, which is also the slider's orientation. Keys reach a
 * figure through its pointer, the way the hairline bench's `?at=` does, so a
 * figure needs no key code of its own; a figure that does handle keys (and
 * calls preventDefault) is left alone.
 */
const FIGURES: Record<
  HairlineKind,
  {
    load: () => Promise<{ default: HairlineFigureModule }>;
    fallback: string;
    scrub: readonly [Point, Point];
    orientation: "horizontal" | "vertical";
  }
> = {
  // The hood turns toward the pointer's bearing: across the hood, full left to full right.
  ghost: {
    load: () => import("./figures/ghost.js"),
    fallback: "/images/hairline/ghost.svg",
    scrub: [
      [160, 150],
      [240, 150],
    ],
    orientation: "horizontal",
  },
  // The plate under the pointer holds and the gaps open as it rises: up the stack.
  shield: {
    load: () => import("./figures/shield.js"),
    fallback: "/images/hairline/shield.svg",
    scrub: [
      [186, 262],
      [204, 70],
    ],
    orientation: "vertical",
  },
};

/** The keyboard's steps along the scrub line; at rest the slider reads the middle one. */
const STEPS = 10;

const KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "Escape",
]);
const FORWARD = new Set(["ArrowRight", "ArrowUp"]);

type HairlineFigureProps = {
  kind: HairlineKind;
  /** Sizes and places the slot; may set --hairline-left/top/width/mask. */
  className?: string;
} & (
  | {
      /** The illustration's name while it is a still picture. */
      label: string;
      /** Its name once the figure answers the pointer and the keys. */
      liveLabel: string;
      decorative?: false;
    }
  | {
      /**
       * Decoration beside copy that already says everything (an empty or error
       * state): hidden from assistive tech and out of the tab order. It still
       * answers the pointer.
       */
      decorative: true;
      label?: never;
      liveLabel?: never;
    }
);

/**
 * A hairline figure (src/components/hairline/figures/<kind>.js) on the shared
 * kernel. The still fallback renders on the server; the figure mounts after
 * hydration, once the slot nears the viewport and the browser is idle. It is
 * destroyed when the component unmounts or its route is hidden by Activity.
 * If the figure module is missing or fails, the still picture stays.
 *
 * Unless decorative, the mounted figure is a slider: the arrow keys, Home and
 * End move the pointer along its scrub line, Escape lets go, and the value
 * text is the figure's own read-out ("facing 12°", "layer 2", "rest").
 */
export function HairlineFigure({
  kind,
  label,
  liveLabel,
  decorative = false,
  className,
}: HairlineFigureProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const readRef = useRef<HTMLSpanElement>(null);
  const guidanceId = useId();
  const [ready, setReady] = useState(false);
  /** Where the keyboard holds the pointer, in steps along the scrub line; null at rest. */
  const [step, setStep] = useState<number | null>(null);
  /** The figure's read-out of what it shows, mirrored for the slider's value text. */
  const [reading, setReading] = useState("");
  const interactive = ready && !decorative;

  useEffect(() => {
    const stage = stageRef.current;
    const read = readRef.current;
    if (!stage || !read) return;

    let cancelled = false;
    let handle: { destroy: () => void } | undefined;
    let idle = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let observer: IntersectionObserver | undefined;
    // The figure writes its read-out as it answers (a pointer leave lands a tick
    // later); the slider speaks it as its value text. A decoration has none.
    const readout = decorative
      ? undefined
      : new MutationObserver(() => setReading(read.textContent ?? ""));
    readout?.observe(read, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    setReady(false);

    async function mount() {
      const [kernel, module] = await Promise.all([
        import("./kernel.js") as Promise<{ HL: HairlineKernel }>,
        FIGURES[kind].load(),
      ]);
      if (cancelled || !stage || !read) return;
      const figure = module.default;
      kernel.HL.inject(document);
      const svg = kernel.HL.mk(
        "svg",
        { viewBox: "0 0 400 320", "aria-hidden": "true" },
        stage,
      );
      handle = figure.mount({ stage, svg, read }, figure.range[1]);
      setReady(true);
    }

    function load() {
      mount().catch(() => {
        // Justified silence: the figure isn't in place yet, or it failed to
        // draw. It is decoration and its still picture is already showing.
        handle?.destroy();
        handle = undefined;
        stage?.replaceChildren();
      });
    }

    function schedule() {
      if ("requestIdleCallback" in window) {
        idle = window.requestIdleCallback(load, { timeout: 1500 });
      } else {
        timer = setTimeout(load, 1);
      }
    }

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer?.disconnect();
          schedule();
        },
        { rootMargin: "200px" },
      );
      observer.observe(stage);
    } else {
      schedule();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      readout?.disconnect();
      if (idle) window.cancelIdleCallback(idle);
      clearTimeout(timer);
      handle?.destroy();
      stage.replaceChildren();
      read.textContent = "";
      // Hidden by Activity, the slot keeps its state: show the still picture
      // again, so the route comes back with it rather than an empty stage.
      setReady(false);
      setStep(null);
      setReading("");
    };
  }, [kind, decorative]);

  /** Holds the pointer at step n (0 to STEPS) along the figure's scrub line. */
  function scrubTo(n: number) {
    const stage = stageRef.current;
    if (!stage) return;
    setStep(n);
    const t = n / STEPS;
    const [[x0, y0], [x1, y1]] = FIGURES[kind].scrub;
    const box = stage.getBoundingClientRect();
    stage.dispatchEvent(
      new PointerEvent("pointermove", {
        pointerType: "mouse",
        pointerId: 1,
        bubbles: true,
        clientX: box.left + ((x0 + (x1 - x0) * t) / 400) * box.width,
        clientY: box.top + ((y0 + (y1 - y0) * t) / 320) * box.height,
      }),
    );
  }

  /** Lets go of the keyboard's pointer: the figure returns to rest. */
  function rest() {
    if (step === null) return;
    setStep(null);
    stageRef.current?.dispatchEvent(
      new PointerEvent("pointerleave", { pointerType: "mouse", pointerId: 1 }),
    );
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.nativeEvent.defaultPrevented || !KEYS.has(event.key)) return;
    event.preventDefault();
    if (event.key === "Escape") return rest();
    if (event.key === "Home") return scrubTo(0);
    if (event.key === "End") return scrubTo(STEPS);
    const delta = FORWARD.has(event.key) ? 1 : -1;
    scrubTo(Math.min(STEPS, Math.max(0, (step ?? STEPS / 2) + delta)));
  }

  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: the slot is role="img" (named by label) until the figure mounts; then the name moves to the stage.
    <div
      className={cn(styles.figure, className)}
      data-figure={kind}
      data-ready={ready || undefined}
      role={decorative || ready ? undefined : "img"}
      aria-label={decorative || ready ? undefined : label}
      aria-hidden={decorative || undefined}
    >
      <div className={styles.box}>
        {/* The still rest drawing, drawn as inline SVG (not an <img>, which snaps to
            the pixel grid) so it lines up exactly with the figure that replaces it. */}
        <svg
          viewBox="0 0 400 320"
          aria-hidden="true"
          focusable="false"
          className={styles.fallback}
        >
          <use href={`${FIGURES[kind].fallback}#figure`} />
        </svg>
        {/* A slider, not a group: screen readers hand a slider the arrow keys
            (focus mode) and speak its value text as it changes. */}
        {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: the mounted stage receives its slider role and its ARIA props together. */}
        <div
          ref={stageRef}
          className={styles.stage}
          data-hairline={kind}
          data-hairline-theme="dark"
          role={interactive ? "slider" : undefined}
          tabIndex={interactive ? 0 : undefined}
          aria-label={interactive ? liveLabel : undefined}
          aria-describedby={interactive ? guidanceId : undefined}
          aria-orientation={interactive ? FIGURES[kind].orientation : undefined}
          aria-valuemin={interactive ? 0 : undefined}
          aria-valuemax={interactive ? STEPS : undefined}
          aria-valuenow={interactive ? (step ?? STEPS / 2) : undefined}
          aria-valuetext={interactive ? reading || undefined : undefined}
          aria-hidden={ready ? undefined : true}
          onKeyDown={interactive ? onKeyDown : undefined}
          onBlur={interactive ? rest : undefined}
        />
      </div>
      {decorative ? null : (
        <span id={guidanceId} hidden>
          {hairline.guidance}
        </span>
      )}
      {/* The figure writes its read-out here; the slider speaks it as its value text. */}
      <span ref={readRef} hidden />
    </div>
  );
}
