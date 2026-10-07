import { HL } from "../kernel.js";

/**
 * Shield: three heater-shield plates stand nested on a ring on the ground, an
 * orbit tipped round them, each plate behind wider, taller and leaning further
 * back, its point drawn up behind the plate in front. The plate under the
 * pointer takes the bright stroke and holds still; the pointer's height opens
 * the gaps, and the other plates part away from the held one, the farther the
 * more. At rest the bright runs round the back plate's outer right rim, from
 * its peak down. The slider is the widest gap, in world units.
 *
 * The pattern: scrub and pick. A spring for the gap, tweens staggered out from
 * the plate picked for which one holds still, a pick against the rest pose,
 * and plates painted back to front. The camera sits low (k 0.27), so the ring
 * lies flat under plates that stand tall: the view is part of the concept.
 */
const {
  Cam, circ, clamp, fillet, fit, hull, lerp, open, poly, proj, rad, ringAt, seg,
  spring, stepS, tdone, tset, tval, tween, disposer, mk, pointer, put, register, solid,
} = HL;

const N = 3, W = 68, H = 99, PK = 16, ANG = 44, KR = 64, T = 3, IN = 2.2, M = 10; // front plate: width, shoulder height, peak; the flanks' slope and the turn up into the sides; thickness, rim inset; steps per turn
const SW = [1, 1.17, 1.27], SH = [1, 1.14, 1.28], ASY = [0.09, 0.05, -0.09], FAN = 2; // each plate behind wider, taller, turned a little further (the fan: how much wider its left half is than its right) and leaning 2° further back
const TIP = [0, 5, 9], TZ = 40; // how far each plate's point is drawn up behind the plate in front, and over what height its flanks bend back to their line
const G0 = 9.1, SLOT = [-1, 0, 0.9], BEAR = 41; // rest gap; places in gaps, closer behind; the stack's bearing off the line of sight
const R1 = 59, D1 = 0.87, R2 = 69, Z2 = 6, TILT = 6, FR = -10, FF = 44.2; // the ground ring, a touch shallower than round; the orbit, lifted and tipped back; where the front point stands from their centre, to the right and toward the eye
const Q = Math.SQRT1_2, EU = [Q, -Q], EN = [-Q, -Q]; // across the plates (screen right) and away from the eye, at azimuth 45
const ES = EN.map((n, j) => n * Math.cos(rad(BEAR)) + EU[j] * Math.sin(rad(BEAR))); // back along the stack
const O = EU.map((u, j) => FR * u - FF * EN[j] - SLOT[0] * G0 * ES[j]); // where slot 0 stands

/** The two rings round the stack's centre, as world points: the ground ring, and the orbit, whose far side rises. */
function hoops() {
  const at = (R, d, z, rise) => circ(R, 72).map((q) => [q.u * EU[0] + q.v * d * EN[0], q.u * EU[1] + q.v * d * EN[1], z + q.v * rise]);
  return [at(R1, D1, 0, 0), at(R2, Math.cos(rad(TILT)), Z2, Math.sin(rad(TILT)))];
}

/** A heater shield's outline inset by b, as a ring: the point at (0, tip), flanks that turn up into upright sides, a peaked top. */
function shield(sw, sh, b, tip) {
  const a = (W / 2) * sw, h = H * sh, pk = PK * sw, th = rad(ANG), r = KR * sw, kk = Math.hypot(a, pk) / a;
  const cx = a - r, cy = a * Math.tan(th) + r * Math.tan(Math.PI / 4 - th / 2); // the turn's centre
  const turn = [];
  for (let i = 0; i <= M; i++) { const t = (th - Math.PI / 2) * (1 - i / M); turn.push([cx + (r - b) * Math.cos(t), cy + (r - b) * Math.sin(t)]); }
  const p0 = [0, b / Math.cos(th)], flank = [1, 2, 3].map((k) => [lerp(0, turn[0][0], k / 4), lerp(p0[1], turn[0][1], k / 4)]); // the flank in steps, so it can bend
  const half = [p0, ...flank, ...turn, [a - b, h + (pk * b) / a - b * kk], [0, h + pk - b * kk]];
  const pts = half.concat(half.slice(1, -1).reverse().map(([u, v]) => [-u, v]));
  const s = half.length - 2, corner = { 0: 1.2, [s]: 0.8, [s + 1]: 0.8, [s + 2]: 0.8 }; // point, shoulders and peak: crisp, never sharp
  const lift = (v) => (v < TZ ? v + tip * (1 - v / TZ) ** 2 : v); // the point drawn up, the flanks bending smoothly back to their line by TZ
  return fillet(pts, pts.map((_, i) => (i in corner ? Math.max(0.5, corner[i] - b) : 0)), 3).map(([u, v]) => ({ u, v: lift(v) }));
}

