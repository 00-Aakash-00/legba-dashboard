import type { CSSProperties } from "react";
import {
  HairlineFigure,
  type InteractiveKind,
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
  /**
   * More dust in a shell just outside the figure's rest silhouette (an ellipse
   * round its upper half), thinning outward: the edge catches the light.
   */
  halo?: {
    centre: readonly [number, number];
    radii: readonly [number, number];
    count: number;
    /** How far out the shell reaches, in slot px. */
    spread: number;
  };
};

type Atmosphere = { dust: DustField; back: Light[]; front: Light[] };

/** A glow centred at (x, y) with radii (rx, ry), in slot px. */
function glow(x: number, y: number, rx: number, ry: number, alpha: number) {
  const box: Box = [
    ((x - rx) / 215) * 100,
    ((y - ry) / 305) * 100,
    ((2 * rx) / 215) * 100,
    ((2 * ry) / 305) * 100,
  ];
  return { kind: "glow", box, alpha } as const;
}

/**
 * Each plan's atmosphere: dust, glows and rings behind the figure (its plates
 * are opaque, so these show only around it), the mockup's light streaks in
 * front (spec subs.card.<plan>.illustration.streak.*). The rim glows sit just
 * outside the lit edge of the figure's rest pose (slot px, measured from the
 * figures' rest silhouettes), so the red reads as light on that edge.
 */
const ATMOSPHERE: Record<InteractiveKind, Atmosphere> = {
  ghost: {
    dust: {
      seed: 11,
      count: 230,
      centre: [108, 158],
      radii: [116, 152],
      hot: [
        [150, 46, 40],
        [22, 172, 46],
      ],
      halo: { centre: [109, 128], radii: [58, 101], count: 260, spread: 11 },
    },
    back: [
      // The hood's lit right rim, from just off the crown down past the brow.
      glow(128, 29, 14, 10, 0.55),
      glow(141, 43, 16, 12, 0.66),
      glow(154, 59, 16, 14, 0.62),
      glow(163, 80, 12, 16, 0.42),
      glow(168, 107, 9, 18, 0.2),
      // The left streak's spill on the cloak.
      glow(22, 158, 34, 18, 0.34),
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
      count: 260,
      centre: [104, 150],
      radii: [112, 150],
      hot: [
        [168, 60, 46],
        [180, 140, 44],
        [150, 222, 40],
      ],
      redAbove: 248,
    },
    back: [
      // The back plate's lit outer rim: the flare on its shoulder, the top edge,
      // then down its upright side and round the turn into the point.
      glow(169, 58, 18, 18, 0.9),
      glow(140, 40, 22, 9, 0.32),
      glow(176, 86, 12, 24, 0.62),
      glow(176, 122, 12, 24, 0.55),
      glow(171, 157, 12, 20, 0.48),
      glow(159, 185, 14, 14, 0.4),
      glow(141, 205, 15, 11, 0.3),
      // Light laid on the figure's own two rings: the orbit, then the ground ring.
      { kind: "ring", box: [1.81, 58.79, 89.86, 23.38], opacity: 0.4 },
      { kind: "ring", box: [8.33, 66.79, 76.84, 12.72] },
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

/** Scatters motes in the field's ellipse, thinning toward its edge, then its halo. */
function scatter(field: DustField): Mote[] {
  const next = random(field.seed);
  const [cx, cy] = field.centre;
  const [rx, ry] = field.radii;
  const motes: Mote[] = [];
  function add(x: number, y: number, near = false) {
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
        Math.round(
          (red
            ? 0.4 + next() * 0.45
            : (near ? 0.24 : 0.14) + next() * (near ? 0.44 : 0.36)) * 100,
        ) / 100,
    });
  }
  for (let tries = 0; motes.length < field.count && tries < 5000; tries++) {
    const x = cx + (next() * 2 - 1) * rx;
    const y = cy + (next() * 2 - 1) * ry;
    const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
    // Thinner toward the edge, and none over the copy beside the slot.
    if (d > 1 || x > 208 || next() > 1.15 - d * 0.75) continue;
    add(x, y);
  }
  const { halo } = field;
  for (let i = 0; halo && i < halo.count; i++) {
    // Round the upper half, from a little below one side to the other.
    const angle = Math.PI * (0.92 + next() * 1.16);
    const out = (-Math.log(1 - next() * 0.95) * halo.spread) / 3;
    const x = halo.centre[0] + Math.cos(angle) * (halo.radii[0] + out);
    const y = halo.centre[1] + Math.sin(angle) * (halo.radii[1] + out);
    if (x > 0 && x < 208 && y > 0) add(x, y, true);
  }
  return motes;
}

/**
 * The motes as a few paths, one per colour, opacity and size: each mote is a
 * zero-length segment drawn as a round cap, so hundreds of motes cost a few
 * dozen elements in the page instead of one each.
 */
function batch(motes: Mote[]) {
  const groups = new Map<
    string,
    { red: boolean; alpha: number; width: number; d: string }
  >();
  for (const mote of motes) {
    const alpha = Math.round(mote.alpha * 10) / 10;
    const width = Math.round(mote.r * 8) / 4;
    const key = `${mote.red ? "red" : "bone"}-${alpha}-${width}`;
    const group = groups.get(key) ?? { red: mote.red, alpha, width, d: "" };
    group.d += `M${mote.x} ${mote.y}h0`;
    groups.set(key, group);
  }
  return [...groups].map(([key, group]) => ({ key, ...group }));
}

const DUST = {
  ghost: batch(scatter(ATMOSPHERE.ghost.dust)),
  shield: batch(scatter(ATMOSPHERE.shield.dust)),
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
  plan: InteractiveKind;
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
          {DUST[plan].map((group) => (
            <path
              key={group.key}
              d={group.d}
              fill="none"
              stroke={group.red ? "rgb(245 39 77)" : "rgb(245 243 236)"}
              strokeOpacity={group.alpha}
              strokeWidth={group.width}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <Lights lights={back} />
      </div>
      <HairlineFigure
        kind={plan}
        label={plans[plan].art}
        liveLabel={plans[plan].artLive}
        className={styles.figure}
      />
      <div className={styles.front} aria-hidden="true">
        <Lights lights={front} />
      </div>
    </div>
  );
}
