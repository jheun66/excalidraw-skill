# 02 — Assembling a scene in code

Do not hand-write `.excalidraw` JSON. Write a **skeleton** — a short list of shapes and the relationships between them — and let `scripts/build-scene.mjs` expand it into the real file.

The expansion is done by `convertToExcalidrawElements`, Excalidraw's own programmatic-authoring entry point. It is the same code path the editor uses, so everything a hand-written file gets wrong, it gets right by construction: element ids, fractional `index`, `containerId`, **both** directions of `boundElements`, `startBinding`/`endBinding` with their `focus` and `gap`, arrow extents, and every style default.

That is why `05-validation.md` is now one page of judgement calls instead of a twelve-item field checklist. The fields it used to police cannot be wrong on this path.

## The command

```bash
node scripts/build-scene.mjs diagram.skeleton.json
# → diagram.excalidraw
```

An explicit output path is accepted as a second argument. A `.mjs` input is imported instead of parsed, and its default export is used — take that path when the layout is computed rather than typed (a grid, a fan of N children, coordinates derived from data).

The script prints what it produced:

```
wrote: /path/diagram.excalidraw
  10 elements  (rectangle 3, arrow 2, text 5)
  bounds: 0,0 → 540,290
```

Read those two lines. A label that failed to bind shows up as a missing `text`; an arrow that failed to bind is called out as a warning.

## The skeleton format

A skeleton file is either a bare array of elements or `{ elements, appState, files }`.

```json
{
  "elements": [
    { "type": "rectangle", "id": "client", "x": 0, "y": 0, "width": 200, "height": 90,
      "backgroundColor": "#e7f5ff", "label": { "text": "클라이언트" } },
    { "type": "rectangle", "id": "api", "x": 340, "y": 0, "width": 200, "height": 90,
      "backgroundColor": "#fff3bf", "label": { "text": "API 게이트웨이" } },
    { "type": "rectangle", "id": "db", "x": 340, "y": 200, "width": 200, "height": 90,
      "backgroundColor": "#ffe3e3", "label": { "text": "데이터베이스" } },

    { "type": "arrow", "start": { "id": "client" }, "end": { "id": "api" },
      "label": { "text": "요청" } },
    { "type": "arrow", "start": { "id": "api" }, "end": { "id": "db" },
      "label": { "text": "조회" } }
  ]
}
```

Ten elements, three arrows' worth of binding, and not one id, `index`, or `boundElements` entry typed by hand.

### Shapes

`x`, `y`, `width`, `height`, plus any of the style fields from `01-json-schema.md`. `rectangle`, `ellipse`, `diamond`, `text`, `arrow`, `line`, `frame` all work.

`width` and `height` are optional. Omit them and the shape sizes itself to its label — which is usually what you want for a node whose text length you cannot predict. Give them and the shape holds that size, wrapping the label and **growing in height** if it does not fit; a label never gets clipped.

### Labels

```json
{ "type": "rectangle", "id": "svc", "x": 0, "y": 0, "width": 180, "height": 80,
  "label": { "text": "인증 서비스", "fontSize": 20, "strokeColor": "#1971c2" } }
```

One `label` produces the bound text element *and* wires it in both directions. Do not write a separate `text` element with a `containerId` — that is the hand-authoring shape of this, and it is what used to go wrong.

A free-floating caption is a plain `text` element with no container:

```json
{ "type": "text", "x": 0, "y": -40, "text": "요청 경로", "fontSize": 16 }
```

### Arrows

```json
{ "type": "arrow", "start": { "id": "a" }, "end": { "id": "b" }, "label": { "text": "호출" } }
```

No coordinates. `build-scene.mjs` runs the segment between the two facing edges — side to side when the shapes are mostly side by side, top to bottom when they are mostly stacked — leaving a small gap so the head does not sit on the outline. This is the arithmetic the old "edge anchoring formulas" section existed to make you do by hand.

`start` and `end` may also be inline shapes rather than references, in which case the converter creates them:

```json
{ "type": "arrow", "x": 0, "y": 0,
  "start": { "type": "rectangle", "width": 120, "height": 60 },
  "end": { "type": "ellipse", "width": 100, "height": 100 } }
```

**Ids in a skeleton are local handles, not the ids that end up in the file.** The converter mints a fresh id for every element. A skeleton `id` exists so an arrow's `start`/`end` can name its target; `build-scene.mjs` fails loudly, naming the offending id, if one of them points at nothing.

### Right-angle paths

