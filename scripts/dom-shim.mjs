// Minimal browser environment for running Excalidraw's packages under plain Node.
//
// Both entry points need this:
//   - scripts/build-scene.mjs  → @excalidraw/excalidraw (convertToExcalidrawElements)
//   - scripts/render.mjs       → @excalidraw/utils      (exportToSvg)
//
// Import this module *before* importing either package. The Excalidraw bundles
// touch `document`, `devicePixelRatio` and a 2D canvas context at module-eval
// time, so a shim installed afterwards is too late.

import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", {
  pretendToBeVisual: true,
});

export const { window } = dom;

const SHIM_KEYS = [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "HTMLImageElement",
  "HTMLCanvasElement",
  "Element",
  "Node",
  "DocumentFragment",
  "SVGElement",
  "Image",
  "DOMParser",
  "XMLSerializer",
  "getComputedStyle",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "devicePixelRatio",
  "location",
  "matchMedia",
  "performance",
  "CustomEvent",
  "Event",
  "MutationObserver",
];

for (const key of SHIM_KEYS) {
  if (window[key] !== undefined && globalThis[key] === undefined) {
    globalThis[key] = window[key];
  }
}

/**
 * FontFace + document.fonts stubs — JSDOM implements neither.
 *
 * `@excalidraw/utils` reads `unicodeRange` to build a glyph-range regex; if it
 * is undefined the export crashes inside getUnicodeRangeRegex. The browser
 * default per CSS Fonts spec is "U+0-10FFFF" — mirror that.
 */
class FontFaceStub {
  constructor(family, source, descriptors = {}) {
    this.family = family;
    this.source = source;
    this.unicodeRange = descriptors.unicodeRange ?? "U+0-10FFFF";
    this.style = descriptors.style ?? "normal";
    this.weight = descriptors.weight ?? "normal";
    this.stretch = descriptors.stretch ?? "normal";
    this.display = descriptors.display ?? "auto";
    this.featureSettings = descriptors.featureSettings ?? "normal";
    this.variant = descriptors.variant ?? "normal";
    this.status = "loaded";
    this.loaded = Promise.resolve(this);
  }
  async load() {
    return this;
  }
}
if (globalThis.FontFace === undefined) {
  globalThis.FontFace = FontFaceStub;
}

const fontSet = new Set();
const fontFacesShim = {
  add: (face) => (fontSet.add(face), fontFacesShim),
  delete: (face) => fontSet.delete(face),
  has: (face) => fontSet.has(face),
  clear: () => fontSet.clear(),
  check: () => true,
  load: async () => Array.from(fontSet),
  ready: Promise.resolve(),
  status: "loaded",
  forEach: (cb) => fontSet.forEach(cb),
  [Symbol.iterator]: () => fontSet[Symbol.iterator](),
  get size() {
    return fontSet.size;
  },
};
Object.defineProperty(globalThis.document, "fonts", {
  value: fontFacesShim,
  configurable: true,
});

/**
 * 2D canvas context stub.
 *
 * JSDOM's getContext("2d") returns null without the native `canvas` package,
 * and the editor bundle dereferences it at module scope
 * (`"filter" in document.createElement("canvas").getContext("2d")`), so a null
 * return crashes the import outright.
 *
 * Only `measureText` has to produce meaningful numbers: it is what sizes bound
 * text and therefore what grows a container to fit its label. The metrics below
 * are a deliberate approximation — see the note in scripts/build-scene.mjs
 * about why label boxes are sized generously rather than exactly.
 */
const AVG_ADVANCE_RATIO = 0.55; // mean glyph width as a fraction of font size
const ASCENT_RATIO = 0.8;
const DESCENT_RATIO = 0.2;

const parseFontSize = (font) => {
  const match = /(\d+(?:\.\d+)?)px/.exec(String(font ?? ""));
  return match ? Number(match[1]) : 16;
};

// CJK glyphs are full-width; Latin is roughly half that. Counting them
// separately keeps a Korean label from being sized as if it were English.
const WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹯＀-｠￠-￦]/;

const advanceUnits = (text) => {
  let units = 0;
  for (const ch of String(text)) units += WIDE.test(ch) ? 1 : AVG_ADVANCE_RATIO;
  return units;
};

const context2d = {
  filter: "none",
  font: "16px sans-serif",
  textAlign: "left",
  textBaseline: "alphabetic",
  measureText(text) {
    const size = parseFontSize(this.font);
    const width = advanceUnits(text) * size;
    return {
      width,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: width,
      actualBoundingBoxAscent: size * ASCENT_RATIO,
      actualBoundingBoxDescent: size * DESCENT_RATIO,
      fontBoundingBoxAscent: size * ASCENT_RATIO,
      fontBoundingBoxDescent: size * DESCENT_RATIO,
    };
  },
  createLinearGradient: () => ({ addColorStop() {} }),
  createPattern: () => null,
  getImageData: () => ({ data: new Uint8ClampedArray(4) }),
  // Everything else is drawing, and nothing here ever rasterises.
};
for (const noop of [
  "save", "restore", "scale", "translate", "rotate", "transform", "setTransform",
  "resetTransform", "beginPath", "closePath", "moveTo", "lineTo", "bezierCurveTo",
  "quadraticCurveTo", "arc", "arcTo", "ellipse", "rect", "roundRect", "fill",
  "stroke", "clip", "clearRect", "fillRect", "strokeRect", "fillText",
  "strokeText", "drawImage", "putImageData", "setLineDash", "getLineDash",
]) {
  context2d[noop] = () => {};
}
globalThis.HTMLCanvasElement.prototype.getContext = function getContext(type) {
  return type === "2d" ? context2d : null;
};
