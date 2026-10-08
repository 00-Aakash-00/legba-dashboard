"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { hairline } from "@/content/copy";
import { cn } from "@/lib/utils";
import type { HairlineFigureModule, HairlineKernel } from "./figures/figure";
import styles from "./hairline-figure.module.css";

/** Figures people can drive with the keyboard (product art in a card). */
export type InteractiveKind = "ghost" | "shield";
/** Figures that decorate one empty or error state (never focusable). */
export type StateKind =
  | "keyhooks"
  | "blankwindows"
  | "blanksheet"
  | "vending"
  | "breaker"
  | "signpost"
  | "fuse"
  | "cardfile"
  | "flapboard";
/** Every figure is drawn for, and used in, exactly one place (AGENTS.md). */
export type HairlineKind = InteractiveKind | StateKind;

type Point = readonly [number, number];

type Entry = {
  load: () => Promise<{ default: HairlineFigureModule }>;
  /** The still rest drawing (public/images/hairline/<kind>.svg). */
  fallback: string;
  /** The colour the figure's plates take when its place isn't a panel. */
  plate?: string;
  /**
   * The rest drawing's box [x, y, w, h] in viewBox units (measured from the
   * still, plus a little room). The slot then takes its aspect ratio and the
   * stage is placed so the drawing fills it: size such a slot by height.
   */
  crop?: readonly [number, number, number, number];
};

/** Inline host variables for an entry: its plate, and its crop if it has one. */
function hostStyle({ plate, crop }: Entry): CSSProperties | undefined {
  if (!plate && !crop) return undefined;
  const style: Record<string, string> = {};
  if (plate) style["--hairline-plate"] = plate;
  if (crop) {
    const [x, y, w, h] = crop;
    style.aspectRatio = `${w} / ${h}`;
    style["--hairline-width"] = `${(400 / w) * 100}%`;
    style["--hairline-left"] = `${(-x / w) * 100}%`;
    style["--hairline-top"] = `${(-y / h) * 100}%`;
  }
  return style as CSSProperties;
}

/**
 * A drivable figure also has the line (viewBox units, 400 x 320) the keyboard
 * moves the pointer along, from the figure's least answer to its most, which
 * is also the slider's orientation. Keys reach a figure through its pointer,
 * the way the hairline bench's `?at=` does, so a figure needs no key code of
 * its own; a figure that does handle keys (and calls preventDefault) is left
 * alone.
 */
type DrivableEntry = Entry & {
  scrub: readonly [Point, Point];
  orientation: "horizontal" | "vertical";
};

const FIGURES: { [K in InteractiveKind]: DrivableEntry } & {
  [K in StateKind]: Entry;
} = {
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
  // API keys, none yet: a key rack with every hook bare.
  keyhooks: {
    load: () => import("./figures/keyhooks.js"),
    fallback: "/images/hairline/keyhooks.svg",
    crop: [77, 65, 246, 201],
  },
  // Sessions, none yet: a rack of browser windows with blank viewports.
  blankwindows: {
    load: () => import("./figures/blankwindows.js"),
    fallback: "/images/hairline/blankwindows.svg",
    crop: [79, 51, 234, 230],
  },
  // Search palette, no results: a loupe over a blank ruled sheet.
  blanksheet: {
    load: () => import("./figures/blanksheet.js"),
    fallback: "/images/hairline/blanksheet.svg",
    plate: "#141516",
    crop: [37, 66, 326, 198],
  },
  // Plans: the plan read failed: a vending machine with an item stuck.
  vending: {
    load: () => import("./figures/vending.js"),
    fallback: "/images/hairline/vending.svg",
    crop: [109, 16, 181, 304],
  },
  // The app frame failed: a breaker panel with one breaker tripped.
  breaker: {
    load: () => import("./figures/breaker.js"),
    fallback: "/images/hairline/breaker.svg",
    plate: "#121314",
    crop: [41, 41, 329, 249],
  },
  // 404, on the page colour: a signpost whose boards point nowhere.
  signpost: {
    load: () => import("./figures/signpost.js"),
    fallback: "/images/hairline/signpost.svg",
    plate: "#121314",
    crop: [66, 40, 272, 253],
  },
  // Whole-app failure: a blown cartridge fuse.
  fuse: {
    load: () => import("./figures/fuse.js"),
    fallback: "/images/hairline/fuse.svg",
    plate: "#121314",
    crop: [53, 41, 293, 250],
  },
  // Overview subscriptions failed: a card file whose divider jumped its notch.
  cardfile: {
    load: () => import("./figures/cardfile.js"),
    fallback: "/images/hairline/cardfile.svg",
    plate: "#0f1010",
    crop: [52, 49, 295, 232],
  },
  // Sessions failed to load: a split-flap status board with one flap stuck mid-flip.
  flapboard: {
    load: () => import("./figures/flapboard.js"),
    fallback: "/images/hairline/flapboard.svg",
    crop: [141, 71, 117, 190],
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
  /** Sizes and places the slot; may set --hairline-left/top/width/mask. */
  className?: string;
} & (
  | {
      kind: InteractiveKind;
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
      kind: HairlineKind;
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
  const entry: Entry | DrivableEntry = FIGURES[kind];
  const drive = "scrub" in entry ? entry : null;
  const interactive = ready && !decorative && drive !== null;

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
    if (!stage || !drive) return;
    setStep(n);
    const t = n / STEPS;
    const [[x0, y0], [x1, y1]] = drive.scrub;
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
      style={hostStyle(entry)}
      data-figure={kind}
      data-cropped={entry.crop ? "" : undefined}
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
          aria-orientation={interactive ? drive?.orientation : undefined}
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
