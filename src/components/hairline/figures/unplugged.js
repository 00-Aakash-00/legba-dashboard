import { HL } from "../kernel.js";

/**
 * Unplugged: a piece of wall with an outlet in its face, and the plug hanging half out of it: its blades still in the
 * slots, its body sagging out at an angle under its own weight and a little crooked, its cord falling from the sleeve to
 * the floor and lying there in one shallow curve, its end turned back. The bare blade between the plug and the outlet is
 * the one bright mark. The nearer the pointer, the further a spring pushes the plug back toward seated and square: it
 * straightens a little, slips in, and goes on in, but it never seats: a sliver of blade stays bare and the plug stays
 * off-square. The slider is that sliver.
 *
 * The pattern: one continuous number on one spring, the bare length. The push falls off with the pointer's distance to
 * the plug's middle at rest, which never moves, and skips from E1 to E2, so no pointer holds the far blade as a sliver at
 * the plug's edge. Every part is the hull of two rounded rings, stood on the axis it needs.
 */
const {
  Cam, circ, clamp, facing, fit, hull, lerp, mk, open, pointer, poly, prism, proj, put, rad, register,
  ringAt, rings, rrect, run, solid, spring, stepS, disposer,
} = HL;

const sub = (p, q) => p.map((v, i) => v - q[i]), add = (p, d, k) => p.map((v, i) => v + d[i] * k);
const unit = (p) => { const l = Math.hypot(...p); return p.map((v) => v / l); };
const dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
const cross = (p, q) => [0, 1, 2].map((i) => p[(i + 1) % 3] * q[(i + 2) % 3] - p[(i + 2) % 3] * q[(i + 1) % 3]);

const S = 3.2;                                          // the camera's scale
const WX0 = -40, WX1 = 30, WT = 5, WH = 44;             // the wall: its face from x0 to x1, its thickness and height
const SX = 8, SZ = 21;                                  // the socket's centre on the face
const PW = 36, PH = 30, PT = 2, RW = 30, RH = 22, RT = 1.2; // the cover plate, and the receptacle raised on it
const PS = 6.2, BW = 4, BT = 1.2, ZB = 3, SH = 2.5;     // the blades: half their spacing, width, thickness, ZB below the
                                                        // body's middle; the slots' half height
const UW = 20, UH = 12, UL = 21, UR = 6, UB = 0.2, VR = 4.2, VL = 9; // the plug's body, round by UR, narrowing by UB; the sleeve
const RC = 1.6;                                         // the cord's radius
const E0 = 7, EN = 2;                                   // the blade left bare at rest; the least the slider may ask
const E1 = 6.2, E2 = 3.5;                               // pushed halfway, it slips in from E1 to E2 at once
const YAW = 8, PITCH = 26, ROLL = 4, KEEP = 0.5;        // how crooked it hangs at rest, and the share kept at EN
const MOUTH = [SX, PT + RT, SZ];                        // the middle of the slots, on the receptacle's face

/** The way the camera looks from: a world normal faces it when its dot with this is positive. */
function toward(P) {
  const o = P(0, 0, 0), a = [P(1, 0, 0), P(0, 1, 0), P(0, 0, 1)].map((p) => [p[0] - o[0], p[1] - o[1]]);
  return cross(a.map((p) => p[0]), a.map((p) => p[1]));
}

/**
 * A solid on any axis, from ring a at h0 to ring b at h1, where to(u, v, h) is the world point (and, less its
 * origin, a direction): the hull of both rings, and the visible run of inner at h1 as its crease.
 */
function shape(P, V, to, a, b, inner, h0, h1) {
  const o = to(0, 0, 0), Q = (u, v, h) => P(...to(u, v, h));
  const faces = (q) => dot(sub(to(q.nu, q.nv, 0), o), V) > 0;
  return { sil: poly(hull(ringAt(Q, a, h0).concat(ringAt(Q, b, h1)))), crease: open(ringAt(Q, run(inner, faces), h1)) };
}

