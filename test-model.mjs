// Checks for model.mjs. Run `node test-model.mjs`; exits non-zero on any failure.
import * as M from "./model.mjs";

let failed = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? `  (${detail})` : ""}`);
  if (!ok) failed++;
};
const near = (a, b, tol) => Math.abs(a - b) <= tol;

const hi = M.steady(M.DETENTS.HI, 1);
const med = M.steady(M.DETENTS.MED, 1);
const lo = M.steady(M.DETENTS.LO, 1);
const off = M.steady(M.DETENTS.OFF, 1);

check("OFF passes no gas", off.qGas === 0 && off.power === 0);
check("HI is about 2.6 kW (8,800 Btu/h)", near(hi.power, 2590, 60), `${hi.power.toFixed(0)} W`);
check("HI puts the full 4.0 in. w.c. on the orifice", near(hi.inwc, 4.0, 0.01), hi.inwc.toFixed(2));
check("power falls monotonically from HI to LO", hi.power > med.power && med.power > lo.power);
check("LO simmer is about 15 % of HI", near(lo.power / hi.power, 0.15, 0.01));
check("open shutter gives 50 to 60 % primary air", hi.aeration > 0.5 && hi.aeration < 0.6, `${(hi.aeration * 100).toFixed(0)} %`);
check("entrainment ratio does not depend on the valve setting", near(hi.r, lo.r, 1e-9));
check("inner cone 5 to 15 mm at HI", hi.cone > 0.005 && hi.cone < 0.015, `${(hi.cone * 1000).toFixed(1)} mm`);
check("inner cone shrinks at LO", lo.cone < hi.cone / 4);
check("no flashback or lift-off at the detents", [hi, med, lo].every((s) => !s.flashback && !s.lift));

const closed = M.steady(M.DETENTS.HI, 0.2);
check("closing the shutter cuts primary air", closed.aeration < hi.aeration / 2, `${(closed.aeration * 100).toFixed(0)} %`);
check("closing the shutter brings yellow tips", closed.yellow > 0.9 && hi.yellow === 0);
check("closing the shutter lengthens the flame", closed.outer > hi.outer);

check("spark switch closed only around LITE", M.switchClosed(M.DETENTS.LITE) && !M.switchClosed(M.DETENTS.HI) && !M.switchClosed(M.DETENTS.OFF));

// the ignition sequence: push, turn to LITE over 0.75 s, hold
const S = M.initial();
let firstSpark = null, litAt = null, roundAt = null;
for (let i = 0; i < 600; i++) {
  const t = i / 120;
  const theta = t < 0.3 ? 0 : Math.min(M.DETENTS.LITE, (t - 0.3) * 120);
  const o = M.step(S, theta, 1, 1 / 120);
  if (o.fired && firstSpark === null) firstSpark = t;
  if (o.lit && litAt === null) litAt = t;
  if (o.spread >= Math.PI && roundAt === null) roundAt = t;
}
check("first spark within 0.1 s of the switch closing", firstSpark !== null && firstSpark - (0.3 + M.SWITCH[0] / 120) < 0.1, `${firstSpark?.toFixed(2)} s`);
check("lights within two sparks", litAt !== null && litAt - firstSpark <= 0.55, `${litAt?.toFixed(2)} s`);
check("flame runs round the ring in under 0.3 s", roundAt !== null && roundAt - litAt < 0.3, `${(roundAt - litAt).toFixed(2)} s`);

// turning off puts the flame out
for (let i = 0; i < 240; i++) M.step(S, 0, 1, 1 / 120);
check("flame goes out at OFF", !S.lit);

console.log(failed ? `${failed} failed` : "all passed");
process.exitCode = failed ? 1 : 0;
