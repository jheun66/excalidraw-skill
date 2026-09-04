# 07 — Build, render, embed

Two scripts, in order.

`scripts/build-scene.mjs` turns a skeleton into the `.excalidraw` file — that file is the deliverable. See `02-drawing-api.md`.

`scripts/render.mjs` turns a `.excalidraw` file into SVG and PNG. **This is an audit instrument, not a product.** You render so you can look at what you built; the user gets the `.excalidraw`. If they want an image, Excalidraw exports one from the app, at whatever scale and background they want, with the scene embedded in it.

Internally the renderer is a Node script with no browser:

- `scripts/dom-shim.mjs` provides jsdom plus the handful of APIs Excalidraw's export path expects.
- `@excalidraw/utils.exportToSvg` produces the SVG.
- `@resvg/resvg-js` (Rust-backed) rasterizes it to PNG at 2×, pointed at the extracted font cache so handwriting and CJK glyphs survive.

## Setup once

```bash
cd excalidraw-skill
npm install
```

Requires Node ≥ 20.19. `npm install` also runs `scripts/bundle-excalidraw.mjs`, which produces `scripts/.generated/excalidraw.mjs` (~13 MB, gitignored) — `build-scene.mjs` will not run without it. No Python, no Playwright, no Chromium, no global CLI.

## The loop

```bash
node scripts/build-scene.mjs diagram.skeleton.json   # → diagram.excalidraw
node scripts/render.mjs diagram.excalidraw           # → diagram.png, diagram.svg
```

Then:

1. Read the counts `build-scene.mjs` printed. Missing text elements or an unbound-arrow warning are structural problems; fix them before looking at the image.
2. Open `diagram.png` with the `Read` tool.
3. Run the four-line audit (see `SKILL.md` Step 5).
4. If any category is `FAIL`, edit the **skeleton** — not the built file — and repeat.

Editing the `.excalidraw` directly is how the two drift apart. The skeleton is the source.

`./scripts/render.sh` remains as a thin wrapper around the renderer for one-off use on a file that has no skeleton.

## Embedding in Markdown

When a doc needs a picture rather than an editable file:

```markdown
![Architecture overview](./diagrams/architecture.png)
```

Conventions that pay off:

- Keep all three siblings in a `diagrams/` directory next to the doc: `overview.skeleton.json`, `overview.excalidraw`, `overview.png`.
- Same base name for all three. The scripts assume it.
- Rebuild and re-render on every edit. Committing a PNG without rebuilding is how the image stops matching the source.
- Commit the skeleton and the `.excalidraw`. The PNG is regenerable; whether to commit it depends on whether your docs render from the repo.

## Troubleshooting

| Symptom                                       | Likely cause                                          | Fix                                                                     |
| --------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| `Cannot find module ./.generated/excalidraw.mjs` | Bundle step has not run                            | `npm install`, or `npm run build`                                       |
| `Cannot find module @excalidraw/utils`        | `npm install` not yet run                             | `cd <skill dir> && npm install`                                         |
| `error: arrow endpoints reference ids that no skeleton declares` | Typo in an arrow's `start`/`end`    | The message names the id — fix it in the skeleton                       |
| `warning: N arrows are not bound at both ends` | An arrow endpoint is a bare coordinate, not a shape  | Give it `start`/`end` referencing shape ids, or accept that it will not follow them |
| `Unsupported Node version` / parse errors     | Node < 20.19                                          | Upgrade Node (e.g. `nvm install 20.19`)                                 |
| PNG text shows as boxes / wrong font          | Stale font cache                                      | Delete `fonts/` and re-render; it re-extracts                           |
| Korean renders in a system font, not handwriting | Text is not `fontFamily: 5`                        | Excalidraw chains to the Xiaolai CJK hand font only for Excalifont — see `01-json-schema.md` |
| Label slightly wider than it needs to be      | Text measurement outside a browser is an estimate     | Expected — `build-scene.mjs` errs generous on purpose; nudge `width` if it matters |
| PNG looks blurry                              | Output too small for the embed context                | Already 2×; raise the `fitTo` value in `render.mjs` if you need more    |

## References

- `@excalidraw/utils` package — published alongside `@excalidraw/excalidraw`
- `@resvg/resvg-js` — <https://github.com/yisibl/resvg-js>
- Official Excalidraw export utilities: <https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils/export>
