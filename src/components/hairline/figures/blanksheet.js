import { HL } from "../kernel.js";

/**
 * Blanksheet: one ruled sheet, every line blank, and a loupe held over it. The
 * ruling is faint; at rest the glass sits over the blank band between two
 * rules, and shows nothing: an empty glass, with ruled paper all round it.
 * The pointer is put on the sheet's plane, and the loupe glides toward it on
 * two springs, held to a band of the sheet so the hovered loupe never leaves
 * the rest drawing by more than a few units. The glass magnifies the lines
 * under it, a little less toward its rim, as a lens does: as it passes over a
 * rule, that rule sweeps through the glass, magnified and blank as well.
 * The light caught on the rim's upper right is the one bright stroke.
 * The read-out names the line under the glass and what it holds: `line 4 · 0`.
 * The slider is the lens's power. At 4, the default, the patch of sheet the
 * glass shows is narrower than the band between two rules, so at rest it
 * holds no line at all; from 3 down, the rules either side reach its rim.
 *
 * The pattern: a continuous position on a spring, a hit test on the sheet's
 * plane (which never moves), and an empty state whose rest is the whole idea.
 */
const {
  Cam, clamp, facing, fit, hull, lerp, open, poly, prism, proj, rad, ringAt, rings, run, seg, unproj,
  spring, stepS, disposer, mk, pointer, put, register, solid,
} = HL;

// Five rules, as far apart as the margins, so the sheet reads as blank ruled paper and not as a page of text.
// They stop OUT short of the right edge, so at rest no rule ends in the joint of the rim and the ferrule.
const W = 104, H = 132, T = 2, IN = 6, OUT = 10, TOP = 22, GAP = 22, NR = 5;
// RW, the rim's face: wide enough that the glass's edge stays clear of the crease below it at 1x.
const R = 29, RW = 5.5, D = 5.5, LIFT = 40, TILT = 28, PHI = 14, NECK = 7, CR = 6.2, HAND = 42, HR = 5;
/**
 * Rest: the glass over the blank band between rules 2 and 3. The glide clamps x + y, which runs down the
 * screen, and x − y, which runs across it, and X0 is a floor on x taken out of x − y, so x + y holds: the
 * glass never rises past the sheet's top corner or leaves the sheet, and every pose stays within six units
 * of the rest drawing's box, while the glass still brings each of the five rules into its view, the last
 * from the glide's lower-left corner.
 */
const REST = [50, 55], DOWN = [67, 115], ACROSS = 33, X0 = 11;
/**
 * How far the lens's swell eases toward its rim: 0 magnifies evenly, 1 bows the rules into a ball. Kept low,
 * so a rule in the glass stays a straight line and does not echo the rim as a second ring.
 */
const BOW = 0.12;
/** Toward the camera of Cam(45, K): what P flattens to a point. */
const K = 0.5, V = [Math.SQRT1_2 * Math.sqrt(1 - K * K), Math.SQRT1_2 * Math.sqrt(1 - K * K), K];

