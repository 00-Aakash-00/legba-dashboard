import type { CSSProperties } from "react";
import { Mark } from "@/components/brand/logo";

/*
 * The showcase panel's art, measured in docs/design/spec/login.json
 * (showcase.glow.*, showcase.pixels.*, showcase.grid, showcase.mark). All of
 * it is CSS/SVG: no raster except the locked doll mark.
 *
 * Glows: seven additive Gaussian blooms over a #040202 base. Each layer adds
 * its colour (plus-lighter), so overlaps brighten like light instead of
 * stacking alpha. Boxes are ±2.5σ of the measured Gaussians, placed as
 * percentages of the panel's padding box (616.55 × 893 at 1440 × 927), so
 * the composition holds at every desktop size and on the mobile banner.
 *
 * The seven-glow fit misses the darker valley between the main bloom and
 * the right core (spec showcase.glow.main notes). A residual fit against the
 * mockup (red RMS 6.8 → 5.3 levels) adds one rotated shade (a black-alpha
 * Gaussian: multiplies the light under it by 1 − α) and two faint lifts.
 */

type Box = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  /** Degrees, about the box centre. */
  rotate?: number;
};

type Glow = Box & { rgb: [number, number, number] };
type Shade = Box & { alpha: number };

const GLOWS: Glow[] = [
  {
    id: "left-wash",
    left: -116.211,
    top: -23.236,
    width: 219.771,
    height: 124.86,
    rgb: [113, 13, 23],
  },
  {
    id: "right-wash",
    left: 22.869,
    top: -72.564,
    width: 175.168,
    height: 192.609,
    rgb: [60, 10, 14],
  },
  {
    id: "top",
    left: -18.166,
    top: -11.926,
    width: 82.718,
    height: 31.915,
    rgb: [64, 0, 6],
  },
  {
    id: "main",
    left: 1.541,
    top: -24.076,
    width: 60.822,
    height: 86.226,
    rgb: [147, 56, 61],
  },
  {
    id: "right-core",
    left: 54.821,
    top: 15.957,
    width: 43.792,
    height: 33.035,
    rgb: [59, 1, 10],
  },
  {
    id: "bottom-left",
    left: -46.387,
    top: 74.188,
    width: 113.535,
    height: 44.233,
    rgb: [67, 7, 13],
  },
  {
    id: "right-low",
    left: 79.231,
    top: 61.142,
    width: 62.444,
    height: 25.756,
    rgb: [57, 8, 13],
  },
];

// Residual corrections (fitted at 1440 × 927; see the header comment).
const SHADES: Shade[] = [
  {
    id: "valley",
    left: 20.627,
    top: 35.722,
    width: 84.065,
    height: 22.522,
    rotate: -142.2,
    alpha: 0.43,
  },
];

const LIFTS: Glow[] = [
  {
    id: "centre-lift",
    left: 13.876,
    top: 0.713,
    width: 81.698,
    height: 112.985,
    rotate: 1,
    rgb: [13.3, 5.3, 5.1],
  },
  {
    id: "left-lift",
    left: -3.835,
    top: 29.255,
    width: 39.895,
    height: 19.413,
    rotate: 114,
    rgb: [24.3, 0, 1.6],
  },
];

// exp(-½(2.5t)²) sampled every 10% of the radius, tapered to 0 at the edge
// so no ring shows where the box ends.
const PROFILE = [
  1, 0.9692, 0.8825, 0.7548, 0.6065, 0.4578, 0.3247, 0.2163, 0.1353, 0.07, 0,
];

