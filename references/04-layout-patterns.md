# 04 — Layout patterns

A diagram only "argues" if its layout matches the relationship being drawn. This page collects the layouts this skill reaches for the most, with coordinate templates you can lift into a skeleton (`02-drawing-api.md`).

The coordinate model is straightforward: `x`, `y` is the top-left corner of a shape, `width` / `height` extend right and down. Origin is at the top-left of the canvas. All edge formulas in this page use that convention.

## Coordinates are the only thing you place

Arrows are not your job. Write `{ "type": "arrow", "start": { "id": "a" }, "end": { "id": "b" } }` and `scripts/build-scene.mjs` runs the line between the two shapes, clipping it where it leaves each outline — a rectangle's side, a diamond's slant, an ellipse's curve — and backing off a small gap. What follows is therefore about *where the boxes go*, which is the part that carries the argument anyway.

The formulas below are here only for the case where you override the path with explicit `points` (see `02-drawing-api.md`). Given a shape `(x, y, width, height)`:

| Edge          | Point                          |
| ------------- | ------------------------------ |
| Top center    | `(x + width/2, y)`             |
| Bottom center | `(x + width/2, y + height)`    |
| Left center   | `(x, y + height/2)`            |
| Right center  | `(x + width, y + height/2)`    |

## Pattern 1 — Vertical pipeline

Use when the argument is "data flows through these stages, in this order".

```
   ┌────────┐
   │ Stage1 │
   └───┬────┘
       ▼
   ┌────────┐
   │ Stage2 │
   └───┬────┘
       ▼
   ┌────────┐
   │ Stage3 │
   └────────┘
```

Coordinate template (3 stages, 200×80 boxes, 80 px gaps):

| Element  | x    | y    | w   | h  |
| -------- | ---- | ---- | --- | -- |
| Stage 1  | 200  | 100  | 200 | 80 |
| Stage 2  | 200  | 260  | 200 | 80 |
| Stage 3  | 200  | 420  | 200 | 80 |
| Arrow A  | 300  | 180  | 0   | 80 |
| Arrow B  | 300  | 340  | 0   | 80 |

Each arrow's `points` is `[[0,0],[0,80]]`, originating at the bottom edge of the previous stage.

## Pattern 2 — Horizontal pipeline

Same idea, rotated 90°. Better when stage names are short and the page is wide.

| Element  | x    | y    | w   | h  |
| -------- | ---- | ---- | --- | -- |
| Stage 1  | 100  | 200  | 200 | 80 |
| Stage 2  | 380  | 200  | 200 | 80 |
| Stage 3  | 660  | 200  | 200 | 80 |
| Arrow A  | 300  | 240  | 80  | 0  |
| Arrow B  | 580  | 240  | 80  | 0  |

Arrow `points` is `[[0,0],[80,0]]`, on the right edge of the previous stage.

## Pattern 3 — Fan-out (1 → N)

Use when one node feeds many. The fan must be visible: place children below and *spread them horizontally*.

```
           ┌────────┐
           │  Hub   │
           └───┬────┘
       ┌───────┼───────┐
       ▼       ▼       ▼
   ┌────┐  ┌────┐  ┌────┐
   │ A  │  │ B  │  │ C  │
   └────┘  └────┘  └────┘
```

| Element | x    | y    | w   | h  |
| ------- | ---- | ---- | --- | -- |
| Hub     | 380  | 100  | 160 | 80 |
| Child A | 160  | 280  | 120 | 60 |
| Child B | 400  | 280  | 120 | 60 |
| Child C | 640  | 280  | 120 | 60 |

Arrows leave the hub's bottom-center `(460, 180)` and route via an L-shape to each child's top-center. With `elbowed: true`, points are:

- Hub → A: `[[0,0],[-240,0],[-240,100]]`  (width 240, height 100)
- Hub → B: `[[0,0],[0,100]]`              (width 0, height 100)
- Hub → C: `[[0,0],[240,0],[240,100]]`    (width 240, height 100)

If your hub has more than five children, switch to a horizontal fan (rotate the whole layout) or split into two rows.

## Pattern 4 — Hub-and-spoke

Like fan-out but the hub sits in the middle and connections flow outward in any direction. Use when the argument is "this thing talks to many siblings, and direction varies".

| Element | x    | y    | w   | h  |
| ------- | ---- | ---- | --- | -- |
| Hub     | 480  | 280  | 160 | 80 |
| North   | 500  | 100  | 120 | 60 |
| East    | 720  | 290  | 120 | 60 |
| South   | 500  | 460  | 120 | 60 |
| West    | 280  | 290  | 120 | 60 |

Each arrow runs from the hub's nearest edge to the spoke's facing edge. Keep arrowheads only on the directions that carry meaning — bidirectional everywhere becomes noise.

## Pattern 5 — Layered (concentric)

Use when the argument is "this layer wraps that layer". The outer rectangle visibly contains the inner one; nesting *is* the dependency direction.

```
┌────────────────────────┐
│ presentation           │
│  ┌──────────────────┐  │
│  │ application      │  │
│  │  ┌────────────┐  │  │
│  │  │ domain     │  │  │
│  │  └────────────┘  │  │
│  └──────────────────┘  │
└────────────────────────┘
```

| Element       | x    | y    | w   | h   |
| ------------- | ---- | ---- | --- | --- |
| presentation  | 80   | 80   | 720 | 620 |
| application   | 170  | 200  | 540 | 440 |
| domain        | 280  | 320  | 320 | 200 |

Place each layer's label as a free-floating text element near the top of its rectangle (not bound), so the inner shapes aren't covered. Use a warm color and the thickest stroke on the innermost layer to mark it as the "core".

## Pattern 6 — Sequence

Two parallel actors with messages between them. Use when timing matters.

| Element        | x    | y    | w   | h   |
| -------------- | ---- | ---- | --- | --- |
| Actor A header | 100  | 60   | 160 | 40  |
| Actor B header | 500  | 60   | 160 | 40  |
| Actor A line   | 180  | 100  | 0   | 500 |
| Actor B line   | 580  | 100  | 0   | 500 |
| msg 1 (A→B)    | 180  | 160  | 400 | 0   |
| msg 2 (B→A)    | 580  | 240  | -400| 0   |
| msg 3 (A→B)    | 180  | 320  | 400 | 0   |

Vertical lines are `line` elements; messages are `arrow` elements with `endArrowhead: "arrow"`. Time runs top-to-bottom; do not break that order.

## Anti-pattern — Uniform card grid

A grid of identical boxes with one label each is the default failure mode. The reader sees no hierarchy, no direction, no claim — just a roster. If you find yourself reaching for a 3×3 grid, ask whether the actual relationship between those nine items is something else (a fan-out, a layered stack, a sequence) and redraw it that way.

## When patterns don't fit

Most diagrams are a single pattern. If yours seems to need two, you are probably trying to make one picture say two arguments — split it into two diagrams instead.
