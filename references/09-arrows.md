# 09 — Arrows: a philosophy

Arrow geometry is produced for you — see `02-drawing-api.md`. This page is the layer above — *when* to use arrows, *which* arrowhead, *which* stroke style, *what* color, and *what* path. The single rule that everything else descends from:

> **An arrow is a claim about causality. If a connection is not directional, it is not an arrow.**

A diagram littered with arrows that don't actually mean "X depends on / sends to / triggers Y" forces readers to guess which arrows carry the argument and which are just connective tissue. That guessing tax is what kills otherwise-correct pictures.

---

## 1. Arrow vs. line vs. nesting

There are three ways to show a relationship in Excalidraw. Pick the one that matches the relationship's nature.

| Relationship                          | Use            |
| ------------------------------------- | -------------- |
| "X depends on Y" / "X sends to Y"     | **Arrow**      |
| "X and Y are siblings" / "X is in Y"  | **Line** (or no connector at all — proximity / grouping) |
| "X contains Y"                        | **Nesting** — put Y's rectangle inside X's |

A common failure mode is using arrows for grouping ("these things go together") because arrows feel "more connected." They aren't — they introduce a phantom direction the reader has to mentally undo. Use a dashed group rectangle instead.

---

## 2. Arrowhead vocabulary

Excalidraw exposes five `endArrowhead` values. Treat them as a small semantic dictionary, not as decoration:

| `endArrowhead` | Look                       | Meaning                                                            |
| -------------- | -------------------------- | ------------------------------------------------------------------ |
| `null`         | no head                    | non-directional connection — usually means *use a `line` instead*  |
| `"arrow"`      | open / line head           | default directional flow; UML asynchronous message                 |
| `"triangle"`   | filled triangle head       | UML synchronous call (the caller blocks); strong "X invokes Y"     |
| `"bar"`        | perpendicular bar          | termination / cap; "the path stops here"                           |
| `"dot"`        | filled circle              | UML composition / aggregation endpoint                             |

`startArrowhead` is mirror-symmetric. Use it only for explicitly bidirectional relationships — and prefer two unidirectional arrows over one bidirectional one when the *cardinality of each direction matters*.

Inside a single diagram, **do not mix arrowheads to mean the same thing**. If you've used `"arrow"` for "depends on" once, every "depends on" gets `"arrow"`. The vocabulary collapses if it's inconsistent.

---

## 3. Stroke style as a semantic channel

`strokeStyle` carries meaning, not aesthetics:

| `strokeStyle` | Meaning                                             |
| ------------- | --------------------------------------------------- |
| `"solid"`     | the primary, real flow — default                    |
| `"dashed"`    | optional / asynchronous / future / virtual          |
| `"dotted"`    | annotation, weak association, "see also"           |

The most common mistake: dashed for *everything that isn't quite the happy path*, which dilutes the channel. Dashed has to *mean* one specific thing per diagram. State that meaning in a small key if there's any ambiguity.

For UML sequence diagrams specifically (see `08-diagram-types.md` §7):

- synchronous call: solid + `"triangle"` head
- asynchronous call: solid + `"arrow"` head
- return: dashed + `"arrow"` head

That triple is recognized at a glance by anyone who has seen UML before. Do not invent a fourth.

---

## 4. Color follows the source role

An arrow says "I depend on / I send to / I trigger Y." The "I" is the source. Color the arrow with **the source's color family**, so the reader can scan the diagram by *who is doing the calling*.

Examples (palette from `03-color-palette.md`):

- A presentation rectangle's outgoing arrow → blue stroke (`#1971c2`).
- An application use case's outgoing arrow → green (`#2f9e44`).
- An infrastructure adapter's `implements traits` arrow → purple (`#862e9c`).

Exceptions earn a different color:

- Error / failure paths → red, regardless of source.
- Critical / hot path → red or thick black, even if otherwise mundane.
- A neutral arrow that doesn't belong to any role's color family → dark gray (`#5f6368`).

Multi-rainbow coloring (every arrow a different hue) is the visual equivalent of shouting every word — it carries no information.

---

## 5. Path: straight by default

Routing decisions:

