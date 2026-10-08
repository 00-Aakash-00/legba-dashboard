import { HL } from "../kernel.js";

/**
 * Vending: a snack machine, its glass front showing two shelves of spiral coils with a packet standing in each.
 * One packet has been turned off the end of its coil and hangs crooked from its shelf's lip over the empty drop,
 * its top corner caught behind the wire's last turn: its outline is the one bright stroke. The pointer rocks the
 * machine, as a hand would to shake it loose: its x tips the cabinet onto one bottom edge or the other, on a spring,
 * and the packets swing after it, nearest the pointer first; the stuck one swings widest and never drops. The
 * read-out names its row. The slider is the most rock, in degrees.
 *
 * The pattern: one continuous number, the rock, read from the pointer's x against the cabinet's rest centre,
 * which never moves; the whole machine redrawn from its own frame while it rocks; a spring per packet, fed the
 * rock late by its distance from the pointer.
 */
const {
  Cam, clamp, fit, hull, mk, open, place, pointer, poly, prism, proj, rad, register,
  ringAt, rings, rrect, run, spring, stepS, disposer,
} = HL;

// The machine's own frame: d is depth (its front at d = D), a runs across the front, z is up. It stands in the
// world as (a, d, z), so its glass faces down-left, and it rocks in the plane of its front.
const D = 38, W = 72, H = 104, BR = 6, BB = 1.8;                    // the cabinet and its rounding; it stands on the floor
const GL = [21, 27, 65, 100], BIN = [21, 8, 65, 22];                 // the glass and the delivery flap on the front: a0, z0, a1, z1
const XB = 9, XF = 31, XE = 33.5;                                    // the shelves run from XB to their lip at XF; the coils end at XE
const ROWS = [56, 77], SLOTS = [17.5, 31.5, 45.5];                   // shelf tops, bottom up, high over an empty drop; slot centres across
const IW = 10, IT = 3.5, PITCH = 7, RC = 3.5;                        // a packet: width, thickness; its coil's pitch and radius
const SR = 0, SS = 1, SH = 15, ROLL0 = 34, TILT = 8, SWING = [-20, 28]; // the stuck one: row, slot, height, roll at rest (plumb from its corner), its foot's tilt to the glass, its roll's reach
const TALL = [[12, SH, 10], [10, 13, 11]];                           // each coil holds its own snack: a height per slot, rows bottom up
const MOST = 4, STEP = 40, KICK = 6, WOBBLE = 10;                   // the slider's far end (range, in degrees of rock); the stagger, ms a slot; a rock's swing
const AEND = rad(-90);                                               // where each wire is round its axis at XE

const packet = (h) => [rrect(-IW / 2, 0, IW / 2, h, 2.2, 6), rrect(-IW / 2 + 1, 1, IW / 2 - 1, h - 1, 1.2, 6)];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** A turn of th° in the a–z plane about the point (p, 0), the top going toward +a: a rock onto a corner. */
const tip = (th, p) => { const s = Math.sin(rad(th)), c = Math.cos(rad(th)); return (a, z) => [p + (a - p) * c + z * s, z * c - (a - p) * s]; };
/** The machine rocked th° onto the bottom edge on that side: its frame's points, in the world. */
const rocked = (th) => { const t = tip(th, th > 0 ? W : 0); return (d, a, z) => { const [x, y] = t(a, z); return [x, d, y]; }; };
/** A standing packet: u across, v up, w toward the glass, its foot's back edge centred at f, rocked th° onto a corner. */
const standing = (f, th) => { const t = tip(th, th > 0 ? IW / 2 : -IW / 2); return (u, v, w) => { const [a, z] = t(u, v); return [f[0] + w, f[1] + a, f[2] + z]; }; };
const TS = Math.sin(rad(TILT)), TC = Math.cos(rad(TILT));
/** The stuck packet, hung by its top corner at h: rolled ro° in its own plane, its foot tilted toward the glass. */
const hanging = (h, ro) => {
  const s = Math.sin(rad(ro)), c = Math.cos(rad(ro));
  return (u, v, w) => {
    const du = u - IW / 2, dv = v - SH, y = du * c - dv * s, z = du * s + dv * c;
    return [h[0] + w * TC - z * TS, h[1] + y, h[2] + w * TS + z * TC];
  };
};
/** How far a point of the machine's frame stands out from the back face of the packet hung at h: its w, whatever the roll. */
const depthOf = (h, [d, , z]) => (d - h[0]) * TC + (z - h[2]) * TS;

/** A thin solid in packet space: the ring at w 0 and w IT, hulled, and the inset ring's visible run on the face toward the camera. */
function slab(P, V, to, [ring, inner]) {
  const o = to(0, 0, 0), dir = (u, v, w) => to(u, v, w).map((x, i) => x - o[i]);
  const at = (ring, w) => ring.map((q) => P(...to(q.u, q.v, w)));
  const near = dot3(dir(0, 0, 1), V) > 0 ? IT : 0;
  return [poly(hull(at(ring, 0).concat(at(ring, IT)))), open(at(run(inner, (q) => dot3(dir(q.nu, q.nv, 0), V) > 0), near))];
}

