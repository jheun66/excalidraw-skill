# 05 — Validation

Most authoring bugs are easy to spot once the picture is rendered, but expensive to spot in JSON. This page is a pre-render checklist plus the small amount of arithmetic you cannot avoid.

## Pre-render checklist

Before you call the renderer, scan the JSON against this list:

- [ ] Every element has a unique `id`. Unique `seed`, `version`, `versionNonce` too (a counter is fine).
- [ ] `elements` array is non-empty. (An empty file renders an empty viewport.)
- [ ] No element has `width` or `height` of 0 unless it is an arrow / line.
- [ ] Every shape with a label has a `boundElements` entry **and** a paired text element with the matching `containerId`. One direction without the other renders an empty box.
- [ ] Every text element either has `containerId` set to a real shape's id, or has `containerId: null` and is positioned by `x`/`y`.
- [ ] Every arrow's `points` starts with `[0, 0]`. The remaining points are deltas from the arrow's `(x, y)`.
- [ ] Every arrow has `width` and `height` matching its `points` extent (formula below).
- [ ] Every arrow with more than two points has `elbowed: true`, `roundness: null`, `roughness: 0`. Drop any one and you get a curve.
- [ ] No `diamond` shapes carrying labels (use a colored rectangle instead — see `01-json-schema.md`).
- [ ] All bound arrows reference shape ids that exist in the same scene.
- [ ] No id is referenced by `containerId` or arrow bindings but missing from the elements array.
- [ ] The shape's `boundElements` lists every text and arrow that points at it (not just text). Missing arrow entries cause subtle rendering glitches.

## Arrow `width` / `height` formula

For an arrow with `points = [[0,0], [p1x, p1y], [p2x, p2y], …]`:

```
width  = max(|p1x|, |p2x|, …)
height = max(|p1y|, |p2y|, …)
```

A few examples:

| `points`                         | width | height |
| -------------------------------- | ----- | ------ |
| `[[0,0],[0,80]]`                 | 0     | 80     |
| `[[0,0],[120,0]]`                | 120   | 0      |
| `[[0,0],[0,40],[200,40]]`        | 200   | 40     |
| `[[0,0],[60,0],[60,-180],[40,-180]]` | 60 | 180    |

Wrong values do not raise an error — they just clip the visible arrow or leave whitespace beside it. Get this right or expect chase-the-arrow rounds.

## Edge anchoring

Arrows must originate on a shape's *edge*, not its center. Reuse the formulas from `04-layout-patterns.md`:

```
top    = (x + width/2, y)
bottom = (x + width/2, y + height)
left   = (x,           y + height/2)
right  = (x + width,   y + height/2)
```

If you bind the arrow with `startBinding` / `endBinding` and a `fixedPoint`, Excalidraw recomputes the anchor automatically when the shape moves. Without bindings, you have to recompute by hand after every coordinate change.

`fixedPoint` cheat sheet:

| Position    | `fixedPoint` |
| ----------- | ------------ |
| Top-center  | `[0.5, 0]`   |
| Bottom-center | `[0.5, 1]` |
| Left-center | `[0, 0.5]`   |
| Right-center | `[1, 0.5]`  |

## Common rendering bugs and their JSON fix

| Symptom                                          | Cause                                              | Fix                                                                 |
| ------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------- |
| Empty rectangle where the label should be        | Shape's `boundElements` missing the text entry     | Add `{ "type": "text", "id": "<text-id>" }` to `boundElements`      |
| Label sits outside its shape                     | Text's `containerId` is wrong or null              | Set `containerId` to the shape's id, set `verticalAlign: "middle"`  |
| Arrow visibly floats next to the source          | Arrow `(x,y)` is at the shape's center, not edge   | Recompute the source `(x,y)` using the edge formula                 |
| Arrow renders as a curve instead of right angles | Missing `elbowed` / `roundness:null` / `roughness:0` | Add all three to the arrow                                          |
| Half the arrow is invisible                      | `width` / `height` does not match `points`         | Recompute as `max(|points x|)`, `max(|points y|)`                   |
| Inner shape covers the outer label               | Layered diagram with bound (centered) outer label  | Use a free-floating text on the outer shape (`containerId: null`)   |
| Arrow lands on the wrong corner of the target    | Wrong `fixedPoint` in `endBinding`                 | Pick the matching edge from the cheat sheet above                   |

## When in doubt, render and look

Do not try to debug a diagram by reading JSON for more than a couple of minutes. Render the PNG, open it with the `Read` tool, and see what is actually wrong. Fix one issue, re-render, repeat. Five quick render passes beat one heroic JSON edit.