/** How far plate i moves back along the line of sight as the gap opens past rest, spread about the held plate's slot k (0, the middle, at rest). */
const foot = (i, gap, k) => (SLOT[i] - k) * (gap - G0);

/** Plate i in its slot on the stack, moved e back along the line of sight: plate coordinates (u across, v up it as it leans, t back through it) to world. The half left of the ridge is drawn wider: the fan's turn. */
function world(i, e) {
  const th = rad(FAN * i), cs = Math.cos(th), sn = Math.sin(th), w = SLOT[i] * G0;
  return (u, v, t) => {
    const x = u * (u < 0 ? 1 + ASY[i] : 1 - ASY[i]), b = e + v * sn;
    return [O[0] + (w + t) * ES[0] + x * EU[0] + b * EN[0], O[1] + (w + t) * ES[1] + x * EU[1] + b * EN[1], v * cs];
  };
}

/** The camera, fitted to the rings and to every plate at rest and at the widest gap held at either end, so nothing leaves the frame. */
function camera(gtop) {
  const C = Cam(45, 0.27, 1.4), pts = hoops().flat();
  for (const [gap, k] of [[G0, 0], [gtop, SLOT[0]], [gtop, SLOT[N - 1]]]) for (let i = 0; i < N; i++) {
    const X = world(i, foot(i, gap, k));
    for (const q of shield(SW[i], SH[i], 0, TIP[i])) pts.push(X(q.u, q.v, 0), X(q.u, q.v, T));
  }
  fit(C, pts, 200, 166);
  return C;
}

/** Whether a screen point is inside a closed run of screen points. */
function inside(pts, [x, y]) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/** How far a screen point is from the outline of a closed run of screen points. */
function away(pts, [x, y]) {
  return Math.min(...pts.map((a, i) => {
    const b = pts[(i + 1) % pts.length], dx = b[0] - a[0], dy = b[1] - a[1];
    const t = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1), 0, 1);
    return Math.hypot(a[0] + t * dx - x, a[1] + t * dy - y);
  }));
}

/** The silhouette's run, clockwise on screen, from the vertex nearest `from` to the vertex nearest `to`. */
function stretch(h, from, to) {
  const near = (q) => h.reduce((m, p, i) => (Math.hypot(p[0] - q[0], p[1] - q[1]) < Math.hypot(h[m][0] - q[0], h[m][1] - q[1]) ? i : m), 0);
  const out = [], b = near(to);
  for (let i = near(from); ; i = (i + 1) % h.length) { out.push(h[i]); if (i === b) break; }
  return out;
}

