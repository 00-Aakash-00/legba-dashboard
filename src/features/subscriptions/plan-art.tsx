import type { CSSProperties } from "react";
import {
  HairlineFigure,
  type HairlineKind,
} from "@/components/hairline/hairline-figure";
import { plans } from "@/content/copy";
import { cn } from "@/lib/utils";
import styles from "./plan-art.module.css";

/** A box in percentages of the 215 x 305 slot: left, top, width, height. */
type Box = readonly [number, number, number, number?];

type Light =
  | { kind: "streak"; box: Box; from: string }
  | { kind: "glow"; box: Box; alpha: number }
  | { kind: "ring"; box: Box; opacity?: number };

/** Where the dust falls (slot units): an ellipse, and the spots that catch red light. */
type DustField = {
  seed: number;
  count: number;
  centre: readonly [number, number];
  radii: readonly [number, number];
  /** Circles [x, y, r] where dust is mostly red. */
  hot: readonly (readonly [number, number, number])[];
  /** Below this y the dust is bone only (nothing red under the shield's rings). */
  redAbove?: number;
};

type Atmosphere = { dust: DustField; back: Light[]; front: Light[] };

/**
 * Each plan's atmosphere: dust, glows and rings behind the figure (its plates
 * are opaque, so these show only around it), the mockup's light streaks in
 * front (spec subs.card.<plan>.illustration.streak.*).
 */
const ATMOSPHERE: Record<HairlineKind, Atmosphere> = {
  ghost: {
    dust: {
      seed: 11,
      count: 210,
      centre: [108, 158],
      radii: [116, 152],
      hot: [
        [168, 52, 52],
        [22, 172, 46],
      ],
    },
    back: [
      { kind: "glow", box: [51.2, 3.3, 51.2, 29.5], alpha: 0.36 },
      { kind: "glow", box: [-12.6, 41.3, 48.4, 28.9], alpha: 0.5 },
    ],
    front: [
      { kind: "streak", box: [63.95, 15.74, 13.95], from: "#b82d3f" },
      { kind: "streak", box: [66.28, 19.67, 31.16], from: "#c41e37" },
      { kind: "streak", box: [0.23, 51.31, 40.47], from: "#f72843" },
      { kind: "streak", box: [30, 75.74, 46.51], from: "#e5253e" },
    ],
  },
  shield: {
    dust: {
      seed: 7,
      count: 210,
      centre: [104, 150],
      radii: [112, 150],
      hot: [
        [168, 60, 46],
        [178, 150, 40],
        [150, 222, 40],
      ],
      redAbove: 248,
    },
    back: [
      { kind: "glow", box: [60.5, 3.44, 30, 75.41], alpha: 0.32 },
      { kind: "glow", box: [71.16, 13.87, 16.74, 11.8], alpha: 0.62 },
      { kind: "ring", box: [2.23, 63.84, 89.02, 17.18], opacity: 0.3 },
      { kind: "ring", box: [7.44, 64.82, 78.6, 15.21] },
      { kind: "streak", box: [6.51, 47.54, 22.56], from: "#e91d3a" },
    ],
    front: [{ kind: "streak", box: [70.47, 20.16, 7.44], from: "#c8142e" }],
  },
};

/** A small seeded PRNG (mulberry32): the dust is the same on every render. */
function random(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Mote = { x: number; y: number; r: number; red: boolean; alpha: number };

/** Scatters motes in the field's ellipse, thinning toward its edge. */
function scatter(field: DustField): Mote[] {
  const next = random(field.seed);
  const [cx, cy] = field.centre;
  const [rx, ry] = field.radii;
  const motes: Mote[] = [];
  for (let tries = 0; motes.length < field.count && tries < 5000; tries++) {
    const x = cx + (next() * 2 - 1) * rx;
    const y = cy + (next() * 2 - 1) * ry;
    const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
    // Thinner toward the edge, and none over the copy beside the slot.
    if (d > 1 || x > 208 || next() > 1.15 - d * 0.75) continue;
    const hot = field.hot.some(
      ([hx, hy, hr]) => Math.hypot(x - hx, y - hy) < hr,
    );
    const red =
      (field.redAbove === undefined || y < field.redAbove) &&
      next() < (hot ? 0.82 : 0.1);
    motes.push({
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      r: Math.round((0.35 + next() * 0.5) * 100) / 100,
      red,
      alpha:
        Math.round((red ? 0.4 + next() * 0.45 : 0.14 + next() * 0.36) * 100) /
        100,
    });
  }
  return motes;
}

const DUST: Record<HairlineKind, Mote[]> = {
  ghost: scatter(ATMOSPHERE.ghost.dust),
  shield: scatter(ATMOSPHERE.shield.dust),
};

const pct = (n: number) => `${n}%`;

function Lights({ lights }: { lights: Light[] }) {
  return lights.map((light) => {
    const [left, top, width, height] = light.box;
    const style: CSSProperties & Record<`--${string}`, string | number> = {
      left: pct(left),
      top: pct(top),
      width: pct(width),
      ...(height === undefined ? {} : { height: pct(height) }),
      ...(light.kind === "streak" ? { "--from": light.from } : {}),
      ...(light.kind === "glow" ? { "--a": light.alpha } : {}),
      ...(light.kind === "ring" && light.opacity !== undefined
        ? { opacity: light.opacity }
        : {}),
    };
    return (
      <i
        key={`${light.kind}-${left}-${top}`}
        className={styles[light.kind]}
        style={style}
      />
    );
  });
}

/** The card's illustration slot: the plan's hairline figure in its host atmosphere. */
export function PlanArt({
  plan,
  className,
}: {
  plan: HairlineKind;
  className?: string;
}) {
  const { back, front } = ATMOSPHERE[plan];
  return (
    <div className={cn(styles.art, styles[plan], className)}>
      <div className={styles.back} aria-hidden="true">
        <svg
          aria-hidden="true"
          className={styles.dust}
          viewBox="0 0 215 305"
          preserveAspectRatio="none"
        >
          {DUST[plan].map((mote) => (
            <circle
              key={`${mote.x}-${mote.y}`}
              cx={mote.x}
              cy={mote.y}
              r={mote.r}
              fill={mote.red ? "rgb(245 39 77)" : "rgb(245 243 236)"}
              fillOpacity={mote.alpha}
            />
          ))}
        </svg>
        <Lights lights={back} />
      </div>
      <HairlineFigure
        kind={plan}
        label={plans[plan].art}
        className={styles.figure}
      />
      <div className={styles.front} aria-hidden="true">
        <Lights lights={front} />
      </div>
    </div>
  );
}
