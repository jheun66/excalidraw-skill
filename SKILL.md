---
name: excalidraw
description: Auto-delegate when the user asks to draw, diagram, sketch, or visualize a codebase, a system architecture, a dependency graph, a sequence/flow, a state machine, or an abstract concept. The skill writes a skeleton, builds it into an editable .excalidraw file with Excalidraw's own programmatic API, renders it locally to check the picture, fixes what it sees, and hands the user the .excalidraw file.
---

# Excalidraw skill — author, build, verify

This skill produces diagrams that **prove a relationship** rather than just labelling boxes. Every shape, position, and connection is chosen so that the picture *itself* — even with the labels peeled off — still tells the story it is supposed to tell.

**The deliverable is a `.excalidraw` file.** Not a PNG. The user opens it in Excalidraw and keeps working on it — moving boxes, retyping labels, exporting whatever image they need from the app. That changes what "correct" means: the file has to survive being edited, which is what bindings and fractional indices are for. Rendering is how *you* check your work, not what you hand over.

The official reference for the file format and APIs is <https://docs.excalidraw.com/docs/>. Treat that site as canonical for anything technical. The files under `references/` are condensed, opinionated guides on top of it.

---

## When to invoke

Trigger on any prompt that asks for a picture of *structure*:

- "Draw / diagram / sketch / visualize / illustrate …"
- "Show me how X talks to Y."
- "Map out the dependencies between …"
- "Make a sequence / flow / state diagram for …"

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
│ 3. Write a skeleton         │  shapes + relationships only
│                             │  references/02, 04, 06
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 4. Build the scene          │  node scripts/build-scene.mjs x.skeleton.json
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 5. Render and *look*        │  node scripts/render.mjs x.excalidraw
│                             │  then Read the .png
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 6. Revise until the picture │  back to step 3 — JSON-only inspection
│    matches the argument     │  is *not* enough
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 7. Hand over the            │  the .excalidraw file, not the PNG
│    .excalidraw file         │
└─────────────────────────────┘
```

Steps 5–6 are mandatory, not optional. What they catch has narrowed — the build step now guarantees every field-level invariant the old checklist policed — but what is left is exactly the class of problem that is invisible in a skeleton and obvious in an image: overlap, crossing arrows, a reading order that fights the argument.

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

Before touching a skeleton, write one sentence the diagram has to make true:

- *"In this codebase, all DB writes funnel through one repository trait."*
- *"A login attempt traverses these four stages, in this order, with one optional branch."*
- *"The presentation layer depends on the application layer, which depends on the domain layer — never the other way."*

Keep the sentence visible while you work. Every shape and arrow either supports it or is dead weight.

### Step 2 — sketch on paper or in plain text

A 30-second pencil sketch beats five minutes of coordinates. Confirm the *shape* of the answer (which nodes, which arrows) before encoding it.

### Step 3 — write the skeleton

Read `references/02-drawing-api.md` for the format, `references/04-layout-patterns.md` for coordinate templates, `references/06-examples.md` for runnable starting points.

A skeleton is shapes and relationships, nothing else:

```json
{
  "elements": [
    { "type": "rectangle", "id": "api", "x": 0, "y": 0, "width": 200, "height": 90,
      "label": { "text": "API" } },
    { "type": "rectangle", "id": "db", "x": 0, "y": 220, "width": 200, "height": 90,
      "label": { "text": "DB" } },
    { "type": "arrow", "start": { "id": "api" }, "end": { "id": "db" },
      "label": { "text": "쿼리" } }
  ]
}
```

Ids are semantic (`pres-rect`, not `box-1`) because arrows reference them and because a build error names them. They are local handles — the ids in the finished file are minted by the converter.

Do not hand-write element JSON. If you find yourself typing `boundElements`, `containerId`, `index`, `seed` or `versionNonce`, you are on the wrong path — those are outputs.

When the layout is repetitive (N consumers, a grid, a row per row of data), write the skeleton as a `.mjs` module that computes it. See the fan-out example in `02`.

### Step 4 — build

```bash
node scripts/build-scene.mjs diagram.skeleton.json
```

Read the summary it prints. The element counts are a cheap sanity check — a label that failed to bind shows up as a missing `text`, and an unbound arrow is called out explicitly. A dangling arrow reference is a hard error naming the id.

### Step 5 — render and look (mandatory self-audit)

```bash
node scripts/render.mjs diagram.excalidraw   # → .svg and .png
```

Use the `Read` tool on the `.png`. After every render you **must** print a four-line audit, exactly one line per category, each ending with `pass` or `FAIL`. No `partial`, no `minor`, no `good enough`, no implicit pass.

1. **Element overlap** — no two unrelated elements visually overlap. (Nested layered rectangles are *not* overlap; that's nesting.)
2. **Arrow paths** — every arrow leaves and lands on the edge that makes sense, points the direction the dependency actually runs, and does not cross another arrow or sit on top of a label.
3. **Reading order** — the intended primary path is the most visually obvious one.
4. **Category vocabulary** — shapes, colors, and arrowheads match the chosen category in `references/08-diagram-types.md` and the arrow vocabulary in `references/09-arrows.md`.

Output format:

```
audit:
  element overlap:   pass | FAIL — <one-line description of what is wrong>
  arrow paths:       pass | FAIL — <one-line description of what is wrong>
  reading order:     pass | FAIL — <one-line description of what is wrong>
  category:          pass | FAIL — <one-line description of what is wrong>
