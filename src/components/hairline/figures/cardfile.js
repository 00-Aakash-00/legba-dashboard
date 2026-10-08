import { HL } from "../kernel.js";

/**
 * Cardfile: a card file holding three plan cards, each whole and upright, two
 * chips on each. A divider stands in front of them, hung by a hooked ear at each
 * top corner, its index tab over the far one, and each side wall's rim has a
 * notch cut to seat an ear. The far ear sits in its notch; the near one has
 * jumped out and stands on the rim well behind it, so the divider hangs askew.
 * That empty notch is the one bright stroke: the holder let go, not what it
 * holds. The pointer lifts the ear and brings it forward on a spring, the nearer
 * the more, but it stops in the air by the notch's back lip and never drops in,
 * so the notch stays empty; the cards barely stir. The slider is how far it comes.
 *
 * The pattern: a field (Terrain's). Springs, a falloff by distance from where
 * the divider rests, which never moves, so a moving divider cannot flicker.
 */
const {
  Cam, facing, fillet, fit, hull, open, poly, proj, rad, ringAt, rrect, run, seg,
  spring, stepS, disposer, mk, pointer, register,
} = HL;

// The box: walls WH high and WT thick, corners WR round. Each side wall's rim has a notch NW wide and ND deep at y = YS.
const X0 = -4, X1 = 56, Y0 = -9, Y1 = 40, WH = 20, WR = 6, WT = 3.5, YS = 26, NW = 10, ND = 5;
// A plan card is CW × CH; the cards, back to front: where each stands (x at its far edge, y) and how far it leans back. The front
// one stands nearer the far wall: its near edge ends behind the divider short of the near ear, and the others' stand clear past it.
const CW = 40, CH = 30, CARDS = [{ x: 9, y: 0, lean: -10 }, { x: 9, y: 6.5, lean: -6 }, { x: 0, y: 13, lean: -2 }];
// The divider: D × DH, a unit clear of each wall, and an EW-wide ear at each top corner, short of the wall's outer face: its foot as
// deep as a notch, its hook RISE above the top edge. Its index tab rises TH over the far ear and runs to TW: that end's hook, which
// hides the far notch's back half. Seated, an ear's foot, VE up the divider, rests on its notch's floor and the divider's own foot
// on the box's floor.
const D = X1 - X0 - 2 * WT - 2, EW = WT + 0.5, VE = WH - ND, DH = VE + ND, RISE = 3, TW = 9, TH = 5.5;
// It turns about the foot of its far ear. The near ear's foot rests on the rim BACK behind the notch's middle, bare rim between; at a
// full give it has come forward to HOLD behind and LIFT up, poised over the rim by the notch's back lip, never in it, and the divider's
// own edge stops short of the lit notch. Both keep its face filling all that shows through the notch. It leans LEAN° forward at rest.
const FAR = [X0 + WT + 1 - EW / 2, YS, WH - ND], BACK = 11, HOLD = 9, LIFT = 4, LEAN = 4, STIR = [0.8, 1.6, 3], REACH = 170;

/** A run of points ordered left to right on screen. */
const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());

// The notch's profile across a side wall, (y, z) from its near end on the rim to its far one, its corners rounded.
const NOTCH = fillet([[YS + NW / 2 + 9, WH], [YS + NW / 2, WH], [YS + NW / 2, WH - ND], [YS - NW / 2, WH - ND], [YS - NW / 2, WH],
  [YS - NW / 2 - 9, WH], [YS - NW / 2 - 9, 0], [YS + NW / 2 + 9, 0]], [0, 0.8, 1.4, 1.4, 0.8, 0, 0, 0]).slice(5, 25);
// Seen from the front, a notch's near side hides its own floor up to y = YB; ZE is where that floor's back edge passes behind it.
const YB = YS + NW / 2 - WT, ZE = WH - ND + WT * Math.sqrt(2 / 3), SEEN = [[YB, WH - ND], ...NOTCH.filter(([y]) => y < YB)];

/** A ring's run at the rim, as world [x, y] left to right on screen, cut in two where its side at x crosses the notch. */
function halves(P, ring, keep, x) {
  let s = run(ring, keep).map((q) => [q.u, q.v]);
  if (P(s[0][0], s[0][1], WH)[0] > P(s[s.length - 1][0], s[s.length - 1][1], WH)[0]) s = s.reverse();
  const on = (q) => Math.abs(q[0] - x) < 1e-6, i = s.findIndex((q, k) => on(q) && s[k + 1] && on(s[k + 1]) && (q[1] - YS) * (s[k + 1][1] - YS) < 0);
  return [s.slice(0, i + 1), s.slice(i + 1)];
}

