import * as k from "./kit/iso-kit.mjs";
export function buildOrtho(W, H) {
  const P = k.fitProjection([[-300, -110, -20], [190, 110, 200]], W, H, { pad: 20, azimuth: 118, elevation: 30 });
  return { P, back: k.figureSvg({ width: W, height: H, className: "gb-back", label: "ortho", body: "" }), front: `<svg class="iso-svg gb-front" viewBox="0 0 ${W} ${H}"></svg>`, DATA: {}, dynamic: [] };
}
