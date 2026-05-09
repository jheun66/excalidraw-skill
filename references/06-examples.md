# 06 — Examples

Two small, runnable diagrams. Copy the JSON, save it as `name.excalidraw`, run `./scripts/render.sh name.excalidraw`, and you should get a clean PNG.

## Example A — Vertical pipeline (3 stages)

Argument: *"data flows through three stages, in order"*.

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "claude-code-excalidraw-skill",
  "appState": { "viewBackgroundColor": "#ffffff", "gridSize": 20 },
  "files": {},
  "elements": [
    {
      "id": "stage1", "type": "rectangle",
      "x": 200, "y": 100, "width": 200, "height": 80,
      "angle": 0, "strokeColor": "#1971c2", "backgroundColor": "#a5d8ff",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 1, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": { "type": 3 }, "seed": 1, "version": 1, "versionNonce": 1,
      "isDeleted": false, "boundElements": [{ "type": "text", "id": "stage1-text" }],
      "updated": 1, "link": null, "locked": false
    },
    {
      "id": "stage1-text", "type": "text",
      "x": 205, "y": 120, "width": 190, "height": 40,
      "angle": 0, "strokeColor": "#1e1e1e", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 1, "strokeStyle": "solid",
      "roughness": 1, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": null, "seed": 2, "version": 1, "versionNonce": 2,
      "isDeleted": false, "boundElements": null, "updated": 1, "link": null, "locked": false,
      "text": "Stage 1\nIngest", "fontSize": 18, "fontFamily": 1,
      "textAlign": "center", "verticalAlign": "middle",
      "containerId": "stage1", "originalText": "Stage 1\nIngest", "lineHeight": 1.25
    },
    {
      "id": "stage2", "type": "rectangle",
      "x": 200, "y": 260, "width": 200, "height": 80,
      "angle": 0, "strokeColor": "#1971c2", "backgroundColor": "#a5d8ff",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 1, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": { "type": 3 }, "seed": 3, "version": 1, "versionNonce": 3,
      "isDeleted": false, "boundElements": [{ "type": "text", "id": "stage2-text" }],
      "updated": 1, "link": null, "locked": false
    },
    {
      "id": "stage2-text", "type": "text",
      "x": 205, "y": 280, "width": 190, "height": 40,
      "angle": 0, "strokeColor": "#1e1e1e", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 1, "strokeStyle": "solid",
      "roughness": 1, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": null, "seed": 4, "version": 1, "versionNonce": 4,
      "isDeleted": false, "boundElements": null, "updated": 1, "link": null, "locked": false,
      "text": "Stage 2\nTransform", "fontSize": 18, "fontFamily": 1,
      "textAlign": "center", "verticalAlign": "middle",
      "containerId": "stage2", "originalText": "Stage 2\nTransform", "lineHeight": 1.25
    },
    {
      "id": "stage3", "type": "rectangle",
      "x": 200, "y": 420, "width": 200, "height": 80,
      "angle": 0, "strokeColor": "#1971c2", "backgroundColor": "#a5d8ff",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 1, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": { "type": 3 }, "seed": 5, "version": 1, "versionNonce": 5,
      "isDeleted": false, "boundElements": [{ "type": "text", "id": "stage3-text" }],
      "updated": 1, "link": null, "locked": false
    },
    {
      "id": "stage3-text", "type": "text",
      "x": 205, "y": 440, "width": 190, "height": 40,
      "angle": 0, "strokeColor": "#1e1e1e", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 1, "strokeStyle": "solid",
      "roughness": 1, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": null, "seed": 6, "version": 1, "versionNonce": 6,
      "isDeleted": false, "boundElements": null, "updated": 1, "link": null, "locked": false,
      "text": "Stage 3\nLoad", "fontSize": 18, "fontFamily": 1,
      "textAlign": "center", "verticalAlign": "middle",
      "containerId": "stage3", "originalText": "Stage 3\nLoad", "lineHeight": 1.25
    },
    {
      "id": "arrow1", "type": "arrow",
      "x": 300, "y": 180, "width": 0, "height": 80,
      "angle": 0, "strokeColor": "#1971c2", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": null, "seed": 7, "version": 1, "versionNonce": 7,
      "isDeleted": false, "boundElements": null, "updated": 1, "link": null, "locked": false,
      "points": [[0, 0], [0, 80]], "lastCommittedPoint": null,
      "startBinding": { "elementId": "stage1", "focus": 0, "gap": 1, "fixedPoint": [0.5, 1] },
      "endBinding":   { "elementId": "stage2", "focus": 0, "gap": 1, "fixedPoint": [0.5, 0] },
      "startArrowhead": null, "endArrowhead": "arrow", "elbowed": false
    },
    {
      "id": "arrow2", "type": "arrow",
      "x": 300, "y": 340, "width": 0, "height": 80,
      "angle": 0, "strokeColor": "#1971c2", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": null, "seed": 8, "version": 1, "versionNonce": 8,
      "isDeleted": false, "boundElements": null, "updated": 1, "link": null, "locked": false,
      "points": [[0, 0], [0, 80]], "lastCommittedPoint": null,
      "startBinding": { "elementId": "stage2", "focus": 0, "gap": 1, "fixedPoint": [0.5, 1] },
      "endBinding":   { "elementId": "stage3", "focus": 0, "gap": 1, "fixedPoint": [0.5, 0] },
      "startArrowhead": null, "endArrowhead": "arrow", "elbowed": false
    }
  ]
}
```

What to look for in the rendered PNG:

- Three blue boxes evenly spaced top-to-bottom.
- Two arrows touching the bottom of the upper box and the top of the lower box, no gap, no overlap.
- Labels centered horizontally and vertically inside each box.

## Example B — Fan-out (1 hub → 3 children)

Argument: *"the hub feeds three independent consumers"*.

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "claude-code-excalidraw-skill",
  "appState": { "viewBackgroundColor": "#ffffff", "gridSize": 20 },
  "files": {},
  "elements": [
    {
      "id": "hub", "type": "rectangle",
      "x": 380, "y": 100, "width": 160, "height": 80,
      "angle": 0, "strokeColor": "#e8590c", "backgroundColor": "#ffd8a8",
      "fillStyle": "solid", "strokeWidth": 3, "strokeStyle": "solid",
      "roughness": 1, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": { "type": 3 }, "seed": 1, "version": 1, "versionNonce": 1,
      "isDeleted": false, "boundElements": [{ "type": "text", "id": "hub-text" }],
      "updated": 1, "link": null, "locked": false
    },
    {
      "id": "hub-text", "type": "text",
      "x": 385, "y": 130, "width": 150, "height": 20,
      "angle": 0, "strokeColor": "#7c3a00", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 1, "strokeStyle": "solid",
      "roughness": 1, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": null, "seed": 2, "version": 1, "versionNonce": 2,
      "isDeleted": false, "boundElements": null, "updated": 1, "link": null, "locked": false,
      "text": "Hub", "fontSize": 18, "fontFamily": 1,
      "textAlign": "center", "verticalAlign": "middle",
      "containerId": "hub", "originalText": "Hub", "lineHeight": 1.25
    },
    {
      "id": "child-a", "type": "rectangle",
      "x": 160, "y": 280, "width": 120, "height": 60,
      "angle": 0, "strokeColor": "#1971c2", "backgroundColor": "#a5d8ff",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 1, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": { "type": 3 }, "seed": 3, "version": 1, "versionNonce": 3,
      "isDeleted": false, "boundElements": [{ "type": "text", "id": "child-a-text" }],
      "updated": 1, "link": null, "locked": false
    },
    {
      "id": "child-a-text", "type": "text",
      "x": 165, "y": 295, "width": 110, "height": 30,
      "angle": 0, "strokeColor": "#0a3a78", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 1, "strokeStyle": "solid",
      "roughness": 1, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": null, "seed": 4, "version": 1, "versionNonce": 4,
      "isDeleted": false, "boundElements": null, "updated": 1, "link": null, "locked": false,
      "text": "Consumer A", "fontSize": 16, "fontFamily": 1,
      "textAlign": "center", "verticalAlign": "middle",
      "containerId": "child-a", "originalText": "Consumer A", "lineHeight": 1.25
    },
    {
      "id": "child-b", "type": "rectangle",
      "x": 400, "y": 280, "width": 120, "height": 60,
      "angle": 0, "strokeColor": "#1971c2", "backgroundColor": "#a5d8ff",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 1, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": { "type": 3 }, "seed": 5, "version": 1, "versionNonce": 5,
      "isDeleted": false, "boundElements": [{ "type": "text", "id": "child-b-text" }],
      "updated": 1, "link": null, "locked": false
    },
    {
      "id": "child-b-text", "type": "text",
      "x": 405, "y": 295, "width": 110, "height": 30,
      "angle": 0, "strokeColor": "#0a3a78", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 1, "strokeStyle": "solid",
      "roughness": 1, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": null, "seed": 6, "version": 1, "versionNonce": 6,
      "isDeleted": false, "boundElements": null, "updated": 1, "link": null, "locked": false,
      "text": "Consumer B", "fontSize": 16, "fontFamily": 1,
      "textAlign": "center", "verticalAlign": "middle",
      "containerId": "child-b", "originalText": "Consumer B", "lineHeight": 1.25
    },
    {
      "id": "child-c", "type": "rectangle",
      "x": 640, "y": 280, "width": 120, "height": 60,
      "angle": 0, "strokeColor": "#1971c2", "backgroundColor": "#a5d8ff",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 1, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": { "type": 3 }, "seed": 7, "version": 1, "versionNonce": 7,
      "isDeleted": false, "boundElements": [{ "type": "text", "id": "child-c-text" }],
      "updated": 1, "link": null, "locked": false
    },
    {
      "id": "child-c-text", "type": "text",
      "x": 645, "y": 295, "width": 110, "height": 30,
      "angle": 0, "strokeColor": "#0a3a78", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 1, "strokeStyle": "solid",
      "roughness": 1, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": null, "seed": 8, "version": 1, "versionNonce": 8,
      "isDeleted": false, "boundElements": null, "updated": 1, "link": null, "locked": false,
      "text": "Consumer C", "fontSize": 16, "fontFamily": 1,
      "textAlign": "center", "verticalAlign": "middle",
      "containerId": "child-c", "originalText": "Consumer C", "lineHeight": 1.25
    },
    {
      "id": "arrow-a", "type": "arrow",
      "x": 460, "y": 180, "width": 240, "height": 100,
      "angle": 0, "strokeColor": "#5f6368", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": null, "seed": 9, "version": 1, "versionNonce": 9,
      "isDeleted": false, "boundElements": null, "updated": 1, "link": null, "locked": false,
      "points": [[0, 0], [-240, 0], [-240, 100]], "lastCommittedPoint": null,
      "startBinding": { "elementId": "hub", "focus": 0, "gap": 1, "fixedPoint": [0.5, 1] },
      "endBinding":   { "elementId": "child-a", "focus": 0, "gap": 1, "fixedPoint": [0.5, 0] },
      "startArrowhead": null, "endArrowhead": "arrow", "elbowed": true
    },
    {
      "id": "arrow-b", "type": "arrow",
      "x": 460, "y": 180, "width": 0, "height": 100,
      "angle": 0, "strokeColor": "#5f6368", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": null, "seed": 10, "version": 1, "versionNonce": 10,
      "isDeleted": false, "boundElements": null, "updated": 1, "link": null, "locked": false,
      "points": [[0, 0], [0, 100]], "lastCommittedPoint": null,
      "startBinding": { "elementId": "hub", "focus": 0, "gap": 1, "fixedPoint": [0.5, 1] },
      "endBinding":   { "elementId": "child-b", "focus": 0, "gap": 1, "fixedPoint": [0.5, 0] },
      "startArrowhead": null, "endArrowhead": "arrow", "elbowed": false
    },
    {
      "id": "arrow-c", "type": "arrow",
      "x": 460, "y": 180, "width": 240, "height": 100,
      "angle": 0, "strokeColor": "#5f6368", "backgroundColor": "transparent",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 0, "opacity": 100, "groupIds": [], "frameId": null,
      "roundness": null, "seed": 11, "version": 1, "versionNonce": 11,
      "isDeleted": false, "boundElements": null, "updated": 1, "link": null, "locked": false,
      "points": [[0, 0], [240, 0], [240, 100]], "lastCommittedPoint": null,
      "startBinding": { "elementId": "hub", "focus": 0, "gap": 1, "fixedPoint": [0.5, 1] },
      "endBinding":   { "elementId": "child-c", "focus": 0, "gap": 1, "fixedPoint": [0.5, 0] },
      "startArrowhead": null, "endArrowhead": "arrow", "elbowed": true
    }
  ]
}
```

What to look for in the rendered PNG:

- The hub at top is the most visually prominent element (orange, thicker stroke).
- Three arrows splay outward in a clear fan pattern; the side arrows turn 90° before reaching their child.
- All three consumers share the same color family — they have the same role.