- **Straight diagonal**: when source and target are not aligned and there is no obstacle. The most honest path. Default.
- **90° elbow** (authored `points` with an intermediate corner — *not* `elbowed: true`, which does nothing in a static file): when (a) you need to avoid an obstacle, (b) you have parallel arrows that would otherwise cross, or (c) the orthogonality itself carries meaning ("this path strictly travels along structural lanes").
- **Curved / U-shaped**: only for self-calls (a method calls itself) or one-off return paths. Heavy. If two arrows in your diagram are curved, the diagram has a layout problem.

Never elbow a path that could be straight. Elbows say "I went out of my way to avoid something" — when there is nothing to avoid, that signal is noise.

---

## 6. Geometry — what is left for you to get right

Endpoints, extents and bindings are computed by `scripts/build-scene.mjs`: an arrow declared as `start`/`end` between two shapes lands on each outline, with the right `width`/`height` and both bindings. An arrow floating next to its source is not a failure mode on this path.

Two rules survive, because they are about *choice*, not arithmetic:

- **An arrow's start must not collide with another arrow's end label**, and vice versa. Technically valid, visually noise. The fix is to move a *shape* so the two arrows approach from different sides — or, if the layout is right and only one path is wrong, override that one arrow with explicit `points`.
- **Elbow only to avoid something.** A right angle in the file means authoring the corner yourself (`02-drawing-api.md`). `elbowed: true` on its own draws a straight line — the editor computes elbow routes during a drag and the file only stores the result.

## 7. Width as emphasis

`strokeWidth` is the loudness knob:

| `strokeWidth` | When                                                       |
| ------------- | ---------------------------------------------------------- |
| 1             | secondary / annotation arrows (rare; usually drop instead) |
| 2             | default; the one most arrows in any diagram should use     |
| 3             | the critical path of the diagram (one or two arrows)       |
| 4+            | deliberate "this is the headline" emphasis (very rare)     |

A diagram in which every arrow is `strokeWidth: 3` has emphasized nothing. Reserve thickness for the one or two arrows that carry the *headline*.

---

## 8. Multiple arrows from one shape

When N arrows leave the same edge, they need to read as a fan, not as a tangle:

- **Stagger** along the edge: distribute the start points evenly. For `N=2`, use 30 % / 70 %; for `N=3`, 20 % / 50 % / 80 %; for `N=5`, 20 % / 35 % / 50 % / 65 % / 80 %. The endpoints already differ, so the only thing left to disambiguate is the start.
- **Color-code by destination role** if the destinations have different roles. Same-role destinations get the same arrow color; mixed roles get different colors.
- **Cap at N=5 per edge.** Beyond five arrows leaving one edge, split into two columns, an intermediate hub, or a different layout entirely. Six arrows from one box is not "rich" — it is unreadable.

For arrows that arrive at the same edge of one target, the same staggering logic applies in reverse — distribute the end points along the edge.

---

## 9. The five mistakes to never make

1. **Arrows that mean nothing**: connecting two boxes with an arrow because they are "related," not because one *causes / depends on / sends to* the other.
2. **Arrows on midpoints**: start or end coordinates aimed at a shape's center rather than its edge — produces visibly floating arrows.
3. **Bidirectional everywhere**: using `startArrowhead: "arrow"` + `endArrowhead: "arrow"` to mean "they talk to each other" when in fact only one direction carries the argument.
4. **Inconsistent vocabulary inside one diagram**: using `"triangle"` for a synchronous call once and `"arrow"` for the next one. The reader assumes you meant something different — and they're right.
5. **Decorative dashed**: dashing arrows because "it looks nicer" rather than to encode optional / async / virtual. Once dashed loses its meaning, the channel is unrecoverable for that diagram.

---

## 10. Cross-references inside this skill

| What                          | Where                                |
| ----------------------------- | ------------------------------------ |
| Declaring an arrow, authored `points` | `02-drawing-api.md` §"Arrows" |
| What the build step guarantees | `05-validation.md` §"What the pipeline already guarantees" |
| Per-category arrow vocabulary | `08-diagram-types.md` (sync/async/return tables in §7, transition labels in §8, etc.) |
| Color palette                 | `03-color-palette.md`                |
