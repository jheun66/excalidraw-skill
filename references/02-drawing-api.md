# 02 — Drawing API

When the diagram is small you can hand-write the JSON directly (`references/01-json-schema.md`). When the diagram is generated from data, or when you need to load / merge / measure existing scenes, the `@excalidraw/utils` package exposes utilities that work both in the editor and (for some of them) in plain Node — given a DOM shim like `jsdom`. `@excalidraw/utils` is the standalone export of these helpers, separate from the heavier `@excalidraw/excalidraw` editor package; this skill depends on the former so it can run outside a browser without pulling React.

This page is a compact map of the utilities you are most likely to call from this skill. The authoritative list lives at <https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils>; export-specific functions are documented at <https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils/export>.

## Loading and saving

| Utility                           | Returns                | Use case                                                         |
| --------------------------------- | ---------------------- | ---------------------------------------------------------------- |
| `serializeAsJSON(elements, appState)` | JSON string         | Save a scene back to a `.excalidraw` file                        |
| `loadFromBlob(blob, …)`           | `Promise<RestoredDataState>` | Read a `.excalidraw` file or paste payload back into a scene |
| `loadLibraryFromBlob(blob)`       | `Promise<LibraryItems>`| Import a `.excalidrawlib` library                                |
| `loadSceneOrLibraryFromBlob(blob)`| Either of the above    | Accept either kind from a single drop target                     |

When this skill renders a diagram, the in-house renderer (`scripts/render.mjs`) uses these internally — you do not normally call them yourself.

## Element queries

| Utility                          | Returns | Use case                                                  |
| -------------------------------- | ------- | --------------------------------------------------------- |
| `isInvisiblySmallElement(el)`    | boolean | Filter out zero-width/height elements before measuring    |
| `isLinearElement(el)`            | boolean | Branch on shape vs connector                              |
| `getNonDeletedElements(els)`     | array   | Drop soft-deleted elements before exporting               |
| `getFreeDrawSvgPath(el)`         | string  | SVG `d` attribute for a freedraw element                  |

## Coordinates and bounds

| Utility                                   | Returns      | Use case                                                |
| ----------------------------------------- | ------------ | ------------------------------------------------------- |
| `sceneCoordsToViewportCoords({sceneX, sceneY}, appState)` | `{x, y}` | Convert from logical scene → screen pixels        |
| `viewportCoordsToSceneCoords({clientX, clientY}, appState)` | `{x, y}` | Convert from screen → logical scene             |
| `getCommonBounds(elements)`               | `[x1,y1,x2,y2]` | Compute the bounding box of a selection            |
| `elementsOverlappingBBox(els, bbox)`      | array        | Filter elements that overlap a region                   |
| `isElementInsideBBox(el, bbox)`           | boolean      | Strict containment test                                 |

`getCommonBounds` is the workhorse for "make a wrapper rectangle around these N elements" patterns; computing the right padding once and reusing the bounds avoids drift between an inner group and its container.

## Library management

| Utility                          | Returns | Use case                                                          |
| -------------------------------- | ------- | ----------------------------------------------------------------- |
| `mergeLibraryItems(target, src)` | array   | Combine two libraries without duplicates                          |
| `parseLibraryTokensFromUrl(url)` | object  | Parse `?addLibrary=…` parameters                                  |

## Export functions

| Utility                                      | Returns                | Browser DOM required                  |
| -------------------------------------------- | ---------------------- | ------------------------------------- |
| `exportToSvg({elements, appState, files, …})`| `Promise<SVGSVGElement>` | Yes (uses DOM APIs internally)       |
| `exportToCanvas({elements, appState, getDimensions, files, …})` | `HTMLCanvasElement` | Yes — produces an `HTMLCanvasElement` |
| `exportToBlob({...})`                        | `Promise<Blob>`        | Yes — calls `canvas.toBlob`           |
| `exportToClipboard({...})`                   | `void` (writes to clipboard) | Yes — needs Clipboard API       |

**Implication for this skill**: the export functions are not directly callable from a plain Node script. Our in-house renderer (`scripts/render.mjs`) works around this by setting up a `jsdom`-backed DOM shim plus stubs for `FontFace` / `document.fonts`, then importing `@excalidraw/utils` *after* the shim is in place to call `exportToSvg`. The resulting SVG is fed to `@resvg/resvg-js` for the final PNG. No real browser is involved, and the result is the same file format the Excalidraw web app would produce.

## Practical recipe — programmatic authoring loop

```ts
import {
  serializeAsJSON,
  getCommonBounds,
  getNonDeletedElements,
} from "@excalidraw/utils";

// 1. Build elements (hand-rolled or generated from your data)
const elements = buildElements(/* … */);

// 2. Compute a wrapping rectangle around them, with padding
const live = getNonDeletedElements(elements);
const [x1, y1, x2, y2] = getCommonBounds(live);
const padding = 24;
const wrapper = makeRectangle({
  id: "wrapper",
  x: x1 - padding,
  y: y1 - padding,
  width: x2 - x1 + padding * 2,
  height: y2 - y1 + padding * 2,
  strokeStyle: "dashed",
  fillStyle: "transparent",
});

// 3. Serialize and write the file
const json = serializeAsJSON([wrapper, ...elements], { viewBackgroundColor: "#ffffff" });
await fs.writeFile("scene.excalidraw", json);
```

Then render and inspect via `./scripts/render.sh scene.excalidraw`.

## References

- API utils overview: <https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils>
- Export utilities: <https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils/export>