/** The box, which never moves: `far` is painted before the file, `near` after it; each entry is [d, class]. */
function box(P, front, outer, inner) {
  const at = (x) => ([y, z]) => P(x, y, z), rim = (pts) => pts.map(([x, y]) => P(x, y, WH)), xf = X0 + WT, xn = X1 - WT;
  const [n0, n1] = [NOTCH[0], NOTCH[NOTCH.length - 1]], back = (q) => !front(q);
  const oT = LR(ringAt(P, run(outer, front), WH)), oB = LR(ringAt(P, run(outer, front), 0));
  // the far wall, seen from inside: its outline dips into the notch, down the near side's edge and back along the floor behind it
  const [fiL, fiR] = halves(P, inner, back, xf), [foL, foR] = halves(P, outer, back, X0);
  const far = [
    [poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, WH)))), "fo"],
    [open([oT[0], ...rim(foL), at(X0)(n0), ...[...NOTCH.slice(0, 5), [YS + NW / 2, ZE]].map(at(xf)), ...SEEN.map(at(X0)), ...rim(foR), oT[oT.length - 1]]), "nf sil"],
    [open([...rim(fiL), at(xf)(n0)]) + open([...[[YS + NW / 2, ZE], ...NOTCH.slice(5)].map(at(xf)), ...rim(fiR)]), "nf"],
    [seg(at(X0)(n1), at(xf)(n1)), "nf lo"],
    [open(ringAt(P, run(inner, back), 2)), "nf lo"],
  ];
  // the near walls: opaque up to the rim and down into the notch to its outer edge; its floor and cut faces filled behind that edge
  const [iL, iR] = halves(P, inner, front, xn), [oL, oR] = halves(P, outer, front, X1), hx = (X0 + X1) / 2, onFront = (ring) => ring.map((q) => P(q.u, Y1, q.v));
  const near = [
    [poly([...rim(iL), at(xn)(n0), ...NOTCH.map(at(X1)), at(xn)(n1), ...rim(iR), oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]), "fo"],
    [poly([...NOTCH.map(at(X1)), ...NOTCH.map(at(xn)).reverse()]), "fo"],
    [open([...rim(oL), at(X1)(n0)]) + open([at(X1)(n1), ...rim(oR)]), "nf lo"],
    [open([...rim(iL), at(xn)(n0)]) + open([...SEEN.map(at(xn)), ...rim(iR)]), "nf"],
    [open([oT[0], ...oB, oT[oT.length - 1]]), "nf sil"],
    // a label holder on the front: its frame, and the window
    [poly(onFront(rrect(hx - 13, 6, hx + 13, 14, 2, 4))), "nf"],
    [poly(onFront(rrect(hx - 10.5, 7.8, hx + 10.5, 12.2, 1, 4))), "nf lo"],
    // the near notch, empty: the seat its ear jumped, and the one bright stroke
    [open([at(xn)(n0), ...NOTCH.map(at(X1)), at(xn)(n1)]), "nf hi"],
  ];
  return { far, near };
}

const CARD = fillet([[0, 0], [CW, 0], [CW, CH], [0, CH]], [1, 1, 3, 3]);
// The divider's outline in its own plane (u across from its far edge, v up from its foot), 5 points a corner: its near ear is 10–34.
const DIV = fillet([[0, 0], [D, 0], [D, VE], [D + EW, VE], [D + EW, DH + RISE], [D, DH + RISE], [D, DH], [TW, DH], [TW, DH + TH],
  [-EW, DH + TH], [-EW, VE], [0, VE]], [1, 1, 0.5, 1, 1, 0.9, 0.5, 0.6, 0.9, 0.9, 1, 0.5]);

/** The divider's frame at give g: `a` runs from its far ear's foot to its near one's, `up` is square to it and leaned forward. */
function frame(g) {
  const L = D + EW, dy = -BACK + (BACK - HOLD) * g, dz = ND + LIFT * g;
  const a = [Math.sqrt(L * L - dy * dy - dz * dz) / L, dy / L, dz / L];
  const k = Math.hypot(a[2] * a[0], a[2] * a[1], 1 - a[2] * a[2]), u0 = [-a[2] * a[0] / k, -a[2] * a[1] / k, (1 - a[2] * a[2]) / k];
  const f = [u0[1] * a[2] - u0[2] * a[1], u0[2] * a[0] - u0[0] * a[2], u0[0] * a[1] - u0[1] * a[0]];
  const t = rad(LEAN * (1 - g)), c = Math.cos(t), s = Math.sin(t);
  return { a, up: u0.map((v, i) => v * c + f[i] * s) };
}