`elbowed: true` does **not** produce an elbow in a static file. Elbow routing is computed by the editor while you drag, and the file only stores the resulting `points`; a freshly built file with `elbowed: true` and no explicit path draws as a straight line.

For a right angle in the file, author the path:

```json
{ "type": "arrow", "x": 80, "y": 78,
  "points": [[0, 0], [0, 177], [332, 177]],
  "start": { "id": "a" }, "end": { "id": "b" } }
```

Bindings survive; the corner is where you put it. `points` is relative to the arrow's own `x`, `y`, and the first point is always `[0, 0]`. Supplying `points` also switches off the automatic edge anchoring above — that is the escape hatch when the straight run is wrong.

## Computed layouts

For anything repetitive, write the skeleton as a module:

```js
// deps.skeleton.mjs
const CONSUMERS = ["web", "mobile", "batch", "admin"];
const COL = 260;

export default {
  elements: [
    { type: "rectangle", id: "core", x: 0, y: 0, width: 220, height: 90,
      backgroundColor: "#d0bfff", label: { text: "core" } },

    ...CONSUMERS.map((name, i) => ({
      type: "rectangle",
      id: name,
      x: (i - (CONSUMERS.length - 1) / 2) * COL,
      y: 240,
      width: 180,
      height: 80,
      label: { text: name },
    })),

    ...CONSUMERS.map((name) => ({
      type: "arrow",
      start: { id: "core" },
      end: { id: name },
    })),
  ],
};
```

```bash
node scripts/build-scene.mjs deps.skeleton.mjs
```

This is the case that makes the skeleton worth having: adding a fifth consumer is one string, not forty lines of JSON and four new ids to keep consistent.

## Why there is a bundle step

`npm install` runs `scripts/bundle-excalidraw.mjs`, which uses esbuild to pull `convertToExcalidrawElements`, `restore` and `setCustomTextMetricsProvider` out of `@excalidraw/excalidraw` into `scripts/.generated/excalidraw.mjs` (~13 MB, gitignored).

The step is not decoration. The published package ships one `.` export whose bundle is written for a web bundler: it imports extensionless paths (`roughjs/bin/rough`), imports JSON with no import attribute, and reaches a CJS-only dependency through a named import. Node's ESM resolver refuses all three. esbuild resolves them the way a browser bundler would.

Two other things that package assumes about its environment, handled in `scripts/dom-shim.mjs`:

- **A DOM.** jsdom, plus `devicePixelRatio` and a 2D canvas context — the bundle dereferences `document.createElement("canvas").getContext("2d")` at module scope, so a null return crashes the import outright.
- **Text measurement.** Glyph advances decide how wide a bound label is and therefore whether it fits its container, and jsdom cannot measure them. `build-scene.mjs` registers a provider through `setCustomTextMetricsProvider`, the package's own hook for "where canvas API is not available". The estimate is coarse and deliberately errs generous: full-width for CJK, ~0.58em for Latin. A few pixels of extra padding is invisible; a few pixels short clips the label.

## `@excalidraw/utils` — what it is actually for

`scripts/render.mjs` imports `exportToSvg` from `@excalidraw/utils`. That is the whole of this skill's use of that package.

Its full export surface is small — fifteen names, and worth stating plainly because it is easy to assume otherwise:

| Group | Exports |
| ----- | ------- |
| Export | `exportToSvg`, `exportToCanvas`, `exportToBlob`, `exportToClipboard`, `MIME_TYPES` |
| Bounds | `getCommonBounds`, `isElementInsideBBox`, `elementsOverlappingBBox`, `elementPartiallyOverlapsWithOrContainsBBox` |
| Geometry | `getBBox`, `doBBoxesIntersect`, `isPointOnLine`, `isPointRightOfLine`, `isLineSegmentTouchingOrCrossingLine`, `doLineSegmentsIntersect` |

`serializeAsJSON`, `loadFromBlob`, `restore`, `getNonDeletedElements`, `isLinearElement`, `mergeLibraryItems` and friends are **not** here. They exist, but in `@excalidraw/excalidraw` — the same package the bundle step pulls from. Importing them from `@excalidraw/utils` throws at the import line.

`elementsOverlappingBBox` also does not take `(elements, bbox)`; it takes one object, and `type` (`"overlap" | "contain" | "inside"`) is required.

## References

- Programmatic API: <https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/excalidraw-element-skeleton>
- Utils overview: <https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils>
- Export utilities: <https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils/export>
