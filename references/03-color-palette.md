# 03 — Color palette

Excalidraw ships with a small, deliberate palette built on top of the [Open Color](https://yeun.github.io/open-color/) project. Stick to it for the bulk of a diagram — the palette was chosen so the colors read clearly together at any zoom.

## Defaults you can rely on

The values below are the editor's default picker, useful as semantic anchors.

### Stroke colors (line / border)

| Family   | Hex       | Typical meaning                                       |
| -------- | --------- | ----------------------------------------------------- |
| black    | `#1e1e1e` | Default text and stroke                               |
| gray     | `#5f6368` | Inactive / secondary boundary                         |
| red      | `#e03131` | Errors, blocked paths                                 |
| pink     | `#c2255c` | Highlights without alarm                              |
| grape    | `#9c36b5` | External / third-party                                |
| violet   | `#6741d9` | Async / messaging                                     |
| indigo   | `#3b5bdb` | Cool primary                                          |
| blue     | `#1971c2` | Primary services, presentation layer                  |
| cyan     | `#0c8599` | Caches, queues                                        |
| teal     | `#099268` | Pipelines                                             |
| green    | `#2f9e44` | Success / positive flow                               |
| lime     | `#66a80f` | Background tasks                                      |
| yellow   | `#f08c00` | Warnings, manual steps                                |
| orange   | `#e8590c` | Decision points, branching                            |

### Fill colors (semitransparent backgrounds)

Pair each stroke with a light fill from the same family to keep the picture readable on white.

| Family   | Light fill (`backgroundColor`) |
| -------- | ------------------------------ |
| black    | `#ffffff`                      |
| gray     | `#f1f3f5`                      |
| red      | `#ffc9c9`                      |
| pink     | `#fcc2d7`                      |
| grape    | `#eebefa`                      |
| violet   | `#d0bfff`                      |
| indigo   | `#bac8ff`                      |
| blue     | `#a5d8ff`                      |
| cyan     | `#99e9f2`                      |
| teal     | `#96f2d7`                      |
| green    | `#b2f2bb`                      |
| lime     | `#d8f5a2`                      |
| yellow   | `#ffec99`                      |
| orange   | `#ffd8a8`                      |

If you need slightly cooler / warmer than the defaults, the full Open Color scale (`*-50` through `*-90`) is fair game. Avoid arbitrary hex values — they rarely look at home next to the default palette.

## Color is hierarchy, not decoration

Two rules of thumb that keep diagrams legible:

1. **One family per role.** All "presentation" boxes get blue strokes; all "domain" boxes get the warm yellow. Repeating a family signals "these things have the same role" without needing a label.
2. **Saturation marks emphasis.** The element you most want the reader to focus on gets the strongest fill / thickest stroke; supporting elements stay paler. A page where every box is equally saturated has lost the chance to direct attention.

## A few semantic patterns

| Pattern                                     | Stroke / fill                              |
| ------------------------------------------- | ------------------------------------------ |
| Core domain layer (golden, central)         | `#f08c00` / `#fff3bf` (warm, eye-catching) |
| Application or use case layer               | `#2f9e44` / `#d3f9d8` (calm green)         |
| Presentation / outer interface              | `#1971c2` / `#e7f5ff` (cool blue)          |
| Adapter / infrastructure (external service) | `#862e9c` / `#f3d9fa` (purple)             |
| Optional / experimental path                | gray stroke, `strokeStyle: "dashed"`       |
| Failure path                                | `#e03131` / `#ffc9c9`                      |
| Decision / router                           | `#e8590c` / `#ffd8a8`, `strokeWidth: 3`    |

## Dark mode

Set `appState.exportWithDarkMode: true` (or pass `--dark` to the CLI) to render against Excalidraw's dark theme. The palette flips automatically; you should not normally hand-pick alternate hexes for dark mode.

## References

- Open Color (the source palette): <https://yeun.github.io/open-color/>
- Excalidraw appState (background, dark mode flags): <https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/props/initialdata#appstate>
