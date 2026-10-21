# CircutiViz — how to work on it (for an LLM or a human)

CircutiViz draws a breadboard wiring diagram from a data file and walks a hobbyist through it wire by wire
(step list, checkboxes, progress, pin tooltips, draggable parts, pin map). It is one engine file plus a parts
catalog; each electronics project keeps its own data file. **No MCP, no npm, no build step, no framework.**
Vanilla JS; the only external script is GSAP from cdnjs (optional, the page works without it).

## Files

| file | role |
|---|---|
| `circutiviz.js` | the engine: injects its CSS, reads `window.CIRCUIT` + `window.CIRCUTIVIZ_PARTS`, renders into `#circutiviz` or `document.body`. Exposes `window.CircutiViz = { validate, render }`. |
| `components.js` | the parts catalog (`window.CIRCUTIVIZ_PARTS`): boards, sensors, displays, actuators with pins, io types, one-sentence pin descriptions and a gotcha. |
| `validate.js` | `node validate.js path/to/wiring.js` — runs the engine's `validate()` in a node `vm` sandbox, no browser. Exit 1 on problems. |
| `index.html` + `examples/blink.js` | demo project (XIAO ESP32C3 + LED + resistor + button). |
| `library.html` | the component library: every catalog part drawn with its pins, what it is, when to use it, pin table, datasheet, Copy snippet. Same two script tags with `<body data-view="library">`; the engine then runs `CircutiViz.renderLibrary()` instead of `render()`. |
| `template/wiring.html` + `template/wiring.js` | starting point for a new project; every field commented. |
| `README.md` | this text plus a short intro. |

Load order in a page: `gsap.min.js` (optional) → `components.js` → the project's `wiring.js` → `circutiviz.js`.

## Create a new project

1. Put the engine next to the project (a git submodule or a copied folder named `circutiviz/`).
2. Copy `template/wiring.html` and `template/wiring.js` to the project root. The HTML already loads
   `circutiviz/components.js`, `wiring.js`, `circutiviz/circutiviz.js` in that order; change only the `<title>`.
3. Edit `wiring.js`: parts (by catalog id + x/y), rails, stages with wires, a Check per stage.
4. Validate: `node circutiviz/validate.js wiring.js` → `OK` or a list of problems (`node circutiviz/validate.js --catalog` checks the catalog itself) (the page shows the same
   problems in a red banner, and opening the page with `#selftest` logs the summary to the console and in a green banner).
