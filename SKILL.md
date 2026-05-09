---
name: excalidraw
description: Auto-delegate when the user asks to draw, diagram, sketch, or visualize a codebase, a system architecture, a dependency graph, a sequence/flow, a state machine, or an abstract concept. The skill writes an .excalidraw JSON file, renders it to PNG/SVG via an in-house Node renderer (jsdom + @excalidraw/utils + @resvg/resvg-js), looks at the rendered image, fixes any problems it sees, and gives the user a Markdown-embeddable artifact.
---

# Excalidraw skill — author, render, verify

This skill produces diagrams that **prove a relationship** rather than just labelling boxes. Every shape, position, and connection is chosen so that the picture *itself* — even with the labels peeled off — still tells the story it is supposed to tell.

The official reference for the file format and APIs is the Excalidraw docs site: <https://docs.excalidraw.com/docs/>. Treat that site as the canonical truth for anything technical (element types, fields, utility signatures). The files under `references/` in this skill are condensed, opinionated guides on top of that — not a replacement for the docs.

---

## When to invoke

Trigger on any prompt that asks for a picture of *structure*:

- "Draw / diagram / sketch / visualize / illustrate …"
- "Show me how X talks to Y."
- "Map out the dependencies between …"
- "Make a sequence / flow / state diagram for …"
- "Render this architecture as an image."

Skip when the user only wants prose, an ASCII sketch in chat, or a file that already exists and just needs a tweak.

---

## Quick workflow

```
┌─────────────────────────────┐
│ 1. State the argument       │  one sentence: "this picture proves …"
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 2. Pick a layout that       │  fan-out, pipeline, layered wrap,
│    embodies that argument   │  hub-and-spoke, sequence …
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 3. Write .excalidraw JSON   │  use references/01..06 as a cheat sheet
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 4. Render to PNG (and SVG)  │  ./scripts/render.sh diagram.excalidraw
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 5. *Read the PNG*           │  use the Read tool on the .png file
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 6. Revise until the picture │  back to step 3 — JSON-only inspection
│    matches the argument     │  is *not* enough
└─────────────────────────────┘
```

The render-and-look feedback loop is mandatory, not optional. Most authoring mistakes (overlapping shapes, mis-bound labels, arrows landing on the wrong edge) are invisible in JSON and obvious in the rendered image.

---

## Core principle: shape mirrors meaning

A diagram is a small machine for delivering one specific claim. The geometry of that machine has to match the claim:

| Claim                              | Geometry that proves it                                             |
| ---------------------------------- | ------------------------------------------------------------------- |
| One source feeds many consumers    | A single node up top fanning out to many below                      |
| Data flows through stages in order | A horizontal pipeline reading left-to-right, arrows on every gap    |
| One layer wraps another            | Concentric rectangles where the outer fully contains the inner      |
| Two services mutually depend       | A pair connected with arrows in both directions, equal sizes        |
| Some consumers are optional        | Branching arrows, dashed strokes for the optional path              |
| A change cascades                  | A chain whose later nodes are visibly later (offset down or right)  |

### The stripped-label check

After drafting, mentally remove every text label. Does the shape alone still convey the claim? If yes — keep going. If no — the layout is decorative, not argumentative; restructure before adding more detail.

### The "boxes earn their keep" rule

A rectangle around text is a strong visual statement: *this thing is a unit*. Use rectangles only when the framing carries meaning — grouping, state, type, an interactive surface. Free-floating text is the default; a wall of identical boxes flattens hierarchy and works against the picture.

---

## Authoring loop in detail

### Step 1 — write the argument

Before touching JSON, write one sentence the diagram has to make true. Examples:

- *"In this codebase, all DB writes funnel through one repository trait."*
- *"A login attempt traverses these four stages, in this order, with one optional branch."*
- *"The presentation layer depends on the application layer, which depends on the domain layer — never the other way."*

Keep the sentence visible while you work. Every shape and arrow either supports it or is dead weight.

### Step 2 — sketch on paper or in plain text

A 30-second pencil sketch beats five minutes of JSON. Confirm the *shape* of the answer (which nodes, which arrows) before encoding it.

### Step 3 — write the JSON

See `references/01-json-schema.md` for the element schema, `references/04-layout-patterns.md` for coordinate templates, and `references/06-examples.md` for runnable starting points. Put unique, semantic IDs on every element (`pres-rect`, not `box-1`) — they are the lifeline when arrows or label bindings need updating.

### Step 4 — render

