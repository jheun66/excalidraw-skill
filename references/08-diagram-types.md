# 08 — Diagram types and their design vocabulary

The earlier reference pages cover *general* authoring rules (JSON, layout patterns, color, validation). This page is the opposite — every diagram type has its own visual vocabulary, and using the wrong vocabulary makes the picture confusing even when the JSON is technically correct.

The categories below cover what this skill is most often asked to produce. For each one:

- **What it argues** — the kind of claim it is best at making.
- **Layout** — the canonical arrangement readers expect.
- **Shapes** — which Excalidraw primitives carry which role.
- **Color** — what color means *in this category*.
- **Edges and arrows** — how connections are drawn.
- **Standard reference** — where the convention comes from.

Pick the category before you start placing shapes. The default layout templates in `04-layout-patterns.md` are the building blocks; this page tells you which template to reach for.

---

## A. Structure — static shape

Diagrams that argue about *what exists and how the parts are arranged*. Time is not represented; the picture is a snapshot.

### 1. Layered architecture (Clean / Hexagonal / Onion)

- **Argues**: a dependency direction — outer layers know about inner layers but not the reverse.
- **Layout**: concentric rectangles, the innermost being the smallest and most central.
- **Shapes**: rectangles only. Layer label is a free-floating text element near the top of each rectangle (not bound) so the inner shapes are not occluded.
- **Color**: warmth gradient toward the center. Outer layers in cool grays / blues, application layer in green, domain at the core in warm yellow / amber. The innermost layer also gets the thickest stroke.
- **Edges**: optional explicit "depends on" arrows pointing *inward* — the nesting itself already shows direction, but small arrows reinforce the claim.
- **Reference**: Robert C. Martin, *Clean Architecture* (2017). Same idea predates it as Hexagonal / Ports & Adapters.

### 2. Microservices / component / deployment

- **Argues**: which services exist, who they talk to, where they live.
- **Layout**: roughly clustered by deployment unit (VPC, region, namespace) with dashed-rectangle group boundaries; arrows for synchronous calls, dashed arrows for async / event flows.
- **Shapes**: rectangles for services / containers; ellipse for a person or external user; dashed rectangle for a deployment region.
- **Color**: one family per service role (gateway / business-logic / data / cache). External / third-party systems in gray.
- **Edges**: solid arrow for HTTP / gRPC, dashed arrow for queue / event, label on every arrow with the protocol or topic.
- **Reference**: C4 model — <https://c4model.com> (notation-independent but visually conventional).

### 3. Dependency graph (modules, packages, build)

- **Argues**: a directed graph between named units. The interesting facts are usually *which arrow exists* and *whether there is a cycle*.
- **Layout**: hierarchical (Sugiyama-style) — sources at the top, dependents below. ELK.js will do this for you when the CLI auto-lays out.
- **Shapes**: uniform rectangles; the graph itself is the message, not the boxes. Cycles get a thick red stroke or an annotation.
- **Color**: minimal. One stroke color, one fill color. Use color only to mark "interesting" nodes (cycles, root, leaf).
- **Edges**: simple solid arrows; never dashed unless dashed means something specific.
- **Reference**: graph-drawing literature (Sugiyama et al., 1981) — most layout tools follow this.

### 4. Data model (ER, schema, class diagram)

- **Argues**: the entities of a domain and the cardinalities of their relationships.
- **Layout**: grid-ish; related entities clustered. Relationships travel in straight lines as much as possible.
- **Shapes**:
  - **Chen notation** — rectangles for entities, ovals for attributes, diamonds for relationships, with `m`/`n` labels on the connecting lines.
  - **Crow's Foot notation** — rectangles for entities (with attribute lists inside), simple lines between them, *cardinality at the line endpoints*: `‖` (one-mandatory), `○─` (zero-or-one), `─⪼` (one-mandatory-many), `○⪼` (zero-or-many).
  - **UML class diagram** — rectangle split into three: name / fields / methods; arrows for inheritance (open triangle), composition (filled diamond), aggregation (open diamond).
- **Color**: subdued. Color is a poor channel here because attribute lists already carry density.
- **Edges**: lines (not arrows) for ER relationships; arrows for class inheritance and dependency.
- **Reference**: Chen (1976) for the original notation; Crow's Foot is the de-facto industry default for ER. UML 2.x for class diagrams.

### 5. Network topology (star / mesh / ring / hub-and-spoke)

- **Argues**: the *shape* of the network is the message — a ring really is circular, a star fans out, a mesh is fully connected.
- **Layout**: pick the geometry that matches the topology name. Do not place mesh nodes in a grid — the eye should *see* the topology before reading.
- **Shapes**: ellipses or rectangles for nodes. Often a different shape for "hub" vs "leaf" (rectangle vs ellipse).
- **Color**: traffic-flow direction by color (incoming vs outgoing) when the diagram is busy. Otherwise a single accent.
- **Edges**: undirected lines unless direction matters; in mesh topologies, arrows quickly become noise.
- **Reference**: classical network-topology terms; no single canonical visual standard, but the shape conventions above are widely understood.

