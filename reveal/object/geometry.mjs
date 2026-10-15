// A single-burner built-in gas hob, built part by part in millimetres for the 3D mode.
// Axes: x across (world −x is screen-right at yaw 0), y front (+y faces the viewer at yaw 0), z up.
// The burner sits behind the knob on the centre line: knob → stem → plug valve → nozzle → orifice hood →
// air shutter → venturi (bell, throat, diffuser) → mixing chamber → flare → crown with ports → cap.
import * as G from "../kit/lathe.mjs";
const TAU = Math.PI * 2;
const unit = G.unit3;
const sub = G.sub3;
const mul = G.mul3;
const dot = G.dot3;
const cross = G.cross3;
export const frame = (o, a, u) => {
  const A = unit(a);
  const U = unit(sub(u, mul(A, dot(u, A))));
  return { o, a: A, u: U, v: cross(A, U) };
};
const AX = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
const NX = [-1, 0, 0];
const NY = [0, -1, 0];

// ---------- dimensions (mm) ----------
export const HOB = { W: 150, D: 200, floor: 2, top: 58, plate: 60, wall: 4 };
const ZT = 32; // tube, valve and stem axis height
const HC = [0, -40]; // burner head centre (x, y)
const HOLE = 44; // half-size of the square hole in the top plate
const HEAD = { boxZ: [14, 46], flareZ: [46, 58], crownZ: [58, 72], rFlare: 20, rCrown: 34, portZ: [64, 68], capZ: [72, 74.5, 78], rCap: 36 };
const ELECTRODE = { x: -40, y: -40, z: [36, 62], r: 3.2 };
const FONT = "ui-monospace, Menlo, monospace";

const ring = (r, steps = 72) =>
  Array.from({ length: steps }, (_, j) => {
    const a = (TAU * j) / steps;
    return `${j ? "L" : "M"}${(r * Math.cos(a)).toFixed(3)} ${(r * Math.sin(a)).toFixed(3)}`;
  }).join("") + "Z";
const line = (d, tone = "lo") => `<path class="iso-line" data-tone="${tone}" d="${d}"/>`;
const text = (x, y, s, size, tone = "mid") => `<text class="iso-face-text" data-tone="${tone}" font-size="${size}" text-anchor="middle" style="font-family:${FONT};letter-spacing:.12em" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})">${s}</text>`;
const circlePoly = (r, n = 6, phase = Math.PI / 6) => Array.from({ length: n }, (_, j) => [r * Math.cos(phase + (TAU * j) / n), r * Math.sin(phase + (TAU * j) / n)]);