```bash
./scripts/render.sh diagram.excalidraw
# produces diagram.png and diagram.svg
```

The renderer is `scripts/render.mjs`, an in-house Node script — `jsdom` for the DOM shim, `@excalidraw/utils` for the SVG path, `@resvg/resvg-js` for the PNG conversion. Scale defaults to 2× for crisp output. No Chromium, no external CLI.

### Step 5 — look at the image (mandatory self-audit)

Use the `Read` tool on the resulting `.png`. After every render you **must** print a five-line audit, exactly one line per category, each ending with `pass` or `FAIL`. No `partial`, no `minor`, no `good enough`, no implicit pass. The five categories:

1. **Labels** — every label is inside its container, fully visible, not clipped, not overlapping unrelated elements.
2. **Arrow geometry** — every arrow's start *and* end land on a shape edge (not mid-air, not on label backgrounds, not on a different arrow's footprint). See `references/09-arrows.md` §6.
3. **Element overlap** — no two unrelated elements visually overlap. (Nested layered rectangles are *not* overlap; that's nesting.)
4. **Reading order** — the intended primary path is the most visually obvious one.
5. **Category vocabulary** — shapes, colors, and arrowheads match the chosen category in `references/08-diagram-types.md` and the arrow vocabulary in `references/09-arrows.md`.

Output format:

```
audit:
  labels:            pass | FAIL — <one-line description of what is wrong>
  arrow geometry:    pass | FAIL — <one-line description of what is wrong>
  element overlap:   pass | FAIL — <one-line description of what is wrong>
  reading order:     pass | FAIL — <one-line description of what is wrong>
  category:          pass | FAIL — <one-line description of what is wrong>
```

If **any** category is `FAIL` → go to Step 6. Do **not** report success. Do **not** finalize. Do **not** describe the FAIL as small.

### Step 6 — revise

Apply the smallest fix that addresses the FAILs from Step 5. Common moves:

- Re-anchor an arrow that floats: recompute `points` against the source/target edges (formulas in `references/05-validation.md`).
- Move an arrow start to a *different edge* of the source shape when its current edge collides with another arrow's label or endpoint (`references/09-arrows.md` §6).
- Pair a missing label binding (`boundElements` ↔ `containerId`).
- Swap a mid-line elbow for a straight diagonal when the elbow adds no meaning.
- Drop a decorative box when a piece of free-floating text would do.

Re-render. Return to Step 5. Repeat the audit *as a fresh inspection*, not as a recall of the previous pass — actually re-look at the image.

The diagram is complete only when Step 5 prints all `pass` *and* a separate fresh audit after at least one revision confirms the same. A single all-pass audit on the very first render is suspicious — re-look once before finalizing.

**Forbidden**: declaring a FAIL "minor" and skipping its fix. Categorizing a FAIL as a non-issue is the single failure mode this skill exists to prevent. If you are tempted to do it, the skill is not yet applied; return to Step 6.

---

## Building large diagrams in slices

A diagram of more than ~20 elements is hard to write in one pass. Work in slices:

1. Place the **outline only** — section labels and the bounding boxes for each major area.
2. Add one slice at a time, render between slices, look at the image.
3. Use ID prefixes per slice (`auth-*`, `payment-*`) so cross-slice references stay legible.

If a slice cannot stand on its own visually, the slice boundary is wrong — re-cut.

---

## References

| File                              | What it covers                                                |
| --------------------------------- | ------------------------------------------------------------- |
| `references/01-json-schema.md`    | Element types, common fields, file envelope                   |
| `references/02-drawing-api.md`    | `@excalidraw/utils` helpers for programmatic authoring        |
| `references/03-color-palette.md`  | Default colors and a small extension palette                  |
| `references/04-layout-patterns.md`| Coordinate templates for common layouts                       |
| `references/05-validation.md`     | Checklist + formulas for IDs, bindings, arrow geometry        |
| `references/06-examples.md`       | Small, runnable JSON samples                                  |
| `references/07-render-embed.md`   | CLI options, render flags, Markdown embedding                 |
| `references/08-diagram-types.md`  | Per-category design vocabulary (architecture, sequence, state, ER, journey, …) |
| `references/09-arrows.md`         | Arrow philosophy: when to use one, head/style/color/path semantics            |

The category page (`08`) is essential — different diagram types have different visual vocabularies, and using the wrong one produces correct-but-confusing pictures. Pick a category before placing shapes.

For anything not covered above, defer to the official docs at <https://docs.excalidraw.com/docs/>.