function boxStyle({ left, top, width, height, rotate }: Box): CSSProperties {
  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`,
    rotate: rotate ? `${rotate}deg` : undefined,
  };
}

function glowStyle(glow: Glow): CSSProperties {
  const stops = PROFILE.map((k, i) => {
    const [r, g, b] = glow.rgb.map((c) => Math.round(c * k * 10) / 10);
    return `rgb(${r} ${g} ${b}) ${i * 10}%`;
  });
  // Opaque black edges add nothing under plus-lighter.
  return {
    ...boxStyle(glow),
    backgroundImage: `radial-gradient(closest-side, ${stops.join(", ")})`,
  };
}

function shadeStyle(shade: Shade): CSSProperties {
  const stops = PROFILE.map(
    (k, i) =>
      `rgb(0 0 0 / ${Math.round(shade.alpha * k * 1000) / 1000}) ${i * 10}%`,
  );
  return {
    ...boxStyle(shade),
    backgroundImage: `radial-gradient(closest-side, ${stops.join(", ")})`,
  };
}

type Tile = [x: number, y: number, w: number, h: number, fill: string];

// Measured tile edges (page px at 1440) relative to each cluster's origin,
// with shared edges snapped together so translucent tiles never overlap.
const TOP_CLUSTER: Tile[] = [
  [81.3, 0, 34.35, 34.75, "rgb(255 90 110 / 0.10)"],
  [115.65, 0, 49.85, 67.55, "rgb(255 185 195 / 0.15)"],
  [165.5, 34.75, 33.5, 32.8, "rgb(255 235 240 / 0.11)"],
  [84.9, 67.55, 80.6, 35, "rgb(255 190 200 / 0.15)"],
  [165.5, 0, 33.5, 34.75, "rgb(255 80 100 / 0.52)"],
  [199, 0, 33.3, 34.75, "rgb(255 255 255 / 0.02)"],
  [199, 34.75, 33.3, 32.8, "rgb(255 80 100 / 0.49)"],
  [50.6, 67.55, 34.3, 35, "rgb(255 80 100 / 0.55)"],
  [165.5, 67.55, 33.5, 35, "rgb(255 255 255 / 0.04)"],
  [16.4, 102.55, 34.2, 34.95, "rgb(255 190 200 / 0.15)"],
  [16.4, 34.75, 33.5, 17.25, "rgb(255 255 255 / 0.03)"],
  [0, 85.7, 16.4, 16.85, "rgb(255 255 255 / 0.025)"],
];

const LEFT_CLUSTER: Tile[] = [
  [34.6, 0, 33.9, 16.4, "rgb(255 255 255 / 0.06)"],
  [0, 16.4, 34.6, 34.3, "rgb(252 48 79 / 0.60)"],
  [68.5, 47, 33.4, 34.6, "rgb(255 150 160 / 0.15)"],
  [101.9, 47, 33.3, 34.6, "rgb(255 80 100 / 0.54)"],
  [68.5, 81.6, 33.4, 32.15, "rgb(255 80 100 / 0.50)"],
  [34.6, 113.75, 33.9, 35.15, "rgb(255 255 255 / 0.155)"],
  [101.9, 113.75, 33.3, 35.15, "rgb(255 255 255 / 0.06)"],
  [136.2, 148.9, 15.2, 15.8, "rgb(255 255 255 / 0.05)"],
];

function Cluster({
  tiles,
  width,
  height,
  className,
}: {
  tiles: Tile[];
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      shapeRendering="crispEdges"
      className={className}
    >
      {tiles.map(([x, y, w, h, fill]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} fill={fill} />
      ))}
    </svg>
  );
}

/** Glows + pixel clusters. Fills the panel's padding box; purely decorative. */
export function ShowcaseDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 isolate">
      {/* The base sits inside the isolated group so the glows add onto it. */}
      <div className="absolute inset-0 bg-[#040202]" />
      {GLOWS.map((glow) => (
        <div
          key={glow.id}
          className="absolute mix-blend-plus-lighter"
          style={glowStyle(glow)}
        />
      ))}
      {SHADES.map((shade) => (
        <div key={shade.id} className="absolute" style={shadeStyle(shade)} />
      ))}
      {LIFTS.map((glow) => (
        <div
          key={glow.id}
          className="absolute mix-blend-plus-lighter"
          style={glowStyle(glow)}
        />
      ))}
      {/* Top cluster: anchored top-right (41.65px in at 1440). The lone tile
          and the left cluster sit at their measured offsets at 1440 × 927 and
          rise with shorter panels, staying clear of the bottom-anchored mark. */}
      <Cluster
        tiles={TOP_CLUSTER}
        width={232.3}
        height={137.5}
        className="absolute top-[51.9px] right-[41.65px] max-lg:top-2.5 max-lg:right-3 max-lg:h-[68.75px] max-lg:w-[116.15px]"
      />
      <Cluster
        tiles={[[0, 0, 34.1, 34.8, "rgb(255 255 255 / 0.055)"]]}
        width={34.1}
        height={34.8}
        className="absolute top-[min(300.7px,calc(100%-592.3px))] left-[calc(50%-9.175px)] max-lg:hidden"
      />
      <Cluster
        tiles={LEFT_CLUSTER}
        width={151.4}
        height={164.7}
        className="absolute top-[min(335px,calc(100%-558px))] left-[24.9px] max-lg:hidden"
      />
    </div>
  );
}

/**
 * The doll mark, exactly as provided, with the faint red grid behind it
 * (desktop). The grid's lines sit at the measured pitch (32.8 × 31.7) and
 * fade out radially.
 */
export function ShowcaseMark() {
  return (
    <div className="relative size-11 shrink-0 lg:size-[95px]">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-31.1px] left-[-111.45px] hidden h-[150px] w-[330px] lg:block"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgb(255 70 90 / 0.05) 1px, transparent 1px), linear-gradient(180deg, rgb(255 70 90 / 0.05) 1px, transparent 1px)",
          backgroundSize: "32.8px 100%, 100% 31.7px",
          backgroundPosition: "16.1px 0, 0 35px",
          maskImage:
            "radial-gradient(ellipse 175px 85px at 170px 90px, #000 35%, transparent 100%)",
        }}
      />
      <Mark size={95} priority className="relative size-full" />
    </div>
  );
}
