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
import { ensureFonts } from "./extract-fonts.mjs";

// -------- Step 1. DOM shim — exportToSvg uses browser APIs.
// Shared with scripts/build-scene.mjs; see scripts/dom-shim.mjs.
import { window } from "./dom-shim.mjs";

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