5. Look at it: `python3 -m http.server 8000` in the project root, open `http://localhost:8000/wiring.html`
   (opening the file directly also works). Headless visual check:
   `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1300,900 --virtual-time-budget=5000 --screenshot=/tmp/wiring.png "file:///abs/path/wiring.html#selftest"`
   (Chrome's minimum window is ~500 px; for a true phone-width shot load the page in a 400 px `<iframe>` wrapper.)
6. Layout: drag parts on the diagram (mouse or touch, snaps to a 10-unit grid). Dragged positions live only in
   the browser's localStorage (`circutiviz:<id>:layout`). Click **Copy layout** to get
   `{ "beetle": { "x": 420, "y": 112 }, ... }` and paste those x/y values into `wiring.js`; **Reset layout** goes
   back to the file. **The data file is the source of truth**; the browser layout is an overlay for experimenting.

## `CIRCUIT` schema (complete)

```js
window.CIRCUIT = {
  id: "beetletrail-v1",            // required; localStorage key base for progress and layout
  title: "BeetleTrail wiring",     // optional (falls back to id)
  subtitle: "one line",            // optional
  libraryHref: "circutiviz/library.html", // optional; the header LIBRARY link (default "library.html", i.e. the engine folder is the page folder)
  notes: ["paragraph", "..."],     // optional; shown under the header; `backticks` render as code
  canvas: { w: 1000, h: 640 },     // optional; SVG units, default 1000 x 640; parts must fit inside
  colors: { key: "#hex" },         // optional; add or override wire colour keys (an object {light,dark} is accepted; dark is used)
  // built-in keys: wire 3v3 5v gnd sck mosi miso cs dc rst blk scl sda
  rails: [                         // horizontal power rails
    { id: "3v3", label: "3V3 rail (+)", y: 46, x1: 40, x2: 960, color: "3v3" }, // x1/x2 default 40 / w-40; color defaults to id
  ],
  parts: [                         // placed parts, drawn in order
    { id: "beetle", part: "dfrobot-beetle-esp32c6", x: 420, y: 112 },           // from the catalog
    { id: "display", part: "gc9a01-round-128", x: 40, y: 110, edge: "right" }, // edge: move a single-header part's pins to that edge
    { id: "r1", part: "resistor", name: "220 Ω", x: 180, y: 200 },             // any catalog field may be overridden inline
    { id: "x", name: "Inline part", kind: "module", style: "blue", x: 0, y: 0, w: 120, h: 90, // or a part with no `part`: define it fully
      pins: { left: ["VCC", "GND", { id: "OUT", sub: "A0", io: "out", desc: "0-3.3 V" }] } },
  ],
  stages: [                        // the walkthrough
    { title: "Display",            // required
      intent: "why this stage",    // optional one-liner
      steps: [
        { from: "display.SCL", to: "beetle.23", color: "sck", note: "SCL here is SPI clock." }, // wire step
        { from: "beetle.left.GND", to: "rail:gnd", color: "gnd" },  // part.edge.PIN when the label exists on two edges
        { text: "Solder the header.", note: "optional" },             // task step (no wire)
      ],
      run: "cmd" /* or ["cmd1", "cmd2"] */,   // optional; rendered in <pre><code> with a Copy button
      check: "what the user should see" },   // required unless run is given; the validator warns otherwise
  ],
};
```

Pin references: `"part.PIN"` (first match on any edge; keep part x,y ≥ 16 so they clear the ruler strip), `"part.edge.PIN"` (edge = left/right/top/bottom),
`"rail:<rail id>"` (only as `to`, or either end — the engine swaps). Pin ids may contain dots (`uno.3.3V` works).
Wire steps are counted in the progress pill ("7 / 18 wires"); task steps have a checkbox but do not count.

## Catalog entry schema (complete) — `components.js`

```js
"gy-271-qmc5883l": {
  name: "GY-271 (QMC5883L compass)", // printed under the part and in the pin map
  short: "GY-271",                     // used in step labels ("GY-271 SCL → Beetle 20 (SCL)"); defaults to name
  kind: "module",                      // "board" | "module" | "component" (components get short leads: LED, resistor, button)
  category: "sensors",                 // "boards" | "sensors" | "displays" | "actuators" | "radio" | "power" | "passives" | "interface" (library grouping)
  use: "Use it when the project needs a compass heading rather than motion.", // one beginner sentence: when/why you reach for it
  w: 160, h: 120,                      // body size in canvas units; pin pitch 22 = 2.54 mm, so a 15-pin row needs about 15*22+40
  style: "blue",                       // "black" | "blue" | "green" | "purple" | any CSS colour; light fills get dark labels automatically
  pitch: 22, pinStart: 16,             // optional; pins are centred on the edge unless pinStart (distance to the first pin) is given
  decor: [{ type: "chip", label: "QMC5883L" }], // optional, see below
  info: "3-axis magnetometer on I2C at 0x0D. 3.3-5 V in, 3.3 V logic. Gotcha: clones may be HMC5883L (0x1E) or QMC5883P (0x2C).",
  datasheet: "https://...",            // optional
  pinOrderVaries: true,                // generic clones differ: the page shows "wire by label; your board's pin order may differ"
  pins: {                              // physical order: left/right top→bottom, top/bottom left→right, seen from above, USB at the top
    left: [
      { id: "VCC", io: "power", desc: "3.3-5 V in (regulator on board)." },
      { id: "GND", io: "gnd",   desc: "Ground." },
      { id: "SCL", io: "in",    desc: "I2C clock." },
      { id: "SDA", io: "io",    desc: "I2C data." },
      { id: "DRDY", io: "out",  desc: "Data-ready pulse; optional.", sub: "INT" }, // sub: alternate name printed smaller (A3, SCK, GPIO36 ...)
    ],
  },
}
```

`io` is one of `power | gnd | in | out | io | nc`. `desc` is one sentence: what the pin is, bus role, voltage or
boot gotcha ("GPIO4, ADC1_CH4, strapping pin, safe as output."). Decor types (all accept `x`,`y` offsets from the
part's top-left to override the default spot): `chip {label}`, `usb {}` (stub on the top edge; give `y: h` for a
bottom connector), `screen {}` (round glass), `panel {w,h}` (rectangular glass), `button {label, at: "tl"|"tr"|"bl"|"br"}`,
`led {label}`. `components.js` uses a tiny helper `P(id, io, desc, sub)` to keep entries compact; the result is the
object shape above.

## Adding a missing catalog part

1. Find the official pinout (vendor wiki, datasheet, or the board's `pins_arduino.h` variant). For generic modules
   (GY-xxx, OLEDs, relay boards) the silkscreen order differs between sellers: list the most common order and set
   `pinOrderVaries: true`. Never invent a pin.
2. Add an entry with the pattern above: kebab-case id (`vendor-board` or `chip-function`), pins in physical order,
   `id` exactly as the silkscreen prints it (`3V3`, `D7`, `GP16`, `BLK`), GPIO numbers or bus roles as `sub`.
3. Write `use` (one sentence: when/why a beginner reaches for it) and `info` (two or three sentences: what it is, which bus, which voltage, the one gotcha people hit). Pick the `category`.
4. Size it so the longest pin row fits: `rows * 22 + 40`; keep `w >= 110` when pins are on both sides (labels need room).
5. Run `node validate.js --catalog` (every entry needs name, short, kind, category, use, info, w, h, pins; every pin id, io, desc; rows must fit the body), then validate a project that uses it and look at it in `library.html` (search finds it by name, pin label or any word of `use`/`info`). The library's Copy snippet gives `{ id: "<short lowercased, spaces→->", part: "<catalog id>", x: 0, y: 0 }` for a project's `parts`.

## Conventions for project data

- Every stage ends with a **Check** (`check` and/or `run`): what to run and what the user should see. The validator warns if missing.
- Every wire has a colour key; power first (`3v3`/`5v`, `gnd`), then signals. Draw order: rail wires underneath, then stage order.
- `note` explains the *why* ("SCL on the display is SPI clock, not I2C"), not the what (the label already says it).
- Pin ids are the silkscreen text; the user wires by label. When a label exists on two edges (`GND` left and right) write `part.edge.PIN`.
- Place parts so wires leave sideways toward each other (use `edge: "right"` on a module placed left of the board).
- Keep the data file as the only source of truth; copy dragged positions back into it.

## Engine API

- `CircutiViz.validate(circuit, catalog)` → `{ ok, problems: string[], summary: { parts, rails, stages, steps, wires, unresolved } }`. Pure, no DOM.
- `CircutiViz.render(circuit, catalog, root?)` → renders the page (called automatically on load when `window.CIRCUIT` exists).

## What the page does (so you can describe it to the user)

A retro "circuit puzzle console": riveted steel panels on a dark teal screen. Desktop is three columns: left
widgets (STAGE n + WIRES done/total, a SIGNAL oscilloscope that blips on every event, COMPONENTS with per-part
wire counts, INSPECTOR), the board in the middle (PCB green with a copper grid and ruler strips; parts and wires
lie on it), STEPS on the right (stage/step list, Check boxes, vertical progress bar with percent). Phones stack
board, steps, widgets; the board pans horizontally. Not-done wires are dim copper dashed traces; done wires glow in
their colour; the selected wire pulses, draws on, and its two pins get rings while the Inspector shows both pins'
descriptions. Checkbox, Space, ArrowUp/Down or j/k, Previous/Next, Reset progress (two clicks); everything
persists in localStorage under the project id. Hover a pin or part for a tooltip; tap/click or keyboard-focus puts
the same text in the Inspector. Drag parts to re-layout (keep x,y >= 16: the ruler strip); Copy/Reset layout in the
header. SND switch in the header (synthesised UI sounds incl. a power-up when a stage completes; off state
remembered). Legend under the board, generated PIN MAP panel at the bottom. A red banner lists data problems.

Style tokens live on `:root` in `circutiviz.js` (`--screen`, `--steel`, `--steel-hi`, `--steel-lo`, `--pcb`,
`--copper`, `--glow-green`, `--glow-red`, `--px-yellow`, `--px-green`, `--accent`, `--ink`, `--muted`, wire colours as
`--w-<key>`). Fonts: Press Start 2P (panel headers, counters, >= 11 px), Share Tech Mono (pins, code, inspector),
IBM Plex Sans (step text). GSAP (cdnjs, pinned 3.12.5) is optional; without it only CSS transitions remain.
