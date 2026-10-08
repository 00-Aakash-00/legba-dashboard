import { HL } from "../kernel.js";

/**
 * Signpost: a fingerpost on its plinth with three boards. Two are signed, each
 * lettered with a place name in plain rules; the third is blank inside its
 * frame, a way to nowhere, and holds the one bright stroke. At rest the boards
 * zigzag: up-left, the blank one out to the right, down-left. The pointer picks
 * a board (the one under it, or the one at its height on its side of the post),
 * and that board turns on the post to face the viewer, levelling out and opening
 * its face: the nearer the post the pointer is, the further it comes round. Each
 * board stops just short of face-on, so it keeps to its side of the post and no
 * board crosses another. The boards beside it follow less, staggered outwards.
 * The blank board never gets a name. The slider is the neighbours' share.
 *
 * The pattern: one of many, on a post. Tweens for which board (the stagger), one
 * spring for where the pointer is, and a hit test on the boards' rest outlines
 * and fixed roots, so a board swinging out from under the pointer keeps it.
 */
const {
  Cam, circ, clamp, fillet, fit, hull, lerp, open, poly, prism, proj, rad, ringAt, rings, run, facing,
  spring, stepS, tdone, tset, tval, tween, disposer, mk, pointer, put, register, solid,
} = HL;

const R = 4.2, ZP = 122, TK = 2.6, H = 24, TIP = 13, BD = 3.2, STEP = 45, BASE = 27;
/** Where a board starts, inside the post: behind it the post hides the root, in front of it the board covers the post's edge. */
const U0 = R - 1;
/**
 * The boards, top to bottom: the height of each one's lower edge, its length to the shoulder of its point, its rest
 * yaw in degrees (0 runs down to the right, 90 down to the left), the most it swings, round to face the viewer (the
 * sign says which way round; each stops a few degrees short of face-on, 135° or -45°, so it never changes sides of the
 * post and never nears edge-on), and its lettering, a share of the face per line.
 */
const ARMS = [
  { z: 92, l: 70, rest: 160, swing: -22, lines: [0.7, 0.42] },
  { z: 64, l: 66, rest: -25, swing: -17, lines: [] },
  { z: 36, l: 60, rest: 105, swing: 25, lines: [0.78, 0.5] },
], BLANK = 1;
/** The share of its swing a picked board takes with the pointer out at its point; it takes it all at the post. */
const REACH = 0.7;

/** A convex outline moved in by b on every side, or out for a negative b (the outline runs counter-clockwise). */
function inset(pts, b) {
  const n = pts.length, lines = pts.map((p, i) => {
    const q = pts[(i + 1) % n], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy);
    return [p[0] - (dy / l) * b, p[1] + (dx / l) * b, dx, dy];
  });
  return lines.map((a, i) => {
    const c = lines[(i + n - 1) % n], t = ((a[0] - c[0]) * a[3] - (a[1] - c[1]) * a[2]) / (c[2] * a[3] - c[3] * a[2]);
    return [c[0] + c[2] * t, c[1] + c[3] * t];
  });
}

/** A board of length l in its own plane, u out from the post and v up: a board with a pointed end, the frame of its face, its hit zone, and its lettering, a rule per line, centred, as a fingerpost is signed. */
function board(l, lines) {
  const out = [[U0, 0], [l, 0], [l + TIP, H / 2], [l, H], [U0, H]];
  const b = { shape: fillet(out, [4.5, 2, 2.6, 2, 4.5]), frame: fillet(inset(out, BD), [2.6, 1.4, 1.6, 1.4, 2.6]), zone: inset(out, -3) };
  const u0 = U0 + BD + 3, u1 = l - 1, c = (u0 + u1) / 2;
  b.rules = lines.map((f, k) => {
    const v = H / 2 + 3.6 * (lines.length - 1 - 2 * k), h = (f * (u1 - u0)) / 2;
    return [[c - h, v], [c + h, v]];
  });
  return b;
}

/** Where the points of a board's face fall at yaw th, on its nearer side; and whether the board stands in front of the post. */
function orient(P, th, z0) {
  const c = Math.cos(rad(th)), s = Math.sin(rad(th)), near = c - s >= 0 ? 1 : -1;
  const at = (pts, side = near) => pts.map(([u, v]) => P(u * c - side * (TK / 2) * s, u * s + side * (TK / 2) * c, z0 + v));
  return { at, near, fore: c + s > 0 };
}

