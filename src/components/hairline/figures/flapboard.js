import { HL } from "../kernel.js";

/**
 * Flapboard: a split-flap departures board standing on two legs, three rows of blank flaps, a long one and a
 * short one in each row, every flap showing only its centre split. Every flap has settled but one: the short
 * flap of row 2 froze mid-flip, its top leaf hanging out of the board's face, and that leaf's edge is the one
 * bright stroke. Over the board, the pointer nudges the leaf on toward settling, the nearer the further, on a
 * spring, and it never lands; the other flaps barely stir. The read-out names the row and its state. The
 * slider is the most the stuck leaf can be nudged, in degrees.
 *
 * The pattern: springs, a falloff by distance measured on the board's face (a plane that never moves), and a
 * hit area made from the rest pose. The board is a slab rounded in its own plane, built from two rings; the stuck
 * leaf is a thin plate built the same way along its own normal.
 */
const {
  Cam, circ, clamp, facing, fillet, fit, hull, mk, open, pointer, poly, prism, proj, put, rad, register,
  rrect, run, solid, spring, stepS, disposer,
} = HL;

const MX = 6, MZ = 6, TH = 15, L = TH / 2, RG = 8;           // the margins, a flap module's height, a leaf (half of it), the gap between rows
const TL = 46, TS = 26, CG = 4;                                // each row: a long module (the place), a short one (the platform), the gap between
const COLS = [[MX, TL], [MX + TL + CG, TS]];                   // [x0, width] of each
const W = 2 * MX + TS + CG + TL, H = 2 * MZ + 3 * TH + 2 * RG; // the board's face: x across, z up
const D = 10, Z0 = 30, RB = 6, BB = 2;                         // its depth (y, toward the eye), how high it stands, its corner radius, its crease's inset
const RT = 3.2, RH = 0.6, TK = 1.8;                            // a leaf's outer and hinge corner radii, and its thickness
const LX = 15, LR = 3.3, PR = 5.5, PT = 2.5;                    // the legs: inset from each end, a post's radius, its round foot's radius and height
const STUCK = 3, REST = 120, STIR = 10, MAXN = 48, REACH = 70; // the stuck module (row 2, short) and its leaf's angle; the others' most stir; the most nudge; the reach