export function buildObject(T, { layer }) {
  const parts = {};
  const groups = {};
  const explode = [];
  const anchors = {};
  const features = [];
  const L = layer;
  const root = T.group("root", { free: { origin: [0, 0, 46] } });
  groups.root = root;
  const assembly = (name, dir, travel, delay = 0, parent = root) => {
    const g = T.group(name, { parent, slide: { direction: unit(dir), travel } });
    groups[name] = g;
    explode.push({ name, travel, delay });
    return g;
  };
  const hinge = (name, parent, point, axis, range) => {
    const g = T.group(name, { parent, hinge: { point, axis, range } });
    groups[name] = g;
    return g;
  };
  const part = (p) => (parts[p.name] = p);
  const prismOn =
    (axis, u) =>
    (name, group, poly, s0, s1, o = {}) =>
      part(T.prism({ name, group, layer: L, F: frame([0, 0, 0], axis, u), polygon: poly, s0, s1, steps: 5, tone: o.tone ?? "hi", crease: o.crease ?? "lo", bevel: o.bevel ?? 0, material: o.material, lit: o.lit, details: o.details }));
  const prismY = prismOn(AX.y, AX.z); // polygon in (z, x)
  const prismZ = prismOn(AX.z, AX.x); // polygon in (x, y)
  const prismX = prismOn(AX.x, AX.y); // polygon in (y, z)
  const round = (name, group, F, s0, s1, r, o = {}) =>
    part(T.round({ name, group, layer: L, F, s0, s1, r, ends: o.ends, tone: o.tone ?? "hi", crease: o.crease ?? "lo", material: o.material, lit: o.lit, details: o.details }));
  const plane = (p, o, u, v, svg, normal, fade = [0.04, 0.3]) => T.plane({ part: p, o, u, v, svg, normal, fade });
  const box = (name, group, [x0, x1], [y0, y1], [z0, z1], o = {}) =>
    prismZ(name, group, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], z0, z1, o);
  const up = (x, y) => frame([x, y, 0], AX.z, AX.x);
  const alongY = (x = 0, z = ZT) => frame([x, 0, z], AX.y, AX.z);
  const FRONT = { u: [-1, 0, 0], v: [0, 0, -1] };
  const TOPF = { u: [-1, 0, 0], v: [0, 1, 0] };
  const { W, D, floor, top, plate, wall } = HOB;

  // ---------- chassis: floor tray and feet (fixed) ----------
  const core = assembly("core", AX.z, 0, 0);
  box("case.floor", core, [-W, W], [-D, D], [0, floor], { material: "steel" });
  for (const [x, y] of [[-128, -178], [128, -178], [-128, 178], [128, 178]]) round(`case.foot.${x > 0 ? "r" : "l"}${y > 0 ? "f" : "b"}`, core, up(x, y), -8, 0, 10, { material: "rubber" });

  // ---------- walls: front (round the stem hole), back, two sides ----------
  const frontG = assembly("wall.front", AX.y, 70, 0.14);
  const hole = { x: 8.6, z: [23, 41] };
  const fl = box("wall.front.l", frontG, [-W, -hole.x], [D - wall, D], [floor, top], { material: "steel" });
  const fr = box("wall.front.r", frontG, [hole.x, W], [D - wall, D], [floor, top], { material: "steel" });
  const fb = box("wall.front.b", frontG, [-hole.x, hole.x], [D - wall, D], [floor, hole.z[0]], { material: "steel" });
  const ft = box("wall.front.t", frontG, [-hole.x, hole.x], [D - wall, D], [hole.z[1], top], { material: "steel" });
  // the dial printed round the knob: each mark on the wall piece it falls on (face plane y = D, seen from the front)
  {
    const f = D + 0.02;
    const at = (deg, r) => { const a = (deg * Math.PI) / 180; return [r * Math.sin(a), ZT + r * Math.cos(a)]; }; // world x, z; 0 = up, positive = counter-clockwise seen from the front
    const marks = { l: "", r: "", b: "", t: "" };
    const pieceOf = ([x, z]) => (x < -hole.x ? "l" : x > hole.x ? "r" : z < hole.z[0] ? "b" : "t");
    const toFace = ([x, z], p) => [-(x - p.cx), -(z - p.cz)];
    const PIECE = { l: { part: fl, cx: -(W + hole.x) / 2 }, r: { part: fr, cx: (W + hole.x) / 2 }, b: { part: fb, cx: 0 }, t: { part: ft, cx: 0 } };
    for (const k in PIECE) PIECE[k].cz = ZT;
    // world −x is the viewer's right; a counter-clockwise turn from the top goes to the viewer's left (+x)
    for (let deg = 0; deg <= 270; deg += 15) {
      const a = at(deg, 30), b = at(deg, deg % 45 === 0 ? 34.5 : 33);
      const key = pieceOf(a);
      if (pieceOf(b) !== key) continue;
      const p = PIECE[key];
      const [ax, ay] = toFace(a, p), [bx, by] = toFace(b, p);
      marks[key] += `M${ax.toFixed(2)} ${ay.toFixed(2)}L${bx.toFixed(2)} ${by.toFixed(2)}`;
    }
    const labels = [["OFF", 0], ["LITE", 90], ["HI", 115], ["MED", 190], ["LO", 270]];
    const texts = { l: "", r: "", b: "", t: "" };
    for (const [s, deg] of labels) {
      const pt = at(deg, 41.5);
      const key = pieceOf(pt);
      const [tx, ty] = toFace(pt, PIECE[key]);
      texts[key] += text(tx, ty + 1.6, s, 4.4, "hi");
    }
    for (const key in PIECE) {
      const p = PIECE[key];
      const svg = (marks[key] ? line(marks[key], "mid") : "") + texts[key];
      if (svg) plane(p.part, [p.cx * 1, f, p.cz], [1, 0, 0].map((v) => -v), [0, 0, -1], svg, AX.y);
    }
  }
  const backG = assembly("wall.back", NY, 60, 0.14);
  box("wall.back", backG, [-W, W], [-D, -D + wall], [floor, top], { material: "steel" });
  // gas inlet union on the outside of the back wall
  {
    const F = alongY(60, ZT);
    prismY("inlet.nut", backG, circlePoly(8).map(([a, b]) => [ZT + a, 60 + b]), -D - 8, -D, { material: "brass" });
    round("inlet.thread", backG, F, -D - 18, -D - 8, 5.2, { material: "brass", details: { ribs: { s0: -D - 17.5, s1: -D - 8.5, count: 22, fade: [0.1, 0.6], tone: "lo" } } });
    anchors.inlet = [60, -D - 12, ZT];
  }
  const sideL = assembly("wall.left", AX.x, 60, 0.14);
  box("wall.left", sideL, [W - wall, W], [-D + wall, D - wall], [floor, top], { material: "steel" });
  const sideR = assembly("wall.right", NX, 60, 0.14);
  box("wall.right", sideR, [-W, -W + wall], [-D + wall, D - wall], [floor, top], { material: "steel" });

  // ---------- top plate round a square hole, the trim ring, the grate ----------
  const [hx, hy] = HC;
  // the top plate is four pieces round the burner hole; each lifts and slides away from the hole
  const topPiece = (name, dir, xs, ys, bevel = 0.6) => box(name, assembly(name, dir, 130, 0.1), xs, ys, [top, plate], { material: "gunmetal", bevel });
  topPiece("top.l", [1, 0, 1.1], [hx + HOLE, W], [-D, D]);
  topPiece("top.r", [-1, 0, 1.1], [-W, hx - HOLE], [-D, D]);
  const tf = topPiece("top.f", [0, 1, 1.1], [hx - HOLE, hx + HOLE], [hy + HOLE, D], 0);
  topPiece("top.b", [0, -1, 1.1], [hx - HOLE, hx + HOLE], [-D, hy - HOLE], 0);
  plane(tf, [0, 150, plate + 0.02], TOPF.u, TOPF.v, text(0, 0, "NATURAL GAS · 2.6 kW", 5, "mid") + line("M-34 5H34", "faint"), AX.z);
  const ringG = assembly("trim", AX.z, 120, 0.06);
  const N_TRIM = 16;
  for (let j = 0; j < N_TRIM; j++) {
    const a0 = (TAU * j) / N_TRIM, a1 = (TAU * (j + 1)) / N_TRIM;
    const p = (a, r) => [hx + r * Math.cos(a), hy + r * Math.sin(a)];
    box; // wedge
    prismZ(`trim.${j}`, ringG, [p(a0, 46), p(a0, 66), p(a1, 66), p(a1, 46)], plate, plate + 1.2, { material: "chrome", tone: "faint", crease: "faint" });
  }
  const grateG = assembly("grate", AX.z, 250, 0);
  {
    const g0 = 92, g1 = 98, H = 100, b = 4;
    for (const [x, y] of [[hx - H, hy - H], [hx + H, hy - H], [hx - H, hy + H], [hx + H, hy + H]]) {
      round(`grate.foot.${x > 0 ? "a" : "b"}${y > hy ? "f" : "k"}`, grateG, up(x, y), plate, plate + 3, 6, { material: "rubber" });
      round(`grate.post.${x > 0 ? "a" : "b"}${y > hy ? "f" : "k"}`, grateG, up(x, y), plate + 3, g0, 4.5, { material: "gunmetal" });
    }
    box("grate.bar.f", grateG, [hx - H - b, hx + H + b], [hy + H - b, hy + H + b], [g0, g1], { material: "gunmetal" });
    box("grate.bar.k", grateG, [hx - H - b, hx + H + b], [hy - H - b, hy - H + b], [g0, g1], { material: "gunmetal" });
    box("grate.bar.a", grateG, [hx + H - b, hx + H + b], [hy - H + b, hy + H - b], [g0, g1], { material: "gunmetal" });
    box("grate.bar.b", grateG, [hx - H - b, hx - H + b], [hy - H + b, hy + H - b], [g0, g1], { material: "gunmetal" });
    box("grate.finger.a", grateG, [hx + 42, hx + H - b], [hy - 3, hy + 3], [g0, g1], { material: "gunmetal" });
    box("grate.finger.b", grateG, [hx - H + b, hx - 42], [hy - 3, hy + 3], [g0, g1], { material: "gunmetal" });
    box("grate.finger.f", grateG, [hx - 3, hx + 3], [hy + 42, hy + H - b], [g0, g1], { material: "gunmetal" });
    box("grate.finger.k", grateG, [hx - 3, hx + 3], [hy - H + b, hy - 42], [g0, g1], { material: "gunmetal" });
    anchors.grate = [hx + 70, hy, g1];
  }

  // ---------- the burner head: mixing chamber, flare, crown with ports, cap, flames ----------
  const mixG = assembly("mixer", AX.z, 30, 0.24);
  const chamber = box("head.chamber", mixG, [hx - 20, hx + 20], [hy - 20, hy + 20], HEAD.boxZ, { material: "steel", bevel: 0.4 });
  round("head.post", core, up(hx, hy), floor, HEAD.boxZ[0], 6, { material: "steel" });
  const flareG = assembly("flare", AX.z, 140, 0.07);
  round("head.flare", flareG, up(hx, hy), HEAD.flareZ[0], HEAD.flareZ[1], [HEAD.rFlare, HEAD.rCrown], { material: "steel" });
  const crownG = assembly("crown", AX.z, 178, 0.04);
  round("head.crown", crownG, up(hx, hy), HEAD.crownZ[0], HEAD.crownZ[1], HEAD.rCrown, {
    material: "steel",
    details: { seams: [HEAD.portZ[0] - 1.5], ribs: { s0: HEAD.portZ[0], s1: HEAD.portZ[1], count: 96, fade: [0.08, 0.5], tone: "hi" } },
  });
  const capG = assembly("cap", AX.z, 218, 0.02);
  round("head.cap.rim", capG, up(hx, hy), HEAD.capZ[0], HEAD.capZ[1], HEAD.rCap, { material: "rubber" });
  round("head.cap.dome", capG, up(hx, hy), HEAD.capZ[1], HEAD.capZ[2], [HEAD.rCap, 27], { material: "rubber" });
  // a flame cone at every other port, tilted 20° up from radial; faded by the page (data-mat="flame")
  const N_FLAME = 24;
  for (let j = 0; j < N_FLAME; j++) {
    const a = (TAU * (j + 0.5)) / N_FLAME;
    const dir = [0.94 * Math.cos(a), 0.94 * Math.sin(a), 0.342];
    const o = [hx + (HEAD.rCrown + 1.4) * Math.cos(a), hy + (HEAD.rCrown + 1.4) * Math.sin(a), (HEAD.portZ[0] + HEAD.portZ[1]) / 2];
    round(`flame.${j}`, crownG, frame(o, dir, AX.z), 0, 13, [2.3, 0.25], { material: "flame", tone: "mid", crease: "faint" });
  }
  anchors.head = [hx, hy, 66];
  anchors.ports = [hx - HEAD.rCrown, hy + 6, 66];
  anchors.cap = [hx, hy, HEAD.capZ[2]];

  // ---------- electrode on its bracket from the chamber ----------
  const elecG = assembly("electrode", AX.z, 60, 0.16);
  box("electrode.bracket", mixG, [ELECTRODE.x - ELECTRODE.r - 1, hx - 20], [ELECTRODE.y - 3, ELECTRODE.y + 3], [ELECTRODE.z[0] - 3, ELECTRODE.z[0]], { material: "steel" });
  round("electrode.insulator", elecG, up(ELECTRODE.x, ELECTRODE.y), ELECTRODE.z[0], ELECTRODE.z[1], [ELECTRODE.r, ELECTRODE.r - 0.6], {
    material: "porcelain",
    details: { seams: [ELECTRODE.z[0] + 6, ELECTRODE.z[0] + 12] },
  });
  {
    const a = [ELECTRODE.x + 0.3, ELECTRODE.y, ELECTRODE.z[1] + 1.4];
    const tip = [hx - HEAD.rCrown - 2.4, hy, 66.6];
    const d = sub(tip, a);
    round("electrode.wire", elecG, frame(a, d, AX.y), 0, Math.hypot(...d), 0.6, { material: "steel", tone: "hi" });
  }
  anchors.electrode = [ELECTRODE.x + 3, ELECTRODE.y, 62];

  // ---------- venturi tube: diffuser, throat, bell, shutter sleeve, collar with its air openings ----------
  const tubeG = mixG;
  const TF = alongY();
  round("tube.diffuser", tubeG, TF, hy + 20, 44, [12, 8], { material: "steel", details: { seams: [10] } });
  round("tube.throat", tubeG, TF, 44, 52, 8, { material: "steel" });
  round("tube.bell", tubeG, TF, 52, 64, [8, 16.6], { material: "steel" });
  round("tube.collar.rear", tubeG, TF, 64, 76, 16.6, { material: "steel" });
  const collarFront = round("tube.collar.front", tubeG, TF, 88, 92, 16.6, { material: "steel" });
  // the open mouth round the orifice: three air openings in the collar's front plate
  {
    let d = ring(6.2, 40);
    for (let j = 0; j < 3; j++) {
      const a0 = (TAU * j) / 3 + 0.35, a1 = a0 + TAU / 3 - 0.7;
      const arc = (r, from, to, n = 12) => Array.from({ length: n + 1 }, (_, i) => { const a = from + ((to - from) * i) / n; return [r * Math.cos(a), r * Math.sin(a)]; });
      const pts = [...arc(14.2, a0, a1), ...arc(8.6, a1, a0)];
      d += "M" + pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L") + "Z";
    }
    plane(collarFront, [0, 92.02, ZT], [-1, 0, 0], [0, 0, -1], `<path class="ar-hole" d="${d}"/>` + line(d, "hi"), AX.y);
  }
  const shutterG = T.group("shutter", { parent: tubeG, slide: { direction: AX.y, travel: 10 } });
  groups.shutter = shutterG;
  round("tube.shutter", shutterG, TF, 76, 88, 18.4, { material: "chrome", details: { seams: [78, 86] } });
  round("tube.shutter.screw", shutterG, frame([0, 82, ZT + 18.4], AX.z, AX.x), 0, 3.2, 1.8, { material: "steel" });
  round("tube.shutter.head", shutterG, frame([0, 82, ZT + 18.4], AX.z, AX.x), 3.2, 5.4, 3.2, { material: "steel" });
  box("tube.cradle", core, [-6, 6], [44, 52], [floor, ZT - 8], { material: "steel" });
  anchors.venturi = [0, 48, ZT + 8];
  anchors.shutter = [0, 82, ZT + 18];

  // ---------- valve: body, bonnet, nozzle, orifice hood; inlet boss and pipe to the elbow ----------
  const valveG = assembly("valve", AX.z, 50, 0.2);
  const VF = alongY();
  round("hood.tip", valveG, VF, 93.5, 97.5, [2.2, 4], { material: "brass" });
  prismY("hood.hex", valveG, circlePoly(6.5).map(([a, b]) => [ZT + a, b]), 97.5, 103.5, { material: "brass" });
  round("valve.nozzle", valveG, VF, 103.5, 112, 4.5, { material: "brass" });
  round("valve.body", valveG, VF, 112, 140, 12.5, { material: "brass", details: { seams: [116, 136] } });
  prismY("valve.bonnet", valveG, circlePoly(8.4).map(([a, b]) => [ZT + a, b]), 140, 147, { material: "brass" });
  round("valve.boss", valveG, frame([0, 126, ZT], AX.x, AX.y), 12.5, 18, 4.2, { material: "brass" });
  round("valve.inlet", valveG, frame([0, 126, ZT], AX.x, AX.y), 18, 54.6, 3.6, { material: "steel" });
  box("valve.bracket", core, [-8, 8], [120, 132], [floor, ZT - 12.5], { material: "steel" });
  anchors.orifice = [0, 95, ZT];
  anchors.valve = [0, 128, ZT + 12];

  // ---------- gas line: elbow block and the long pipe to the back wall ----------
  const lineG = assembly("gasline", NX, 24, 0.5);
  box("gas.elbow", lineG, [56, 64], [122, 130], [ZT - 4, ZT + 4], { material: "brass", bevel: 0.3 });
  round("gas.pipe", lineG, alongY(60, ZT), -D + wall, 122, 3.6, { material: "steel", details: { seams: [-120, 40] } });
  box("gas.clip", core, [55, 65], [-104, -96], [floor, ZT - 3.6], { material: "steel" });

  // ---------- spark switch under the stem, spark module on the floor ----------
  const switchG = assembly("switch", AX.z, 26, 0.2);
  box("switch.body", switchG, [-9, 9], [159, 171], [12, 23], { material: "porcelain", bevel: 0.3 });
  box("switch.tab.a", switchG, [9, 12], [161, 163], [14, 19], { material: "copper" });
  box("switch.tab.b", switchG, [9, 12], [167, 169], [14, 19], { material: "copper" });
  box("switch.post", core, [-4, 4], [162, 168], [floor, 12], { material: "steel" });
  anchors.switch = [0, 165, 23];
  const moduleG = assembly("module", AX.z, 36, 0.2);
  const mod = box("module.body", moduleG, [80, 132], [100, 150], [floor, 26], { material: "gunmetal", bevel: 0.5 });
  plane(mod, [106, 125, 26.02], TOPF.u, TOPF.v, text(0, -6, "SPARK", 3.6, "hi") + text(0, 0, "120 V · 2 Hz", 3, "mid"), AX.z);
  round("module.tower", moduleG, up(120, 112), 26, 34, [5, 4], { material: "porcelain" });
  round("module.lead", moduleG, up(92, 112), 26, 30, 2.2, { material: "rubber" });
  anchors.module = [106, 125, 26];

  // ---------- the knob, its stem and the cam (turn together; pull off forward) ----------
  const knobLift = assembly("knob.lift", AX.y, 90, 0);
  const knob = hinge("knob", knobLift, [0, 0, ZT], AX.y, [-300, 300]);
  const KF = alongY();
  round("stem.rear", knob, KF, 147, 163, 3, { material: "steel" });
  {
    const lobe = Array.from({ length: 24 }, (_, j) => {
      const a = (TAU * j) / 24;
      const r = 5.6 + 1.8 * Math.max(0, Math.cos(a)) ** 2;
      return [ZT - r * Math.cos(a), r * Math.sin(a)]; // lobe points down at OFF
    });
    prismY("stem.cam", knob, lobe, 163, 167, { material: "steel" });
  }
  round("stem.front", knob, KF, 167, D + 2, 3, { material: "steel" });
  round("knob.skirt", knob, KF, D + 2, D + 5, 24, { material: "chrome", tone: "mid" });
  round("knob.body", knob, KF, D + 5, D + 22, 21, { material: "chrome", details: { ribs: { s0: D + 6, s1: D + 21, count: 64, fade: [0.08, 0.55], seams: true, tone: "lo" } } });
  const fin = prismY("knob.fin", knob, [[ZT + 16, -2.8], [ZT + 18.4, 0], [ZT + 16, 2.8], [ZT - 15, 2.8], [ZT - 15, -2.8]], D + 22, D + 29, { material: "chrome", lit: true });
  plane(fin, [0, D + 29.02, ZT + 12], FRONT.u, FRONT.v, `<circle cx="0" cy="0" r="1.3" fill="#d6452f"/>`, AX.y);
  anchors.knob = [0, D + 26, ZT];
  anchors.cam = [0, 165, ZT - 5];
  anchors.body = [0, 0, 40];

  // states the order must hold in: the knob through its travel, the shutter, both
  for (let i = 0; i <= 9; i++) features.push({ knob: i * 30 });
  features.push({ shutter: 10 }, { shutter: 10, knob: 90 });
  return { parts, groups, explode, root, anchors, features, counts: { ports: N_FLAME } };
}
export function explodeValues(explode, apart, { stretch = 0.55 } = {}) {
  const out = {};
  for (const { name, travel, delay } of explode) {
    const t = Math.max(0, Math.min(1, (apart - delay * stretch) / (1 - stretch)));
    out[name] = travel * t * t * (3 - 2 * t);
  }
  return out;
}
