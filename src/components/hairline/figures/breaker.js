import { HL } from "../kernel.js";

/**
 * Breaker: a breaker panel on a wall, its door swung open on a row of five breakers. Each toggle stands in a
 * window on its breaker's face, and every one is up, at the top of its window, but the fourth's, which has
 * tripped down to the bottom of its own: that breaker, its body and its toggle, is the one bright mark. Over
 * the panel, the pointer lifts the tripped toggle back toward on, the nearer the further, on a spring, and it
 * always falls short. The read-out names the breaker and its state. The slider is the most the tripped
 * toggle can be lifted, in degrees.
 *
 * The pattern: one continuous number on one spring, a falloff by distance measured on the breakers' face (a
 * plane that never moves), and a hit area made from the rest pose. The toggle is a solid on its own axis.
 */
const {
  Cam, circ, clamp, facing, fit, hull, mk, open, pointer, poly, prism, proj, put, rad, register,
  rings, rrect, run, solid, spring, stepS, disposer,
} = HL;

const W = 86, H = 44, D = 18;                            // the box: y across the wall, z up, x out of the wall
const N = 5, TRIP = 3, BW = 12.8, Y0 = (W - N * BW) / 2; // five breakers in a row, the fourth tripped
const ZC = 22, MH = 28, NOSE = 3.5;                      // the row's middle, the breakers' height, how far they stand out
// A toggle: its length, thickness and width, and how far it sits toward the eye: a toggle leans out of its
// breaker, which on screen carries its tip to the right, so this centres it on the breaker's outline.
const L = 10, T = 3, LW = 5, TY = 2.6;
const SW = 3.9, SH = 11.2;                               // the window a toggle stands in: half its width, half its height
const ON = 75, OFF = -75, R = 70;                        // the toggles' angles; how far the pointer reaches
const PHI = 70, DT = 2.4, HY = 0.5, DW = W - 1;          // the door: how far open, its thickness, its hinge, its width

const yOf = (i) => Y0 + (N - 0.5 - i) * BW;              // breaker i's middle; breaker 1 is at the left, nearest the eye
const fall = (u) => (u >= 1 ? 0.1 : 0.1 + 0.9 * (1 - u) ** 2); // 1 under the pointer, down to a floor of .1 at the reach