/** Where a coil's wire is at depth d, round its axis at (a, z + RC): a turn every PITCH, at AEND at XE, just past the lip. */
const wireAt = (d, a, z) => { const t = AEND + (2 * Math.PI * (d - XE)) / PITCH; return [d, a + RC * Math.cos(t), z + RC + RC * Math.sin(t)]; };
const wire = (Q, a, z, d0, d1) => { const pts = []; for (let d = d0; d < d1 + 0.01; d += 0.35) pts.push(Q(...wireAt(Math.min(d, d1), a, z))); return open(pts); };

/** Twice the signed area of a screen polygon: its winding. */
const area = (pts) => pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let most = value, over = null;

  // Fitted to the cabinet at rest and at the slider's most rock either way, so no pose leaves the frame.
  const C = Cam(45, 0.5, 2.3), box = [];
  for (const th of [-MOST, 0, MOST]) for (const d of [0, D]) for (const a of [0, W]) for (const z of [0, H]) box.push(rocked(th)(d, a, z));
  fit(C, box, 200, 166);
  const P = proj(C), o = P(0, 0, 0), ax = [P(1, 0, 0), P(0, 1, 0), P(0, 0, 1)].map((p) => [p[0] - o[0], p[1] - o[1]]);
  const r = ax.map((p) => p[0]), s = ax.map((p) => p[1]);
  const V = [r[1] * s[2] - r[2] * s[1], r[2] * s[0] - r[0] * s[2], r[0] * s[1] - r[1] * s[0]]; // toward the camera
  const R0 = rocked(0), Q0 = (d, a, z) => P(...R0(d, a, z)), face = (Q, ring) => ring.map((q) => Q(D, q.u, q.v));

  // Every part is drawn from the pose: Q projects the machine's frame, F says whether a ring's sample faces the camera,
  // R gives world points. Parts are appended in paint order, back to front, and keep that order however it rocks.
  const g = mk("g", {}, svg), parts = [], items = [], dots = [];
  const part = (classes, draw, it) => parts.push({ els: classes.map((cls) => mk("path", { class: cls }, g)), draw, it });
  const [cr, ci] = rings(0, 0, D, W, BR, BB), gr = rrect(GL[0], GL[1], GL[2], GL[3], 3, 6);
  const flip = Math.sign(area(face(Q0, gr))) === Math.sign(area(hull(ringAt(Q0, cr, 0).concat(ringAt(Q0, cr, H)))));
  const glass = (Q) => (flip ? face(Q, gr).reverse() : face(Q, gr)); // wound against the cabinet, so it cuts a hole in it
  const packetOf = (R, it) => slab(P, V, (u, v, w) => R(...it.to(it.a)(u, v, w)), packet(it.h));

  // the cabinet's inside, opaque, so nothing under it shows through the glass
  part(["fo"], (Q) => [poly(glass(Q))]);

  // Inside, bottom row first, so each shelf covers what is under it; in a row, slot by slot from the far end, back to front.
  const [sr, si] = rings(XB, SLOTS[0] - 8, XF, SLOTS[2] + 8, 1.5, 0.8), mid = XE - PITCH;
  ROWS.forEach((z, ri) => {
    part(["", "nf lo"], (Q, F) => { const p = prism(Q, F, sr, si, z - 2, z); return [p.sil, p.crease]; });
    SLOTS.forEach((a, sj) => {
      if (ri === SR && sj === SS) return part(["nf"], (Q) => [wire(Q, a, z, XB + 1, XF)]); // the coil turned this one out: bare
      part(["nf lo"], (Q) => [wire(Q, a, z, XB + 1, mid)]); // only behind its packet, which hides the turn it stands in
      const it = { to: (th) => standing([mid - IT / 2, a, z], th), h: TALL[ri][sj], rest: 0, lo: -WOBBLE, hi: WOBBLE };
      items.push(it);
      part(["", "nf lo"], (Q, F, R) => packetOf(R, it), it);
    });
    if (ri !== SR) return;
    // The stuck one hangs off its shelf's lip, in front of its whole row, by its top corner, which sits on the top of its
    // coil's last turn: the wire runs on round it, comes out through the packet's face at `cut`, and ends over it, at XT.
    const a = SLOTS[SS], hook = [XE - PITCH / 2, a + 0.6, z + 2 * RC + 1], XT = XE + 0.6 * PITCH;
    let back = XE, cut = XT;
    while (cut - back > 0.01) { const m = (back + cut) / 2; if (depthOf(hook, wireAt(m, a, z)) > IT) cut = m; else back = m; }
    const it = { to: (ro) => hanging(hook, ro), h: SH, rest: ROLL0, lo: ROLL0 + SWING[0], hi: ROLL0 + SWING[1], stuck: true };
    part(["nf"], (Q) => [wire(Q, a, z, XF, cut)]);
    items.push(it);
    part(["hi", "nf lo"], (Q, F, R) => packetOf(R, it), it);
    part(["nf"], (Q) => [wire(Q, a, z, cut, XT)]); // in front of the packet: painted after it
  });

  // The cabinet over it all, with the glass cut out of it; on its front the glass's frame, a display, a keypad, the flap.
  part(["fo", "nf sil", "nf lo"], (Q, F) => { const b = prism(Q, F, cr, ci, 0, H); return [b.sil + poly(glass(Q)), b.sil, b.crease]; });
  const nf = [gr, rrect(6, 86, 17, 95, 1.6, 4), rrect(BIN[0], BIN[1], BIN[2], BIN[3], 3, 6)];
  const lo = [rrect(GL[0] - 2, GL[1] - 2, GL[2] + 2, GL[3] + 2, 4.5, 6), rrect(BIN[0] + 2, BIN[1] + 2, BIN[2] - 2, BIN[3] - 3, 2, 6)];
  part(["nf", "nf lo"], (Q) => [nf, lo].map((set) => set.map((ring) => poly(face(Q, ring))).join("")));
  for (let k = 0; k < 12; k++) dots.push({ el: mk("circle", { r: 1.1, class: "dot m" }, g), at: [D, 8 + (k % 3) * 3.6, 79 - Math.floor(k / 3) * 4.4] });

  // The rock on the default spring. The packets sit loose in their coils and the stuck one hangs free, so theirs keep the
  // default's stiffness with less damping: they swing past where they settle and the swing dies away, as a hanging thing's does.
  const cab = spring(0, { eps: 0.02 });
  for (const it of items) Object.assign(it, { sp: spring(it.rest, { k: 100, c: 11, eps: 0.05 }), a: it.rest, drawn: NaN, late: 0, fall: 1 });
  let drawn = NaN;
  function render() {
    const th = clamp(cab.x, -MOST, MOST), all = th !== drawn, R = rocked(th), Q = (d, a, z) => P(...R(d, a, z));
    const c = Math.cos(rad(th)), sn = Math.sin(rad(th)), F = (q) => dot3([q.nv * c, q.nu, -q.nv * sn], V) > 0;
    for (const pt of parts) if (all || (pt.it && pt.it.a !== pt.it.drawn)) pt.draw(Q, F, R).forEach((d, i) => pt.els[i].setAttribute("d", d));
    if (all) for (const k of dots) place(k.el, Q(...k.at));
    for (const it of items) it.drawn = it.a;
    drawn = th;
  }

  // Each packet feels the rock `late` ms after it happens: [ms, rock, how far the rock still has to go], kept as long as the latest needs.
  const LATE = 4 * STEP, hist = [[-Infinity, 0, 0]];
  const felt = (now, late) => { let h = hist[0]; for (const e of hist) if (e[0] <= now - late) h = e; return h; };
  let shook = -Infinity;
  const B = register(stage, (dt, now) => {
    let moving = stepS(cab, dt);
    if (moving) shook = now;
    hist.push([now, cab.x, cab.t - cab.x]);
    while (hist.length > 2 && hist[1][0] <= now - LATE) hist.shift();
    for (const it of items) {
      // A rock under way swings a packet against it, the stuck one, hanging free, twice as far as those held in their
      // coils; the stuck one also turns back by the rock, to hang plumb.
      const [, th, lag] = felt(now, it.late);
      it.sp.t = it.stuck ? ROLL0 + th - KICK * lag : (-KICK / 2) * it.fall * lag;
      if (stepS(it.sp, dt)) moving = true;
      it.a = clamp(it.sp.x, it.lo, it.hi);
    }
    render();
    return moving || now - shook < LATE;
  });
  bag.add(B.unregister);

  // The pointer is read against the rest pose, which never moves (rule 01): the side of the cabinet's rest centre line it
  // is on sets the rock, whole a little way from it, and its distance to each packet's rest centre, in slots, sets how
  // late that packet feels the rock and how hard.
  const A = Q0(D / 2, W / 2, H / 2), HALF = 30, s0 = Q0(XF, SLOTS[0], 60), s1 = Q0(XF, SLOTS[1], 60), SLOT = Math.hypot(s1[0] - s0[0], s1[1] - s0[1]);
  for (const it of items) it.c = P(...R0(...it.to(it.rest)(0, it.h / 2, IT / 2)));
  function aim(p) {
    over = p;
    cab.t = p ? most * clamp((p[0] - A[0]) / HALF, -1, 1) : 0;
    if (p) {
      const far = items.map((it) => Math.hypot(p[0] - it.c[0], p[1] - it.c[1]) / SLOT), near = Math.min(...far);
      items.forEach((it, i) => { const n = Math.min(4, far[i] - near); it.late = n * STEP; it.fall = 1 - n * 0.15; });
    }
    read.textContent = p ? `row ${ROWS.length - SR} · stuck` : "rest";
    B.wake();
  }

  read.textContent = "rest";
  render();
  bag.add(pointer(stage, { move: (p) => aim(p), leave: () => aim(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { most = v; if (over) aim(over); },
    destroy: bag.dispose,
  };
}

export default {
  name: "vending",
  means: "A snack machine with one packet caught on its coil: the pointer rocks the machine, and the packet swings widest but never drops.",
  rules: [1, 2, 5, 6],
  range: [2, 3, 4],
  mount,
};
