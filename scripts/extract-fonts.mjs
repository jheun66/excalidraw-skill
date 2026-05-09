#!/usr/bin/env node
// One-time font extraction for the Node renderer.
//
// resvg ignores @font-face declarations inside the SVG, so woff2 fonts that
// @excalidraw/utils inlines as data: URLs never reach the PNG. We extract
// them once to a cache dir and point resvg at it via font.fontDirs.
//
// Output layout: <skillDir>/fonts/
//   *.ttf      — copied from @excalidraw/utils/dist/prod/assets
//   *.woff2    — every data:font/woff2 inlined in the bundle (Xiaolai chunks
//                + per-script Excalifont/Cascadia/Nunito/etc. faces)

import { readFile, writeFile, mkdir, copyFile, readdir, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const skillDir = resolve(here, "..");
const fontsDir = join(skillDir, "fonts");
const utilsDir = join(skillDir, "node_modules/@excalidraw/utils/dist/prod");
const utilsPkgPath = join(skillDir, "node_modules/@excalidraw/utils/package.json");
const bundlePath = join(utilsDir, "index.js");
const ttfDir = join(utilsDir, "assets");

const STAMP = join(fontsDir, ".extracted");

async function utilsVersion() {
  return JSON.parse(await readFile(utilsPkgPath, "utf8")).version;
}

export async function ensureFonts() {
  const version = await utilsVersion();
  if (existsSync(STAMP)) {
    const stamp = await readFile(STAMP, "utf8");
    if (stamp.includes(`version=${version}`)) return fontsDir;
  }
  await extract(version);
  return fontsDir;
}

async function clearFonts() {
  if (!existsSync(fontsDir)) return;
  for (const name of await readdir(fontsDir)) {
    if (name.endsWith(".ttf") || name.endsWith(".woff2") || name === ".extracted") {
      await unlink(join(fontsDir, name));
    }
  }
}

async function extract(version) {
  await clearFonts();
  await mkdir(fontsDir, { recursive: true });

  let ttfCount = 0;
  for (const name of await readdir(ttfDir)) {
    if (!name.toLowerCase().endsWith(".ttf")) continue;
    await copyFile(join(ttfDir, name), join(fontsDir, name));
    ttfCount++;
  }

  const bundle = await readFile(bundlePath, "utf8");
  const matches = bundle.match(/data:font\/woff2;base64,[A-Za-z0-9+/=]+/g) ?? [];
  const pad = String(matches.length).length;
  let woff2Count = 0;
  for (const [i, url] of matches.entries()) {
    const buf = Buffer.from(url.split(",")[1], "base64");
    const fname = `excalidraw-${String(i + 1).padStart(pad, "0")}.woff2`;
    await writeFile(join(fontsDir, fname), buf);
    woff2Count++;
  }

  await writeFile(STAMP, `version=${version} ttf=${ttfCount} woff2=${woff2Count}\n`);
  console.error(`extracted ${ttfCount} TTF + ${woff2Count} woff2 (utils@${version}) → ${fontsDir}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await extract(await utilsVersion());
}
