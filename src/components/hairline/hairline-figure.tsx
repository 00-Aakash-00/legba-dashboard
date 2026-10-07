"use client";

import Image from "next/image";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { hairline } from "@/content/copy";
import { cn } from "@/lib/utils";
import type { HairlineFigureModule, HairlineKernel } from "./figures/figure";
import styles from "./hairline-figure.module.css";

export type HairlineKind = "ghost" | "shield";

type Point = readonly [number, number];

/**
 * Per figure: its still rest drawing, and the line (viewBox units, 400 x 320)
 * the keyboard moves the pointer along, from the figure's least answer to its
 * most. Keys reach a figure through its pointer, the way the hairline bench's
 * `?at=` does, so a figure needs no key code of its own; a figure that does
 * handle keys (and calls preventDefault) is left alone.
 */
const FIGURES: Record<
  HairlineKind,
  { fallback: string; scrub: readonly [Point, Point] }
> = {
  // The hood turns toward the pointer's bearing: across the hood, full left to full right.
  ghost: {
    fallback: "/images/hairline/ghost.svg",
    scrub: [
      [160, 150],
      [240, 150],
    ],
  },
  // The plate under the pointer holds and the gaps open as it rises: up the stack.
  shield: {
    fallback: "/images/hairline/shield.svg",
    scrub: [
      [186, 262],
      [204, 70],
    ],
  },
};

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
  /** The illustration's name while it is a still picture. */
  label: string;
  /** Sizes and places the slot; may set --hairline-left/top/width/mask. */
  className?: string;
};

/**
 * A hairline figure (src/components/hairline/figures/<kind>.js) on the shared
 * kernel. The still fallback renders on the server; the figure mounts after
 * hydration, once the slot nears the viewport and the browser is idle. It is
 * destroyed when the component unmounts or its route is hidden by Activity.
 * If the figure module is missing or fails, the still picture stays.
 */
export function HairlineFigure({
  kind,
  label,
  className,
}: HairlineFigureProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const readRef = useRef<HTMLSpanElement>(null);
  /** Where the keyboard holds the pointer on the scrub line (0 to 1); null at rest. */
  const scrubRef = useRef<number | null>(null);
  const guidanceId = useId();
  const [means, setMeans] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const ready = means !== null;

  useEffect(() => {
    const stage = stageRef.current;
    const read = readRef.current;
    if (!stage || !read) return;

    let cancelled = false;
    let handle: { destroy: () => void } | undefined;
    let idle = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let observer: IntersectionObserver | undefined;
    setMeans(null);

    async function mount() {
      const [kernel, module] = await Promise.all([
        import("./kernel.js") as Promise<{ HL: HairlineKernel }>,
        import(`./figures/${kind}`) as Promise<{
          default: HairlineFigureModule;
        }>,
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
      setMeans(figure.means);
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
      if (idle) window.cancelIdleCallback(idle);
      clearTimeout(timer);
      handle?.destroy();
      stage.replaceChildren();
      read.textContent = "";
      scrubRef.current = null;
    };
  }, [kind]);

  /** Holds the pointer at t along the figure's scrub line. */
  function scrubTo(t: number) {
    const stage = stageRef.current;
    if (!stage) return;
    scrubRef.current = t;
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
    if (scrubRef.current === null) return;
    scrubRef.current = null;
    stageRef.current?.dispatchEvent(
      new PointerEvent("pointerleave", { pointerType: "mouse", pointerId: 1 }),
    );
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!ready || event.nativeEvent.defaultPrevented || !KEYS.has(event.key)) {
      return;
    }
    event.preventDefault();
    if (event.key === "Escape") return rest();
    if (event.key === "Home") return scrubTo(0);
    if (event.key === "End") return scrubTo(1);
    const step = FORWARD.has(event.key) ? 1 : -1;
    const from = scrubRef.current ?? 0.5;
    scrubTo(Math.min(1, Math.max(0, Math.round(from * 10 + step) / 10)));
  }

  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: the slot is role="img" (named by label) until the figure mounts; then the name moves to the stage.
    <div
      className={cn(styles.figure, className)}
      data-figure={kind}
      data-ready={ready || undefined}
      role={ready ? undefined : "img"}
      aria-label={ready ? undefined : label}
    >
      <div className={styles.box}>
        <Image
          src={FIGURES[kind].fallback}
          alt=""
          width={400}
          height={320}
          unoptimized
          draggable={false}
          className={styles.fallback}
        />
        {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: the mounted stage receives its group role and its name together. */}
        <div
          ref={stageRef}
          className={styles.stage}
          data-hairline={kind}
          data-hairline-theme="dark"
          role={ready ? "group" : undefined}
          tabIndex={ready ? 0 : undefined}
          aria-label={means ?? undefined}
          aria-describedby={ready ? guidanceId : undefined}
          aria-hidden={ready ? undefined : true}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            rest();
          }}
        />
      </div>
      <span id={guidanceId} className="sr-only" hidden={!ready}>
        {hairline.guidance}
      </span>
      {/* The figure writes its read-out here; it is spoken only while the figure has focus. */}
      <span
        ref={readRef}
        className="sr-only"
        aria-live={focused ? "polite" : "off"}
        aria-atomic="true"
      />
    </div>
  );
}
