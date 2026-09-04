# 06 — Examples

Three runnable skeletons. Save one as `name.skeleton.json`, then:

```bash
node scripts/build-scene.mjs name.skeleton.json
node scripts/render.mjs name.excalidraw
```

Each is short because the skeleton carries only shapes and relationships — ids, `index`, `boundElements`, `containerId` and bindings are produced by the build step. See `02-drawing-api.md`.

---

## Example A — Vertical pipeline (3 stages)

Argument: *"data flows through three stages, in order"*.

```json
{
  "elements": [
    { "type": "rectangle", "id": "ingest", "x": 200, "y": 100, "width": 200, "height": 80,
      "strokeColor": "#1971c2", "backgroundColor": "#a5d8ff", "roundness": { "type": 3 },
      "label": { "text": "수집" } },
    { "type": "rectangle", "id": "transform", "x": 200, "y": 260, "width": 200, "height": 80,
      "strokeColor": "#1971c2", "backgroundColor": "#a5d8ff", "roundness": { "type": 3 },
      "label": { "text": "변환" } },
    { "type": "rectangle", "id": "store", "x": 200, "y": 420, "width": 200, "height": 80,
      "strokeColor": "#1971c2", "backgroundColor": "#a5d8ff", "roundness": { "type": 3 },
      "label": { "text": "적재" } },

    { "type": "arrow", "start": { "id": "ingest" }, "end": { "id": "transform" } },
    { "type": "arrow", "start": { "id": "transform" }, "end": { "id": "store" } }
  ]
}
```

What to look for in the rendered PNG:

- Three blue boxes evenly spaced top-to-bottom.
- Two vertical arrows leaving the bottom edge of the upper box and landing on the top edge of the lower one.
- Labels centred in each box.

Because the boxes are stacked, the build step picks the vertical edges on its own — no arrow coordinates appear in the skeleton at all.

---

## Example B — Fan-out (1 hub → 3 children)

Argument: *"the hub feeds three independent consumers"*.

```json
{
  "elements": [
    { "type": "rectangle", "id": "hub", "x": 380, "y": 100, "width": 160, "height": 80,
      "strokeColor": "#e8590c", "backgroundColor": "#ffd8a8", "strokeWidth": 3,
      "roundness": { "type": 3 }, "label": { "text": "이벤트 버스" } },

    { "type": "rectangle", "id": "search", "x": 140, "y": 340, "width": 160, "height": 80,
      "roundness": { "type": 3 }, "label": { "text": "검색 색인" } },
    { "type": "rectangle", "id": "mail", "x": 380, "y": 340, "width": 160, "height": 80,
      "roundness": { "type": 3 }, "label": { "text": "메일 발송" } },
    { "type": "rectangle", "id": "audit", "x": 620, "y": 340, "width": 160, "height": 80,
      "roundness": { "type": 3 }, "label": { "text": "감사 로그" } },

    { "type": "arrow", "start": { "id": "hub" }, "end": { "id": "search" } },
    { "type": "arrow", "start": { "id": "hub" }, "end": { "id": "mail" } },
    { "type": "arrow", "start": { "id": "hub" }, "end": { "id": "audit" } }
  ]
}
```

What to look for:

- One node above, three below, arrows visibly diverging — the fan is the argument.
- The three children are the same size. Different sizes would imply a hierarchy that is not there.

---

## Example C — Computed fan-out

Same picture, but the consumer list is data. This is the form to reach for whenever the diagram has repetition in it: adding a consumer is one string.

Save as `consumers.skeleton.mjs`:

```js
const CONSUMERS = ["검색 색인", "메일 발송", "감사 로그", "웹훅"];
const COL = 240;
const ROW_Y = 340;

export default {
  elements: [
    {
      type: "rectangle",
      id: "hub",
      x: -80,
      y: 100,
      width: 160,
      height: 80,
      strokeColor: "#e8590c",
      backgroundColor: "#ffd8a8",
      strokeWidth: 3,
      roundness: { type: 3 },
      label: { text: "이벤트 버스" },
    },

    ...CONSUMERS.map((name, i) => ({
      type: "rectangle",
      id: `consumer-${i}`,
      // centre the row on the hub
      x: (i - (CONSUMERS.length - 1) / 2) * COL - 80,
      y: ROW_Y,
      width: 160,
      height: 80,
      roundness: { type: 3 },
      label: { text: name },
    })),

    ...CONSUMERS.map((_, i) => ({
      type: "arrow",
      start: { id: "hub" },
      end: { id: `consumer-${i}` },
    })),
  ],
};
```

```bash
node scripts/build-scene.mjs consumers.skeleton.mjs
```

Note the arrows are generated from the same list as the boxes, so the two can never drift apart — which is the failure mode that made hand-written JSON expensive at this size.
