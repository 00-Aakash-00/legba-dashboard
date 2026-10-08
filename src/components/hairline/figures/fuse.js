import { HL } from "../kernel.js";

/**
 * Fuse: a blown glass cartridge fuse seated in a fuse block, a low rounded plinth with a spring clip at each end: a band
 * of leaf bent round the underside of one of the fuse's short metal caps, its two lips turned out. Through the glass runs
 * the wire that blew, snapped midway, its two ends curled back a hair apart. The wire is the one bright mark, and keeps
 * it. The nearer the pointer comes to the near cap, the further that cap is pried up out of its clip, the fuse pivoting
 * on its far cap, which never leaves its clip: offered for replacing, never replaced. The slider is how far the pry reaches.
 *
 * The pattern: one spring, a falloff by distance from where the cap rests, and a paint order that moves the near clip's
 * front arm behind the fuse once the cap has risen clear of it. The glass is a plate, so the plinth never shows through.
 */
const {
  Cam, circ, clamp, disposer, fit, hull, mk, open, place, pointer, poly, prism, proj, put, rad, register, ringAt,
  rrect, run, seg, solid, spring, stepS,
} = HL;

const YAW = -97, S = 2.75, SIDES = 48;               // the fuse's heading on the ground; the camera's scale; samples round a ring
const RG = 12, RC = 13.5, H = 40, LC = 18, B = 1.4;  // glass radius, cap radius, half the glass's length, cap length, crease inset
const SC = H + LC / 2, ZA = 25;                      // where along the fuse the clips hold its caps; its axis above the ground
const PL = H + LC + 5, PW = 19, PH = 6, PR = 7;      // the plinth: half its length, half its width, its height, its corner
const T = 2.2, CW = 14, FW = 5;                      // a clip's band: its thickness, its width along the fuse, half its foot
const WRAP = rad(6), LIP = rad(38), RB = 4;          // each arm wraps its cap to WRAP past level, then its lip turns out by LIP round RB
const LIFT = rad(20), FLOOR = 0.1;                   // the furthest the near cap is pried; the pry's share far from it
// The wire's halves, each from its cap to the break: [where it leaves the cap, its way along the fuse, up (1) or down
// (-1), the run's length, the end's length, how far the end turns]. The wire crosses the glass from behind the near
// cap's middle to in front of the far one's, DEEP off the axis at each.
const HALF = [[-H, 1, 1, 42.8, 8, 2.1], [H, -1, -1, 24.6, 8, 2.1]], DEEP = 11;
const N = 16;                                        // steps along an end
const WT = Array.from({ length: N }, (_, k) => 0.7 + (0.6 * (k + 0.5)) / N), WS = WT.reduce((a, b) => a + b, 0);

/** One half of the wire as points (s along the fuse, q up from its axis): the taut run off the cap, then its end, turning tighter to the tip. */
function half([s0, dir, up, len, A, turn]) {
  let s = s0 + dir * len, q = 0, h = 0;
  const pts = [[s0, 0], [s, q]];
  for (const w of WT) { h += (turn * w) / WS; s += (dir * Math.cos(h) * A) / N; q += (up * Math.sin(h) * A) / N; pts.push([s, q]); }
  return pts;
}

/** Angles from a0 to a1, about 7° apart, both ends included. */
const sweep = (a0, a1) => {
  const n = Math.max(1, Math.ceil(Math.abs(a1 - a0) / 0.12));
  return Array.from({ length: n + 1 }, (_, k) => a0 + ((a1 - a0) * k) / n);
};

/**
 * A clip's arm toward the eye, from under its cap to its tip, as [x, y, nx, ny, h]: a point of the leaf's middle (x
 * across toward the eye, y up, from the cap's axis), the way its outside faces, and half its thickness. It wraps the cap,
 * turns out round RB, and ends in a half-round. c, where the leaf's outside turns from the eye, is one of its points.
 */
function arm(c) {
  const RM = RC + T / 2, O = RM + RB, pts = [], at = (x, y, a, h = T / 2) => pts.push([x, y, Math.cos(a), Math.sin(a), h]);
  for (const a of [...sweep(-Math.PI / 2, c), ...sweep(c, WRAP).slice(1)]) at(RM * Math.cos(a), RM * Math.sin(a), a);
  for (const b of sweep(0, LIP).slice(1)) { const a = WRAP - b; at(O * Math.cos(WRAP) - RB * Math.cos(a), O * Math.sin(WRAP) - RB * Math.sin(a), a); }
  const a = WRAP - LIP, [x, y] = pts[pts.length - 1];
  for (const g of sweep(0, Math.PI / 2).slice(1)) at(x - (T / 2) * Math.sin(g) * Math.sin(a), y + (T / 2) * Math.sin(g) * Math.cos(a), a, (T / 2) * Math.cos(g));
  return pts;
}