/** Plug space to world with e of blade bare: x across, y back from its face (0 there), z up; it sags and turns with e. */
function plugAt(e) {
  const k = lerp(KEEP, 1, clamp((e - EN) / (E0 - EN), 0, 1)), ps = rad(YAW * k), th = rad(PITCH * k), ph = rad(ROLL * k);
  const back = [-Math.sin(ps) * Math.cos(th), Math.cos(ps) * Math.cos(th), -Math.sin(th)];
  const s0 = [Math.cos(ps), Math.sin(ps), 0], u0 = cross(s0, back);
  const side = add(s0.map((v) => v * Math.cos(ph)), u0, Math.sin(ph)), up = add(u0.map((v) => v * Math.cos(ph)), s0, -Math.sin(ph));
  const F = add(add(MOUTH, back, e), up, ZB);
  return (x, y, z) => F.map((v, i) => v + x * side[i] + y * back[i] + z * up[i]);
}

/** The point at t of a cubic Bézier in the world, and n points of one after its first. */
const bpt = (a, b, c, d, t) => { const s = 1 - t; return a.map((_, k) => s * s * s * a[k] + 3 * s * s * t * b[k] + 3 * s * t * t * c[k] + t * t * t * d[k]); };
const bez = (a, b, c, d, n) => Array.from({ length: n }, (_, i) => bpt(a, b, c, d, (i + 1) / n));

// The cord falls from the sleeve to the floor, DL beyond the sleeve's end at rest along the plug's way out, H0, and
// from there lies in one shallow curve that never moves: only the fall follows the plug. v is to the plug's left.
const T0 = plugAt(E0), A0 = T0(0, UL + VL, 0), H0 = unit([A0[0] - MOUTH[0], A0[1] - MOUTH[1], 0]), DL = 7;
const on = (u, v) => [A0[0] + u * H0[0] - v * H0[1], A0[1] + u * H0[1] + v * H0[0], RC];
const LAND = on(DL, 0), FLOOR = bez(LAND, on(DL + 9, 0), on(DL + 14, 10), on(DL + 11, 20), 14);

/** The cord's centre line with e of blade bare. */
function cord(e) {
  const T = plugAt(e), a = T(0, UL + VL, 0), b = sub(T(0, UL + VL + 1, 0), a);
  return [a, ...bez(a, add(a, b, 5), on(DL - 7, 0), LAND, 12), ...FLOOR];
}

