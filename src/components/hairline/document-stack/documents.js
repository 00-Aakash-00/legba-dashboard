import { HL } from "./kernel.js"

const { Cam, clamp, disposer, fillet, fit, hull, mk, open, pointer, poly, proj, register, rrect, seg, spring, stepS } =
  HL

/** The reference is a frontal stack, so its shallow camera preserves that silhouette. */
function mount({ stage, svg, read }, value) {
  const bag = disposer(),
    C = Cam(0, 0.18, 1.5)
  fit(
    C,
    [
      [-100, 0, 0],
      [100, 0, 0],
      [-64, -18, 148],
      [64, -18, 148],
    ],
    200,
    166,
  )
  // Local lighting follows the supplied material reference, without changing the shared engine.
  const id = `documents-${crypto.randomUUID()}`,
    defs = mk("defs", {}, svg)
  const gradient = (name, stops, radial = false) => {
    const node = mk(
      radial ? "radialGradient" : "linearGradient",
      {
        id: `${id}-${name}`,
        ...(radial ? { cx: "0%", cy: "0%", r: "110%" } : { x1: "0%", y1: "0%", x2: "75%", y2: "100%" }),
      },
      defs,
    )
    stops.forEach(([offset, color]) => {
      mk("stop", { offset, "stop-color": color }, node)
    })
    return `url(#${id}-${name})`
  }
  const panelLight = gradient(
      "panel",
      [
        ["0%", "#1c1d1e"],
        ["60%", "#111112"],
        ["100%", "#121314"],
      ],
      true,
    ),
    paperLight = gradient("paper", [
      ["0%", "#383939"],
      ["38%", "#282929"],
      ["100%", "#1c1c1d"],
    ]),
    foldLight = gradient("fold", [
      ["0%", "#303031"],
      ["100%", "#262627"],
    ]),
    badgeLight = gradient("badge", [
      ["0%", "#2b2a29"],
      ["100%", "#232324"],
    ])
  // Exact outlined lettering keeps the approved appearance without a font dependency.
  const glyphs = [
    {
      d: "M658.4994506835938 0H272.58050537109375V263.0361328125H644.3395385742188Q788.0010986328125 263.0361328125 885.3619995117188 313.9068908691406Q982.722900390625 364.77764892578125 1032.0032958984375 471.8285827636719Q1081.28369140625 578.8795166015625 1081.28369140625 745.840087890625Q1081.28369140625 912.4205932617188 1031.6933288574219 1018.781494140625Q982.1029663085938 1125.1423950195312 885.502197265625 1176.0531311035156Q788.9014282226562 1226.9638671875 646.1401977539062 1226.9638671875H265.66046142578125V1490H664Q888.479736328125 1490 1049.7294616699219 1400.7300109863281Q1210.9791870117188 1311.4600219726562 1298.0690002441406 1144.6900329589844Q1385.1588134765625 977.9200439453125 1385.1588134765625 745.840087890625Q1385.1588134765625 513.3800659179688 1298.1089782714844 346.1500549316406Q1211.0591430664062 178.9200439453125 1048.279296875 89.46002197265625Q885.4994506835938 0 658.4994506835938 0ZM440.1971435546875 1490V0H134.641845703125V1490Z",
      transform: "translate(98.92853546142578 225.50390625) scale(0.009765625 -0.009765625)",
    },
    {
      d: "M789.3997802734375 -20Q591.9200439453125 -20 434.32037353515625 70.07009887695312Q276.720703125 160.14019775390625 185.3209228515625 331.1002197265625Q93.921142578125 502.06024169921875 93.921142578125 744Q93.921142578125 987.479736328125 185.3209228515625 1158.7097473144531Q276.720703125 1329.9397583007812 434.32037353515625 1419.9698791503906Q591.9200439453125 1510 789.3997802734375 1510Q986.8795166015625 1510 1143.9791870117188 1419.9698791503906Q1301.078857421875 1329.9397583007812 1392.5186157226562 1158.7097473144531Q1483.9583740234375 987.479736328125 1483.9583740234375 744Q1483.9583740234375 501.520263671875 1392.5186157226562 330.56024169921875Q1301.078857421875 159.6002197265625 1143.9791870117188 69.80010986328125Q986.8795166015625 -20 789.3997802734375 -20ZM789.3997802734375 251.0361328125Q905.1204833984375 251.0361328125 991.5613403320312 307.736572265625Q1078.002197265625 364.43701171875 1126.1128234863281 474.6078796386719Q1174.2234497070312 584.7787475585938 1174.2234497070312 744Q1174.2234497070312 904.6812744140625 1126.1128234863281 1015.1221313476562Q1078.002197265625 1125.56298828125 991.5613403320312 1182.263427734375Q905.1204833984375 1238.9638671875 789.3997802734375 1238.9638671875Q673.759033203125 1238.9638671875 587.0881652832031 1182.0334167480469Q500.41729736328125 1125.1029663085938 452.03668212890625 1014.662109375Q403.65606689453125 904.2212524414062 403.65606689453125 744Q403.65606689453125 584.7787475585938 452.03668212890625 474.837890625Q500.41729736328125 364.89703369140625 587.0881652832031 307.9665832519531Q673.759033203125 251.0361328125 789.3997802734375 251.0361328125Z",
      transform: "translate(113.366455078125 225.50390625) scale(0.009765625 -0.009765625)",
    },
    {
      d: "M785.6998901367188 -20Q587.68017578125 -20 431.16046142578125 70.07009887695312Q274.6407470703125 160.14019775390625 184.28094482421875 331.1002197265625Q93.921142578125 502.06024169921875 93.921142578125 744Q93.921142578125 987.479736328125 185.09091186523438 1158.7097473144531Q276.26068115234375 1329.9397583007812 433.0503845214844 1419.9698791503906Q589.840087890625 1510 785.6998901367188 1510Q912.7393188476562 1510 1022.4189453125 1474.5700988769531Q1132.0985717773438 1439.1401977539062 1216.9583740234375 1371.0503845214844Q1301.8181762695312 1302.9605712890625 1356.1281433105469 1204.6308898925781Q1410.4381103515625 1106.3012084960938 1427.1982421875 980.5016479492188H1118.403076171875Q1107.8028564453125 1041.84228515625 1079.5624389648438 1089.5827026367188Q1051.322021484375 1137.3231201171875 1008.5115051269531 1170.8433837890625Q965.7009887695312 1204.3636474609375 910.8504943847656 1221.6637573242188Q856 1238.9638671875 792.1796264648438 1238.9638671875Q675.9989013671875 1238.9638671875 588.2480773925781 1180.9534606933594Q500.49725341796875 1122.9430541992188 452.07666015625 1012.502197265625Q403.65606689453125 902.0613403320312 403.65606689453125 744Q403.65606689453125 583.1588134765625 452.8466491699219 472.9879455566406Q502.0372314453125 362.81707763671875 589.2480773925781 306.9266052246094Q676.4589233398438 251.0361328125 791.0996704101562 251.0361328125Q854.9200439453125 251.0361328125 909.5005493164062 268.5662536621094Q964.0810546875 286.09637451171875 1007.4315490722656 319.3866271972656Q1050.7820434570312 352.6768798828125 1079.5624389648438 400.6473083496094Q1108.3428344726562 448.61773681640625 1119.4830322265625 509.49835205078125H1428.2781982421875Q1415.7579345703125 405.7579345703125 1366.5777587890625 310.89813232421875Q1317.3975830078125 216.038330078125 1234.9676818847656 141.23876953125Q1152.5377807617188 66.439208984375 1039.6182861328125 23.2196044921875Q926.6987915039062 -20 785.6998901367188 -20Z",
      transform: "translate(128.76773071289062 225.50390625) scale(0.009765625 -0.009765625)",
    },
  ]
  const P = proj(C),
    root = mk("g", {}, svg),
    layers = [],
    sp = spring(0)
  let reach = value,
    target = null,
    active = -1,
    selected = -1,
    drawn = NaN
  const shape = fillet(
    [
      [-80, 24],
      [-22, 24],
      [-22, 78],
      [-39, 95],
      [-80, 95],
    ],
    [4, 4, 1.2, 1.2, 4],
    8,
  )
  for (let i = 2; i >= 0; i--) {
    const group = mk("g", {}, root)
    layers[i] = {
      group,
      edge: mk("path", { class: "document-edge" }, group),
      face: mk(
        "path",
        {
          class: `document-panel-${["front", "middle", "back"][i]}`,
          ...(i === 0 ? { style: `fill: ${panelLight}` } : {}),
        },
        group,
      ),
      crease: mk("path", { class: `document-bevel document-bevel-${i}` }, group),
    }
  }
  const page = mk("path", { class: "document-page", style: `fill: ${paperLight}` }, layers[0].group),
    pageBevel = mk("path", { class: "document-bevel" }, layers[0].group),
    fold = mk("path", { class: "document-fold", style: `fill: ${foldLight}` }, layers[0].group),
    pageRules = mk("path", { class: "document-inset" }, layers[0].group),
    badge = mk("path", { class: "document-badge", style: `fill: ${badgeLight}` }, layers[0].group),
    label = mk("g", { class: "document-label" }, layers[0].group),
    heading = mk("path", { class: "document-heading" }, layers[0].group),
    rules = mk("path", { class: "document-rule" }, layers[0].group)
  // The supplied reference explicitly includes this embossed plaque.
  glyphs.forEach((glyph) => {
    mk("path", glyph, label)
  })
  // The camera is fixed. Build the surfaces once, then lift each intact panel.
  function build() {
    layers.forEach((layer, i) => {
      const inset = i * 18,
        lift = i * 8,
        at = (u, v, depth = 0) => P(u, -i * 9 + depth, v + lift),
        ring = rrect(-100 + inset, 0, 100 - inset, 114, 12 - i, 12),
        front = ring.map((q) => at(q.u, q.v)),
        back = ring.map((q) => at(q.u, q.v, -2))
      layer.edge.setAttribute("d", poly(hull(front.concat(back))))
      layer.face.setAttribute("d", poly(front))
      const inner = rrect(-98 + inset, 2, 98 - inset, 112, 10 - i, 12)
      layer.crease.setAttribute(
        "d",
        open(inner.filter((q) => q.nv > 0 || (q.nu < 0 && q.v > 80)).map((q) => at(q.u, q.v))),
      )
    })
    const at = (u, v, depth = 3) => P(u, depth, v),
      points = shape.map(([u, v]) => at(u, v)),
      rear = shape.map(([u, v]) => at(u, v, 0.4)),
      line = (u, v, end) => seg(at(u, v), at(end, v))
    const bar = (u, v, end, height) => poly(rrect(u, v, end, v + height, height / 2, 6).map((q) => at(q.u, q.v)))
    page.setAttribute("d", poly(hull(points.concat(rear))))
    pageBevel.setAttribute("d", open([at(-79, 26), at(-79, 90), at(-78, 94), at(-40, 94)]))
    fold.setAttribute(
      "d",
      poly(
        fillet(
          [
            [-39, 94],
            [-39, 79],
            [-23, 79],
          ],
          [0.5, 2, 0.5],
          6,
        ).map(([u, v]) => at(u, v)),
      ),
    )
    pageRules.setAttribute(
      "d",
      open([at(-72, 55), at(-72, 86), at(-47, 86)]) +
        line(-66, 78, -51) +
        line(-66, 71, -46) +
        line(-66, 64, -42) +
        line(-66, 57, -50),
    )
    badge.setAttribute("d", poly(rrect(-73, 29, -32, 53, 4.5, 12).map((q) => at(q.u, q.v, 4))))
    heading.setAttribute("d", bar(-7, 90, 73, 3.6) + bar(-7, 80, 40, 3.6))
    rules.setAttribute(
      "d",
      [
        [67, 77],
        [58, 52],
        [49, 64],
        [40, 76],
        [31, 53],
        [22, 38],
      ]
        .map(([v, end]) => bar(-7, v, end, 1.7))
        .join(""),
    )
  }
  build()
  const origin = P(0, 0, 0),
    unitLift = P(0, 0, 1),
    liftX = unitLift[0] - origin[0],
    liftY = unitLift[1] - origin[1],
    liftFactors = [0.12, 0.55, 1]
  function draw() {
    const amount = clamp(sp.x, 0, 1)
    if (amount === drawn) return
    drawn = amount
    layers.forEach((layer, i) => {
      const lift = amount * reach * liftFactors[i]
      layer.group.setAttribute("transform", `translate(${liftX * lift} ${liftY * lift})`)
    })
  }
  const loop = register(stage, (dt) => {
    const moving = stepS(sp, dt)
    draw()
    return moving
  })
  bag.add(loop.unregister)
  function retarget(immediate = false) {
    sp.t = target ?? 0
    if (active !== selected) {
      if (selected !== -1) layers[selected].face.classList.remove("document-selected")
      if (active !== -1) layers[active].face.classList.add("document-selected")
      selected = active
      read.textContent = target === null ? "rest" : `page ${active + 1}`
    }
    if (immediate) {
      sp.x = sp.t
      sp.v = 0
      draw()
    }
    loop.wake()
  }
  // All hit bands use the fixed rest geometry, never the spring's current pose.
  const left = P(-100, 0, 0)[0],
    right = P(100, 0, 0)[0],
    bottom = P(0, 0, 0)[1],
    top = P(0, -18, 130)[1],
    frontTop = P(0, 0, 114)[1],
    middleTop = P(0, -9, 122)[1]
  function point([x, y]) {
    const inside = x >= left - 8 && x <= right + 8 && y >= top - 16 && y <= bottom + 8
    target = inside ? clamp((bottom - y) / (bottom - top), 0, 1) : null
    active = !inside ? -1 : y < middleTop ? 2 : y < frontTop ? 1 : 0
    retarget()
  }
  function rest(immediate = false) {
    target = null
    active = -1
    retarget(immediate)
  }
  bag.add(pointer(stage, { move: point, down: point, leave: () => rest() }))
  bag.on(stage, "keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Escape"].includes(event.key)) return
    event.preventDefault()
    if (event.key === "Escape") return rest(true)
    if (event.key === "Home") target = 0
    else if (event.key === "End") target = 1
    else {
      const direction = ["ArrowUp", "ArrowRight"].includes(event.key) ? 1 : -1
      target = clamp(Math.round((target ?? 0) * 10 + direction) / 10, 0, 1)
    }
    active = target > 0.9 ? 2 : target > 0.8 ? 1 : 0
    retarget(true)
  })
  bag.on(stage, "blur", () => rest(true))
  bag.add(() => svg.replaceChildren())
  draw()
  read.textContent = "rest"
  return {
    set: (v) => {
      reach = clamp(v, 6, 16)
      drawn = NaN
      retarget()
    },
    destroy: bag.dispose,
  }
}
export default {
  name: "documents",
  means: "Three document panels separate as the pointer rises.",
  rules: [1, 3, 5, 6, 8, 9],
  range: [6, 11, 16],
  mount,
}
