# 05 — Validation

This page used to be a twelve-item field checklist. Most of it is gone, because `scripts/build-scene.mjs` now guarantees what it used to police. What is left is the part no library can check for you.

## What the pipeline already guarantees

Do not spend a review pass on any of these. On the skeleton path they cannot be wrong:

- Unique `id`, `seed`, `version`, `versionNonce` on every element.
- Fractional `index` present and consistent with array order.
- Every label paired in both directions — the shape's `boundElements` and the text's `containerId`.
- No dangling reference: `build-scene.mjs` refuses to write a file whose arrow names an id no skeleton declares, and prints which one.
- Arrow `width` / `height` matching `points`. These are derived, not authored: `restore` recomputes them from `points` and overwrites whatever is in the file. You could write `0` or `9999` and get the same result.
- Bound arrows referencing shapes that exist, with `focus` and `gap` set.
- Labels fitting their containers. A fixed-size shape wraps its label and grows in height; a shape with no `width` sizes itself to its label. Clipping is not a failure mode here.

## What the pipeline cannot check

These are judgement calls about the picture, and they are the whole reason to look at a render:

- **Overlap.** Two unrelated shapes sitting on top of each other. Nesting is not overlap.
- **Crossing arrows.** Legal, ugly, and usually a sign the layout order is wrong.
- **Reading order.** Whether the path the diagram is arguing for is the one the eye takes first.
- **Arrow direction.** A binding is valid in either direction; only you know which way the dependency runs.
- **Density.** Boxes so close that the picture reads as a wall, or so far apart that the relationship stops being visible.
- **The stripped-label test.** Peel every label off mentally. Does the geometry still carry the claim? See `SKILL.md`.

## Bindings matter for editing, not for rendering

Worth being precise about, because the reason changed when the deliverable changed.

Strip every `startBinding` and `endBinding` from a scene and re-render: the SVG is byte-identical. Rendering reads `points`, and nothing else.

But the deliverable is a `.excalidraw` file that a person opens and edits. The moment they drag a box, an unbound arrow stays behind while everything around it moves — and an arrow missing from the shape's `boundElements` does the same. Bindings are what make the file survive contact with its reader.

This is also why `build-scene.mjs` runs `restore` before writing. `restore` is the same normalisation the editor applies on open; doing it up front means the file on disk already matches what the app will hold in memory, so opening it does not immediately show up as an unsaved change.

## Two things the old checklist got wrong

Both are worth knowing about because they still appear in older Excalidraw notes elsewhere.

**The arrow extent formula.** `width = max(|x|)` over the points is wrong for a path that doubles back: for `[[0,0],[-100,0],[50,0]]` it gives 100, and the actual span is 150. It is also irrelevant — `restore` recomputes it either way. Measured:

| written `width` | after `restore` |
| --------------- | --------------- |
| 100 (old formula) | 150 |
| 150 (true span) | 150 |
| 9999 | 150 |
| 0 | 150 |

**The "elbowed triple".** Setting `elbowed: true` with `roundness: null` and `roughness: 0` does not produce a right-angle path in a static file. Elbow routing happens in the editor during a drag; the file only stores the resulting `points`. A freshly built arrow with `elbowed: true` and no explicit path draws as a straight line. To get a corner, author `points` — see `02-drawing-api.md`.

While correcting old lore: `diamond` shapes carry labels and bind arrows correctly. The advice to substitute a coloured rectangle was working around a hand-authoring problem that does not exist on this path.

## Looking at a render

The renderer is an audit instrument now, not the deliverable:

```bash
node scripts/render.mjs diagram.excalidraw   # → diagram.svg, diagram.png
```

Open the PNG with the `Read` tool. Everything in "what the pipeline cannot check" is obvious in the image within a second and invisible in JSON for ten minutes. Fix one thing, rebuild, look again.
