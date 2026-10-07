import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { buttonVariants } from "@/components/ui/button";
import { overview } from "@/content/copy";
import { cn } from "@/lib/utils";
import styles from "./instances-card.module.css";

const TITLE_ID = "instances-card-title";

/**
 * Overview "View your instances" card (docs/design/spec/overview.json,
 * instances.*). Static: it prerenders into the shell.
 */
export function InstancesCard() {
  const { instances } = overview;
  return (
    <section
      aria-labelledby={TITLE_ID}
      className={cn(
        styles.surface,
        "@container/instances relative isolate flex min-h-[340px] overflow-hidden rounded-[21px] @md/instances:min-h-[300px]",
      )}
    >
      <RackArt className="absolute right-0 bottom-0 h-[250px] w-[310px] origin-bottom-right scale-70 @md/instances:scale-100" />
      <div className="relative flex w-full flex-col items-start pt-7 pr-6 pb-5 pl-6 @md/instances:pt-[47.4px] @md/instances:pr-6 @md/instances:pb-[23px] @md/instances:pl-[35px]">
        {/* The 1px top pad lets the trimmed box enclose the i-dots, which
            rise above cap height; the text itself doesn't move. */}
        <h2
          id={TITLE_ID}
          className={cn(
            styles.trimDescent,
            "font-semibold text-[#fdfcfc] text-[24px] leading-[28px] tracking-[-0.03em] @md/instances:-mt-px @md/instances:pt-px @md/instances:text-[27px] @md/instances:leading-[34px]",
          )}
        >
          {instances.title}
        </h2>
        <p
          className={cn(
            styles.trimDescent,
            "mt-3.5 max-w-[19rem] text-pretty font-medium text-[#c2bbba] text-[15px] leading-[22px] tracking-[-0.03em] @md/instances:mt-[16.52px] @md/instances:max-w-none @md/instances:text-[16px] @md/instances:leading-[23px] @md/instances:tracking-[-0.043em]",
          )}
        >
          {instances.body.map((line, index) => (
            <Fragment key={line}>
              {index > 0 ? (
                <>
                  {" "}
                  <br className="hidden @md/instances:inline" />
                </>
              ) : null}
              {line}
            </Fragment>
          ))}
        </p>
        <Link
          href="/deployments"
          className={cn(
            buttonVariants({ variant: "pill-red", size: "pill-lg" }),
            styles.launch,
            "mt-auto -ml-[7.8px] h-11 w-[136.5px] justify-start gap-[9px] border-0 pr-0 pl-[29.5px] text-[14px] shadow-[0_0_5px_-1px_rgb(200_28_48/0.4)] motion-reduce:active:not-aria-[haspopup]:scale-100 motion-reduce:active:opacity-85",
          )}
        >
          <span className="text-ink leading-[10px] tracking-[-0.064em]">
            {instances.cta}
          </span>
          <ArrowUpRightIcon strokeWidth={1.7} className="size-[26px]" />
        </Link>
      </div>
    </section>
  );
}

// Translucent tiles (top-left alpha, bottom-right alpha) in art coordinates.
const TILES = [
  { x: 207.5, y: 10, w: 29.25, h: 29.25, red: true, a: [0.21, 0.21] },
  { x: 236.75, y: 39.4, w: 29.4, h: 30.4, red: true, a: [0.17, 0.17] },
  { x: 178, y: 54.5, w: 16.5, h: 16, red: false, a: [0.021, 0.021] },
  { x: 44.7, y: 84.9, w: 28.5, h: 30.2, red: true, a: [0.18, 0.13] },
  { x: 73.2, y: 115, w: 29.3, h: 30.5, red: true, a: [0.29, 0.26] },
  { x: 17.2, y: 116.1, w: 16.2, h: 17.7, red: false, a: [0.018, 0.018] },
  { x: 53, y: 156.3, w: 20.1, h: 18.7, red: false, a: [0.027, 0.027] },
  { x: 5.1, y: 134.8, w: 11.2, h: 12, red: false, a: [0.019, 0.019] },
  { x: 165.4, y: 24, w: 12.1, h: 14.7, red: false, a: [0.014, 0.014] },
] as const;

