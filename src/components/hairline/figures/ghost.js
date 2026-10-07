import { HL } from "../kernel.js";

/**
 * Ghost: a hooded operator, seen from the front. A deep hood of rounded shells,
 * round at the crown, sits on a cloak with square shoulders; the face opening is
 * a wide dark plate, a thin cowl round it, with a mask set back inside: two thin
 * crescent brows swept down into the narrow wedge of the nose, the one plate in
 * the void. The cloak's lapels run down from under the hood. The hood turns on a
 * spring to look toward the pointer; the turn falls off down the figure, all of
 * it at the crown, a tenth at the hem. The hood's outline on the right, the side
 * the light comes from, takes the bright stroke from just off the crown down to
 * the brow: the rim that catches the light, whichever way the hood looks. At
 * rest it looks a little to the right. The slider is how far it can turn, in
 * degrees: at most 20, so the wide opening stays on the side of the hood that
 * faces the viewer.
 *
 * The pattern: one continuous number, a yaw, on one spring. The bearing comes
 * from the pointer and the figure's fixed axis, never from what is drawn.
 */
const { Cam, clamp, fillet, fit, hull, lerp, open, poly, proj, rad, spring, stepS, disposer, mk, pointer, register } = HL;

// World units; z is up and +y comes toward the viewer. The neck turns about x = 0, y = YC. CAP is in viewBox units.
const S = 0.96, YC = -6, REST = 3, LOOK = 160, DEPTH = 30, ZC = 166, CAP = 14;
/** A filleted half-profile [half-width, z], up from the bottom, as rings [z, half-width, half-depth, centre y]. */
const lathe = (pts, radii, b, c) => fillet(pts, radii, 8).filter(([a]) => a > 0.5).map(([a, z]) => [z, a, b(a), c(z)]);
// The cloak, straight down from square shoulders; then the hood, lying in a V on the chest, up its flanks to a round cap:
// the last four points lie on an arc of radius 30 about the axis, from 40° up to the top, where it meets the axis level.
const CLOAK = lathe([[0, 0], [100, 0], [102, 124], [66, 150], [30, 160], [0, 160]], [0.01, 4, 16, 14, 6, 0.01], (a) => 17 + 0.29 * a, (z) => (-8 * z) / 160);
const HOOD = lathe([[0, 92], [9, 92], [59.5, 140], [61.5, 185], [52, 225], [38, 246], [23, 261.3], [16.5, 267.1], [8.6, 270.7], [0, 272]],
  [0.01, 4, 30, 40, 40, 8, 4, 4, 4, 0.01], (a) => a, (z) => clamp(34 - (z - 92) * 0.75, -8, 34) - Math.max(0, z - 200) * 0.15);
/** The share of the turn taken at height z: all of it at the crown, half where the hood lies on the chest; then the cloak, a third at the neck, a tenth at the hem. */
const HEAD = (z) => { const s = clamp((z - 98) / 72, 0, 1); return 0.5 + 0.5 * s * s * (3 - 2 * s); };
const CLOTH = (z) => 0.1 + 0.25 * clamp(z / 160, 0, 1);
/** World points turned about the neck, each by th degrees times its share: positive turns the front to the viewer's right. */
const turn = (th, w) => ([x, y, z]) => { const a = rad(th * w(z)), c = Math.cos(a), s = Math.sin(a); return [x * c + (y - YC) * s, YC - x * s + (y - YC) * c, z]; };

/** A ring's samples, as world points. */
const ring = ([z, a, b, c], n = 40) => Array.from({ length: n }, (_, i) => [a * Math.cos((i / n) * 2 * Math.PI), c + b * Math.sin((i / n) * 2 * Math.PI), z]);
/** The front of a stack of rings at (x, z), d behind its surface. */
function surf(R, x, z, d = 0) {
  let i = 0;
  while (i < R.length - 2 && z > R[i + 1][0]) i++;
  const [z0, a0, b0, c0] = R[i], [z1, a1, b1, c1] = R[i + 1], t = clamp((z - z0) / (z1 - z0), 0, 1);
  const a = lerp(a0, a1, t), b = lerp(b0, b1, t), c = lerp(c0, c1, t);
  return [x, c + b * Math.sqrt(Math.max(0, 1 - (x / a) ** 2)) - d, z];
}
/** n + 1 points along f(t), t from 0 to 1. */
const along = (n, f) => Array.from({ length: n + 1 }, (_, k) => f(k / n));

