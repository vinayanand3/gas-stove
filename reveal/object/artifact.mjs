// The figure page as an Artifact body: the turnable hob, buttons for touch screens, and the reveal film.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(HERE, "figure-light.html"), "utf8");
const head = page.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<meta[^>]*>/g, "").replace(/<title>[^<]*<\/title>/, "");
let inner = page.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];
const controls = `<div class="ar-controls" role="group" aria-label="Burner controls">
  <button type="button" data-go="knob" aria-pressed="false">Turn to LITE</button>
  <button type="button" data-go="flame" aria-pressed="false">Light it</button>
  <button type="button" data-go="apart" aria-pressed="false">Take apart</button>
</div>`;
// put the buttons right after the figure card
inner = inner.replace(/(<figcaption)/, `${controls}$1`);
const film = `<section class="ar-film">
  <h2>The reveal</h2>
  <p>Ten seconds, one take: the hob tumbles in, the knob turns to LITE, the flames catch round the crown, and it comes apart and back together.</p>
  <video src="burner-reveal.mp4" poster="poster.jpg" controls muted loop playsinline preload="metadata" width="1080" height="1080"></video>
</section>`;
const css = `<style>
:root{--ar-page:#f2f2ef}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--ar-page:#0b0b0b;color-scheme:dark}}
:root[data-theme="dark"]{--ar-page:#0b0b0b;color-scheme:dark}
body{background:var(--ar-page);margin:0}
.iso-root{background:var(--anatomy-page);min-height:100%;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:12px}
.ar-intro{max-width:700px;margin:12px auto 0}
.ar-intro h1{margin:0;font-size:26px;font-weight:600;letter-spacing:-.01em;color:var(--anatomy-strong);text-wrap:balance}
.ar-intro p{margin:6px 0 0;color:var(--anatomy-muted);font-size:14px;line-height:1.5;max-width:62ch}
.ar-controls{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 4px}
.ar-controls button{all:unset;cursor:pointer;padding:8px 14px;border:1px solid var(--anatomy-faint);border-radius:6px;font-family:var(--anatomy-mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--anatomy-text);background:var(--anatomy-card)}
.ar-controls button[aria-pressed="true"]{border-color:#e2533b;color:var(--anatomy-strong)}
.ar-controls button:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:2px}
.ar-film{max-width:700px;margin:8px auto 32px}
.ar-film h2{margin:0;font-size:18px;font-weight:600;color:var(--anatomy-strong)}
.ar-film p{margin:6px 0 12px;color:var(--anatomy-muted);font-size:14px;line-height:1.5;max-width:62ch}
.ar-film video{display:block;width:100%;max-width:100%;height:auto;aspect-ratio:1/1;background:#f1ece2;border:1px solid var(--anatomy-faint)}
</style>`;
const pick = `<script>(function(){var r=document.documentElement.getAttribute("data-theme");var dark=r?r==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.getElementById("ar-root").setAttribute("data-theme",dark?"dark":"light");})();</script>`;
const wire = `<script>(function(){
  const state = { knob: false, flame: false, apart: false };
  const btn = (k) => document.querySelector('[data-go="' + k + '"]');
  const sync = () => {
    btn("knob").textContent = state.knob ? "Turn to OFF" : "Turn to LITE";
    btn("flame").textContent = state.flame ? "Put it out" : "Light it";
    btn("apart").textContent = state.apart ? "Put together" : "Take apart";
    for (const k in state) btn(k).setAttribute("aria-pressed", String(state[k]));
  };
  const go = (v) => window.__anatomy && window.__anatomy.go(v);
  btn("knob").addEventListener("click", () => { state.knob = !state.knob; if (!state.knob) state.flame = false; go({ knob: state.knob ? 90 : 0, flame: state.flame ? 1 : 0 }); sync(); });
  btn("flame").addEventListener("click", () => { state.flame = !state.flame; if (state.flame) state.knob = true; go({ knob: state.knob ? 90 : 0, flame: state.flame ? 1 : 0, apart: 0 }); state.apart = false; sync(); });
  btn("apart").addEventListener("click", () => { state.apart = !state.apart; go({ apart: state.apart ? 1 : 0 }); sync(); });
  sync();
})();</script>`;
const intro = `<header class="ar-intro"><h1>Gas Burner Teardown</h1><p>The same kitchen burner, built as a real single-burner hob from 116 solid parts. Drag to turn it any way you like, hover (or tap Take apart) to see inside, and turn the knob to light it.</p></header>`;
const html = `<title>Gas Burner Teardown</title><meta name="claude:viewport-fit-sides" content="cover">${head}${css}<div class="iso iso-root" id="ar-root" data-theme="light">${pick}${intro}${inner}${film}${wire}</div>`;
writeFileSync(join(HERE, "..", "artifact.html"), html);
console.log(`wrote artifact.html · ${(html.length / 1024).toFixed(0)} KB`);
