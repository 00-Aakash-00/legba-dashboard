import { HL } from "../kernel.js";

/**
 * Blankwindows: two browser windows stand in a rack, each in its own slot, with
 * title-bar dots and an address bar over a blank viewport: nothing is loaded.
 * The front window's empty viewport has the bright rim. The window under the
 * pointer rises in its slot and stands straight while the other leans away, and
 * the rim goes with it, its chrome turning medium as the other's dims. The
 * slider is the lift, which stops before the window clears its slot.
 *
 * The pattern: discrete items, as Riffle. Tweens, a stagger by distance, and a
 * hit test on each window's resting face, front first, so nothing that moves
 * can flip the choice.
 */
const {
  Cam, clamp, facing, fit, open, poly, proj, prism, rad, ringAt, rings, rrect, run,
  tdone, tset, tval, tween, disposer, mk, place, pointer, put, register, solid,
} = HL;

const N = 2, W = 112, H = 64, R = 4.5, TK = 1.6, TB = 12, G = 11, STEP = 45;
// the viewport: a blank screen M in from the sides, MB up from the foot, up to the title bar
const M = 3.5, MB = 6.5, RV = 2.2;
// FWD tips the front window far enough that a chosen back window's rim shows over it
const REST = [-17, -5], BACK = -26, FWD = 16, LMAX = 4;
const X0 = -9, X1 = W + 9, Y0 = -10, Y1 = (N - 1) * G + 9, PH = 6;
// A slot runs SB behind a window's face to SF in front of it, SD deep; LIP is the plinth's top just in front of it.
// LMAX stays under SD, so a lifted window's foot is still in its slot; at rest the lip hides the foot.
const SB = 4.2, SF = 2.2, SR = 2.4, SD = 4.5, SX0 = -5, SX1 = W + 5, Z0 = PH - SD, LIP = 4.5;
const DOTS = [8, 13.5, 19], A0 = 26, A1 = 60, AH = 5.2;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = clamp(value, 0, LMAX);

  // Fitted to the plinth and to every window's top in each pose it can take: at rest, straight at the highest lift, leaning back, leaning forward.
  const C = Cam(45, 0.5, 2);
  const tops = [];
  for (let i = 0; i < N; i++) for (const [th, z] of [[REST[i], 0], [0, LMAX], [BACK, 0], [FWD, 0]]) {
    for (const u of [0, W]) tops.push([u, i * G + H * Math.sin(rad(th)), Z0 + z + H * Math.cos(rad(th))]);
  }
  fit(C, [[X0, Y0, 0], [X1, Y1, 0], [X1, Y0, 0], [X0, Y1, 0], ...tops], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const [pr, pi] = rings(X0, Y0, X1, Y1, 7, 1.8);
  put(solid(g), prism(P, front, pr, pi, 0, PH));

  // A window is an opaque plate; its viewport is a ring on it with nothing inside.
  const frame = rrect(0, 0, W, H, R, 5), view = rrect(M, MB, W - M, H - TB, RV, 4);
  const bar = rrect(A0, H - TB / 2 - AH / 2, A1, H - TB / 2 + AH / 2, AH / 2, 4);

  // Back to front: for each window, its slot's far rim (dim, so the base stays quiet), the window, then the lip in
  // front of it, an opaque strip of the plinth's top that hides the window's foot in the groove, and the near rim.
  const panes = [];
  for (let i = 0; i < N; i++) {
    const yb = i * G, ring = rrect(SX0, yb - SB, SX1, yb + SF, SR, 4), far = run(ring, (q) => !front(q));
    mk("path", { d: open(ringAt(P, far, PH)), class: "nf lo" }, g);
    const grp = mk("g", {}, g);
    const back = mk("path", { class: "lo" }, grp), face = mk("path", { class: "sil" }, grp), rim = mk("path", { class: "nf" }, grp);
    // every window has its title-bar dots and address bar: medium on the window whose viewport is bright, dim on the rest
    const dots = DOTS.map(() => mk("circle", { r: 2.1, class: i === N - 1 ? "dot m" : "dot off" }, grp));
    const addr = mk("path", { class: i === N - 1 ? "nf" : "nf lo" }, grp);
    const lip = [[SX0, yb + SF], [SX1, yb + SF], [SX1, yb + SF + LIP], [SX0, yb + SF + LIP]];
    mk("path", { d: poly(lip.map(([x, y]) => P(x, y, PH))), class: "fo" }, g);
    mk("path", { d: open(ringAt(P, [far[far.length - 1], ...run(ring, front), far[0]], PH)), class: "nf" }, g);
    panes.push({ back, face, rim, dots, addr, a: tween(REST[i]), z: tween(0), th: NaN, lz: NaN });
  }

  /** Window i leaning th degrees (negative leans back) and lifted by z, drawn in its own plane from the slot's floor. */
  function draw(i, th, z) {
    const p = panes[i], yb = i * G, s = Math.sin(rad(th)), c = Math.cos(rad(th));
    const w = (q) => P(q.u, yb + q.v * s, Z0 + z + q.v * c);
    const wb = (q) => P(q.u, yb + q.v * s - TK * c, Z0 + z + q.v * c + TK * s);
    p.back.setAttribute("d", poly(frame.map(wb)));
    p.face.setAttribute("d", poly(frame.map(w)));
    p.rim.setAttribute("d", poly(view.map(w)));
    p.dots.forEach((el, k) => place(el, w({ u: DOTS[k], v: H - TB / 2 })));
    p.addr.setAttribute("d", poly(bar.map(w)));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    panes.forEach((p, i) => {
      const th = tval(p.a, now), z = tval(p.z, now);
      if (th !== p.th || z !== p.lz) { p.th = th; p.lz = z; draw(i, th, z); }
      if (!tdone(p.a, now) || !tdone(p.z, now)) moving = true;
    });
    return moving;
  });
  bag.add(B.unregister);

  // Hit areas, in the REST pose: each window's face, front first. They never move, and nothing draws them.
  const quads = REST.map((th, i) => {
    const s = Math.sin(rad(th)), c = Math.cos(rad(th));
    return [[0, 0], [W, 0], [W, H], [0, H]].map(([u, v]) => P(u, i * G + v * s, Z0 + v * c));
  });
  const inside = (q, [x, y]) => {
    let pos = 0, neg = 0;
    for (let k = 0; k < 4; k++) {
      const a = q[k], b = q[(k + 1) % 4], cr = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
      if (cr > 0) pos++; else if (cr < 0) neg++;
    }
    return !(pos && neg);
  };
  function hit(pt) {
    for (let i = N - 1; i >= 0; i--) if (inside(quads[i], pt)) return i;
    return -1;
  }

  let act = -1;
  /** Chooses window a; -1 lets everything back. The stagger spreads out from what was chosen, or let go; the bright rim, and the medium chrome with it, go to the chosen window, or the front one at rest. */
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    panes.forEach((p, i) => {
      const delay = Math.abs(i - from) * STEP, lit = i === (a < 0 ? N - 1 : a);
      tset(p.a, a < 0 ? REST[i] : i < a ? BACK : i > a ? FWD : 0, now, delay);
      tset(p.z, a === i ? lift : 0, now, delay);
      p.rim.classList.toggle("hi", lit);
      p.addr.classList.toggle("lo", !lit);
      for (const el of p.dots) { el.classList.toggle("m", lit); el.classList.toggle("off", !lit); }
    });
    read.textContent = a < 0 ? "rest" : `window ${N - a} · 0`;
    B.wake();
  }
  panes[N - 1].rim.classList.add("hi");

  bag.add(pointer(stage, { move: (pt) => setActive(hit(pt)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = clamp(v, 0, LMAX); if (act >= 0) { tset(panes[act].z, lift, performance.now(), 0); B.wake(); } },
    destroy: bag.dispose,
  };
}

export default {
  name: "blankwindows",
  means: "Browser windows stand in a rack, their viewports blank: the window under the pointer rises in its slot.",
  rules: [2, 4, 5, 6],
  range: [2, 3, 4],
  mount,
};
