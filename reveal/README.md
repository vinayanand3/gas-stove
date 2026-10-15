# Gas burner teardown (Anatomy Reveal)

The same kitchen burner as the main figure, rebuilt as a single-burner built-in hob from 116 convex solid parts with the [Anatomy Reveal](https://github.com/annnguyentt/anatomy-reveal-skill) skill (MIT), which runs the Anatomy kit in its 3D mode. Real millimetres: a 300 × 400 mm steel case, a 34 mm burner crown with 24 ports, a 1.45 mm orifice.

- **Turnable page:** drag to spin it to any angle, hover (or tap *Take apart*) to see inside, turn the knob to LITE and light it.
- **Film:** `burner-reveal.mp4`, 10 s, 1080 × 1080, 30 fps with motion blur. Tumble in, the knob turns to LITE, the flames catch round the crown, a top-down look at the flame ring, then it comes apart and back together.

## Build

```sh
npm install                                    # puppeteer-core for the checks and render
node object/build.mjs --light                  # object/figure-light.html (and without --light for dark)
node object/scan-apart.mjs -35 28              # no pairs pass through each other
node motion/build.mjs --ratio 1:1 --duration 10
node motion/scan.mjs                           # no pass-throughs in any frame
node motion/render.mjs blur out/blur --step 4 --most 40
MAGICK=convert node motion/encode.mjs out/blur out/burner-reveal.mp4
```

`object/geometry.mjs` is the hob; `object/film.mjs` holds its titles, features (knob, flame) and readout; `motion/timeline.mjs` is the film's beats. The kit in `kit/` adds a `flame` material to the skill's copy. The flames are cones faded in by a CSS variable, so they show the flame pattern, not combustion physics; the main figure's model is the one with the numbers.