/** A cord along screen points, w each side of them: a fill that hides what is behind it, and its outline, round at its end. */
function tube(c, w) {
  const L = [], R = [];
  c.forEach((p, i) => {
    const a = c[Math.max(i - 1, 0)], b = c[Math.min(i + 1, c.length - 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = ((a[1] - b[1]) / l) * w, ny = ((b[0] - a[0]) / l) * w;
    L.push([p[0] + nx, p[1] + ny]); R.push([p[0] - nx, p[1] - ny]);
  });
  const e = c[c.length - 1], n = sub(L[L.length - 1], e);
  const cap = [1, 2, 3, 4, 5].map((k) => { const t = (k * Math.PI) / 6; return [e[0] + n[0] * Math.cos(t) + n[1] * Math.sin(t), e[1] + n[1] * Math.cos(t) - n[0] * Math.sin(t)]; });
  const ring = L.concat(cap, R.reverse());
  return [poly(ring), open(ring)];
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let emin = value, at = null, drawn = NaN;

  // Fitted to the wall, the cord, and the plug both at rest and pushed as far in as it ever goes.
  const C = Cam(45, 0.5, S), pts = [];
  for (const z of [0, WH]) for (const x of [WX0, WX1]) for (const y of [-WT, 0]) pts.push([x, y, z]);
  for (const e of [E0, EN]) {
    const T = plugAt(e);
    for (const z of [-UH / 2, UH / 2]) for (const x of [-UW / 2, UW / 2]) pts.push(T(x, 0, z), T(x * (1 - UB), UL, z));
    pts.push(...cord(e));
  }
  fit(C, pts, 200, 166);
  const P = proj(C), V = toward(P), W = RC * S;
  const flat = (y) => (u, v, h) => [u, y + h, v]; // on the wall's face: (x, z) along it, h out of it
  const slab = (y, [ring, inner], t) => shape(P, V, flat(y), ring, ring, inner, 0, t);
  const g = mk("g", {}, svg);

  // Back to front: the wall, the outlet and its slots, the bare blades, the plug, and the cord out of its sleeve.
  put(solid(g), prism(P, facing(C), ...rings(WX0, -WT, WX1, 0, 3, 1.6), 0, WH));
  put(solid(g), slab(0, rings(SX - PW / 2, SZ - PH / 2, SX + PW / 2, SZ + PH / 2, 3.5, 0.7), PT));
  put(solid(g), slab(PT, rings(SX - RW / 2, SZ - RH / 2, SX + RW / 2, SZ + RH / 2, 3, 0.6), RT));
  for (const k of [-1, 1]) {
    mk("path", { d: poly(rrect(SX + k * PS - 0.9, SZ - SH, SX + k * PS + 0.9, SZ + SH, 0.9, 3).map((q) => P(q.u, PT + RT, q.v))), class: "nf lo" }, g);
  }
  const blades = [-1, 1].map(() => mk("path", { class: "sil hi" }, g));
  const body = solid(g), sleeve = solid(g);
  const cf = mk("path", { class: "fo" }, g), cs = mk("path", { class: "nf sil" }, g);
  // The body stands on the plug's own up: its footprint narrows toward the back, its top's near edge is the crease.
  const taper = (ring) => ring.map((q) => ({ ...q, u: q.u * (1 - (UB * q.v) / UL) }));
  const [foot, top] = rings(-UW / 2, 0, UW / 2, UL, UR, 1.4).map(taper);

  /** The bare part of the blade at plug x: from where its four long edges meet the receptacle's face, into the body. */
  const bare = (T, x) => {
    const q = [];
    for (const u of [x - BT / 2, x + BT / 2]) for (const v of [-BW / 2 - ZB, BW / 2 - ZB]) {
      const a = T(u, 0, v), d = sub(T(u, 1, v), a);
      q.push(P(...add(a, d, (MOUTH[1] - a[1]) / d[1])), P(...add(a, d, 2)));
    }
    return poly(hull(q));
  };

  function draw(e) {
    const T = plugAt(e), along = (u, v, h) => T(u, h, v);
    blades.forEach((el, i) => el.setAttribute("d", bare(T, (i ? 1 : -1) * PS)));
    put(body, shape(P, V, T, foot, foot, top, -UH / 2, UH / 2));
    put(sleeve, shape(P, V, along, circ(VR, 16), circ(RC + 0.5, 12), circ(RC - 0.1, 12), UL - 1, UL + VL));
    const [f, s] = tube(cord(e).map((p) => P(...p)), W);
    cf.setAttribute("d", f); cs.setAttribute("d", s);
  }

  const sp = spring(E0);
  const B = register(stage, (dt) => {
    const moving = stepS(sp, dt);
    const e = clamp(sp.x, EN, E0);
    if (e !== drawn) { drawn = e; draw(e); }
    return moving;
  });
  bag.add(B.unregister);
  drawn = E0; draw(E0);

  // The push: all of it near the plug's middle at rest, which never moves; none past REACH.
  const A = P(...T0(0, UL / 2, 0)), REACH = 150;
  const push = (u) => { const t = clamp((u - 0.2) / 0.8, 0, 1); return 1 - t * t * (3 - 2 * t); };
  function aim(p) {
    at = p;
    const f = p ? push(Math.hypot(p[0] - A[0], p[1] - A[1]) / REACH) : 0;
    sp.t = f < 0.5 ? lerp(E0, E1, f * 2) : lerp(E2, emin, f * 2 - 1);
    read.textContent = f > 0 ? "plug · loose" : "rest";
    B.wake();
  }

  read.textContent = "rest";
  bag.add(pointer(stage, { move: (p) => aim(p), leave: () => aim(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { emin = v; if (at) aim(at); },
    destroy: bag.dispose,
  };
}

export default {
  name: "unplugged",
  means: "A plug hangs half out of its socket: the nearer the pointer, the further it is pushed back in, and it never quite seats.",
  rules: [1, 3, 4, 5],
  range: [3.5, 3, 2],
  mount,
};
