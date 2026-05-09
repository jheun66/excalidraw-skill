# 07 — Render and embed

The renderer is `scripts/render.mjs`, an in-house Node script. It produces the same SVG that the Excalidraw web app would, then converts that SVG to PNG locally — no headless browser, no external CLI.

Internally:

- `jsdom` provides a DOM shim (Excalidraw's `exportToSvg` calls a few browser APIs).
- `@excalidraw/utils.exportToSvg` produces the SVG.
- `@resvg/resvg-js` (Rust-backed) rasterizes the SVG to PNG.

## Setup once

```bash
cd excalidraw-skill
npm install
```

Requires Node ≥ 20.19. No Python, no Playwright, no Chromium, no global CLI.

## Quick render

Use the wrapper:

```bash
./scripts/render.sh path/to/diagram.excalidraw
```

This produces `diagram.png` (scale 2×) and `diagram.svg` next to the source file.

For finer control (or when calling from your own Node process), invoke the script directly:

```bash
node scripts/render.mjs path/to/diagram.excalidraw
```

## Render → look loop

Skipping this loop is the single most common cause of bad diagrams. After every non-trivial JSON edit:

1. `./scripts/render.sh diagram.excalidraw`
2. Open the resulting `diagram.png` with the `Read` tool.
3. Run the five-line audit (see `SKILL.md` Step 5).
4. If any category is `FAIL`, fix the JSON and repeat.

A 30-second JSON-to-image loop is far cheaper than a five-minute "I'm sure it's right" inspection.

## Embedding in Markdown

Once the PNG looks right:

```markdown
![Architecture overview](./diagrams/architecture.png)
```

Conventions that pay off:

- Keep `.excalidraw` and `.png` as siblings in a `diagrams/` directory next to the doc that uses them.
- Use the same base name for both (`overview.excalidraw` ↔ `overview.png`); the wrapper depends on this implicitly.
- Re-render on every edit — committing only the PNG without re-rendering produces drift between source and image.

If a doc embeds many diagrams, list them in a small index (`diagrams/INDEX.md`) so a future editor can find the source for each image.

## Troubleshooting

| Symptom                                       | Likely cause                                          | Fix                                                                     |
| --------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| `Cannot find module @excalidraw/utils`        | `npm install` not yet run                             | `cd <skill dir> && npm install`                                         |
| `Unsupported Node version` / parse errors     | Node < 20.19                                          | Upgrade Node (e.g. `nvm install 20.19`)                                 |
| `ReferenceError: FontFace is not defined`     | Old `render.mjs` without the FontFace shim            | Pull the latest `scripts/render.mjs` — the shim is at the top           |
| PNG looks blurry                              | Output too small for the embed context                | The script renders at 2× already; if you need more, edit the `fitTo` value in `render.mjs` |
| Output written next to the input by surprise  | The script defaults to sibling `.png` / `.svg`        | Move or rename the input file before rendering                          |

## References

- `@excalidraw/utils` package — published alongside `@excalidraw/excalidraw`
- `@resvg/resvg-js` — <https://github.com/yisibl/resvg-js>
- Official Excalidraw export utilities (browser-side reference): <https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils/export>
