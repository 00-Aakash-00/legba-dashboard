import { HL } from "../kernel.js";

/**
 * Keyclip: a D-shaped keychain carabiner, narrow at the top and wide at the
 * basket, hanging plumb from a peg on the wall, its spring gate stuck open, and
 * on the floor just under the gap the key ring it let go of, the keys whole and
 * still on it. The open gate carries the one bright stroke: where the holder
 * failed. The pointer swings the gate back toward the notch in its nose on a
 * spring, the nearer the more, and the carabiner sways on its peg the way the
 * gate is pushed, but the gate always stops just short of the notch: a near
 * miss, never latched. The slider is the swing, in degrees.
 *
 * The pattern: a continuous field on one part. A spring on the gate's angle, a
 * falloff by distance to the gate's rest pose (which never moves), and a clamp
 * that keeps the gate short of latching.
 */
const {
  Cam, circ, clamp, fillet, fit, hull, open, poly, proj, rad, run, spring, stepS,
  disposer, mk, pointer, register,
} = HL;

const S = 2.75, AZ = 70, ZH = 65, YC = 16; // the scale; the wall's facing (degrees round z: 45 faces the viewer); the peg's height, and how far out on it the carabiner hangs
const D = [[-10, 10], [10, 10], [10, -44], [-22, -44]], DR = [10, 4, 4, 12]; // the frame's centreline before rounding, in its own plane (u along the wall, v up): a narrow top it hangs by, the straight spine down the right, a basket wider than the top, and the gate's line up the left, leaning out to it; each corner's cut, tight at the spine and broad at the gate: a D
const RR = 1.6, RG = 1.3, STUB = 1.5, LIP = 2.4; // the rod's radius and the gate's; the straight run at each end of the frame, along the gate's line; the lip on the nose
const RP = 1.3, KNOB = 1.7, ROSE = 3, RT = 1; // the peg's radius and its cap's; the wall plate's radius and thickness
const VP = D[0][1] - RR - RP; // where the peg sits in the frame's plane: holding the inside of the top bend
const OPEN = 13.5, MAXS = 5, TILT = 0, SWAY = -0.25; // the gate's rest angle and the most it swings back (never to its notch); the rest lean (plumb), and the lean per degree of swing: negative, so the carabiner swings the way its gate is pushed
const R = 120, FLOOR = 0.1; // the pointer's reach on screen, and the share of the swing beyond it
const RING = [-12, 22, 7.5], WIRE = 1, TK = 1, HOLE = 2.2; // the key ring, from the peg's foot (along the wall, out from it, radius), its wire; a key's thickness (the height of its face; its sides are too thin to draw at this size) and the hole in its bow
const KEYS = [[-65, -40, 30, 12], [-20, -12, 28, 11.5], [30, 20, 25, 10.5]]; // each key: where its hole sits on the ring, the way its blade points (degrees), its length, its bow
const BASE = [-39, 21]; // the wall's foot, along the wall either side of the peg: where the wall meets the floor the keys fell on

/** The share of the swing at d screen units from the gate's rest pose: 1 on it, falling to FLOOR. */
const reach = (d) => FLOOR + (1 - FLOOR) * Math.exp(-((d / R) ** 2) * 3);

/** Distance from screen point p to the segment a–b. */
function segDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
  const t = L ? clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L, 0, 1) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

/**
 * The outline of a round rod r wide on screen along the screen polyline c, round at its start. Its end is round, or,
 * given a lip, the carabiner's nose: the outer half runs lip further as a tooth and the inner half stops square, so
 * the notch between is where the gate's tip would seat. c runs clockwise on screen, so +n is the inside.
 */
function tube(c, r, lip) {
  const L = c.length - 1, out = [];
  const nr = c.map((p, j) => {
    const a = c[Math.max(0, j - 1)], b = c[Math.min(L, j + 1)], m = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [(a[1] - b[1]) / m, (b[0] - a[0]) / m];
  });
  const at = (j, f, sg) => {
    const [nx, ny] = nr[j];
    return [c[j][0] + sg * r * (nx * Math.cos(f) + ny * Math.sin(f)), c[j][1] + sg * r * (ny * Math.cos(f) - nx * Math.sin(f))];
  };
  for (let j = 0; j < L; j++) out.push(at(j, 0, 1));
  if (lip) {
    const [nx, ny] = nr[L], E = c[L], q = (a, b) => [E[0] + a * nx + b * ny, E[1] + a * ny - b * nx]; // a across toward the inside, b along
    out.push(...fillet([at(L - 1, 0, 1), q(r, 0), q(0, 0), q(0, lip), q(-r, lip), q(-r, 0)], [0, 0.35 * r, 0.25 * r, 0.35 * r, 0.5 * r, 0], 3).slice(4, 20));
  } else for (let k = 0; k < 8; k++) out.push(at(L, (Math.PI * k) / 8, 1));
  for (let j = L; j >= 0; j--) out.push(at(j, 0, -1));
  for (let k = 1; k < 8; k++) out.push(at(0, (Math.PI * k) / 8, -1));
  return out;
}

