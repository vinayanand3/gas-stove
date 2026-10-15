export const FILM = {
  fig: "Fig 2",
  title: "Gas burner",
  radius: 330,
  label:
    "A single-burner built-in gas hob, turning, seen close on the knob, the spark switch cam, the orifice firing into the air shutter and venturi, and the burner crown as its flames light, then taken apart into its grate, cap, crown, top plate, walls, valve, venturi tube and spark module and put back together.",
  bounds: [
    [-270, 270],
    [-330, 330],
    [-8, 350],
  ],
};

export const FIGURE = {
  title: "Gas burner · anatomy",
  start: { yaw: -32, pitch: 24 },
  label:
    "A single-burner built-in gas hob built from {parts} solid parts: a steel case with a dark top plate and a cast-iron grate; a burner head of mixing chamber, flare, crown with {ports} ports and an enamel cap, with a spark electrode beside it; a knob on the front whose stem turns a brass plug valve and a cam over the spark switch; a nozzle and orifice hood firing into the air shutter of a venturi tube; the gas line to an inlet union on the back wall; and a spark module on the floor. Apart, it opens into {assemblies} assemblies.",
  keys: [
    { mark: "lit", label: "Gas path: inlet, gas line, valve, nozzle, orifice, venturi, burner head" },
    { mark: "raised", label: "Ignition: knob cam, spark switch, spark module, electrode" },
    { mark: "edge", label: "Case: floor, walls, top plate, trim ring, grate" },
  ],
  caption:
    "{parts} convex parts, re-projected and re-shaded every frame and painted in an order solved from separating planes. Turn the knob and the cam on its stem rolls over the spark switch at LITE while the brass valve opens; light the burner and blue flames stand out of the ports. Apart, the grate, cap, crown and flare lift off the head, the top plate rises, the walls fall away, and the valve, venturi, switch and spark module lift out of the floor tray. Dimensions are a typical domestic burner, not one maker's drawing.",
};

export const FEATURE_DEFAULTS = { knob: 0, flame: 0 };

export const FEATURE_KEYS = [
  { key: "k", channel: "knob", name: "knob", unit: "°", values: [0, 90], ease: 0.25, verb: "turns the knob to LITE", tour: [0.04, 0.38] },
  { key: "f", channel: "flame", name: "flame", unit: "", values: [0, 1], ease: 0.3, verb: "lights the burner", tour: [0.12, 0.38] },
];

const clamp01 = (x) => Math.max(0, Math.min(1, x));

export function featureValues(s, values) {
  return { ...values, knob: s.knob };
}

// page-level styling a feature drives: the flames fade in with `flame` and out as the hob comes apart
export function featureCss(s) {
  const apart = s.apart ?? 0;
  const gas = clamp01((s.knob - 50) / 30);
  return { "--flame": (clamp01(s.flame) * gas * clamp01(1 - apart * 6)).toFixed(3) };
}

export function featureTravel(a, b) {
  return Math.max((Math.abs(b.knob - a.knob) * Math.PI * 21) / 180, Math.abs(b.flame - a.flame) * 30);
}

// the readout in words: where the knob is and whether it is lit
export function featureReadout(s) {
  const k = s.knob;
  const at = k < 12 ? "OFF" : k < 80 ? "opening" : k < 102 ? "LITE" : k < 150 ? "HI" : k < 230 ? "MED" : "LO";
  const lit = clamp01(s.flame) * clamp01((k - 50) / 30) > 0.5 ? "lit" : k >= 50 ? "gas on" : "no gas";
  return `${at} · ${lit}`;
}