/** Whether a screen point lies inside a convex outline. */
function inside(pts, [x, y]) {
  let side = 0;
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length], c = Math.sign((bx - ax) * (y - ay) - (by - ay) * (x - ax));
    if (c && side && c !== side) return false;
    side = side || c;
  }
  return true;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let share = value;

  // Fitted to the plinth, the cap, and every yaw a board passes through on its swing, so no swing leaves the frame.
  const C = Cam(45, 0.5, 1.74), pts = [[-BASE, -BASE, -6], [BASE, BASE, -6], [BASE, -BASE, -6], [-BASE, BASE, -6], [0, 0, ZP + 5]];
  for (const a of ARMS) for (let k = 0; k <= 6; k++) for (const z of [a.z, a.z + H]) {
    const th = rad(a.rest + (a.swing * k) / 6);
    pts.push([(a.l + TIP) * Math.cos(th), (a.l + TIP) * Math.sin(th), z]);
  }
  fit(C, pts, 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const [pr, pi] = rings(-BASE, -BASE, BASE, BASE, 10, 1.8);
  put(solid(g), prism(P, front, pr, pi, -6, 0));
  // Boards that point away are painted before the post, boards that point toward the viewer after it; each layer lowest first.
  // The collar goes down before the post, which stands on its top and so hides the collar's far rim.
  const back = mk("g", {}, g), post = mk("g", {}, g), fore = mk("g", {}, g);
  put(solid(post), prism(P, front, circ(R + 2.4, 16), circ(R + 1.2, 16), 0, 6));
  put(solid(post), prism(P, front, circ(R, 16), circ(R - 1.2, 16), 6, ZP));
  const foot = circ(R + 2.4, 16), top = circ(R - 0.2, 16), inner = circ(R - 1.4, 16);
  put(solid(post), { sil: poly(hull(ringAt(P, foot, ZP).concat(ringAt(P, top, ZP + 5)))), crease: open(ringAt(P, run(inner, front), ZP + 5)) });

  const arms = ARMS.map((a) => {
    const grp = mk("g", {}, back), b = board(a.l, a.lines);
    const parts = { back: mk("path", { class: "lo" }, grp), face: mk("path", { class: "sil" }, grp), border: mk("path", { class: "nf lo" }, grp) };
    parts.rule = b.rules.map(() => mk("path", { class: "nf" }, grp));
    return { ...a, ...b, ...parts, grp, e: tween(0), drawn: NaN, fore: null };
  });
  /** The bright stroke on a board's face; its thickness line stays dim, as Riffle's cards keep their backs. */
  const lit = (a, on) => a.face.classList.toggle("hi", on);
  lit(arms[BLANK], true);
  const layer = () => { for (const a of [...arms].reverse()) (a.fore ? fore : back).append(a.grp); };

  /** Draws board a at yaw th, unless it is already there; says whether it crossed to the other side of the post. */
  function draw(a, th) {
    if (th === a.drawn) return false;
    a.drawn = th;
    const q = orient(P, th, a.z);
    a.back.setAttribute("d", poly(q.at(a.shape, -q.near)));
    a.face.setAttribute("d", poly(q.at(a.shape)));
    a.border.setAttribute("d", poly(q.at(a.frame)));
    a.rules.forEach((r, k) => a.rule[k].setAttribute("d", open(q.at(r))));
    if (q.fore === a.fore) return false;
    a.fore = q.fore;
    return true;
  }

  // The spring is the picked board's turn in degrees; every board turns from its own rest by its tween's share of it,
  // the same way round as its own swing and never past it, so the boards beside the picked one follow less.
  let sw = spring(0);
  const B = register(stage, (dt, now) => {
    let moving = stepS(sw, dt), cross = false;
    for (const a of arms) {
      if (draw(a, a.rest + Math.sign(a.swing) * Math.min(tval(a.e, now) * sw.x, Math.abs(a.swing)))) cross = true;
      if (!tdone(a.e, now)) moving = true;
    }
    if (cross) layer();
    return moving;
  });
  bag.add(B.unregister);

  // The hit test never reads the pose on screen: a board's rest outline picks it, and elsewhere the nearest root on the
  // post, only on that board's side of it, so the pointer never lights a board across the post.
  const zones = arms.map((a) => orient(P, a.rest, a.z).at(a.zone));
  const px = P(0, 0, 0)[0], ry = ARMS.map((a) => P(0, 0, a.z + H / 2)[1]), gap = ry[1] - ry[0];
  const span = 0.8 * (P(80 * Math.SQRT1_2, -80 * Math.SQRT1_2, 0)[0] - px);
  /** Where each board's point is across at rest: the pointer between it and the post draws the board round. */
  const tips = ARMS.map((a) => P((a.l + TIP) * Math.cos(rad(a.rest)), (a.l + TIP) * Math.sin(rad(a.rest)), 0)[0]);
  function hit(p) {
    const over = zones.findIndex((z) => inside(z, p));
    if (over >= 0) return over;
    if (Math.abs(p[0] - px) > span + 40 || p[1] < ry[0] - 1.5 * gap || p[1] > ry[2] + 1.6 * gap) return -1;
    let best = 0;
    ry.forEach((v, i) => { if (Math.abs(p[1] - v) < Math.abs(p[1] - ry[best])) best = i; });
    return (p[0] - px) * (tips[best] - px) > 0 ? best : -1;
  }

  let act = -1;
  /** Retargets every board's share of the swing, staggered out from board `from`. */
  function engage(from) {
    const now = performance.now();
    arms.forEach((a, i) => tset(a.e, act < 0 ? 0 : i === act ? 1 : share ** Math.abs(i - act), now, Math.abs(i - from) * STEP));
    B.wake();
  }
  function choose(a, x) {
    if (a >= 0) {
      // the board's swing times the reach, from REACH with the pointer out at its point to 1 at the post and past it.
      // With every board at rest the spring starts on its target, so the boards swing straight there, not by an old one.
      const t = Math.abs(arms[a].swing) * lerp(REACH, 1, clamp((tips[a] - x) / (tips[a] - px), 0, 1)), now = performance.now();
      if (act < 0 && arms.every((m) => tdone(m.e, now))) sw = spring(t); else sw.t = t;
    }
    if (a !== act) {
      const from = a >= 0 ? a : act;
      act = a;
      arms.forEach((m, i) => lit(m, a < 0 ? i === BLANK : i === a));
      read.textContent = a < 0 ? "rest" : `board ${a + 1} · ${arms[a].lines.length ? "signed" : "blank"}`;
      engage(from);
    }
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => choose(hit(p), p[0]), leave: () => choose(-1, 0) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { share = v; if (act >= 0) engage(act); },
    destroy: bag.dispose,
  };
}

export default {
  name: "signpost",
  means: "A signpost with one board blank: the board the pointer picks turns round to face you, and the boards beside it follow less.",
  rules: [1, 2, 4, 5, 8],
  range: [0.15, 0.35, 0.6],
  mount,
};
