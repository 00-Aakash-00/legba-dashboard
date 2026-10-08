import { HL } from "../kernel.js";

/**
 * Patchboard: an operator's switchboard, the desk kind. A capped jack cabinet leans back at the rear of a sloped
 * keyshelf: twenty jacks in two framed banks, a lamp cap over each. Every cord comes up out of the shelf. One routes
 * a line: its plug sits in a jack, the line's lamp is lit, and cord, plug and lamp carry the bright. A second line is
 * patched, dim; the other plugs are parked tip up in the shelf. The pointer picks a jack: the nearest parked cord lifts
 * its plug, carries it over on the 700ms curve and seats it, the lamp lights and the bright goes to it; the patched
 * cords sway aside and the parked plugs lean away, staggered by distance. A cord sags with its reach in one arc to
 * every jack, never folded back. The read-out names the line. The slider is the sway, in world units.
 *
 * The pattern: one of many. A hit test on the face, which never moves; a tween per cord for which jack and one for
 * its sway. Paint order is depth order: the cabinet with its banks, jacks and lamps, the shelf and its seats, the
 * patched cords from the lowest jack up (each cord, then its plug, whose boot covers the cord's end), the parked
 * plugs, and last a plug in flight with its cord.
 */
const { Cam, clamp, fit, hull, lerp, open, place, poly, proj, rad, rrect, run,
  tdone, tset, tval, tween, disposer, mk, pointer, register, solid, put } = HL;

const W = 112, H = 176, T = 26, RR = 5, LEAN = 8; // the cabinet: width, height, depth, corner radius, lean back
const COLS = [-39, -13, 13, 39], ROWS = [36, 62, 88, 128, 154], BANKS = [[0, 2], [3, 4]], JR = 5, JH = 2, LUP = 10; // jacks: columns, rows up the face, banks; collar, hole; the lamp over each
const SW = 136, SD = 48, ST = 8, SL = 20, SR = 6, SEAT = 22; // the keyshelf: width, depth, thickness, slope, corners; how far out its seats sit
const PW = 3.6, PL = 12, BR = 2.5, BL = 5, TR = 1.25, TL = 10, CR = 1.7; // a plug: handle, boot, sleeve; the cord's radius
const AZ = -36, K = 0.42, S = 1.2, STEP = 45, OUT = 24, SAG = 0.2; // the camera; the stagger, in ms; how far out a carried plug swings; sag per unit of reach
// Each cord: its seat across the shelf, and the jack it is patched to at rest (-1: parked); LIT routes the line at rest.
const CORDS = [[-52, 4], [-26, 15], [0, -1], [26, -1], [52, -1]], LIT = 1;

const sl = Math.sin(rad(LEAN)), cl = Math.cos(rad(LEAN)), ss = Math.sin(rad(SL)), cs = Math.cos(rad(SL));
const N = [0, cl, sl], NI = [0, -cl, -sl], NS = [0, ss, cs], X = [1, 0, 0], Z = [0, 0, 1];
const add = (a, b, s = 1) => a.map((x, i) => x + b[i] * s), sub = (a, b) => a.map((x, i) => x - b[i]);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => { const l = Math.hypot(...a); return a.map((x) => x / l); };
/** The face's point u across, v up it, t out from it. */
const F = (u, v, t = 0) => [u, -v * sl + t * cl, v * cl + t * sl];
/** The shelf's point s across, r out from the cabinet, h up from its top. */
const G = (s, r, h = 0) => [s, r * cs + h * ss, -r * ss + h * cs];
const NC = COLS.length, NJ = NC * ROWS.length, jack = (j) => [COLS[j % NC], ROWS[Math.floor(j / NC)]];