/** The face opening in the hood's front, as [x, z]: a wide pointed arch, round at its shoulders, closing to a V at the throat. */
const M2 = fillet([[0, 100], [49, 150], [49, 202], [0, 231], [-49, 202], [-49, 150]], [6, 14, 19, 6, 19, 14], 6);
const MOUTH = M2.map(([x, z]) => surf(HOOD, x, z, 0.4));
// The cowl's rolled edge round the opening.
const HEM = M2.map(([x, z]) => surf(HOOD, x * 1.05, ZC + (z - ZC) * 1.05, 0.4));
// The hood's inner wall, where it meets the face, DEPTH behind the rim: it shows on the side the hood turns toward.
const FACE = MOUTH.map(([x, y, z]) => [x, y - DEPTH, z]);
// The mask, half as deep, one plate: each brow a thin crescent, arched, from a point at its outer end (just rounded), its
// underside swept down into one side of the nose's narrow wedge; the gap between the wedge's two sides runs up between the brows.
// As [x, z, corner radius], the right half from the wedge's tip: up its outer side, out under the brow, back over it, down inside.
// Over the whole reach it stays 6 units inside the opening, so it is drawn whole.
const HALF = [[0, 153, 0.8], [7.2, 179, 6], ...along(8, (t) => [lerp(11.5, 30, t), 187.5 + 14.5 * t ** 0.7, t === 0 ? 2 : t === 1 ? 0.6 : 0.01]),
  ...along(8, (t) => [lerp(30, 7, t), 192.5 + 9.5 * (1 - t) ** 0.6, t < 1 ? 0.01 : 2.5]).slice(1), [5.4, 179, 6]];
const MP = [...HALF, [0, 158, 1], ...HALF.slice(1).reverse().map(([x, z, r]) => [-x, z, r])];
const MASK = fillet(MP.map(([x, z]) => [x, z]), MP.map((p) => p[2]), 3).map(([x, z]) => surf(HOOD, x, z, DEPTH / 2));
// The lapels: the cloak's front edges, from under the hood at the shoulders down the chest, meeting low in a soft V.
const LAPELS = fillet([[-57, 152], [9, 14], [57, 152]], [0.01, 10, 0.01], 6).map(([x, z]) => surf(CLOAK, x, z, 0.4));

