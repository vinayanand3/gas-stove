// How a Kitchen Gas Burner Works. `node build.mjs` writes gas-burner.html (light) and gas-burner-dark.html.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import { glCamera } from "./kit/gl.mjs";
import { kitScript, glScript } from "./scripts/inline-kit.mjs";
import * as M from "./model.mjs";
import { buildSection, knobSvg, sleeveSvg, plugSvg } from "./section.mjs";
import { buildOrtho } from "./ortho.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const W = 960, H = 470;

// ---------- section view ----------
const SEC = buildSection(W, H);
const secBack = k.figureSvg({
  width: W, height: H, className: "gb-back",
  label: "Section through a gas range burner on a test base: the knob and its stem, the spark switch, the brass plug valve hung from the manifold, the orifice hood firing into the air shutter and the venturi mixing tube, and the burner head with its ports, cap and spark electrode under a cooktop and drip bowl.",
  body: `${SEC.defs}<g class="far">${SEC.back}</g><g class="cavities">${SEC.cavitySvg}</g><g class="fallback" data-fallback="sec"></g>`,
});
const secFront = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg gb-front" viewBox="0 0 ${W} ${H}" aria-hidden="true">${SEC.defs.replace(/id="h-/g, 'id="f-h-').replace(/<defs>[\s\S]*<\/defs>/, "")}<g class="cuts">${SEC.cutsSvg}<g data-dyn="plug">${plugSvg(k, SEC.P, 1)}</g>${SEC.edgesSvg}<g data-dyn="sleeve">${sleeveSvg(k, SEC.P, 1)}</g></g><g data-dyn="knob">${SEC.knob}</g><g class="labels">${SEC.labels}</g></svg>`;

// ---------- ortho view ----------
const ORT = buildOrtho(W, H);

const view = (name, back, front, extra = "") => `<div class="gb-view" data-view="${name}">${back}<canvas class="gb-gl" aria-hidden="true"></canvas>${front}${extra}</div>`;
const stage = `<div class="gb-stage" tabindex="0" role="slider" aria-label="Gas burner. Use the stage tabs or the left and right arrow keys to turn the knob; drag to pan, wheel to zoom." aria-valuemin="0" aria-valuemax="${M.KNOB_MAX}" aria-valuenow="0" aria-valuetext="Off">
  ${view("section", secBack, secFront)}
  ${view("ortho", ORT.back, ORT.front)}
  <div class="gb-inset" aria-hidden="true"><div class="gb-inset-k">Orifice pressure</div><div class="gb-inset-v"><span data-inset>0.00</span><small>in. w.c.</small><i class="gb-bar"><b data-bar></b></i></div></div>
  <div class="gb-toggle" role="group" aria-label="View"><button type="button" data-set-view="section" aria-pressed="true">Section</button><button type="button" data-set-view="ortho" aria-pressed="false">Ortho</button></div>
  <div class="gb-live" aria-live="polite" data-live></div>
</div>`;

const TABS = ["OFF", "LITE", "HI", "MED", "LO"];
const controls = `<div class="gb-foot"><span class="gb-hint">Click or ← → to turn the knob · drag pans · wheel zooms</span><span class="gb-readout" data-readout>OFF · 0.00 kW</span></div>
<div class="gb-tabs" role="tablist">${TABS.map((t) => `<button type="button" role="tab" data-stage="${t}" aria-selected="${t === "OFF"}">${t}</button>`).join("")}</div>
<label class="gb-shutter"><span>Air shutter</span><input type="range" min="0.1" max="1" step="0.01" value="1" data-shutter aria-label="Air shutter opening"><output data-shutter-out>100 %</output></label>`;

const caption = "A natural-gas range burner on a test base, cut down its centre line. Push and turn the knob to LITE: the brass plug valve opens and a cam on the stem closes the spark switch. Gas at 4 in. w.c. leaves the 1.45 mm orifice as a jet that drags primary air in through the shutter, and the venturi mixes them on the way to the head. When the mixture reaches the ports the next spark lights it, and the flame runs round the ring. At HI the burner gives about 2.6 kW (8,800 Btu/h) with half its air premixed; close the shutter and the flame turns lazy and yellow-tipped. Lumped model: orifice flow and valve throttling are textbook, entrainment and flame size are fitted approximations.";

const body = `<header class="gb-head"><h1>Gas Burner</h1><p>Ignition, gas flow and combustion in a kitchen range burner</p></header>
<figure class="iso-figure gb"><div class="iso-plate">${stage}${controls}</div><figcaption class="iso-legend"><span class="iso-caption">${caption}</span></figcaption></figure>`;

const DATA = {
  W, H,
  sec: { ...SEC.DATA, camera: glCamera(SEC.P) },
  ort: { ...ORT.DATA, camera: glCamera(ORT.P) },
  detents: M.DETENTS, knobMax: M.KNOB_MAX, burner: M.BURNER,
};
const strip = (f) => readFileSync(join(HERE, f), "utf8").replace(/^import .*$/gm, "").replace(/^export /gm, "");
const latheSource = strip("kit/lathe.mjs");
const latheScript = `const G = (() => {${latheSource}\nreturn { viewOf, lightOf, scaleOf, frameAlong, frameOf, pointOf, disc, sphereOf, prismOf, circleOf, arcOf, ribsOf, dotsOf, lathe, solidOf, hullOf, toneOf, bandOf, dot3, add3, sub3, mul3, unit3, cross3, len3 };})();\n`;
const dyn = [knobSvg, sleeveSvg, plugSvg, ...ORT.dynamic].map((fn) => fn.toString()).join("\n");
const CSS = readFileSync(join(HERE, "style.css"), "utf8");
const LIVE = readFileSync(join(HERE, "live.js"), "utf8").replace("__DATA__", JSON.stringify(DATA));
const script = kitScript() + glScript() + latheScript + strip("model.mjs") + dyn + "\n" + LIVE;

for (const theme of ["light", "dark"]) {
  const page = k.pageHtml({ title: "How a Kitchen Gas Burner Works", theme, body: `<style>${CSS}</style>${body}`, script, width: 1040 });
  const name = theme === "light" ? "gas-burner.html" : "gas-burner-dark.html";
  writeFileSync(join(HERE, name), page);
  console.log("wrote", name, `${(page.length / 1024).toFixed(0)} KB`);
}