```

If **any** category is `FAIL` → go to Step 6. Do **not** report success. Do **not** finalize. Do **not** describe the FAIL as small.

Note what is *not* on this list any more: clipped labels, missing bindings, empty containers, mismatched arrow extents. Those are structurally impossible now (`references/05-validation.md` says exactly which and why), and auditing for them wastes the pass.

### Step 6 — revise

Apply the smallest fix that addresses the FAILs. Common moves — all of them edits to the **skeleton**, then rebuild:

- Move a node. Overlap and crossings are almost always a coordinate problem, not an arrow problem.
- Reorder siblings so the arrows stop crossing.
- Swap a straight run for an authored right-angle path (`points` in `02`) when the diagonal cuts through something.
- Drop a decorative box when free-floating text would do.
- Re-pick the category vocabulary if the shapes are fighting the diagram type.

Rebuild, re-render, return to Step 5. Repeat the audit *as a fresh inspection*, not as a recall of the previous pass — actually re-look at the image.

The diagram is complete only when Step 5 prints all `pass` *and* a separate fresh audit after at least one revision confirms the same. A single all-pass audit on the very first render is suspicious — re-look once before finalizing.

**Forbidden**: declaring a FAIL "minor" and skipping its fix. Categorizing a FAIL as a non-issue is the single failure mode this skill exists to prevent. If you are tempted to do it, the skill is not yet applied; return to Step 6.

### Step 7 — hand over

Give the user the **`.excalidraw` file**. Say where it is.

Do not present the PNG as the deliverable. It is a by-product of the audit, useful to show inline if the user is reading in chat, but the file is the thing: they can open it, move a box, fix a label, and export whatever image they need from Excalidraw itself. Keep or delete the `.png`/`.svg` as suits the context.

---

## Building large diagrams in slices

A diagram of more than ~20 elements is hard to get right in one pass. Work in slices:

1. Place the **outline only** — section labels and the bounding boxes for each major area.
2. Add one slice at a time, rebuild and render between slices, look at the image.
3. Use id prefixes per slice (`auth-*`, `payment-*`) so cross-slice references stay legible.

If a slice cannot stand on its own visually, the slice boundary is wrong — re-cut.

---

## References

| File                              | What it covers                                                |
| --------------------------------- | ------------------------------------------------------------- |
| `references/01-json-schema.md`    | What the built file looks like — for reading, not writing     |
| `references/02-drawing-api.md`    | **The skeleton format and the build script — start here**     |
| `references/03-color-palette.md`  | Default colors and a small extension palette                  |
| `references/04-layout-patterns.md`| Coordinate templates for common layouts                       |
| `references/05-validation.md`     | What the pipeline guarantees, and what only your eyes can catch |
| `references/06-examples.md`       | Small, runnable skeletons                                     |
| `references/07-render-embed.md`   | Render options, Markdown embedding                            |
| `references/08-diagram-types.md`  | Per-category design vocabulary (architecture, sequence, state, ER, journey, …) |
| `references/09-arrows.md`         | Arrow philosophy: when to use one, head/style/color/path semantics |

The category page (`08`) is essential — different diagram types have different visual vocabularies, and using the wrong one produces correct-but-confusing pictures. Pick a category before placing shapes.

For anything not covered above, defer to the official docs at <https://docs.excalidraw.com/docs/>.
