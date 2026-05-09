# excalidraw-skill

A Claude Code skill that turns codebase structure, system architecture, and abstract concepts into `.excalidraw` diagrams, renders them to PNG/SVG via an in-house Node renderer, and self-checks the result for accuracy and readability — ready to embed in Markdown.

The skill is invoked automatically inside Claude Code when you ask for a diagram, an architecture drawing, or a visualization. The detailed authoring rules live in [`SKILL.md`](./SKILL.md) and [`references/`](./references/).

## Why this exists

A picture in technical docs should *prove* a relationship — not just label some boxes. This skill enforces a small authoring loop:

1. Decide what the diagram has to argue (one sentence).
2. Choose a layout whose **shape itself** carries the argument (a fan-out really fans out, a pipeline reads left-to-right, a wrapper visually contains its inner layer).
3. Write the JSON, render to PNG, *look at the image*, and revise until the picture matches the argument.

If the labels were peeled off and the structure still made sense, the diagram has done its job.

## Install

Drop the directory under your Claude Code skills path:

```bash
git clone https://github.com/jheun66/excalidraw-skill ~/.claude/skills/excalidraw
cd ~/.claude/skills/excalidraw
npm install              # installs jsdom, @excalidraw/utils, @resvg/resvg-js
```

Requires **Node ≥ 20.19**. No headless browser, no Python, no external CLI.

The renderer is a single Node script (`scripts/render.mjs`) that uses:

- `@excalidraw/utils` to produce the SVG via Excalidraw's official export utility,
- `jsdom` as a DOM shim so that runs work outside a browser,
- `@resvg/resvg-js` (Rust-backed) to convert the SVG to PNG.

## Usage

### Inside Claude Code

Just ask. The skill self-delegates on prompts like:

- "Draw the architecture of this service."
- "Visualize the dependency graph between these crates."
- "Make a sequence diagram for the login flow."

Claude writes the `.excalidraw`, renders it, looks at the PNG, fixes problems, and embeds the image in your Markdown.

### Manual rendering

For an existing `.excalidraw` file:

```bash
# via the wrapper
./scripts/render.sh path/to/diagram.excalidraw

# or call the renderer directly
node scripts/render.mjs path/to/diagram.excalidraw
```

Both produce a sibling `.png` (scale 2×) and `.svg` next to the input file.

## Layout

```
.
├── SKILL.md                # main skill instructions (English)
├── package.json            # dev deps: @excalidraw/utils, @resvg/resvg-js, jsdom
├── references/
│   ├── 01-json-schema.md   # element types and file format
│   ├── 02-drawing-api.md   # Excalidraw utilities you can call programmatically
│   ├── 03-color-palette.md # default Excalidraw colors and how to extend them
│   ├── 04-layout-patterns.md  # vertical, horizontal, hub-spoke, sequence layouts
│   ├── 05-validation.md    # checklist for IDs, label bindings, arrow geometry
│   ├── 06-examples.md      # small, working JSON samples
│   ├── 07-render-embed.md  # render script, options, Markdown embedding
│   ├── 08-diagram-types.md # per-category design vocabulary (16 diagram kinds)
│   └── 09-arrows.md        # arrow philosophy (when, head, style, color, path)
└── scripts/
    ├── render.mjs          # in-house Node renderer
    └── render.sh           # thin bash wrapper around render.mjs
```

## References

- Excalidraw documentation site — <https://docs.excalidraw.com/docs/>
- Excalidraw Utils API (the upstream of `@excalidraw/utils` we depend on) — <https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils>

## License

[MIT](./LICENSE)
