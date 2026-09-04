# 01 — JSON schema

A `.excalidraw` file is a JSON document describing a scene: a list of drawing elements plus some app-level state.

**This page is for reading files, not writing them.** Author scenes as skeletons and let `scripts/build-scene.mjs` produce the JSON — see `02-drawing-api.md`. What follows is what the output looks like, which is what you need when inspecting a file, debugging a render, or reaching for a field the skeleton does not surface. For the canonical schema see <https://docs.excalidraw.com/docs/codebase/json-schema>.

## File envelope

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "claude-code-excalidraw-skill",
  "elements": [],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "gridSize": 20
  },
  "files": {}
}
```

- `type` is always `"excalidraw"` for a scene file.
- `version` is the file format version (currently 2).
- `source` is a free-text identifier for the producing tool.
- `elements` is the array that does the actual work.
- `appState` carries scene-wide settings (background, grid, dark mode, etc.).
- `files` keeps embedded binaries (images) keyed by id; usually `{}` for code-generated diagrams.

## Element types

Seven shapes are recognized. The first four are visual primitives, the next two are connectors, and the last is a layout container:

| Type        | What it is                                            | Notes                                                                        |
| ----------- | ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| `rectangle` | The default shape; carries most labelled content      | Use as the primary container shape                                           |
| `ellipse`   | Oval / circle; users / external systems / endpoints   | Same field set as rectangle                                                  |
| `diamond`   | Rotated square; decision / router nodes               | Carries labels and binds arrows correctly                                    |
| `text`      | Free-floating or container-bound text                 | Bound text needs the two-element pairing described below                    |
| `arrow`     | Directed connector with arrowheads                    | Carries `points` and `startBinding`/`endBinding`                             |
| `line`      | Open polyline without arrowheads                      | Useful as a divider or grouping bracket                                      |
| `frame`     | Logical grouping container                            | Mostly produced by the editor; rare in hand-written JSON                     |

## Fields every element carries

```json
{
  "id": "pres-rect",
  "type": "rectangle",
  "x": 100, "y": 100, "width": 200, "height": 80,
  "angle": 0,
  "strokeColor": "#1971c2",
  "backgroundColor": "#a5d8ff",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "strokeStyle": "solid",
  "roughness": 1,
  "opacity": 100,
  "groupIds": [],
  "frameId": null,
  "index": "a0",
  "roundness": { "type": 3 },
  "seed": 1,
  "version": 1,
  "versionNonce": 1,
  "isDeleted": false,
  "boundElements": null,
  "updated": 1,
  "link": null,
  "locked": false
}
```

Field highlights:

- **Geometry**: `x`, `y` are the top-left corner; `width`, `height` extend to the right and down.
- **Stroke / fill**: `strokeColor`, `backgroundColor`, `fillStyle` (`hachure`, `cross-hatch`, `solid`), `strokeWidth`, `strokeStyle` (`solid`, `dashed`, `dotted`).
- **Look**: `roughness` 0 is clean, 1 is hand-drawn, 2 is sketchier; `opacity` is 0–100.
- **Identity**: `id` must be unique within the scene; `seed`, `version`, `versionNonce` should also be unique (a simple counter is fine).
- **Stacking**: `index` is a *fractional index* — a short string (`"a0"`, `"a1"`, `"a0V"`) whose lexicographic order is the z-order, chosen so a new element can always be slotted between two existing ones without renumbering the rest. It must agree with the element's position in the `elements` array. Excalidraw repairs an inconsistent set on load, but the repair is not free and not always what you meant; a file whose indices are missing or contradictory is the classic cause of a scene that opens with elements silently dropped.
- **Soft delete**: `isDeleted: true` keeps the element in the file but hides it.
- **Round corners**: `{ "type": 3 }` for friendly rounded rectangles; `null` for hard 90° corners.

## Text element

A text element on its own is free-floating. To put text inside a shape, you need two elements that point at each other:

```json
{
  "id": "pres-rect",
  "type": "rectangle",
  "x": 100, "y": 100, "width": 200, "height": 80,
  "boundElements": [{ "type": "text", "id": "pres-rect-text" }]
}
```

```json
{
  "id": "pres-rect-text",
  "type": "text",
  "x": 105, "y": 120, "width": 190, "height": 40,
  "text": "presentation",
  "fontSize": 18,
  "fontFamily": 5,
  "textAlign": "center",
  "verticalAlign": "middle",
  "containerId": "pres-rect",
  "originalText": "presentation",
  "lineHeight": 1.25
}
```

Notes:

- The shape lists the text in `boundElements`; the text references the shape via `containerId`. Both directions are needed.
- `fontFamily`: `5` Excalifont (hand-drawn — **the default**, and what `convertToExcalidrawElements` emits), `1` Virgil (the older hand font), `2` Helvetica, `3` Cascadia (monospace), `6` Nunito, `7` Lilita One, `8` Comic Shanns, `9` Liberation Sans.
- Excalifont carries no Hangul or CJK glyphs; Excalidraw chains to the bundled Xiaolai hand font for those, and only for Excalifont. So `5` is the value that renders Korean as handwriting — the others fall back to a system face.
- For text that should sit at the **top** of a shape (e.g. a layered diagram where labels go above inner contents), use a free-floating text element with `containerId: null` placed by hand, not a bound text.
- `textAlign` / `verticalAlign` matter only for bound text; free-floating text is positioned by `x`/`y`.

## Arrow element

```json
{
  "id": "arrow-pres-app",
  "type": "arrow",
  "x": 200, "y": 180,
  "width": 0, "height": 35,
  "points": [[0, 0], [0, 35]],
  "roundness": null,
  "elbowed": false,
  "startBinding": { "elementId": "pres-rect", "focus": 0, "gap": 8 },
  "endBinding":   { "elementId": "app-rect",  "focus": 0, "gap": 8 },
  "startArrowhead": null,
  "endArrowhead": "arrow"
}
```

- `x`, `y` is the **start** of the arrow. `points` is the polyline relative to that origin; the first point is always `[0, 0]`.
- `width`, `height` are derived from `points`, not authored. Excalidraw recomputes them on load and overwrites whatever the file says — see `05-validation.md` for the measurement.
- `startBinding` / `endBinding` attach the endpoint to a shape. `focus` is how far off the shape's centre line the arrow aims (0 is dead centre); `gap` is the distance it stops short of the outline. `fixedPoint` pins the anchor to one spot on the shape and is only used by elbow arrows.
- Binding is what makes the arrow follow its shape when a person drags it in the editor. It has no effect on rendering.
- `elbowed: true` alone does not draw a right angle in a static file. The route is computed by the editor while dragging; a file only stores the resulting `points`. Author the corner explicitly if you want one.
- Arrowheads: `null`, `"arrow"`, `"bar"`, `"dot"`, `"triangle"`. For directed dependency arrows, `endArrowhead: "arrow"` is the usual choice.

## A note on `diamond`

Earlier versions of this page told you to avoid `diamond` for labelled nodes and use a coloured rectangle instead, on the grounds that its bindings floated. That was a hand-authoring artefact. Built through `02-drawing-api.md`, a diamond centres its label and binds arrows to its vertices correctly; a decision node can be a diamond.

## References

- Excalidraw codebase JSON schema: <https://docs.excalidraw.com/docs/codebase/json-schema>
- File serialization helpers: <https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils>
