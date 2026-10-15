# How a Kitchen Gas Burner Works

An interactive engineering figure of a domestic gas range burner, from ignition to flame, built with the [Anatomy](https://github.com/wheresryan22/anatomy) skill. Work in progress.

The figure will follow the real sequence: push and turn the knob to LITE, the plug valve opens and the spark switch on its stem closes, gas leaves the orifice as a jet, the venturi pulls in primary air through the air shutter, the mixture reaches the ports, the electrode's spark lights it, and the flame runs round the ring. Two views: a SECTION cut through the valve, orifice, venturi and head, and an ORTHO isometric of the whole burner rig.

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
