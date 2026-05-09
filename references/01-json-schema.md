# 01 — JSON schema

A `.excalidraw` file is a JSON document describing a scene: a list of drawing elements plus some app-level state. This page is a working summary; for the canonical schema see the official docs at <https://docs.excalidraw.com/docs/codebase/json-schema>.

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
| `diamond`   | Rotated square                                        | **Avoid for labelled nodes** — see the note at the end of this page         |
| `text`      | Free-floating or container-bound text                 | Bound text needs the two-element pairing described below                    |
| `arrow`     | Directed connector with arrowheads                    | Carries `points`, `startBinding`/`endBinding`, optional `elbowed: true`     |
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
- **Soft delete**: `isDeleted: true` keeps the element in the file but hides it.
- **Round corners**: `{ "type": 3 }` for friendly rounded rectangles; `null` for hard 90° corners (required when an arrow's `elbowed: true`).

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
  "fontFamily": 1,
  "textAlign": "center",
  "verticalAlign": "middle",
  "containerId": "pres-rect",
  "originalText": "presentation",
  "lineHeight": 1.25
}
```

Notes:

- The shape lists the text in `boundElements`; the text references the shape via `containerId`. Both directions are needed.
- `fontFamily`: `1` Virgil (hand-drawn), `2` Helvetica, `3` Cascadia (monospace).
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
  "roughness": 0,
  "roundness": null,
  "elbowed": false,
  "startBinding": { "elementId": "pres-rect", "focus": 0, "gap": 1, "fixedPoint": [0.5, 1] },
  "endBinding":   { "elementId": "app-rect",  "focus": 0, "gap": 1, "fixedPoint": [0.5, 0] },
  "startArrowhead": null,
  "endArrowhead": "arrow"
}
```

Critical points:

- `x`, `y` is the **start** of the arrow. `points` is the polyline relative to that origin; the first point is always `[0, 0]`.
- `width`, `height` are the absolute span of `points` (max abs of x components, max abs of y components). Wrong values clip the arrow visually; see `references/05-validation.md`.
- For a 90° elbow path, all three of these must be set: `elbowed: true`, `roundness: null`, `roughness: 0`. Missing any one renders a curve.
- `startBinding` / `endBinding` snap the endpoints to a shape's bounding box. `fixedPoint` is `[fractional-x, fractional-y]` on the shape — `[0.5, 0]` is top-center, `[1, 0.5]` is right-center, etc.
- Arrowheads: `null`, `"arrow"`, `"bar"`, `"dot"`, `"triangle"`. For directed dependency arrows, `endArrowhead: "arrow"` is the usual choice.

## A note on `diamond`

In raw-JSON authoring, `diamond` shapes interact badly with arrow bindings: `roundness` is applied to the vertex coordinates so the visible edge no longer matches the geometric edge, and arrows visibly float. Use a colored rectangle (with `strokeWidth: 3` and a coral/orange fill) when you need a "decision" or "router" node — it keeps bindings clean.

## References

- Excalidraw codebase JSON schema: <https://docs.excalidraw.com/docs/codebase/json-schema>
- File serialization helpers: <https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils>