/** The world point (u, v) of the divider in frame q. */
const onDiv = (q, u, v) => FAR.map((p, i) => p + (u + EW / 2) * q.a[i] + (v - VE) * q.up[i]);

/** The share of the give at u reaches from where the divider rests: 1 → .12, and no further. */
const falloff = (u) => (u <= 0.4 ? 1 : u >= 1 ? 0.12 : 1 - ((u - 0.4) / 0.6) * 0.88);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let give = value, near = 0;

  const C = Cam(45, 0.5, 3.9);
  const q0 = frame(0), q1 = frame(1);
  fit(C, [[X0, Y0, 0], [X1, Y1, 0], [X1, Y0, 0], [X0, Y1, 0], [CARDS[0].x, CARDS[0].y + CH * Math.sin(rad(CARDS[0].lean)), CH],
    onDiv(q0, -EW, DH + TH), onDiv(q0, D + EW, DH + RISE), onDiv(q1, D + EW, DH + RISE)], 200, 166);
  const P = proj(C), front = facing(C), Pw = (w) => P(w[0], w[1], w[2]);
  const outer = rrect(X0, Y0, X1, Y1, WR, 6), inner = rrect(X0 + WT, Y0 + WT, X1 - WT, Y1 - WT, WR - WT, 6);
  const paths = box(P, front, outer, inner);

  const g = mk("g", {}, svg);
  for (const [d, cls] of paths.far) mk("path", { d, class: cls }, g);
  const cards = CARDS.map((cd) => {
    const grp = mk("g", {}, g);
    return { ...cd, face: mk("path", {}, grp), marks: mk("path", { class: "nf lo" }, grp), sp: spring(0), drawn: NaN };
  });
  // the divider is a medium line like the cards, inside the box's bright outline
  const div = { face: mk("path", {}, mk("g", {}, g)), sp: spring(0), drawn: NaN };
  for (const [d, cls] of paths.near) mk("path", { d, class: cls }, g);
  // the near ear stands on the rim, in front of it: painted after the walls
  const eg = mk("g", {}, g);
  div.earFill = mk("path", { class: "fo" }, eg);
  div.ear = mk("path", { class: "nf" }, eg);

  function drawCard(cd) {
    const t = rad(cd.lean + cd.sp.x), f = (u, v) => P(cd.x + u, cd.y + v * Math.sin(t), v * Math.cos(t));
    const chip = (u0, w) => poly(rrect(u0, CH - 7.5, u0 + w, CH - 3.5, 2, 3).map((s) => f(s.u, s.v)));
    cd.face.setAttribute("d", poly(CARD.map(([u, v]) => f(u, v))));
    cd.marks.setAttribute("d", chip(3.5, 10) + chip(CW - 10.5, 7));
  }
  function drawDivider(gv) {
    const q = frame(gv), f = (u, v) => Pw(onDiv(q, u, v)), ear = DIV.slice(10, 35).map(([u, v]) => f(u, v));
    div.face.setAttribute("d", poly(DIV.map(([u, v]) => f(u, v))));
    div.earFill.setAttribute("d", poly(ear));
    div.ear.setAttribute("d", open(ear));
  }

  const B = register(stage, (dt) => {
    let moving = false;
    cards.forEach((cd) => {
      if (stepS(cd.sp, dt)) moving = true;
      if (cd.sp.x !== cd.drawn) { cd.drawn = cd.sp.x; drawCard(cd); }
    });
    if (stepS(div.sp, dt)) moving = true;
    if (div.sp.x !== div.drawn) { div.drawn = div.sp.x; drawDivider(div.sp.x); }
    return moving;
  });
  bag.add(B.unregister);

  // where the divider rests, on screen: the pointer is measured from here, and it never moves
  const home = Pw(onDiv(q0, D / 2, DH / 2));
  function retarget() {
    div.sp.t = give * near;
    cards.forEach((cd, i) => { cd.sp.t = STIR[i] * near * give; });
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => { near = falloff(Math.hypot(p[0] - home[0], p[1] - home[1]) / REACH); read.textContent = "divider · unseated"; retarget(); },
    leave: () => { near = 0; read.textContent = "rest"; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { give = v; retarget(); },
    destroy: bag.dispose,
  };
}

export default {
  name: "cardfile",
  means: "Three plan cards stand whole in a card file whose divider has jumped its notch: the pointer brings it back, but it never seats.",
  rules: [1, 4, 5, 6],
  range: [0.45, 0.7, 0.9],
  mount,
};