/** A circle of radius r about c, square to the axis a, as n world points. */
function disc(c, a, r, n = 16) {
  const e1 = unit(cross(a, Math.abs(a[2]) > 0.9 ? X : Z)), e2 = cross(a, e1);
  return Array.from({ length: n }, (_, k) => { const t = (k / n) * 2 * Math.PI; return add(add(c, e1, r * Math.cos(t)), e2, r * Math.sin(t)); });
}
/** The cubic from p0 to p3 at t, and n + 1 points along it. */
const cub = (p0, p1, p2, p3, t) => { const s = 1 - t; return [0, 1, 2].map((m) => s * s * s * p0[m] + 3 * s * s * t * p1[m] + 3 * s * t * t * p2[m] + t * t * t * p3[m]); };
const bez = (p0, p1, p2, p3, n) => Array.from({ length: n + 1 }, (_, k) => cub(p0, p1, p2, p3, k / n));
/** A cord: a band of half-width w along screen points, both ends rounded. */
function tube(ps, w) {
  const tan = ps.map((p, n) => { const a = ps[Math.max(0, n - 1)], b = ps[Math.min(ps.length - 1, n + 1)], m = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / m, (b[1] - a[1]) / m]; });
  const side = (s) => ps.map((p, n) => [p[0] - tan[n][1] * w * s, p[1] + tan[n][0] * w * s]);
  const cap = (p, [tx, ty], s) => Array.from({ length: 7 }, (_, i) => { const c = Math.cos((i / 6) * Math.PI) * w * s, d = Math.sin((i / 6) * Math.PI) * w * s; return [p[0] - ty * c + tx * d, p[1] + tx * c + ty * d]; });
  return poly([...side(1), ...cap(ps[ps.length - 1], tan[ps.length - 1], 1), ...side(-1).reverse(), ...cap(ps[0], tan[0], -1)]);
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let amp = value, act = -2, cur = -1, lit = LIT;
  const C = Cam(AZ, K, S), c2 = Math.sqrt(1 - K * K), E = [Math.sin(rad(AZ)) * c2, Math.cos(rad(AZ)) * c2, K];
  const face = rrect(-W / 2, 0, W / 2, H, RR, 6), inner = rrect(-W / 2 + 2, 2, W / 2 - 2, H - 2, RR - 2, 6);
  const top = rrect(-SW / 2, 0, SW / 2, SD, SR, 6), tin = rrect(-SW / 2 + 1.6, 1.6, SW / 2 - 1.6, SD - 1.6, SR - 1.6, 6);
  // Fitted to the cabinet, the shelf, the parked plugs' tips, and a plug carried out past the cabinet's corners.
  const pts = face.flatMap((q) => [F(q.u, q.v, 0), F(q.u, q.v, -T)]).concat(top.flatMap((q) => [G(q.u, q.v, 0), G(q.u, q.v, -ST)]));
  for (const u of [-W / 2, W / 2]) for (const v of [0, H]) pts.push(F(u, v, OUT / 2 + PL + BL + TL));
  for (const [s] of CORDS) pts.push(G(s, SEAT, BL + PL + TL));
  fit(C, pts, 200, 166);
  const P = proj(C), Q = (ps) => ps.map((p) => P(...p)), onFace = (ring, t) => poly(Q(ring.map((q) => F(q.u, q.v, t))));

  // Back to front: the cabinet and what is on its face, the shelf and its seats, then the cords' layers.
  const g = mk("g", {}, svg), cab = solid(g);
  put(cab, {
    sil: poly(hull(Q(face.map((q) => F(q.u, q.v, 0)).concat(face.map((q) => F(q.u, q.v, -T)))))),
    crease: open(Q(run(inner, (q) => dot([q.nu, -q.nv * sl, q.nv * cl], E) > 0).map((q) => F(q.u, q.v, 0)))),
  });
  // the cabinet's top: a cap that overhangs it a little all round
  const crown = rrect(-W / 2 - 3, -T - 3, W / 2 + 3, 3.5, 3, 4), cin = rrect(-W / 2 - 1.5, -T - 1.5, W / 2 + 1.5, 2, 1.5, 4), cr = (q, v) => F(q.u, v, q.v);
  put(solid(cab.g), { sil: poly(hull(Q(crown.flatMap((q) => [cr(q, H - 1), cr(q, H + 6)])))), crease: open(Q(run(cin, (q) => dot(add([q.nu, 0, 0], N, q.nv), E) > 0).map((q) => cr(q, H + 6)))) });
  // each bank sits in its own frame, so the gap between them reads as the board's two fields
  for (const [a, b] of BANKS) mk("path", { d: onFace(rrect(-W / 2 + 7, ROWS[a] - 11, W / 2 - 7, ROWS[b] + LUP + 6, 3, 4), 0.1), class: "nf lo" }, cab.g);
  const jacks = mk("g", {}, g), lamps = [];
  for (let j = 0; j < NJ; j++) {
    const [u, v] = jack(j);
    mk("path", { d: poly(Q(disc(F(u, v, 0.3), N, JR, 20))) }, jacks);
    mk("path", { d: poly(Q(disc(F(u, v, 0.3), N, JH, 12))), class: "lo" }, jacks);
    lamps.push(mk("circle", { r: 1.35, class: "dot off" }, jacks));
    place(lamps[j], P(...F(u, v + LUP, 0.3)));
  }
  put(solid(g), {
    sil: poly(hull(Q(top.map((q) => G(q.u, q.v, 0)).concat(top.map((q) => G(q.u, q.v, -ST)))))),
    crease: open(Q(run(tin, (q) => dot([q.nu, q.nv * cs, -q.nv * ss], E) > 0).map((q) => G(q.u, q.v, 0)))),
  });
  // each seat: a collar round a hole
  for (const [s] of CORDS) for (const [r, cls] of [[3.9, ""], [2.4, "lo"]]) mk("path", { d: poly(Q(disc(G(s, SEAT, 0.2), NS, r, 16))), class: cls }, g);
  const patched = mk("g", {}, g), parked = mk("g", {}, g), flight = mk("g", {}, g);

  /** A cylinder from a to b, radius ra at a and rb at b: the outline of its two ends. */
  const can = (a, b, ra, rb = ra) => { const ax = unit(sub(b, a)); return poly(hull(Q([...disc(a, ax, ra), ...disc(b, ax, rb)]))); };
  /** A plug whose cord goes in at `top`, pointing along `axis`: a tapered boot, the handle, and the long sleeve, its tip rounded and cut where it goes into the face. */
  function drawPlug(el, top, axis) {
    const b0 = add(top, axis, BL), b1 = add(b0, axis, PL), into = -dot(axis, N), toward = dot(axis, E) > 0;
    const tl = into > 0.05 ? clamp((dot(b1, N) - 0.3) / into, 0, TL) : TL;
    el.tip.setAttribute("d", tl > 0.4 ? poly(hull(Q([...disc(b1, axis, TR), ...disc(add(b1, axis, Math.max(0, tl - 1.2)), axis, TR), ...disc(add(b1, axis, tl), axis, TR * 0.5, 8)]))) : "");
    el.body.setAttribute("d", can(b0, b1, PW));
    el.cap.setAttribute("d", poly(Q(disc(toward ? b1 : b0, axis, PW - 0.9, 14))));
    el.boot.setAttribute("d", can(top, b0, CR * 1.1, BR));
    // the end that faces the camera is painted last: the sleeve's when it points at the viewer, the boot's when it points away
    if (el.toward !== toward) { el.toward = toward; el.g.append(...(toward ? [el.boot, el.body, el.cap, el.tip] : [el.tip, el.body, el.cap, el.boot])); }
  }

  const cords = CORDS.map(([s, rest], i) => {
    const cg = mk("g", {}, parked), wire = mk("path", { class: "sil" }, cg), pg = mk("g", {}, cg);
    const plug = { g: pg, tip: mk("path", { class: "sil" }, pg), body: mk("path", { class: "sil" }, pg), cap: mk("path", { class: "nf lo" }, pg), boot: mk("path", { class: "sil" }, pg), toward: null };
    return { i, s, S: G(s, SEAT, 0), rest, cg, wire, plug, from: null, to: rest, k: tween(1), sw: tween(0), dk: NaN, ds: NaN };
  });

  // A plug's ways in and out: up out of its seat (where it leans aside as its neighbours sway), or back out of a jack.
  const park = (cd, sw) => ({ top: G(cd.s, SEAT, -1), axis: unit(add(NS, [sw * 0.022, 0, 0])), out: NS });
  const seat = (j) => ({ top: F(...jack(j), PL + BL), axis: NI, out: N });
  /** Where a cord's plug is at `now`: at its target, or carried there out of one end and into the other, turned on the way. */
  function pose(cd, now) {
    const k = tval(cd.k, now), sw = tval(cd.sw, now), b = cd.to < 0 ? park(cd, sw) : seat(cd.to);
    if (!cd.from || k >= 1) return { ...b, k, sw };
    const a = cd.from, e = clamp((k - 0.1) / 0.55, 0, 1);
    return { top: cub(a.top, add(a.top, a.out, OUT), add(b.top, b.out, OUT), b.top, k), axis: unit(a.axis.map((x, m) => lerp(x, b.axis[m], e * e * (3 - 2 * e)))), out: a.out.map((x, m) => lerp(x, b.out[m], k) / 2), k, sw };
  }
  /** The cord: out of its seat, into the boot along the plug, sagging and swaying with its reach; its bends stay over the
   * shelf, and the boot's shortens while the plug, turning in the air, points away from the cord's way, so it never hooks. */
  const above = (p, m) => add(p, NS, Math.max(0, m - dot(p, NS)));
  function cordPts(cd, p) {
    const A = cd.S, B = p.top, d = Math.hypot(...sub(B, A)), g = SAG * d, m = Math.min(CR + 0.5, dot(B, NS)), w = p.sw * Math.min(1, d / 80);
    if (d < 1.5) return null;
    const P2 = add(B, p.axis, -0.3 * d * clamp(1 + 1.5 * dot(p.axis, unit(sub(B, A))), 0, 1)), P1 = add(A, unit(sub(P2, A)), 0.3 * d);
    return bez(A, above(add(P1, [w, 0, -g / 2]), m), above(add(P2, [w, 0, -g]), m), B, 28);
  }
  function draw(cd, now) {
    const p = pose(cd, now);
    if (p.k === cd.dk && p.sw === cd.ds) return;
    cd.dk = p.k; cd.ds = p.sw; drawPlug(cd.plug, p.top, p.axis);
    const ps = cordPts(cd, p); cd.wire.setAttribute("d", ps ? tube(Q(ps), CR * S) : "");
  }
  /** Puts a cord in its layer: in flight, patched (kept from the lowest jack up), or parked. */
  function layer(cd, flying) {
    const L = flying ? flight : cd.to < 0 ? parked : patched;
    if (cd.cg.parentNode === L) return;
    L.append(cd.cg);
    if (L === patched) cords.filter((c) => c.cg.parentNode === patched).sort((a, b) => jack(a.to)[1] - jack(b.to)[1]).forEach((c) => patched.append(c.cg));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const cd of cords) {
      const flying = !tdone(cd.k, now);
      draw(cd, now); layer(cd, flying);
      if (flying || !tdone(cd.sw, now)) moving = true;
    }
    return moving;
  });
  bag.add(B.unregister);

  /** Lights jack j's line: the cord already in it, or the parked cord nearest it carries its plug there (-1 sends every cord back); the patched cords sway aside, staggered out from it. */
  function choose(j) {
    if (j === act) return;
    const now = performance.now();
    let a = j < 0 ? -1 : cords.findIndex((cd) => cd.rest === j);
    if (j >= 0 && a < 0) a = cords.filter((cd) => cd.rest < 0).reduce((m, cd) => (Math.abs(cd.s - jack(j)[0]) < Math.abs(m.s - jack(j)[0]) ? cd : m)).i;
    const from = a >= 0 ? a : cur >= 0 ? cur : LIT, on = j < 0 ? CORDS[LIT][1] : j;
    act = j; cur = a; lit = a < 0 ? LIT : a;
    cords.forEach((cd) => {
      const to = cd.i === a ? j : cd.rest, delay = Math.abs(cd.i - from) * STEP;
      if (to !== cd.to) { cd.from = pose(cd, now); cd.to = to; cd.k = tween(0); cd.dk = NaN; tset(cd.k, 1, now, cd.i === a ? 0 : delay); }
      tset(cd.sw, a < 0 || cd.i === a ? 0 : Math.sign(cd.i - a) * amp, now, delay);
      for (const el of [cd.wire, cd.plug.tip, cd.plug.body, cd.plug.boot]) el.classList.toggle("hi", cd.i === lit);
      layer(cd, !tdone(cd.k, now));
    });
    lamps.forEach((el, k) => el.setAttribute("class", k === on ? "dot" : "dot off"));
    read.textContent = j < 0 ? "rest" : `line ${j + 1}`;
    B.wake();
  }

  // The hit test reads the face, which never moves: the pointer on the face's plane, then the nearest jack.
  const o0 = P(...F(0, 0)), eu = sub(P(...F(1, 0)), o0), ev = sub(P(...F(0, 1)), o0), det = eu[0] * ev[1] - eu[1] * ev[0];
  const near = (list, w) => list.reduce((m, x, i) => (Math.abs(x - w) < Math.abs(list[m] - w) ? i : m), 0);
  function hit([x, y]) {
    const qx = x - o0[0], qy = y - o0[1], u = (qx * ev[1] - qy * ev[0]) / det, v = (eu[0] * qy - eu[1] * qx) / det;
    if (Math.abs(u) > W / 2 || v < 0 || v > H) return -1;
    return near(ROWS, v) * NC + near(COLS, u);
  }

  choose(-1);
  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());
  return { set: (v) => { amp = v; const j = act; act = -2; choose(j); }, destroy: bag.dispose };
}

export default {
  name: "patchboard",
  means: "A switchboard: pick a jack and the nearest parked cord lifts its plug from the shelf and seats it there; the patched cords sway aside.",
  rules: [1, 2, 4, 6, 8],
  range: [2, 7, 12],
  mount,
};