// Rack units, top to bottom: slot box, LED centre, status line rows, fade,
// LED wash strength.
const UNITS = [
  {
    y: 90.5,
    h: 33.5,
    led: [139.42, 107.9],
    red: 107.3,
    grey: 110.9,
    o: 1,
    halo: 1,
  },
  {
    y: 139.5,
    h: 34.5,
    led: [139.3, 156.45],
    red: 155.5,
    grey: 160,
    o: 0.92,
    halo: 1,
  },
  {
    y: 189,
    h: 35,
    led: [139.5, 206.3],
    red: 205.2,
    grey: 209.7,
    o: 0.5,
    halo: 0.4,
  },
] as const;

const CHASSIS =
  "M112.7 260 V86.5 A8 8 0 0 1 120.7 78.5 H223 A8 8 0 0 1 231 86.5 V260";

/**
 * Server rack, pixel tiles and dash (instances.rack.*, instances.pixel.*,
 * instances.dash), drawn in CSS px from the mockup with the art's bottom-right
 * corner pinned to the card's. The card's radius clips the chassis and side
 * panel, as drawn. The rack's edges are softened slightly, like the mockup's
 * render; the tiles keep hard edges.
 */
function RackArt({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 310 250"
      fill="none"
      className={cn("pointer-events-none", className)}
    >
      <defs>
        {TILES.map((tile, index) => (
          <linearGradient
            // biome-ignore lint/suspicious/noArrayIndexKey: static art, never reordered
            key={index}
            id={`instances-tile-${index}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              stopColor={tile.red ? "#e61e3c" : "#fff"}
              stopOpacity={tile.a[0]}
            />
            <stop
              offset="1"
              stopColor={tile.red ? "#e61e3c" : "#fff"}
              stopOpacity={tile.a[1]}
            />
          </linearGradient>
        ))}
        {/* Lit from above: the outline fades down the sides. */}
        <linearGradient
          id="instances-chassis-line"
          x1="0"
          y1="78"
          x2="0"
          y2="250"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#443434" />
          <stop offset="0.08" stopColor="#3a2627" />
          <stop offset="0.35" stopColor="#2f1b1c" />
          <stop offset="1" stopColor="#2b1618" />
        </linearGradient>
        <linearGradient
          id="instances-chassis-face"
          x1="0"
          y1="78.5"
          x2="0"
          y2="84.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" stopOpacity="0.07" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.035" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="instances-side-line"
          x1="231"
          y1="0"
          x2="310"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4d2a2c" />
          <stop offset="1" stopColor="#45141a" />
        </linearGradient>
        <linearGradient
          id="instances-side-fill"
          x1="0"
          y1="80"
          x2="0"
          y2="130"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0a0405" stopOpacity="0.12" />
          <stop offset="1" stopColor="#0a0405" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="instances-slot-line" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#3b2b2a" />
          <stop offset="1" stopColor="#2b1b1c" />
        </linearGradient>
        {/* Lines have no height, so their gradients use user space. */}
        <linearGradient
          id="instances-status-red"
          x1="165.7"
          y1="0"
          x2="213.2"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#d01a30" stopOpacity="0.7" />
          <stop offset="1" stopColor="#d01a30" stopOpacity="0.24" />
        </linearGradient>
        <linearGradient
          id="instances-status-grey"
          x1="165.7"
          y1="0"
          x2="213.2"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#d43530" stopOpacity="0.2" />
          <stop offset="1" stopColor="#b16258" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          id="instances-accent"
          x1="0"
          y1="104.5"
          x2="0"
          y2="191.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#c41c30" stopOpacity="0" />
          <stop offset="0.034" stopColor="#c41c30" stopOpacity="0.46" />
          <stop offset="0.172" stopColor="#c41c30" stopOpacity="0.64" />
          <stop offset="0.276" stopColor="#c41c30" stopOpacity="0.52" />
          <stop offset="0.448" stopColor="#c41c30" stopOpacity="0.38" />
          <stop offset="0.621" stopColor="#c41c30" stopOpacity="0.22" />
          <stop offset="0.81" stopColor="#c41c30" stopOpacity="0.09" />
          <stop offset="1" stopColor="#c41c30" stopOpacity="0" />
        </linearGradient>
        <filter
          id="instances-soften"
          x="-0.1"
          y="-0.1"
          width="1.2"
          height="1.2"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="0.45" />
        </filter>
        {/* The LED's light washes along its slot: a broad, soft falloff. */}
        <radialGradient id="instances-led-halo">
          <stop stopColor="#cd0816" stopOpacity="0.34" />
          <stop offset="0.25" stopColor="#cd0816" stopOpacity="0.28" />
          <stop offset="0.375" stopColor="#cd0816" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="#cd0816" stopOpacity="0.14" />
          <stop offset="0.625" stopColor="#cd0816" stopOpacity="0.085" />
          <stop offset="0.75" stopColor="#cd0816" stopOpacity="0.045" />
          <stop offset="1" stopColor="#cd0816" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="191.4" y="1.9" width="15.7" height="2" rx="1" fill="#c41d35" />
      {TILES.map((tile, index) => (
        <rect
          // biome-ignore lint/suspicious/noArrayIndexKey: static art, never reordered
          key={index}
          x={tile.x}
          y={tile.y}
          width={tile.w}
          height={tile.h}
          fill={`url(#instances-tile-${index})`}
        />
      ))}

      {/* Side panel: perspective top edge running off the card. */}
      <path
        d="M231 78.9 L310 94.2 V250 H231 Z"
        fill="url(#instances-side-fill)"
      />
      <path d="M231 78.9 L310 94.2" stroke="url(#instances-side-line)" />
      <rect
        x="265.5"
        y="104.5"
        width="1.5"
        height="87"
        fill="url(#instances-accent)"
        filter="url(#instances-soften)"
      />

      <g filter="url(#instances-soften)">
        {/* Chassis front face; it runs past the card's bottom edge. */}
        <path d={CHASSIS} fill="url(#instances-chassis-face)" />
        <path d={CHASSIS} stroke="url(#instances-chassis-line)" />
        {UNITS.map((unit) => (
          <g key={unit.y} opacity={unit.o}>
            {/* Glass slot: lifts and desaturates what is behind it. */}
            <rect
              x="122"
              y={unit.y}
              width="102"
              height={unit.h}
              rx="6"
              fill="#245c5c"
              fillOpacity="0.1"
              stroke="url(#instances-slot-line)"
            />
            <path
              d={`M165.7 ${unit.red} H213.2`}
              stroke="url(#instances-status-red)"
              strokeWidth="1.5"
            />
            <path
              d={`M165.7 ${unit.grey} H213.2`}
              stroke="url(#instances-status-grey)"
              strokeWidth="1.5"
            />
          </g>
        ))}
      </g>

      {UNITS.map((unit) => {
        const [cx, cy] = unit.led;
        return (
          <g key={unit.y} opacity={unit.o}>
            <ellipse
              cx={cx}
              cy={cy}
              rx="34"
              ry="22"
              fill="url(#instances-led-halo)"
              opacity={unit.halo}
            />
            <g filter="url(#instances-soften)">
              <rect
                x={cx - 7.3}
                y={cy - 7.3}
                width="14.6"
                height="14.6"
                rx="3.5"
                fill="#c41d30"
                fillOpacity="0.12"
                stroke="#b5202f"
                strokeWidth="1.3"
              />
              <circle
                cx={cx + 0.3}
                cy={cy}
                r="1.55"
                stroke="#d42a3b"
                strokeWidth="1.2"
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
}