const GTOP = 44; // the slider's far end: the camera is fitted to it

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let gmax = value, act = -1, at = null, dg = NaN;

  const C = camera(GTOP), P = proj(C);
  const screen = (i, gap, k) => { const X = world(i, foot(i, gap, k)); return (u, v, t) => P(...X(u, v, t)); };

  const g = mk("g", {}, svg);
  // the two rings, painted first: a plate stands on the ground and leans back, so ring behind it is covered and ring in front always falls below it
  const [ground, orbit] = hoops();
  mk("path", { d: poly(orbit.map((p) => P(...p))), class: "nf lo" }, g);
  mk("path", { d: poly(ground.map((p) => P(...p))), class: "nf" }, g);

  // the plates, back to front, so each covers the ones behind it; the rest mark rides in the back plate's group, under the plates in front
  const plates = [];
  let mark = null;
  for (let i = N - 1; i >= 0; i--) {
    const sw = SW[i], sh = SH[i], ring = shield(sw, sh, 0, TIP[i]), rim = shield(sw, sh, IN, TIP[i]), vs = rim.map((q) => q.v);
    const el = solid(g), ridge = mk("path", { class: "nf" }, el.g);
    if (i === N - 1) mark = mk("path", { class: "nf hi" }, el.g);
    plates[i] = { ring, rim, el, ridge, hold: tween(0), k: 0, peak: H * sh + PK * sw, low: Math.min(...ring.map((q) => q.v)), top: Math.max(...vs), tip: Math.min(...vs) };
  }

  const sil = (pl, F) => hull(ringAt(F, pl.ring, T).concat(ringAt(F, pl.ring, 0)));
  function draw(gap) {
    plates.forEach((pl, i) => {
      const F = screen(i, gap, pl.k), h = sil(pl, F);
      put(pl.el, { sil: poly(h), crease: poly(ringAt(F, pl.rim, 0)) });
      pl.ridge.setAttribute("d", seg(F(0, pl.top, 0), F(0, pl.tip, 0)));
      if (i === N - 1) mark.setAttribute("d", open(stretch(h, F(0, pl.peak, T), F(0, pl.low, T))));
    });
  }

  // Picking reads the rest pose, which never moves: each plate's silhouette at rest, front first.
  const rest = plates.map((pl, i) => sil(pl, screen(i, G0, 0)));
  const Y0 = Math.max(...rest[0].map((q) => q[1])), Y1 = Math.min(...rest[N - 1].map((q) => q[1])); // the front point, the back peak
  function hit(p) {
    const i = rest.findIndex((h) => inside(h, p));
    if (i >= 0) return i;
    const d = rest.map((h) => away(h, p)), m = Math.min(...d);
    return m < 8 ? d.indexOf(m) : -1;
  }

  const sp = spring(G0);
  const B = register(stage, (dt, now) => {
    let moving = stepS(sp, dt), changed = sp.x !== dg;
    for (const pl of plates) {
      const k = tval(pl.hold, now);
      if (k !== pl.k) { pl.k = k; changed = true; }
      if (!tdone(pl.hold, now)) moving = true;
    }
    if (changed) { dg = sp.x; draw(dg); }
    return moving;
  });
  bag.add(B.unregister);
  draw(G0);

  /** Holds plate a still and gives it the bright stroke, staggered out from it; -1 lets go and hands the bright back to the rest mark. */
  function pick(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    plates.forEach((pl, i) => {
      tset(pl.hold, a < 0 ? 0 : SLOT[a], now, Math.abs(i - from) * 40);
      pl.el.sil.classList.toggle("hi", i === a);
    });
    mark.classList.toggle("hi", a < 0); mark.classList.toggle("fo", a >= 0);
    read.textContent = a < 0 ? "rest" : "layer " + (a + 1);
  }
  /** The pointer: what it is over picks the plate; its height, from the front point to the back peak, opens the gaps. */
  function aim(p) {
    at = p;
    const a = p ? hit(p) : -1;
    sp.t = a < 0 ? G0 : lerp(G0, gmax, clamp((Y0 - p[1]) / (Y0 - Y1), 0, 1));
    pick(a);
    B.wake();
  }

  read.textContent = "rest";
  bag.add(pointer(stage, { move: (p) => aim(p), leave: () => aim(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { gmax = v; if (at) aim(at); },
    destroy: bag.dispose,
  };
}

export default {
  name: "shield",
  means: "Three nested shield plates in a ring: the one under the pointer lights and holds, and the rest part from it as the pointer rises.",
  rules: [1, 2, 4, 5],
  range: [24, 34, 44],
  mount,
};