/** The pry's share at u reaches from the cap (the pointer's distance over the reach): all of it close by, easing to a floor. */
const fall = (u) => { const t = clamp((u - 0.2) / 0.8, 0, 1); return 1 - (1 - FLOOR) * t * t * (3 - 2 * t); };

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value, at = null;

  // The fuse's frame: s along it, p across it on the ground, z up; q is up from its axis. Pried by th, it turns about
  // its axis at the far clip, so the near cap rises and the far one stays seated.
  const ca = Math.cos(rad(YAW)), sa = Math.sin(rad(YAW));
  const W = (s, p, z) => [s * ca - p * sa, s * sa + p * ca, z];
  const F = (th) => {
    const co = Math.cos(th), si = Math.sin(th);
    return (s, p, q) => { const d = s - SC; return W(SC + d * co + q * si, p, ZA - d * si + q * co); };
  };
  const C = Cam(45, 0.5, S), ring = circ(RC, SIDES), foot = rrect(-PL, -PW, PL, PW, PR, 8);
  const pose = (th) => { const f = F(th); return [-H - LC, -H, H, H + LC].flatMap((s) => ring.map((k) => f(s, k.u, k.v))); };
  fit(C, [...pose(0), ...pose(LIFT), ...[0, PH].flatMap((z) => foot.map((k) => W(k.u, k.v, z)))], 200, 166);
  const P = proj(C), PW3 = (u, v, z) => P(...W(u, v, z));

  // Which way the eye is, in world space: a normal faces it when its dot with V is positive.
  const o = P(0, 0, 0), ax = [P(1, 0, 0), P(0, 1, 0), P(0, 0, 1)].map((p) => [p[0] - o[0], p[1] - o[1]]);
  const V = [ax[1][0] * ax[2][1] - ax[2][0] * ax[1][1], ax[2][0] * ax[0][1] - ax[0][0] * ax[2][1], ax[0][0] * ax[1][1] - ax[1][0] * ax[0][1]];
  const dotV = (x, y, z) => x * V[0] + y * V[1] + z * V[2];
  const flat = (k) => dotV(k.nu * ca - k.nv * sa, k.nu * sa + k.nv * ca, 0) > 0;

  const g = mk("g", {}, svg);
  put(solid(g), prism(PW3, flat, foot, rrect(-PL + 2, -PW + 2, PL - 2, PW - 2, PR - 2, 8), 0, PH));

  // The clips never move. A clip's leaf, as one outline round its cross-section (the arm away from the eye mirrored),
  // split where its outside turns from the eye (c): the part behind is painted behind the fuse, the arm toward the eye
  // in front of it. The leaf's edges facing the eye are drawn at its near and far faces; the near face's other edges are
  // creases, dim.
  const vp = dotV(-sa, ca, 0), m = vp >= 0 ? 1 : -1, c = Math.atan2(-Math.abs(vp), V[2]);
  const front = arm(c), ic = front.findIndex((p) => Math.abs(Math.atan2(p[1], p[0]) - c) < 1e-9);
  const leaf = [...front.map(([x, y, nx, ny, h]) => [-x, y, -nx, ny, h]).reverse(), ...front.slice(1)], ks = front.length - 1 + ic;
  const I = leaf.map(([x, y, nx, ny, h]) => [x - h * nx, y - h * ny]), Ou = leaf.map(([x, y, nx, ny, h]) => [x + h * nx, y + h * ny]);
  const parts = [[...Ou.slice(1, ks + 1).reverse(), ...I.slice(0, ks + 1)], [...I.slice(ks), ...Ou.slice(ks, -1).reverse()]];
  const top = Math.max(...parts[1].map((p) => p[1]));
  const gFar = mk("g", {}, g), gFuse = mk("g", {}, g), gNear = [mk("g", {}, g), mk("g", {}, g)];
  const path = (grp, d, cls) => mk("path", { d, class: cls }, grp);
  /** One part of the clip at sc: its sides' plates, its far edges, its near face's plate, then that face's outline. */
  function part(grp, pts, sc) {
    const A = pts.map(([x, y]) => PW3(sc - CW / 2, m * x, ZA + y)), Z = pts.map(([x, y]) => PW3(sc + CW / 2, m * x, ZA + y));
    const faces = pts.slice(1).map(([x, y], k) => (pts[k][1] - y) * Math.abs(vp) + (x - pts[k][0]) * V[2] > 0);
    const f = [false, ...faces, false], sil = [], lo = [], far = [];
    for (let k = 0, k0 = 0; k <= faces.length; k++) {
      if (k < faces.length && faces[k] === faces[k0]) continue;
      (faces[k0] ? lo : sil).push(open(A.slice(k0, k + 1)));
      if (faces[k0]) far.push(open(Z.slice(k0, k + 1)));
      k0 = k;
    }
    pts.forEach((_, k) => { if (f[k] !== f[k + 1]) far.push(seg(A[k], Z[k])); });
    path(grp, faces.map((_, k) => poly(hull([A[k], A[k + 1], Z[k], Z[k + 1]]))).join(""), "fo");
    path(grp, far.join(""), "nf sil");
    path(grp, poly(A), "fo");
    path(grp, lo.join(""), "nf lo");
    path(grp, sil.join(""), "nf sil");
  }
  for (const sc of [SC, -SC]) {
    const s0 = sc - CW / 2, s1 = sc + CW / 2, RO = RC + T;
    put(solid(gFar), prism(PW3, flat, rrect(s0 + 1, -FW, s1 - 1, FW, 1.5, 4), rrect(s0 + 1.6, -FW + 0.6, s1 - 1.6, FW - 0.6, 0.9, 4), PH, ZA - RO + 1));
    part(gFar, parts[0], sc);
    part(gNear[sc < 0 ? 0 : 1], parts[1], sc);
  }

  // The fuse, back to front: the far cap (its mouth toward the eye, where the glass goes in), the glass's plate, the
  // wire inside it, the glass's two outlines, the near cap.
  const far = solid(gFuse), pane = mk("path", { class: "fo" }, gFuse);
  const wires = HALF.map((hv) => ({ pts: half(hv), line: mk("path", { class: "nf hi" }, gFuse), bead: mk("circle", { r: 1.6, class: "dot" }, gFuse) }));
  // The wire leans across the glass the way the eye looks (e), so at rest it lies along the tube's middle; its ends curl square to that.
  const en = Math.hypot(vp, V[2]), e = [vp / en, V[2] / en], lean = (s, q) => [-q * e[1] + (DEEP * s * e[0]) / H, q * e[0] + (DEEP * s * e[1]) / H, s];
  const glass = mk("path", { class: "nf sil" }, gFuse), nearCap = solid(gFuse), dimple = mk("circle", { r: 1.3, class: "dot off" }, gFuse);
  const mouth = circ(RG, SIDES), face = circ(RC - B, SIDES);

  function draw(th) {
    const f = F(th), Q = (u, v, s) => P(...f(s, u, v));
    // the eye across (vp) and up (vq) from the fuse's axis: a ring sample faces it when nu·vp + nv·vq > 0
    const vq = dotV(Math.sin(th) * ca, Math.sin(th) * sa, Math.cos(th)), faces = (k) => k.nu * vp + k.nv * vq > 0;
    const cap = (s0, s1, inner, sf) => ({ sil: poly(hull(ringAt(Q, ring, s0).concat(ringAt(Q, ring, s1)))), crease: open(ringAt(Q, run(inner, faces), sf)) });
    put(far, cap(H, H + LC, mouth, H));
    pane.setAttribute("d", poly(hull(ringAt(Q, mouth, -H).concat(ringAt(Q, mouth, H)))));
    for (const w of wires) {
      const pts = w.pts.map(([s, q]) => Q(...lean(s, q)));
      w.line.setAttribute("d", open(pts));
      place(w.bead, pts[pts.length - 1]);
    }
    // the glass: its two outlines along the tube, where its surface turns from the eye
    const t = Math.atan2(vq, vp) + Math.PI / 2, edge = (a) => seg(Q(RG * Math.cos(a), RG * Math.sin(a), -H), Q(RG * Math.cos(a), RG * Math.sin(a), H));
    glass.setAttribute("d", edge(t) + edge(t + Math.PI));
    put(nearCap, cap(-H - LC, -H, face, -H - LC));
    place(dimple, Q(0, 0, -H - LC));
    // Once the cap's underside has risen past its clip's lips, it is above the clip's front arm: paint that arm first.
    const up = th > clear;
    if (up !== above) { above = up; (up ? gFar : gFuse).after(gNear[0]); }
  }

  const clear = Math.asin((RC + top) / (2 * SC - CW / 2)), sp = spring(0);
  let drawn = 0, above = false;
  draw(0);
  const loop = register(stage, (dt) => {
    const moving = stepS(sp, dt), th = clamp(sp.x, 0, 1) * LIFT;
    if (th !== drawn) { drawn = th; draw(th); }
    return moving;
  });
  bag.add(loop.unregister);

  // Where the near cap rests on screen: the pointer is read against it, and it never moves.
  const home = PW3(-SC, 0, ZA);
  function aim(pt) {
    at = pt;
    sp.t = pt ? fall(Math.hypot(pt[0] - home[0], pt[1] - home[1]) / reach) : 0;
    read.textContent = pt ? "fuse · blown" : "rest";
    loop.wake();
  }

  read.textContent = "rest";
  bag.add(pointer(stage, { move: (p) => aim(p), leave: () => aim(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { reach = v; if (at) aim(at); },
    destroy: bag.dispose,
  };
}

export default {
  name: "fuse",
  means: "A blown fuse in a fuse block: the pointer pries its near cap up out of the clip, as if to swap it, but never lifts it free.",
  rules: [1, 3, 5, 6],
  range: [100, 150, 220],
  mount,
};
