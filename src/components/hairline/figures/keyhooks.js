import { HL } from "../kernel.js";

/**
 * Keyhooks: a key rack, a short plaque screwed to the wall with three hooks in
 * a row along its foot, every hook bare. Each hook is a round rod screwed in
 * low on the face, standing out and turned up at its end into a ball. At rest
 * the two outer hooks hang low, out over the plaque's lower edge, and the
 * middle one, where the first key will hang, is lifted and carries the bright
 * stroke. The hook under the pointer lifts and its neighbours follow, less and
 * later, staggered outwards from it on the 700ms lift curve. The slider is the
 * lift, in degrees.
 *
 * The pattern: discrete items. Tweens, a stagger by distance, and a hit test
 * against each hook's rest pose (its spine on screen), which never moves.
 */
const {
  Cam, circ, clamp, facing, fit, poly, prism, proj, rad, rings,
  tdone, tset, tval, tween, disposer, mk, place, pointer, put, register, solid,
} = HL;

const N = 3, GAP = 20, M = 14, SH = 9, BT = 7, BH = 18, BL = 2 * M + (N - 1) * GAP, ZM = 3.5, S = 4.6; // hooks and their spacing; the plaque's end margin, and how far right the hooks sit on it, since they stand out down-left; its thickness, height, length; the hooks' height on it, low enough that they stand out over its lower edge; the scale
const R = 1.3, LA = 10, RB = 5, TL = 3.5, BALL = 2.4, FOOT = 0.7; // a hook: the rod's radius, its straight arm, the bend's radius, the straight tip, the ball on its end; how deep the rod's foot shows on the plaque's face (of r)
// A hook held still never lays its arm along the plaque's lower edge: lifted 26° or less, the arm crosses it; 36° or more, it clears it.
// UP and FALL hold every pose out of the band between; BH puts the crease where the marked ball clears it and a chosen ball crosses it.
const BASE = -22, FALL = [1, 0.65, 0.1], MARK = 1, UP = 15, STEP = 45, MAXT = 28; // hooks angle up 22° (lifting is −); share of the lift by distance; the hook lifted at rest, and how far; stagger ms; the most lift, which keeps the ball off the wall
const REST = Array.from({ length: N }, (_, i) => BASE - (i === MARK ? UP : 0)); // -22, -37, -22: the marked hook alone is lifted

/** A hook's centreline in its own plane, s out from the face and t up: the arm, a quarter turn up, the tip. */
const LINE = [[0, 0], [LA / 2, 0], [LA, 0]];
for (let k = 1; k <= 6; k++) LINE.push([LA + RB * Math.cos(rad(15 * k - 90)), RB + RB * Math.sin(rad(15 * k - 90))]);
LINE.push([LA + RB, RB + TL]);

/** Distance from screen point p to the segment a–b. */
function segDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
  const t = L ? clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L, 0, 1) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

/**
 * The outline of a round rod r wide on screen along the screen polyline c: its two sides, a round end, and its foot,
 * the near half of the circle where it meets the plaque's face, foreshortened to `foot` of r deep.
 */
