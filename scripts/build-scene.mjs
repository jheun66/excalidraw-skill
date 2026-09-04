#!/usr/bin/env node
// Skeleton → .excalidraw.
//
// You describe the diagram as a short list of skeleton objects; Excalidraw's own
// `convertToExcalidrawElements` expands each one into a fully-formed element and
// wires the scene together — ids, fractional `index`, `containerId`, both
// directions of `boundElements`, `startBinding`/`endBinding` with their `focus`
// and `gap`, and every style default. See references/02-drawing-api.md.
//
// Usage:
//   node scripts/build-scene.mjs <input.skeleton.json|.mjs> [output.excalidraw]
//
// A .json input is parsed; a .mjs / .js input is imported and its default export
// used, which is the path to take when the layout is computed rather than typed.
// Either may be a bare array of skeletons or { elements, appState, files }.

import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

import "./dom-shim.mjs";

const { convertToExcalidrawElements, restore, setCustomTextMetricsProvider } =
  await import("./.generated/excalidraw.mjs");

// -------- Text measurement
//
// Sizing a label is the one thing in this pipeline that genuinely needs a
// browser: Excalidraw measures glyph advances with a canvas 2D context, and
// that is what decides how wide a bound text is and therefore whether it fits
// its container. `setCustomTextMetricsProvider` is the package's own escape
// hatch for exactly this situation — "where canvas API is not available".
//
// The estimate below is deliberately coarse and deliberately generous. CJK
// glyphs are full-width, Latin averages a bit over half an em, and rounding up
// costs a few pixels of padding while rounding down clips the label. Prefer the
// padding.
const LATIN_ADVANCE = 0.58; // em per glyph, averaged over mixed-case text
const WIDE = /[\u1100-\u115F\u2E80-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/;

setCustomTextMetricsProvider({
  getLineWidth(text, fontString) {
    const size = Number(/(\d+(?:\.\d+)?)px/.exec(String(fontString))?.[1] ?? 20);
    let em = 0;
    for (const ch of String(text)) em += WIDE.test(ch) ? 1 : LATIN_ADVANCE;
    return em * size;
  },
});

// -------- Argv

const inputPath = process.argv[2];
if (!inputPath) {
  console.error(
    "usage: node scripts/build-scene.mjs <input.skeleton.json|.mjs> [output.excalidraw]",
  );
  process.exit(64);
}
const absInput = resolve(inputPath);
const absOutput = resolve(
  process.argv[3] ??
    absInput.replace(/(\.skeleton)?\.(json|mjs|js)$/i, "") + ".excalidraw",
);

// -------- Read the skeleton

const source = /\.(mjs|js)$/i.test(absInput)
  ? (await import(pathToFileURL(absInput).href)).default
  : JSON.parse(await readFile(absInput, "utf8"));

const spec = Array.isArray(source) ? { elements: source } : source;
const skeletons = spec.elements ?? [];

if (!Array.isArray(skeletons) || skeletons.length === 0) {
  console.error("error: skeleton has no elements");
  process.exit(65);
}

// -------- Check the references the converter cannot check for you
//
// A skeleton `id` is a local handle, not the id that ends up in the file — the
// converter mints a fresh one for every element. Its only job is to be the
// target of an arrow's `start` / `end`. A typo there is the one class of
// mistake that survives conversion, so catch it here where the message can name
// the offending id.

const declared = new Set(skeletons.map((s) => s.id).filter(Boolean));
const dangling = [];
for (const s of skeletons) {
  for (const side of ["start", "end"]) {
    const ref = s[side];
    if (ref && typeof ref === "object" && ref.id && !declared.has(ref.id)) {
      dangling.push(`${s.type} ${side}: "${ref.id}"`);
    }
  }
}
if (dangling.length > 0) {
  console.error("error: arrow endpoints reference ids that no skeleton declares:");
  for (const d of dangling) console.error(`  ${d}`);
  process.exit(65);
}

// -------- Anchor bound arrows to the edges they connect
//
// `convertToExcalidrawElements` wires the *bindings* but does not derive the
// *path* from them: an arrow given only endpoints comes out as a horizontal
// 100px stub, and the editor does not recompute it until the user nudges one of
// the shapes. So the arrow drawn in the file would not match the arrow the
// bindings describe.
//
// Rather than push that arithmetic back onto the author — which is what the old
// "edge anchoring formulas" section of 05-validation.md was for — derive it
// here: run the line between the two centres and clip it where it leaves each
// box, then back off by a small gap so the head does not sit on the outline.
// For shapes that are squarely above or beside each other this reduces to the
// familiar edge midpoints; for a diagonal it exits through the corner the line
// actually crosses, which the old top/bottom/left/right formulas got wrong.
//
// An arrow that specifies its own `points` (or `width`/`height`) is left alone;
// that is the escape hatch for a path this heuristic gets wrong.

const EDGE_GAP = 8;

const boxOf = (s) => {
  const w = s.width ?? 100;
  const h = s.height ?? 100;
  return {
    type: s.type,
    cx: (s.x ?? 0) + w / 2,
    cy: (s.y ?? 0) + h / 2,
    hw: w / 2,
    hh: h / 2,
  };
};

/**
 * Where the ray leaving `box`'s centre in direction (dx, dy) crosses its
 * outline, pushed out by `gap`.
 *
 * The outline is the shape's own, not its bounding box — for a diamond or an
 * ellipse those differ most exactly where diagonal arrows arrive, which is the
 * case that looks wrong. Each is one closed-form solve for the scale `t` at
 * which the ray meets the boundary.
 */
const exitPoint = (box, dx, dy, gap) => {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  let t;
  if (box.type === "ellipse") {
    // (x/hw)² + (y/hh)² = 1
    t = 1 / Math.hypot(ax / box.hw, ay / box.hh);
  } else if (box.type === "diamond") {
    // |x/hw| + |y/hh| = 1
    t = 1 / (ax / box.hw + ay / box.hh);
  } else {
    // Rectangle and everything else: whichever pair of sides the ray hits first.
    t = Math.min(ax === 0 ? Infinity : box.hw / ax, ay === 0 ? Infinity : box.hh / ay);
  }
  const len = Math.hypot(dx, dy) || 1;
  return [box.cx + dx * t + (dx / len) * gap, box.cy + dy * t + (dy / len) * gap];
};

const anchorArrows = (skeletons) => {
  const byId = new Map(skeletons.filter((s) => s.id).map((s) => [s.id, s]));
  let anchored = 0;

  const out = skeletons.map((s) => {
    if (s.type !== "arrow" && s.type !== "line") return s;
    if (s.points || s.width != null || s.height != null) return s;

    const from = byId.get(s.start?.id);
    const to = byId.get(s.end?.id);
    if (!from || !to) return s;

    const a = boxOf(from);
    const b = boxOf(to);
    const dx = b.cx - a.cx;
    const dy = b.cy - a.cy;
    if (dx === 0 && dy === 0) return s;

    const start = exitPoint(a, dx, dy, EDGE_GAP);
    const end = exitPoint(b, -dx, -dy, EDGE_GAP);

    anchored += 1;
    return {
      ...s,
      x: start[0],
      y: start[1],
      points: [
        [0, 0],
        [end[0] - start[0], end[1] - start[1]],
      ],
    };
  });

  return { skeletons: out, anchored };
};

const { skeletons: anchoredSkeletons, anchored } = anchorArrows(skeletons);

// -------- Convert, then restore
//
// `restore` is not redundant. It recomputes the fields that are derived rather
// than authored — arrow width/height from `points`, fractional indices from
// array order — and is the same normalisation the editor applies on open. Doing
// it here means the file on disk already matches what the app will hold in
// memory, so opening it does not immediately mark it as modified.

const converted = convertToExcalidrawElements(anchoredSkeletons);

const appState = {
  viewBackgroundColor: "#ffffff",
  gridSize: null,
  ...(spec.appState ?? {}),
};
const files = spec.files ?? {};

const restored = restore(
  { elements: converted, appState, files },
  null,
  null,
);

const scene = {
  type: "excalidraw",
  version: 2,
  source: "excalidraw-skill",
  elements: restored.elements,
  appState: {
    gridSize: restored.appState.gridSize ?? null,
    viewBackgroundColor: restored.appState.viewBackgroundColor,
  },
  files,
};

await writeFile(absOutput, JSON.stringify(scene, null, 2) + "\n");

// -------- Report
//
// The counts are the cheap sanity check: a label that silently failed to bind
// shows up as a missing text element, and an arrow that failed to bind shows up
// in the unbound count.

const byType = {};
for (const el of restored.elements) byType[el.type] = (byType[el.type] ?? 0) + 1;

const arrows = restored.elements.filter((el) => el.type === "arrow");
const unbound = arrows.filter((el) => !el.startBinding || !el.endBinding).length;

const xs = restored.elements.flatMap((el) => [el.x, el.x + el.width]);
const ys = restored.elements.flatMap((el) => [el.y, el.y + el.height]);

console.log(`wrote: ${absOutput}`);
console.log(
  `  ${restored.elements.length} elements  (` +
    Object.entries(byType)
      .map(([t, n]) => `${t} ${n}`)
      .join(", ") +
    ")",
);
console.log(
  `  bounds: ${Math.round(Math.min(...xs))},${Math.round(Math.min(...ys))} → ` +
    `${Math.round(Math.max(...xs))},${Math.round(Math.max(...ys))}`,
);
if (unbound > 0) {
  console.log(
    `  warning: ${unbound} of ${arrows.length} arrows are not bound at both ends —` +
      ` they will not follow their shapes when the user moves them`,
  );
}