const add = (a, b, s = 1) => a.map((x, i) => x + b[i] * s);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (a) => { const l = Math.hypot(...a); return a.map((x) => x / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const AN = Array.from({ length: 48 }, (_, i) => (i / 48) * Math.PI * 2);

// The lens's frame: n leans TILT° further toward the camera than the sheet's; u runs out along the handle, v across it.
const n = unit(add([0, 0, Math.cos(rad(TILT))], unit([V[0], V[1], 0]), Math.sin(rad(TILT))));
const hd = [Math.cos(rad(PHI)), Math.sin(rad(PHI)), 0], u = unit(add(hd, n, -dot(hd, n))), v = cross(n, u);
// a plane square to the view, for the outline of the handle's round end
const w1 = unit(cross(V, [0, 0, 1])), w2 = cross(V, w1);
const facesUs = (d) => dot(d, V) > 0;

/** A circle of radius r round c in the plane of a and b, as world points; with `keep`, only the run whose outward direction passes it. */
function circle(c, r, a, b, keep) {
  const out = (t) => add(a.map((x) => x * Math.cos(t)), b, Math.sin(t));
  return (keep ? run(AN, (t) => keep(out(t))) : AN).map((t) => add(c, out(t), r));
}

/** The loupe over sheet point f: its world parts. The glass sits LIFT above the sheet, on the line of sight through f. */
function loupe(f) {
  const fr = add([f[0], f[1], T], V, LIFT / V[2]), L = add(fr, n, -D / 2);
  const bk = add(L, n, -D / 2), a0 = add(L, u, R - 1), a1 = add(L, u, R - 1 + NECK), tip = add(a1, u, HAND);
  return { fr, bk, a0, a1, tip };
}

/**
 * What the glass shows: the sheet's lines behind it, magnified about its centre c by `power`, a little less
 * toward the rim (BOW), so the answer falls off with distance from the pointer. eu and ev are the glass's radii
 * on screen: in their frame the glass is the unit disc, and it shows the sheet's disc of radius √r2.
 */
function swell(lines, c, eu, ev, power) {
  const det = eu[0] * ev[1] - eu[1] * ev[0], a = BOW * power * (power - 1), r2 = 1 / (power * power - a);
  const disc = (p) => { const x = p[0] - c[0], y = p[1] - c[1]; return [(x * ev[1] - y * ev[0]) / det, (eu[0] * y - eu[1] * x) / det]; };
  const show = (x, y) => { const s = power / Math.sqrt(1 + a * (x * x + y * y)); return [c[0] + s * (x * eu[0] + y * ev[0]), c[1] + s * (x * eu[1] + y * ev[1])]; };
  let d = "";
  for (const [p, q] of lines) {
    const A = disc(p), B = disc(q), dx = B[0] - A[0], dy = B[1] - A[1];
    const qa = dx * dx + dy * dy, qb = A[0] * dx + A[1] * dy, h = qb * qb - qa * (A[0] * A[0] + A[1] * A[1] - r2);
    if (h <= 0) continue;
    const t0 = Math.max(0, (-qb - Math.sqrt(h)) / qa), t1 = Math.min(1, (-qb + Math.sqrt(h)) / qa);
    if (t0 < t1) d += open(Array.from({ length: 13 }, (_, k) => { const t = lerp(t0, t1, k / 12); return show(A[0] + dx * t, A[1] + dy * t); }));
  }
  return d;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.9);
  // Fitted to the rest pose, the thumbnail, so it is the drawing that is centred. The glide is held
  // close to it, so every pose stays in the frame: look.mjs's frame item checks them.
  const q0 = loupe(REST);
  fit(C, [[0, 0, 0], [W, 0, 0], [0, H, 0], [W, H, 0], ...circle(q0.fr, R, u, v), ...circle(q0.bk, R, u, v), ...circle(q0.tip, HR, w1, w2)], 200, 166);
  const P = proj(C), front = facing(C), pts = (ring) => ring.map((q) => P(...q));

  const g = mk("g", {}, svg);
  const [sr, si] = rings(0, 0, W, H, 3, 1.1);
  put(solid(g), prism(P, front, sr, si, 0, T));
  // the sheet's lines, as screen segments: the rules, faint as ruling is, and the sheet's own edge, for the lens to show
  const lines = [];
  for (let k = 0; k < NR; k++) lines.push([P(IN, TOP + k * GAP, T), P(W - OUT, TOP + k * GAP, T)]);
  mk("path", { d: lines.map(([a, b]) => seg(a, b)).join(""), class: "nf lo" }, g);
  const rim = ringAt(P, sr, T);
  rim.forEach((p, i) => lines.push([p, rim[(i + 1) % rim.length]]));

  // the glass's edge is dim and what it shows is not, so a rule sweeping through the glass is the clearest line on the sheet
  const head = solid(g), glass = mk("path", { class: "nf lo" }, head.g), seen = mk("path", { class: "nf" }, head.g);
  // the one bright stroke: the light caught on the rim's upper right, from twelve o'clock to three
  const arc = mk("path", { class: "nf hi" }, head.g);
  // the ferrule is its silhouette alone: the grip's end, drawn over it, is its one inner line, and at 1x a crease would sit on it
  const neck = mk("path", { class: "sil" }, g), grip = solid(g);

  // eps in world units: 0.04 is under a tenth of a viewBox unit, so the last invisible creep is not redrawn
  const fx = spring(REST[0], { eps: 0.04 }), fy = spring(REST[1], { eps: 0.04 });
  let power = value, drawn = "";
  function draw() {
    const key = `${fx.x.toFixed(3)},${fy.x.toFixed(3)},${power}`;
    if (key === drawn) return;
    drawn = key;
    const q = loupe([fx.x, fy.x]), c = P(...q.fr), radius = (w) => { const s = P(...add(q.fr, w, R - RW)); return [s[0] - c[0], s[1] - c[1]]; };
    put(head, {
      sil: poly(hull(pts([...circle(q.fr, R, u, v), ...circle(q.bk, R, u, v)]))),
      crease: open(pts(circle(q.fr, R - 1.1, u, v, facesUs))),
    });
    arc.setAttribute("d", open(pts(circle(q.fr, R, u, v, (d) => d[2] > 0.02 && d[0] - d[1] > -0.35))));
    glass.setAttribute("d", poly(pts(circle(q.fr, R - RW, u, v))));
    seen.setAttribute("d", swell(lines, c, radius(u), radius(v), power));
    neck.setAttribute("d", poly(hull(pts([...circle(q.a0, CR, n, v), ...circle(q.a1, CR, n, v)]))));
    put(grip, {
      sil: poly(hull(pts([...circle(q.a1, HR, n, v), ...circle(q.tip, HR, w1, w2)]))),
      crease: open(pts(circle(add(q.tip, u, -9), HR - 0.6, n, v, facesUs))),
    });
  }
  draw();

  const B = register(stage, (dt) => {
    const moving = stepS(fx, dt) | stepS(fy, dt);
    draw();
    return !!moving;
  });
  bag.add(B.unregister);

  bag.add(pointer(stage, {
    move: (p) => {
      const [x, y] = unproj(C, p[0], p[1], T), a = clamp(x + y, ...DOWN), b = clamp(x - y, 2 * X0 - a, ACROSS);
      fx.t = (a + b) / 2;
      fy.t = (a - b) / 2;
      read.textContent = `line ${clamp(Math.round((fy.t - TOP) / GAP) + 1, 1, NR)} · 0`;
      B.wake();
    },
    leave: () => { fx.t = REST[0]; fy.t = REST[1]; read.textContent = "rest"; B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (val) => { power = val; B.wake(); },
    destroy: bag.dispose,
  };
}

export default {
  name: "blanksheet",
  means: "A loupe glides toward the pointer over a ruled sheet and magnifies the lines under it: every one of them is blank.",
  rules: [1, 3, 4, 5],
  range: [3.5, 4, 4.5],
  mount,
};