/** Clips the closed line pts to the polygon win, the opening the turn may dent: the parts inside, as open runs. */
function within(pts, win) {
  const edges = win.map((a, i) => [a, win[(i + 1) % win.length]]);
  const inside = ([x, y]) => {
    let c = false;
    for (const [[xi, yi], [xj, yj]] of edges) if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    return c;
  };
  const s = pts.findIndex((p) => !inside(p));
  if (s < 0) return poly(pts);
  let d = "", run = [];
  const flush = () => { if (run.length > 1) d += open(run); run = []; };
  for (let k = 0; k < pts.length; k++) {
    // Cut each segment where it crosses the window's edges, and keep the pieces whose middles are inside.
    const p = pts[(s + k) % pts.length], q = pts[(s + k + 1) % pts.length], dx = q[0] - p[0], dy = q[1] - p[1], ts = [0, 1];
    for (const [a, b] of edges) {
      const ex = b[0] - a[0], ey = b[1] - a[1], den = dx * ey - dy * ex, wx = a[0] - p[0], wy = a[1] - p[1];
      const t = (wx * ey - wy * ex) / den, u = (wx * dy - wy * dx) / den;
      if (den && t > 0 && t < 1 && u >= 0 && u <= 1) ts.push(t);
    }
    ts.sort((x, y) => x - y);
    const at = (t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
    for (let i = 0; i + 1 < ts.length; i++) {
      if (!inside(at((ts[i] + ts[i + 1]) / 2))) { flush(); continue; }
      if (!run.length) run.push(at(ts[i]));
      run.push(at(ts[i + 1]));
    }
  }
  flush();
  return d;
}

/** The rim light: the run of the hull h on its right, from CAP right of its top, where the crown turns down, to the height y. */
function rim(h, y) {
  const n = h.length, top = h.reduce((m, p, i) => (p[1] < h[m][1] ? i : m), 0), x0 = h[top][0] + CAP, out = [];
  const step = h[(top + 1) % n][0] > h[top][0] ? 1 : n - 1;
  for (let i = top, k = 0, q = h[top]; k < n && h[i][1] <= y; q = h[i], i = (i + step) % n, k++) {
    const p = h[i];
    if (p[0] < x0) continue;
    if (!out.length && q[0] < x0) out.push([x0, lerp(q[1], p[1], (x0 - q[0]) / (p[0] - q[0]))]);
    out.push(p);
  }
  return out;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value, aim = null, drawn = NaN;

  const C = Cam(0, 0.2, S);
  const CR = CLOAK.flatMap((r) => ring(r)), HR = HOOD.flatMap((r) => ring(r));
  fit(C, [...CR.map(turn(REST, CLOTH)), ...HR.map(turn(REST, HEAD))], 200, 166);
  const P = proj(C), axis = P(0, YC, 0)[0];
  const at = (th, w) => { const t = turn(th, w); return (p) => P(...t(p)); };

  // Back to front: the cloak and its lapels; the hood, its rim light and its rolled edge; the opening's plate, what is
  // inside it, the mask last but one, and last its lip, the hood's inner outline, so nothing inside is drawn over it.
  // Bright outside, dim inside: the outlines and the mask's edge, then the lip, then the lapels, the rolled edge and the wall.
  const g = mk("g", {}, svg);
  const cloak = { sil: mk("path", { class: "sil" }, g), lapels: mk("path", { class: "nf lo" }, g) };
  const hood = {
    sil: mk("path", { class: "sil" }, g), rim: mk("path", { class: "nf hi" }, g), hem: mk("path", { class: "nf lo" }, g),
    plate: mk("path", { class: "fo" }, g), face: mk("path", { class: "nf lo" }, g), mask: mk("path", { class: "sil" }, g),
    lip: mk("path", { class: "nf" }, g),
  };
  const sp = spring(REST);

  function draw(th) {
    if (th === drawn) return;
    drawn = th;
    const H = at(th, HEAD), K = at(th, CLOTH), m = MOUTH.map(H), h = hull(HR.map(H));
    cloak.sil.setAttribute("d", poly(hull(CR.map(K))));
    cloak.lapels.setAttribute("d", open(LAPELS.map(K)));
    hood.sil.setAttribute("d", poly(h));
    hood.rim.setAttribute("d", open(rim(h, Math.min(...m.map((p) => p[1])))));
    hood.hem.setAttribute("d", poly(HEM.map(H)));
    hood.plate.setAttribute("d", poly(m));
    hood.lip.setAttribute("d", poly(m));
    hood.face.setAttribute("d", within(FACE.map(H), m));
    hood.mask.setAttribute("d", poly(MASK.map(H)));
  }

  const B = register(stage, (dt) => {
    const moving = stepS(sp, dt);
    draw(sp.x);
    return moving;
  });
  bag.add(B.unregister);

  /** Points the hood at the pointer's bearing, held to the reach; null sends it back to rest. The rim light stays on the lit side. */
  function look() {
    const deg = aim === null ? REST : clamp((Math.atan2(aim, LOOK) * 180) / Math.PI, -reach, reach);
    sp.t = deg;
    const n = Math.round(deg);
    read.textContent = aim === null ? "rest" : `facing ${n < 0 ? "−" : ""}${Math.abs(n)}°`;
    B.wake();
  }
  look();

  bag.add(pointer(stage, {
    move: (p) => { aim = (p[0] - axis) / S; look(); },
    leave: () => { aim = null; look(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { reach = v; look(); },
    destroy: bag.dispose,
  };
}

export default {
  name: "ghost",
  means: "A hooded figure that turns its hood to look toward the pointer; the cloak twists after it, less toward the hem.",
  rules: [1, 3, 4, 5, 8],
  range: [8, 14, 20],
  mount,
};
