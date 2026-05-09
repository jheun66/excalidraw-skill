#!/usr/bin/env node
// In-house Node renderer for .excalidraw → SVG/PNG.
//
// Pipeline:
//   .excalidraw  →  @excalidraw/utils.exportToSvg  →  SVG  →  @resvg/resvg-js  →  PNG
//
// Usage:
//   node scripts/render.mjs <input.excalidraw>

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { ensureFonts } from "./extract-fonts.mjs";

// -------- Step 1. DOM shim — exportToSvg uses browser APIs.
const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", {
  pretendToBeVisual: true,
});
const { window } = dom;
const shimKeys = [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "HTMLImageElement",
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
];
for (const key of shimKeys) {
  if (window[key] !== undefined && globalThis[key] === undefined) {
    globalThis[key] = window[key];
  }
}

// FontFace + document.fonts stubs — JSDOM does not implement these APIs.
// @excalidraw/utils reads `unicodeRange` to build a glyph-range regex; if it
// is undefined the export crashes inside getUnicodeRangeRegex. The browser
// default per CSS Fonts spec is "U+0-10FFFF" — mirror that.
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
if (globalThis.FontFace === undefined) globalThis.FontFace = FontFaceStub;

const fontSet = new Set();
const fontFacesShim = {
  add: (face) => {
    fontSet.add(face);
    return fontFacesShim;
  },
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

// -------- Step 2. Dynamic import after shim is ready.
const { exportToSvg } = await import("@excalidraw/utils");
const { Resvg } = await import("@resvg/resvg-js");

// -------- Step 3. Argv
const inputPath = process.argv[2];
if (!inputPath) {
  console.error("usage: node scripts/render.mjs <input.excalidraw>");
  process.exit(64);
}
const absInput = resolve(inputPath);
const base = absInput.replace(/\.excalidraw$/i, "");
const svgPath = `${base}.svg`;
const pngPath = `${base}.png`;

// -------- Step 4. Read .excalidraw
const raw = await readFile(absInput, "utf8");
const data = JSON.parse(raw);
const elements = data.elements ?? [];
const appState = {
  ...(data.appState ?? {}),
  exportBackground: true,
  viewBackgroundColor: data.appState?.viewBackgroundColor ?? "#ffffff",
};
const files = data.files ?? {};

// -------- Step 5. Render to SVG
const svgEl = await exportToSvg({ elements, appState, files });
const svgString =
  typeof svgEl === "string"
    ? svgEl
    : svgEl.outerHTML ?? new window.XMLSerializer().serializeToString(svgEl);

await writeFile(svgPath, svgString);

// -------- Step 6. SVG → PNG via resvg.
// resvg ignores @font-face inside the SVG, so the woff2 data URLs that
// @excalidraw/utils inlined would be discarded — text would fall back to
// system fonts. Point resvg at the extracted font cache instead.
const fontDir = await ensureFonts();
const resvg = new Resvg(svgString, {
  fitTo: { mode: "zoom", value: 2 },
  background: appState.viewBackgroundColor,
  font: {
    fontDirs: [fontDir],
    loadSystemFonts: false,
    defaultFontFamily: "Excalifont",
  },
});
const pngBuffer = resvg.render().asPng();
await writeFile(pngPath, pngBuffer);

console.log(`wrote: ${svgPath}`);
console.log(`wrote: ${pngPath}`);