/** The way the camera looks from, as a world vector: a normal faces the eye when its dot with this is positive. */
function eye(P) {
  const o = P(0, 0, 0), [a, b, c] = [P(1, 0, 0), P(0, 1, 0), P(0, 0, 1)].map((p) => [p[0] - o[0], p[1] - o[1]]);
  const v = [b[0] * c[1] - c[0] * b[1], c[0] * a[1] - a[0] * c[1], a[0] * b[1] - b[0] * a[1]];
  return v[2] < 0 ? v.map((k) => -k) : v;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value, over = null;
  read.textContent = "rest";
  const cs = Math.cos(rad(PHI)), sn = Math.sin(rad(PHI));
  // the door's footprint, made closed (u through it, v along it from the hinge) and swung open
  const swing = (rg) => rg.map((q) => ({ u: D + q.v * sn + q.u * cs, v: HY + q.v * cs - q.u * sn, nu: q.nv * sn + q.nu * cs, nv: q.nv * cs - q.nu * sn }));
  const door = rings(0, 0, DT, DW, 1.2, 0.5).map(swing);

  // Fitted to the box and the open door; the toggles stay within them in every pose.
  const C = Cam(45, 0.5, 2.9), pts = [];
  for (const z of [0, H]) {
    for (const x of [0, D]) for (const y of [0, W]) pts.push([x, y, z]);
    pts.push([D + DW * sn, HY + DW * cs, z]);
  }
  fit(C, pts, 200, 166);
  const P = proj(C), front = facing(C), V = eye(P), g = mk("g", {}, svg);
  const face = (rg, x) => poly(rg.map((q) => P(x, q.u, q.v)));                        // on the box's face: u across, v up
  const leaf = (rg) => poly(rg.map((q) => P(D + q.u * sn, HY + q.u * cs, q.v)));        // on the door's inner face

  // Back to front: the box and the cut-out round the breakers, the door with its lip and latch, and its hinges
  // (all farther than the toggles they come near on screen), then the breakers from the far end of the row.
  put(solid(g), prism(P, front, ...rings(0, 0, D, W, 5, 1.8), 0, H));
  mk("path", { d: face(rrect(Y0 - 6, ZC - MH / 2 - 4.5, W - Y0 + 4, ZC + MH / 2 + 4, 2.5, 4), D), class: "nf" }, g);
  put(solid(g), prism(P, front, door[0], door[1], 0.8, H - 0.8));
  mk("path", { d: leaf(rrect(2.2, 3, DW - 2.2, H - 3, 1.6, 4)), class: "nf lo" }, g);
  mk("path", { d: leaf(circ(2, 14).map((q) => ({ ...q, u: q.u + DW - 8, v: q.v + H / 2 }))), class: "nf" }, g);
  const pin = (r) => circ(r, 12).map((q) => ({ ...q, u: q.u + D, v: q.v + HY }));
  for (const z of [9, H - 19]) put(solid(g), prism(P, front, pin(1.8), pin(1.1), z, z + 10));

  const prof = rings(-1, -T / 2, L, T / 2, 1.4, 0.6); // a toggle's side: u along it, v across it
  /** Breaker i's toggle at th degrees, up being on: the hull of its two sides, and the crease round the near one. */
  function toggle(i, th) {
    const c = Math.cos(rad(th)), s = Math.sin(rad(th)), y = yOf(i) + TY;
    const at = (rg, dy) => rg.map((q) => P(D + NOSE + q.u * c - q.v * s, y + dy, ZC + q.u * s + q.v * c));
    const faces = (q) => (q.nu * c - q.nv * s) * V[0] + (q.nu * s + q.nv * c) * V[2] > 0;
    return { sil: poly(hull(at(prof[0], -LW / 2).concat(at(prof[0], LW / 2)))), crease: open(at(run(prof[1], faces), LW / 2)) };
  }

  // Each breaker: its body, the window cut in its face (an opening, drawn like the cut-out round the row, and
  // centred under the toggle), and its toggle, up in that window or, the tripped one, down.
  let tripped = null;
  for (let i = N - 1; i >= 0; i--) {
    const y = yOf(i), body = solid(g);
    put(body, prism(P, front, ...rings(D, y - BW / 2 + 0.7, D + NOSE, y + BW / 2 - 0.7, 1.4, 0.6), ZC - MH / 2, ZC + MH / 2));
    mk("path", { d: face(rrect(y + TY / 2 - SW, ZC - SH, y + TY / 2 + SW, ZC + SH, 2, 4), D + NOSE), class: "nf" }, g);
    const tg = solid(g);
    put(tg, toggle(i, i === TRIP ? OFF : ON));
    if (i === TRIP) { body.sil.classList.add("hi"); tg.sil.classList.add("hi"); tripped = tg; }
  }

  const sp = spring(OFF);
  let drawn = OFF;
  const B = register(stage, (dt) => {
    const moving = stepS(sp, dt);
    if (sp.x !== drawn) { drawn = sp.x; put(tripped, toggle(TRIP, clamp(sp.x, OFF, ON))); }
    return moving;
  });
  bag.add(B.unregister);

  // The pointer is read on the plane of the toggles' pivots, which never moves, and only over the panel and
  // its door at rest: a hull of their corners, a little enlarged.
  const o = P(D + NOSE, 0, 0), a = P(D + NOSE, 1, 0), b = P(D + NOSE, 0, 1);
  const ay = [a[0] - o[0], a[1] - o[1]], bz = [b[0] - o[0], b[1] - o[1]], det = ay[0] * bz[1] - ay[1] * bz[0];
  const onFace = ([x, y]) => [((x - o[0]) * bz[1] - (y - o[1]) * bz[0]) / det, (ay[0] * (y - o[1]) - ay[1] * (x - o[0])) / det];
  const area = hull(pts.map((p) => P(...p)));
  const mx = area.reduce((m, p) => m + p[0], 0) / area.length, my = area.reduce((m, p) => m + p[1], 0) / area.length;
  const big = area.map((p) => [mx + (p[0] - mx) * 1.06, my + (p[1] - my) * 1.06]);
  const inside = ([x, y]) => {
    const s = big.map((p, k) => { const q = big[(k + 1) % big.length]; return Math.sign((q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0])); });
    return !s.includes(1) || !s.includes(-1);
  };

  // where the tripped toggle hangs at rest, on that plane: the nearer the pointer is to it, the further it lifts
  const aim = onFace(P(D + NOSE + (L / 2) * Math.cos(rad(OFF)), yOf(TRIP) + TY, ZC + (L / 2) * Math.sin(rad(OFF))));

  /** The tripped toggle is lifted toward on, the nearer the pointer the further, and never reaches it. */
  function retarget() {
    sp.t = over ? OFF + lift * fall(Math.hypot(over[0] - aim[0], over[1] - aim[1]) / R) : OFF;
    read.textContent = over ? `breaker ${TRIP + 1} · tripped` : "rest";
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (q) => { over = inside(q) ? onFace(q) : null; retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = v; retarget(); },
    destroy: bag.dispose,
  };
}

export default {
  name: "breaker",
  means: "A breaker panel with one breaker tripped: the pointer lifts its toggle back toward on, the nearer the more, and it never resets.",
  rules: [1, 3, 4, 5],
  range: [55, 75, 95],
  mount,
};
