#!/usr/bin/env node
// Bundles the two functions build-scene.mjs needs out of @excalidraw/excalidraw.
//
// Why a bundle step at all: the published package ships a single "." export
// whose bundle is written for a web bundler, not for Node's ESM resolver. It
// imports extensionless paths ("roughjs/bin/rough"), imports JSON without an
// import attribute, and pulls a CJS-only dependency through a named import.
// Node refuses all three. esbuild resolves them the way a web bundler would.
//
// Run automatically by `npm install` (the "prepare" script). The output is
// generated, not source — see .gitignore.

import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const outfile = resolve(here, ".generated/excalidraw.mjs");

await mkdir(dirname(outfile), { recursive: true });

await build({
  stdin: {
    contents: `export { convertToExcalidrawElements, restore, setCustomTextMetricsProvider } from "@excalidraw/excalidraw";`,
    resolveDir: resolve(here, ".."),
    sourcefile: "excalidraw-entry.mjs",
    loader: "js",
  },
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node20",
  outfile,
  // The editor's stylesheet and web fonts are dead weight here — nothing in
  // this pipeline renders. Dropping them avoids dragging binary assets through
  // esbuild's loaders.
  loader: { ".woff2": "empty", ".ttf": "empty", ".css": "empty", ".svg": "text" },
  define: { "process.env.NODE_ENV": '"production"' },
  external: ["canvas"],
  logLevel: "warning",
});

console.log(`wrote: ${join("scripts/.generated", "excalidraw.mjs")}`);
