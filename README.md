# How a Kitchen Gas Burner Works

An interactive engineering figure of a domestic gas range burner, from ignition to flame, built with the [Anatomy](https://github.com/wheresryan22/anatomy) skill.

**Live:** [vinayanand3.github.io/gas-stove](https://vinayanand3.github.io/gas-stove/) (light) · [dark](https://vinayanand3.github.io/gas-stove/gas-burner-dark.html), once GitHub Pages is enabled for this repo.

It follows the real sequence: push and turn the knob to LITE, the plug valve opens and a cam on its stem closes the spark switch, gas leaves the orifice as a jet, the venturi pulls in primary air through the air shutter, the mixture reaches the ports, the electrode's spark lights it, and the flame runs round the ring. Two views:

- **SECTION**: a side elevation cut on the burner's centre plane, with hatched cut faces by material and labels on leaders. A WebGL layer shows the amber gas jet, blue entrained air through the shutter window, the mixture rising through the head, the flames at the ports and the spark.
- **ORTHO**: the whole rig in isometric on its test base: knob and panel with detent marks, valve hung from the manifold with its regulator, orifice hood in the shutter collar, venturi under the cooktop, burner head with ports, cap and electrode in the drip bowl, spark module and leads. Flames are drawn per port in the same camera, hidden behind the crown and cap.

Controls: a stove knob you drag (or tap OFF · LITE · HI · MED · LO round it, or use ← → and Space), wheel to zoom and drag to pan, double-click to reset. Beside the knob a panel says in plain words what is happening now and steps through the sequence; an inset shows heat output and the readout gives phase, valve opening, kW and Btu/h. Turn straight past LITE and it won't light: the spark needs the mixture to have reached the ports, just as on a real range.

## Files

| File | What it is |
|---|---|
| `model.mjs`, `test-model.mjs` | The physics and its checks |
| `parts.mjs` | Shared dimensions (mm) |
| `section.mjs`, `ortho.mjs` | The two views |
| `live.js`, `style.css` | Page behaviour, shaders, styling |
| `build.mjs` | `node build.mjs` writes `gas-burner.html`, `gas-burner-dark.html` and `artifact.html` (needs `npm install` for polygon-clipping) |
| `kit/`, `scripts/` | The Anatomy kit and its capture and line-end checks |

## The model (`model.mjs`)

Every number the figure shows comes from one small, pure module:

| Quantity | How it is computed | Status |
|---|---|---|
| Gas flow | Bernoulli flow through a 1.45 mm orifice (Cd 0.8) at 4.0 in. w.c. regulated natural gas | Textbook |
| Valve setting | Valve and orifice in series; a contoured plug gives roughly linear heat from HI down to a 15 % simmer at LO | Textbook, contour assumed |
| Orifice pressure | (effective area / orifice area)² of the supply | Textbook |
| Primary air | Prigg's injector relation (1 + r)(1 + r·s) = Λ·At/Ao, with one fitted loss factor; the shutter adds a loss as it closes | Approximate |
| Inner cone | h = (w/2)·√((u/S)² − 1) with a fitted burning velocity for the rich primary mixture | Approximate, for trends |
| Flame length, yellow tips | Fitted trends | Illustrative |
| Ignition | 2 Hz spark while the switch is closed; lights once mixture has crossed the tube (transport delay = volume / flow); flame crossfires round the ring at 0.45 m/s | Approximate |

At HI the burner gives about 2.6 kW (8,800 Btu/h) with 54 % primary aeration and a 9.6 mm inner cone; LO is about 0.39 kW. Closing the air shutter to 20 % drops primary air to about 20 % and brings lazy, yellow-tipped flames.

```sh
node test-model.mjs   # checks the model's numbers and the ignition sequence
```

## License

MIT