function rod(c, r, foot) {
  const nr = c.map((p, j) => {
    const a = c[Math.max(0, j - 1)], b = c[Math.min(c.length - 1, j + 1)], m = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [(a[1] - b[1]) / m, (b[0] - a[0]) / m];
  });
  const at = (j, f, sg, q = 1) => {
    const [nx, ny] = nr[j];
    return [c[j][0] + sg * r * (nx * Math.cos(f) + q * ny * Math.sin(f)), c[j][1] + sg * r * (ny * Math.cos(f) - q * nx * Math.sin(f))];
  };
  const L = c.length - 1, out = [];
  for (let j = 0; j <= L; j++) out.push(at(j, 0, 1));
  for (let j = 1; j < 8; j++) out.push(at(L, (Math.PI * j) / 8, 1));
  for (let j = L; j >= 0; j--) out.push(at(j, 0, -1));
  for (let j = 1; j < 8; j++) out.push(at(0, (Math.PI * j) / 8, -1, foot));
  return out;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = clamp(value, 0, MAXT);

  /** World point of hook-plane (s, t) for the hook at x, tilted th degrees about its foot on the plaque's face (negative lifts it). */
  const W = (x, th) => {
    const c = Math.cos(rad(th)), s = Math.sin(rad(th));
    return ([u, v]) => [x, BT + u * c + v * s, ZM - u * s + v * c];
  };
  const hx = (i) => M + SH + i * GAP, tipOf = (w) => w(LINE[LINE.length - 1]);

  // The camera is fitted to the plaque and to the end hooks at both extremes of their lift, which hold every pose between.
  const C = Cam(45, 0.5, S), ends = [];
  for (const x of [hx(0), hx(N - 1)]) for (const th of [BASE + 2, BASE - MAXT - 2]) ends.push(...LINE.map(W(x, th)), tipOf(W(x, th)).map((v, j) => v + (j === 2 ? BALL : 0)));
  fit(C, [[0, 0, 0], [BL, BT, 0], [0, 0, BH], [BL, BT, BH], ...ends], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const [ring, inner] = rings(0, 0, BL, BT, 3, 1.2);
  put(solid(g), prism(P, front, ring, inner, 0, BH));
  // two screw heads, one at each end, hold the plaque to the wall
  for (const x of [M * 0.3, BL - M * 0.3]) place(mk("circle", { r: 2.6, class: "dot m" }, g), P(x, BT, BH * 0.75));

  // A hook is a rod and its ball, each drawn as its silhouette alone; the rod's foot is the only joint with the face.
  const hooks = [];
  for (let i = 0; i < N; i++) {
    const cls = "sil" + (i === MARK ? " hi" : "");
    const h = { x: hx(i), rod: mk("path", { class: cls }, g), ball: mk("path", { class: cls }, g), tw: tween(REST[i]), drawn: NaN };
    h.parts = [h.rod, h.ball];
    hooks.push(h);
  }

  /** Each hook's rest spine on screen: from the plaque's top above it, down to its foot, out along the arm and up to the ball. */
  const o = P(0, 0, 0);
  const spines = hooks.map((h, i) => {
    const w = W(h.x, REST[i]);
    return [P(h.x, BT, BH - 2), P(...w(LINE[0])), P(...w(LINE[2])), P(...tipOf(w))];
  });
  const HIT = (P(GAP, 0, 0)[0] - o[0]) * 0.62;
  /** The hook whose rest spine is nearest the point, or -1 when none is within HIT. */
  function hit(p) {
    let best = -1, bd = HIT;
    spines.forEach((sp, i) => {
      for (let k = 1; k < sp.length; k++) { const d = segDist(p, sp[k - 1], sp[k]); if (d < bd) { bd = d; best = i; } }
    });
    return best;
  }

  const ballRing = circ(BALL * S, 20);
  function draw(h, th) {
    if (th === h.drawn) return;
    h.drawn = th;
    const w = W(h.x, th), [bx, by] = P(...tipOf(w));
    h.rod.setAttribute("d", poly(rod(LINE.map((q) => P(...w(q))), R * S, FOOT)));
    h.ball.setAttribute("d", poly(ballRing.map((q) => [bx + q.u, by + q.v])));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const h of hooks) { draw(h, tval(h.tw, now)); if (!tdone(h.tw, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  let act = -1;
  /** Lifts hook a and its neighbours less (-1 puts them all back). The stagger spreads out from the hook chosen, or the one let go. */
  function setActive(a, again = false) {
    if (a === act && !again) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    hooks.forEach((h, i) => {
      tset(h.tw, a < 0 ? REST[i] : BASE - lift * FALL[Math.abs(i - a)], now, Math.abs(i - from) * STEP);
      for (const el of h.parts) el.classList.toggle("hi", i === (a < 0 ? MARK : a));
    });
    read.textContent = a < 0 ? "rest" : `hook ${a + 1} · 0`;
    B.wake();
  }

  read.textContent = "rest";
  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = clamp(v, 0, MAXT); if (act >= 0) setActive(act, true); },
    destroy: bag.dispose,
  };
}

export default {
  name: "keyhooks",
  means: "A key rack with every hook bare: the hook under the pointer lifts for a key, and its neighbours follow in turn.",
  rules: [1, 2, 4, 5],
  range: [22, 25, 28],
  mount,
};