### 6. C4 model

- **Argues**: a software system at one of four zoom levels — System Context, Container, Component, Code.
- **Layout**: usually hierarchical or radial; the system being described is centered, surrounded by the other actors.
- **Shapes**: a rectangle for every software / container / component; a stick-figure (or simply an ellipse with "User" text) for a person; *external* systems are colored gray and labeled `«external»` or similar.
- **Color**: the system being described uses the strongest color; supporting systems lighter; external systems gray.
- **Edges**: arrows labeled with *what* flows (`HTTPS / JSON`, `JDBC`, `gRPC`) and verb (`Reads`, `Sends events to`).
- **Reference**: Simon Brown, <https://c4model.com>. Notation-independent — *how* you draw a rectangle is up to you, but the four levels and "person + system + external system" vocabulary is essential.

---

## B. Behavior — time and order

Diagrams that argue about *when things happen and in what order*. Time is a real axis on the page.

### 7. Sequence diagram (UML)

- **Argues**: a particular interaction unfolding over time between named participants.
- **Layout**: participants left-to-right at the top; time flows top-to-bottom; messages cross between lifelines.
- **Shapes**:
  - **Participant header** — rectangle at the top of each lifeline.
  - **Lifeline** — long vertical `line` element (often dashed in UML) descending from each participant header.
  - **Activation bar** — thin filled rectangle on a lifeline indicating "this participant is busy here".
  - **Self-call** — small U-shaped arrow looping out and back to the same lifeline, creating a nested activation bar.
- **Color**: one color family per participant. Activation bars in the participant's color.
- **Edges**:
  - **Synchronous message** — solid arrow with filled triangle arrowhead.
  - **Asynchronous message** — solid arrow with open / line arrowhead.
  - **Return** — dashed arrow.
  - Every message labeled with its method or event name.
- **Reference**: UML 2.x — <https://www.uml-diagrams.org/sequence-diagrams.html>.

### 8. State machine / FSM

- **Argues**: how an object moves between named states under what triggers, with what guards.
- **Layout**: roughly left-to-right (initial state on the left) or in a loop if cyclic. Avoid grids.
- **Shapes**:
  - **Initial pseudostate** — small filled black circle.
  - **State** — rounded rectangle, possibly with `entry / do / exit` activities written inside.
  - **Final state** — circle with a smaller filled circle inside (target / bullseye).
  - **Choice** — diamond (use a colored rectangle in Excalidraw — see `01-json-schema.md` for why).
  - **Fork / Join** — heavy short bar.
- **Color**: states grouped by phase or kind (loading / steady / error) get different fills. Error states usually red.
- **Edges**: arrows labeled with `event(parameters) [guard] / action`.
- **Reference**: UML state machine — <https://www.uml-diagrams.org/state-machine-diagrams.html>.

### 9. Data / processing pipeline (ETL, stream)

- **Argues**: data flows through stages in a fixed order and is transformed at each stage.
- **Layout**: horizontal — left-to-right reads as time. Stages aligned on a baseline.
- **Shapes**: rectangles for stages; cylinder-style rectangle (taller, with a top arc using strokeStyle hints) for sources / sinks. Optionally a ellipse for a manual-approval gate.
- **Color**: source in cool blue, transforms in green, sinks in warm orange. Distinct color per stage type lets the reader scan the pipeline by category.
- **Edges**: arrows between stages; double-line / dashed arrow for batch boundaries.
- **Reference**: Apache Beam programming guide; Lambda / Kappa architecture diagrams.

### 10. User flow / business process (BPMN basics)

- **Argues**: the steps a user or system takes through a process, including decision points and parallel branches.
- **Layout**: left-to-right; pools (top-level participants) stack vertically with sequence flows running horizontally.
- **Shapes**:
  - **Event** — circle. Thin border = start, double border = intermediate, thick border = end.
  - **Activity / task** — rounded rectangle.
  - **Gateway** — diamond (in Excalidraw: orange thick-stroked rectangle, see note in `01-json-schema.md`).
  - **Pool** — large outer rectangle wrapping all elements for one participant.
  - **Lane** — horizontal subdivision inside a pool, one per role.
- **Color**: typically minimal — black/white BPMN is the standard. Color is reserved for highlighting a specific path.
- **Edges**:
  - **Sequence flow** — solid arrow.
  - **Message flow** — dashed arrow (between pools).
  - **Association** — dotted line (to artifacts / annotations).
- **Reference**: OMG BPMN 2.0 specification; Camunda BPMN reference at <https://camunda.com/bpmn/reference/>.

### 11. Timeline / Gantt