/** A key lying flat in its own (s, t), its hole at (0, 0) and its blade along +s: a round bow, a neck, a blade with two cuts, a slanted tip. */
function keyShape(len, bow) {
  const b = bow / 2, f = bow - 4.5, pts = [[-4.5, -b], [f, -b], [f, -2.8], [len - 2.5, -2.8], [len, 0.2], [len - 3, 2.8]], rr = [b - 1, 2, 0.8, 1, 1, 0.8];
  for (const c of [len - 7.5, len - 13.5]) { if (c - 1.8 > f + 1) { pts.push([c + 1.8, 2.8], [c, 1], [c - 1.8, 2.8]); rr.push(0.8, 0.8, 0.8); } }
  pts.push([f, 2.8], [f, b], [-4.5, b]); rr.push(0.8, 2, b - 1);
  return fillet(pts, rr, 3);
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let swing = clamp(value, 0, MAXS), over = null;

  // The wall's frame: e runs along it to the right, n out of it toward the viewer.
  const e = [Math.sin(rad(AZ)), -Math.cos(rad(AZ))], n = [Math.cos(rad(AZ)), Math.sin(rad(AZ))];
  const wall = (u, out, z) => [u * e[0] + out * n[0], u * e[1] + out * n[1], z];
  // The frame's centreline: the rounded polygon from the gate's hinge, over the top, down the spine, round the basket and
  // up to the nose, leaving out the left side, which is the gate's line. The gate's tip would seat on it, in the nose's notch.
  const F = fillet(D, DR, 8), top = F[0], foot = F[F.length - 1], gl = Math.hypot(top[0] - foot[0], top[1] - foot[1]), g = [(top[0] - foot[0]) / gl, (top[1] - foot[1]) / gl];
  const along = (p, d) => [p[0] + d * g[0], p[1] + d * g[1]], HINGE = along(top, -STUB), NOSE = along(foot, STUB), SEAT = along(NOSE, RG), LINE = [HINGE, ...F, NOSE];
  /** The carabiner's plane to world, leaning tau degrees about the peg. */
  const plane = (tau) => { const c = Math.cos(rad(tau)), s = Math.sin(rad(tau)); return ([u, v]) => wall(u * c - (v - VP) * s, YC, ZH + u * s + (v - VP) * c); };
  /** The gate's free end, swung th degrees in about its hinge, off the line to the notch. */
  const tipAt = (th) => { const a = rad(th), dx = SEAT[0] - HINGE[0], dv = SEAT[1] - HINGE[1]; return [HINGE[0] + dx * Math.cos(a) - dv * Math.sin(a), HINGE[1] + dx * Math.sin(a) + dv * Math.cos(a)]; };
  const lean = (th) => TILT + SWAY * (OPEN - th);

  // the floor: the ring, and each key's outline in world (x, y), back to front
  const [rx, ry] = wall(RING[0], RING[1], 0), rr = RING[2];
  const keys = KEYS.map(([at, dir, len, bow]) => {
    const hx = rx + rr * Math.cos(rad(at)), hy = ry + rr * Math.sin(rad(at)), c = Math.cos(rad(dir)), s = Math.sin(rad(dir));
    const W = ([u, v]) => [hx + u * c - v * s, hy + u * s + v * c];
    return { out: keyShape(len, bow).map(W), hole: circ(HOLE, 16).map((q) => W([q.u, q.v])), mid: hx + hy + (len / 2) * (c + s) };
  }).sort((a, b) => a.mid - b.mid);

  // The camera is fitted to the peg, the floor, the keys, and the carabiner at both ends of its sway.
  const C = Cam(45, 0.5, S), pts = [wall(-ROSE, 0, ZH + ROSE), wall(ROSE, 0, ZH - ROSE), wall(BASE[0], 0, 0), wall(BASE[1], 0, 0)];
  for (const th of [OPEN, OPEN - MAXS]) for (const [u, v] of LINE.concat([tipAt(th)])) for (const d of [[-RR, -RR], [RR, RR], [-RR, RR], [RR, -RR]]) pts.push(plane(lean(th))([u + d[0], v + d[1]]));
  for (const k of keys) for (const [x, y] of k.out) pts.push([x, y, TK]);
  fit(C, pts, 200, 166);
  const P = proj(C);

  // Back to front: the wall's foot, the ring and the keys on the floor, then everything that hangs above them.
  const G = mk("g", {}, svg);
  mk("path", { d: open([P(...wall(BASE[0], 0, 0)), P(...wall(BASE[1], 0, 0))]), class: "nf lo" }, G);
  // The ring: a round wire lying flat, so its outer edge and its hole are all there is to draw.
  const ell = (r) => circ(r, 40).map((q) => P(rx + q.u, ry + q.v, WIRE));
  mk("path", { d: poly(ell(rr + WIRE)) + poly(ell(rr - WIRE).reverse()), class: "sil" }, G);
  // Each key: its face, level with the ring's wire, with the hole cut through so the ring shows in it.
  for (const k of keys) mk("path", { d: poly(k.out.map(([x, y]) => P(x, y, TK))) + poly(k.hole.map(([x, y]) => P(x, y, TK)).reverse()), class: "sil" }, G);

  // The peg: a round plate on the wall with the near edge of its rim for its thickness, a long pin out of it through the
  // carabiner's top bend, and the cap on the pin's end in front of the bend.
  const disc = (out, r) => circ(r, 24).map((q) => P(...wall(q.u, out, ZH + q.v)));
  const face = (q) => P(...wall(q.u, RT, ZH + q.v)), [fx, fy] = face({ u: 0, v: 0 }), [bx, by] = P(...wall(0, 0, ZH));
  mk("path", { d: poly(hull(disc(0, ROSE).concat(disc(RT, ROSE)))), class: "sil" }, G);
  mk("path", { d: open(run(circ(ROSE, 24), (q) => { const [x, y] = face(q); return (x - fx) * (bx - fx) + (y - fy) * (by - fy) > 0; }).map(face)), class: "nf lo" }, G);
  mk("path", { d: poly(hull(disc(RT, RP).concat(disc(YC, RP)))), class: "sil" }, G);
  // The gate goes in before the frame, so the frame's end covers the gate's hinge.
  const gate = mk("path", { class: "sil hi" }, G), body = mk("path", { class: "sil" }, G);
  mk("path", { d: poly(hull(disc(YC + 1.5, KNOB).concat(disc(YC + 3, KNOB)))), class: "sil" }, G);

  // hit: the gate's rest pose on screen, which never moves
  const rest = plane(lean(OPEN)), g0 = P(...rest(HINGE)), g1 = P(...rest(tipAt(OPEN)));
  const sp = spring(OPEN);
  let drawn = NaN;
  function draw() {
    const th = clamp(sp.x, OPEN - MAXS, OPEN + 3);
    if (th === drawn) return;
    drawn = th;
    const W = plane(lean(th));
    body.setAttribute("d", poly(tube(LINE.map((q) => P(...W(q))), RR * S, LIP * S)));
    gate.setAttribute("d", poly(tube([HINGE, tipAt(th)].map((q) => P(...W(q))), RG * S)));
  }
  draw();

  const B = register(stage, (dt) => { const m = stepS(sp, dt); draw(); return m; });
  bag.add(B.unregister);

  function retarget() {
    sp.t = over ? OPEN - swing * reach(segDist(over, g0, g1)) : OPEN;
    read.textContent = over ? `gate ${Math.round(sp.t)}°` : "rest";
    B.wake();
  }

  read.textContent = "rest";
  bag.add(pointer(stage, {
    move: (p) => { over = p; retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { swing = clamp(v, 0, MAXS); if (over) retarget(); },
    destroy: bag.dispose,
  };
}

export default {
  name: "keyclip",
  means: "A carabiner whose gate stuck open and let its keys slip: the pointer swings the gate back toward its nose, but it never latches.",
  rules: [1, 3, 4, 5],
  range: [3.5, 4.5, 5],
  mount,
};
