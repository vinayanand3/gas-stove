const EASE = {
  lin: (x) => x,
  io: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  i: (x) => x * x * x,
  o: (x) => 1 - Math.pow(1 - x, 3),
  whip: (x) => (x < 0.5 ? 16 * Math.pow(x, 5) : 1 - Math.pow(-2 * x + 2, 5) / 2),
  so: (x) => 1 - Math.pow(1 - x, 2),
  si: (x) => x * x,
  back: (x) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2),
};
export const BASE_DURATION = 10;
const BASE_KEYS = [
  { t: 0, yaw: 150, pitch: 30, roll: -26, zoom: 1.45, focus: "body", panX: 0, panY: -10, apart: 0, knob: 0, flame: 0, glow: [0.8, 1.06, 0.62] },
  { t: 0.6, yaw: 108, pitch: 28, roll: -16, zoom: 1.5, ease: "si" },
  { t: 1.2, yaw: 4, pitch: 24, roll: -4, zoom: 1.66, ease: "lin", panY: -4 },
  { t: 1.62, yaw: -30, pitch: 24, roll: 0, zoom: 1.78, ease: "so", panY: 0, glow: [0.55, 0.55, 0.62] },
  { t: 1.72, yaw: -32, pitch: 24, roll: 0, zoom: 1.8, focus: "body", panX: 0, panY: 0, knob: 0, ease: "lin" },
  // the knob: pushed and turned to LITE
  { t: 1.96, yaw: -10, pitch: 8, roll: 3, zoom: 5.6, focus: "knob", panX: 0, panY: -6, knob: 0, ease: "whip", glow: [0.5, 0.55, 0.55] },
  { t: 2.3, yaw: -12, pitch: 9, roll: 3, zoom: 5.8, ease: "lin", knob: 0 },
  { t: 3.0, yaw: -16, pitch: 10, roll: 2, zoom: 6.2, focus: "knob", panY: -6, knob: 90, ease: "io" },
  // the burner head: the flames catch
  { t: 3.24, yaw: -40, pitch: 36, roll: -3, zoom: 3.3, focus: "head", panX: 0, panY: 8, flame: 0, ease: "whip", glow: [0.5, 0.45, 0.6] },
  { t: 3.6, yaw: -44, pitch: 36, roll: -3, zoom: 3.4, flame: 0, ease: "lin" },
  { t: 4.5, yaw: -54, pitch: 38, roll: -4, zoom: 3.75, focus: "head", panY: 8, flame: 1, ease: "io" },
  // over the top: the whole ring of flames
  { t: 4.74, yaw: -20, pitch: 72, roll: 0, zoom: 4.2, focus: "cap", panX: 0, panY: 0, ease: "whip" },
  { t: 5.7, yaw: 16, pitch: 70, roll: 0, zoom: 4.5, focus: "cap", ease: "lin" },
  // the whole hob, lit
  { t: 5.94, yaw: -62, pitch: 30, roll: 0, zoom: 2.0, focus: "body", panX: 0, panY: 0, ease: "whip", glow: [0.52, 0.5, 0.72] },
  { t: 6.85, yaw: -44, pitch: 30, roll: 0, zoom: 1.9, ease: "lin" },
  { t: 6.93, apart: 0, ease: "lin" },
  { t: 7.33, yaw: -50, pitch: 32, roll: -2, zoom: 1.55, apart: 1, panY: -30, ease: "o" },
  { t: 8.25, yaw: -66, pitch: 30, roll: -3, zoom: 1.5, apart: 1, panY: -30, ease: "lin" },
  { t: 8.9, yaw: -22, pitch: 22, roll: 0, zoom: 1.85, apart: 0, panY: 0, ease: "io", glow: [0.52, 0.45, 0.75] },
  { t: 10, yaw: -26, pitch: 22, roll: 0, zoom: 2.15, panY: 0, ease: "o" },
];
const BASE_LABELS = [
  { t: 0, hint: "Gas burner", readout: "single-burner built-in hob" },
  { t: 1.85, hint: "Push and turn to LITE", readout: "valve opens · spark switch closes" },
  { t: 3.15, hint: "Gas and air reach the ports", readout: "{ports} flames · 2.6 kW" },
  { t: 4.66, hint: "Blue flame at every port", readout: "primary air premixed in the tube" },
  { t: 5.86, hint: "Lit", readout: "8,800 Btu/h on HI" },
  { t: 6.8, hint: "Taken apart", readout: "{parts} parts · {assemblies} assemblies" },
  { t: 8.7, hint: "Gas burner", readout: "300 × 400 × 98 mm" },
];
const REQUESTED = typeof DATA !== "undefined" && DATA.duration ? DATA.duration : BASE_DURATION;
function retimer(keys, duration) {
  const segments = [];
  let fixed = 0;
  for (let i = 1; i < keys.length; i++) {
    const whip = keys[i].ease === "whip";
    segments.push({ a: keys[i - 1].t, b: keys[i].t, whip });
    if (whip) fixed += keys[i].t - keys[i - 1].t;
  }
  const scale = Math.max(0.35, (duration - fixed) / (BASE_DURATION - fixed));
  return (t) => {
    let out = 0;
    for (const s of segments) {
      if (t <= s.a) break;
      const part = Math.min(t, s.b) - s.a;
      out += s.whip ? part : part * scale;
    }
    return out + Math.max(0, t - BASE_DURATION) * scale;
  };
}
const RETIME = retimer(BASE_KEYS, REQUESTED);
export const DURATION = RETIME(BASE_DURATION);
export const KEYS = BASE_KEYS.map((k) => ({ ...k, t: RETIME(k.t) }));
export const LABELS = BASE_LABELS.map((l) => ({ ...l, t: RETIME(l.t) }));
const CHANNELS = ["yaw", "pitch", "roll", "zoom", "panX", "panY", "apart", ...Object.keys(FEATURE_DEFAULTS)];
const DEFAULTS = { yaw: 0, pitch: 0, roll: 0, zoom: 1, panX: 0, panY: 0, apart: 0, ...FEATURE_DEFAULTS };
function track(name) {
  const list = KEYS.filter((k) => k[name] !== void 0).map((k) => ({ t: k.t, v: k[name], ease: k.ease ?? "io" }));
  if (!list.length || list[0].t > 0) list.unshift({ t: 0, v: list.length ? list[0].v : DEFAULTS[name], ease: "lin" });
  return list;
}
const TRACKS = Object.fromEntries(CHANNELS.map((c) => [c, track(c)]));
const FOCUS = KEYS.filter((k) => k.focus !== void 0).map((k) => ({ t: k.t, v: k.focus, ease: k.ease ?? "io" }));
const GLOW = KEYS.filter((k) => k.glow !== void 0).map((k) => ({ t: k.t, v: k.glow, ease: k.ease ?? "io" }));
function sample(list, t, log = false) {
  if (t <= list[0].t) return { a: list[0].v, b: list[0].v, e: 0 };
  for (let i = 1; i < list.length; i++) {
    if (t <= list[i].t) {
      const x = (t - list[i - 1].t) / (list[i].t - list[i - 1].t || 1);
      return { a: list[i - 1].v, b: list[i].v, e: EASE[list[i].ease](x), log };
    }
  }
  const last = list[list.length - 1].v;
  return { a: last, b: last, e: 0 };
}
const mix = (a, b, e) => a + (b - a) * e;
const FRAME = typeof DATA !== "undefined" && DATA.W ? [DATA.W, DATA.H] : [540, 960];
const WIDE_FIT = Math.min(1, FRAME[0] / 540, FRAME[1] / 760);
function fitZoom(z) {
  const x = Math.max(0, Math.min(1, (z - 2.6) / 2));
  return z * Math.pow(WIDE_FIT, 1 - x * x * (3 - 2 * x));
}
export function at(t) {
  const out = {};
  for (const c of CHANNELS) {
    const { a, b, e } = sample(TRACKS[c], t);
    out[c] = c === "zoom" ? Math.exp(mix(Math.log(a), Math.log(b), e)) : mix(a, b, e);
  }
  out.zoom = fitZoom(out.zoom);
  const f = sample(FOCUS, t);
  out.focus = { a: f.a, b: f.b, e: f.e };
  const g = sample(GLOW, t);
  out.glow = g.a.map((v, i) => mix(v, g.b[i], g.e));
  let label = LABELS[0];
  for (const l of LABELS) if (t >= l.t) label = l;
  out.label = label;
  return out;
}