- **Argues**: things happen at specific times and have durations; some depend on others.
- **Layout**: horizontal axis is time, with a date scale. Tasks are bars at fixed vertical rows.
- **Shapes**: horizontal rectangles for tasks; ellipses for milestones (zero-duration); thin lines for the time axis.
- **Color**: tasks colored by team / category. Critical-path tasks in red.
- **Edges**: dashed arrows from task end to dependent task start.
- **Reference**: classic Gantt convention; Henry Gantt (1910s).

---

## C. Concept — meaning and relation

Diagrams that argue about *how ideas relate*. The page is a logical, not temporal or spatial, layout.

### 12. Decision tree / classification tree

- **Argues**: branching decisions lead to leaf outcomes.
- **Layout**: top-to-bottom tree. Root question at the top, leaves at the bottom.
- **Shapes**: rounded rectangles for decision nodes; ellipses for leaf outcomes; the question text sits inside the decision node.
- **Color**: outcomes grouped by category get different fills (e.g., success leaves green, failure leaves red).
- **Edges**: lines (no arrowheads necessary if reading order is clear); each branch labeled with its condition (`yes` / `no` / `≥ 5`).
- **Reference**: classical AI / OR literature; CART (1984).

### 13. Mind map

- **Argues**: associative depth — a central concept and its expanding ramifications.
- **Layout**: radial. Central node in the middle of the canvas; first-level branches extend in all directions; sub-branches grow off them.
- **Shapes**: a strong central element (rectangle with thick stroke or an ellipse with a colored fill); branches as `line` elements (curved if you want a Buzan-style hand-drawn feel — though Excalidraw lines are mostly straight).
- **Color**: every first-level branch gets its own color, inherited by its children. Buzan's rule: *one word per node*.
- **Edges**: lines (not arrows) — the connection is associative, not directional. Branch thickness decreases with depth.
- **Reference**: Tony Buzan, *The Mind Map Book* (1995). The `one-word-per-node` and `color-per-branch` rules are the most diagnostic.

### 14. Comparison matrix / feature table

- **Argues**: a small set of items compared across the same axes.
- **Layout**: a grid. Header row = items being compared; header column = criteria. Cells contain the per-item value.
- **Shapes**: rectangles for cells (or just a `line` grid + free-floating text). Headers visually distinct (thicker stroke, slightly darker fill).
- **Color**: cells colored by judgement (green = supported, red = not supported, yellow = partial). Or by quantitative scale (light → dark for low → high).
- **Edges**: none — the grid is the structure.
- **Reference**: standard tabular comparison; no single source.

### 15. User journey map

- **Argues**: a persona's experience across the stages of an interaction, including their emotions.
- **Layout**: horizontal phases at the top; below each phase, a stack of *lanes* — actions, thoughts, emotions, touchpoints, opportunities. Bottom row often holds insights.
- **Shapes**: rectangles for stage headers; `line` for the emotion curve crossing the lanes; small icons or shapes for touchpoints.
- **Color**: stage headers each get a hue (cool → warm) to create visual progression. The emotion curve uses a sentiment gradient (red → yellow → green from frustrated → neutral → delighted).
- **Edges**: the emotion curve is a continuous line; lanes are separated by horizontal lines. No arrows usually — order is given by horizontal position.
- **Reference**: Nielsen Norman Group, *Journey Mapping 101* — <https://www.nngroup.com/articles/journey-mapping-101/>.

### 16. Venn diagram

- **Argues**: which things have which combinations of properties — overlap is membership.
- **Layout**: two or three overlapping ellipses (rarely four — readers stop tracking past three sets).
- **Shapes**: ellipses with semitransparent fills (`opacity: 50` or so) so overlaps darken naturally. Labels for each set sit *outside* its ellipse, and labels for elements sit in the appropriate region.
- **Color**: each set gets its own translucent color; overlap regions appear automatically as combined colors.
- **Edges**: none. Geometry is the entire payload.
- **Reference**: John Venn (1880); standard set-theory illustration.

---

## How to pick a category fast

When the user asks for a diagram, work through these questions in order:

1. **Does the diagram need to show *time / order*?** → category B (sequence / state / pipeline / flow / timeline).
2. **Does the diagram need to show *what exists, statically*?** → category A (architecture / components / dependency / data model / topology / C4).
3. **Otherwise** — the diagram is conceptual. → category C (decision tree / mind map / matrix / journey / venn).

Once a category is chosen, *commit to its visual vocabulary*. Mixing vocabularies (a sequence diagram with mind-map colors, an ER diagram with a journey-map emotion curve) is the most common reason a technically correct picture still confuses readers.

---

## When the category is wrong

If you finish a diagram and it does not feel right, the failure is often that you picked the wrong category. Symptoms:

- "Reads like a list, not a picture." — probably needs to become a structure diagram (A) instead of a tree.
- "Reads as too busy." — the category is overloaded; split into two diagrams.
- "I can't tell where to start reading." — there is no time axis where one is needed; switch to category B.
- "Every box looks the same." — color or shape is not encoding role; either fix that or move to a different category that uses uniform shapes (dependency graph, comparison matrix).

A second draft in the right category usually beats a third draft in the wrong one.