const fall = (u) => (u >= 1 ? 0.1 : 0.1 + 0.9 * (1 - u) ** 2); // 1 at the module, down to a floor of .1 at the reach

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = clamp(value, 0, MAXN), over = null;
  read.textContent = "rest";

  // the modules, top row first: [x0, x1] across, zb to zt up, split at zs
  const mods = [];
  for (let r = 0; r < 3; r++) for (const [x0, w] of COLS) {
    const zt = Z0 + H - MZ - r * (TH + RG);
    mods.push({ r, x0, x1: x0 + w, w, zt, zb: zt - TH, zs: zt - L });
  }
  const leaf = (w) => fillet([[0, 0], [w, 0], [w, L], [0, L]], [RH, RH, RT, RT]);
  const lower = (m) => fillet([[m.x0, m.zs], [m.x0, m.zb], [m.x1, m.zb], [m.x1, m.zs]], [RH, RT, RT, RH]);

  // Fitted to the board's corners, the feet and the stuck leaf's free edge at both ends of its travel, rest first.
  const C = Cam(45, 0.5, 1.5), body = [], feet = [], tips = [], sm = mods[STUCK];
  for (const x of [0, W]) for (const y of [0, D]) for (const z of [Z0, Z0 + H]) body.push([x, y, z]);
  for (const x of [LX - PR, LX + PR, W - LX - PR, W - LX + PR]) for (const y of [D / 2 - PR, D / 2 + PR]) feet.push([x, y, 0]);
  for (const th of [REST, REST + MAXN]) for (const x of [sm.x0, sm.x1]) tips.push([x, D + L * Math.sin(rad(th)), sm.zs + L * Math.cos(rad(th))]);
  fit(C, [...body, ...feet, ...tips], 200, 166);
  const P = proj(C), front = facing(C), g = mk("g", {}, svg);
  // the way the eye looks from, as a world vector: a face whose normal has a positive dot with it is seen
  const o = P(0, 0, 0), [ax, ay, az] = [P(1, 0, 0), P(0, 1, 0), P(0, 0, 1)].map((p) => [p[0] - o[0], p[1] - o[1]]);
  const E = [ay[0] * az[1] - az[0] * ay[1], az[0] * ax[1] - ax[0] * az[1], ax[0] * ay[1] - ay[0] * ax[1]].map((k, _, v) => (v[2] < 0 ? -k : k));

  // Back to front: the feet and the posts, then the board over their tops.
  const under = (ring, x) => ring.map((q) => ({ ...q, u: q.u + x, v: q.v + D / 2 }));
  for (const x of [LX, W - LX]) {
    put(solid(g), prism(P, front, under(circ(PR, 16), x), under(circ(PR - 1, 16), x), 0, PT));
    put(solid(g), prism(P, front, under(circ(LR, 12), x), under(circ(LR - 0.8, 12), x), PT, Z0));
  }
  // The board: a slab rounded in its face plane (u across, v up), from its back (y 0) to its face (y D).
  const onPlane = (ring, y) => ring.map((q) => P(q.u, y, q.v));
  const face = rrect(0, Z0, W, Z0 + H, RB, 6), inner = rrect(BB, Z0 + BB, W - BB, Z0 + H - BB, RB - BB, 6);
  put(solid(g), {
    sil: poly(hull(onPlane(face, 0).concat(onPlane(face, D)))),
    crease: open(onPlane(run(inner, (q) => q.nu * E[0] + q.nv * E[2] > 0), D)),
  });

  /** Module m's top leaf turned th degrees out of the face about its split: 0 up, 90 straight out, 180 down. */
  const turn = (m, th) => {
    const s = Math.sin(rad(th)), c = Math.cos(rad(th));
    return poly(leaf(m.w).map(([u, v]) => P(m.x0 + u, D + v * s, m.zs + v * c)));
  };
  // Each module: its lower leaf, drawn open along the split, and its top leaf, which can turn; the stuck one shows
  // the next leaf in place behind the one that froze.
  for (const m of mods) {
    mk("path", { d: open(lower(m).map(([u, v]) => P(u, D, v))), class: "nf" }, g);
    m.top = mk("path", { d: turn(m, 0) }, g);
    m.sp = spring(0, { eps: 0.05 });
    m.drawn = 0;
  }
  // The stuck leaf, a thin plate built as a prism along its own normal: the hull of its two faces is its
  // silhouette, the one bright stroke, and the crease runs just inside the face the eye sees, where a side shows.
  const plate = rrect(0, 0, sm.w, L, RT, 4), inset = rrect(0.7, 0.7, sm.w - 0.7, L - 0.7, RT - 0.7, 4), stuck = solid(g);
  stuck.sil.classList.add("hi");
  sm.sp = spring(REST, { eps: 0.05 });
  sm.drawn = NaN;
  const draw = (m) => {
    if (m.sp.x === m.drawn) return;
    m.drawn = m.sp.x;
    if (m !== sm) return m.top.setAttribute("d", turn(m, m.sp.x));
    const th = rad(clamp(m.sp.x, REST, REST + MAXN)), s = Math.sin(th), c = Math.cos(th);
    const at = (t) => (q) => P(sm.x0 + q.u, D + q.v * s - t * c, sm.zs + q.v * c + t * s);
    const seen = (q) => q.nu * E[0] + q.nv * (s * E[1] + c * E[2]) > 0;
    put(stuck, { sil: poly(hull(plate.map(at(0)).concat(plate.map(at(TK))))), crease: open(run(inset, seen).map(at(TK))) });
  };
  draw(sm);

  const B = register(stage, (dt) => {
    let moving = false;
    for (const m of mods) { if (stepS(m.sp, dt)) moving = true; draw(m); }
    return moving;
  });
  bag.add(B.unregister);

  // The pointer is read on the face's plane, which never moves, and only over the board at rest: the hull of
  // its corners, its feet and the stuck leaf, a little enlarged.
  const fo = P(0, D, 0), fx = P(1, D, 0), fz = P(0, D, 1);
  const ex = [fx[0] - fo[0], fx[1] - fo[1]], ez = [fz[0] - fo[0], fz[1] - fo[1]], det = ex[0] * ez[1] - ex[1] * ez[0];
  const onFace = ([x, y]) => [((x - fo[0]) * ez[1] - (y - fo[1]) * ez[0]) / det, (ex[0] * (y - fo[1]) - ex[1] * (x - fo[0])) / det];
  const area = hull([...body, ...feet, ...tips.slice(0, 2)].map((p) => P(...p)));
  const mx = area.reduce((s, p) => s + p[0], 0) / area.length, my = area.reduce((s, p) => s + p[1], 0) / area.length;
  const big = area.map((p) => [mx + (p[0] - mx) * 1.06, my + (p[1] - my) * 1.06]);
  const inside = ([x, y]) => {
    const s = big.map((p, k) => { const q = big[(k + 1) % big.length]; return Math.sign((q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0])); });
    return !s.includes(1) || !s.includes(-1);
  };
  /** How far a face point is from module m, in world units: 0 on it. */
  const far = (m, [x, z]) => Math.hypot(Math.max(m.x0 - x, 0, x - m.x1), Math.max(m.zb - z, 0, z - m.zt));

  /** The stuck leaf is nudged on toward settling, the nearer the pointer the further, and never lands; the rest barely stir. */
  function retarget() {
    for (const m of mods) {
      const f = over ? fall(far(m, over) / REACH) : 0;
      m.sp.t = m === sm ? REST + lift * f : STIR * f;
    }
    read.textContent = over ? `row ${sm.r + 1} · stuck` : "rest";
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (q) => { over = inside(q) ? onFace(q) : null; retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = clamp(v, 0, MAXN); retarget(); },
    destroy: bag.dispose,
  };
}

export default {
  name: "flapboard",
  means: "A departures board with every flap settled but one, stuck mid-flip: the pointer nudges it on, the nearer the more, and it never lands.",
  rules: [1, 3, 4, 5],
  range: [32, 40, 48],
  mount,
};
