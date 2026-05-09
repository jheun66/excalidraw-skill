# excalidraw-skill

A Claude Code skill that draws system architectures, dependency graphs, sequence flows, and other diagrams as `.excalidraw` files — and renders them to **PNG/SVG locally**, with proper handwriting fonts and Korean/CJK glyphs, ready to embed in your Markdown.

No headless browser. No Python. No external CLI. One Node script does the whole pipeline.

---

## What it does

You ask for a diagram in Claude Code:

> *"Draw the architecture of this service."*

Claude:

1. Picks a layout whose **shape itself** carries the argument (a fan-out really fans out, a pipeline reads left-to-right).
2. Writes the `.excalidraw` JSON.
3. Renders it to PNG/SVG — `Excalifont` for handwriting, `Xiaolai` for CJK, all glyphs properly inlined.
4. **Looks at the result**, fixes anything broken (overlaps, wrong arrows, missing labels), and embeds the image.

The detailed authoring rules live in [`SKILL.md`](./SKILL.md) and [`references/`](./references/).

## Install

```bash
git clone https://github.com/jheun66/excalidraw-skill ~/.claude/skills/excalidraw
cd ~/.claude/skills/excalidraw
npm install
```

**Requires Node ≥ 20.19.** That's it.

## Usage

### Inside Claude Code

Just ask. The skill auto-delegates on prompts like:

- *"Draw the architecture of this service."*
- *"Visualize the dependency graph between these crates."*
- *"Make a sequence diagram for the login flow."*

Claude writes the `.excalidraw`, renders it, looks at the PNG, fixes problems, and embeds the image in your reply.

### From the CLI

For an existing `.excalidraw` file:

```bash
./scripts/render.sh path/to/diagram.excalidraw
```

Output: a sibling `diagram.svg` (vector) and `diagram.png` (2× scale) next to the input.

First run extracts the bundled Excalidraw fonts to a local `fonts/` cache (~45 MB, gitignored). Subsequent runs reuse it. Cache rebuilds itself when `@excalidraw/utils` is upgraded.

## How it renders

```
.excalidraw  →  @excalidraw/utils.exportToSvg  →  SVG  →  @resvg/resvg-js  →  PNG
                       (with jsdom shim)                  (with extracted fonts)
```

- **`@excalidraw/utils`** — Excalidraw's official export utility, run under a small jsdom shim.
- **`@resvg/resvg-js`** — Rust-backed SVG → PNG. Fed the extracted font directory so handwriting and CJK glyphs survive into the raster output.
- **`scripts/extract-fonts.mjs`** — One-time extractor: copies the 7 base TTFs and dumps the 200+ Xiaolai woff2 chunks that `@excalidraw/utils` inlines as data URLs. Idempotent + version-aware.

## Why an authoring loop, not a one-shot

A diagram in technical docs should *prove* a relationship — not just label some boxes. The skill enforces a small loop:

1. Decide what the diagram has to argue (one sentence).
2. Choose a layout whose shape itself carries the argument.
3. Write the JSON, render to PNG, *look at the image*, revise.

If the labels were peeled off and the structure still made sense, the diagram has done its job.

## Project layout

```
.
├── SKILL.md                 # main skill instructions
├── package.json             # dev deps: @excalidraw/utils, @resvg/resvg-js, jsdom
├── references/
│   ├── 01-json-schema.md    # element types and file format
│   ├── 02-drawing-api.md    # Excalidraw utilities you can call programmatically
│   ├── 03-color-palette.md  # default Excalidraw colors and how to extend them
│   ├── 04-layout-patterns.md  # vertical, horizontal, hub-spoke, sequence layouts
│   ├── 05-validation.md     # checklist for IDs, label bindings, arrow geometry
│   ├── 06-examples.md       # small, working JSON samples
│   ├── 07-render-embed.md   # render script, options, Markdown embedding
│   ├── 08-diagram-types.md  # per-category design vocabulary (16 diagram kinds)
│   └── 09-arrows.md         # arrow philosophy (when, head, style, color, path)
└── scripts/
    ├── render.mjs           # in-house Node renderer
    ├── render.sh            # bash wrapper around render.mjs
    └── extract-fonts.mjs    # one-time font cache extractor
```

## Troubleshooting

- **PNG text shows as boxes / wrong font.** Delete the `fonts/` directory and re-run; it'll re-extract from the current `@excalidraw/utils` install.
- **`ERR_REQUIRE_ESM` from html-encoding-sniffer.** Make sure Node is ≥ 20.19. This is an upstream chain (`jsdom → html-encoding-sniffer → @exodus/bytes`) that requires Node's native `require(esm)` support.
- **CJK / Korean text doesn't render.** Use `fontFamily: 5` (Excalifont) on text elements that contain CJK. Excalidraw only activates the Xiaolai fallback for Excalifont — Virgil and the others don't get the CJK chain.

## References

- Excalidraw documentation — <https://docs.excalidraw.com/docs/>
- Excalidraw Utils API — <https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils>
- CJK handwriting font (Xiaolai) — [Excalidraw Plus blog post](https://plus.excalidraw.com/blog/adding-hand-drawn-font-for-chinese-japanese-korean)

## License

[MIT](./LICENSE)
