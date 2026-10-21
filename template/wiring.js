/* CircutiViz project template. Copy wiring.html + wiring.js to your project root (engine in ./circutiviz/),
   then edit this file. Validate with: node circutiviz/validate.js wiring.js
   Every field is explained inline; delete the comments when you are done. */
window.CIRCUIT = {
  id: "my-project-v1",                      // required. localStorage key for progress (+ ":layout" for dragged part positions)
  title: "My project wiring",               // page heading (optional, falls back to id)
  subtitle: "ESP32-C3 SuperMini driving a 0.96\" OLED", // one line under the title (optional)
  notes: [                                   // paragraphs under the header; `backticks` render as code (optional)
    "Everything here is 3.3 V logic. Power the OLED from `3V3`, never from `5V`.",
  ],
  canvas: { w: 900, h: 480 },               // SVG units; parts must fit inside (default 1000 x 640)
  colors: {                                  // extra / overriding wire colour keys (optional). Built in:
    // wire 3v3 5v gnd sck mosi miso cs dc rst blk scl sda
    int: "#ff7ac2",                          // one hex per key
  },
  rails: [                                   // horizontal power rails (breadboard + / - rows)
    { id: "3v3", label: "3V3 rail (+)", y: 46, x1: 40, x2: 860 }, // x1/x2 default to 40 / canvas.w-40; colour key defaults to the id
    { id: "gnd", label: "GND rail (−)", y: 70, x1: 40, x2: 860 },
  ],
  parts: [                                   // placed parts; `part` is a key of components.js, x/y the top-left corner
    { id: "mcu", part: "esp32-c3-supermini", x: 380, y: 120 },
    { id: "oled", part: "ssd1306-oled-i2c", x: 120, y: 200, edge: "right" },
    // Any catalog field can be overridden inline: name, short, w, h, style, kind, decor, pins, pitch, pinStart, info, datasheet, pinOrderVaries.
    // `edge` moves a single-header part's pins to another edge (left/right/top/bottom) without re-listing them.
    // A part without `part` is defined fully inline, e.g.:
    // { id: "sensor", name: "My sensor", kind: "module", style: "blue", x: 650, y: 150, w: 120, h: 90,
    //   pins: { left: [ { id: "VCC", io: "power", desc: "3.3 V" }, "GND", { id: "OUT", io: "out", desc: "Analog 0-3.3 V" } ] } },
  ],
  stages: [                                  // the walkthrough, in order; each stage ends with a Check
    {
      title: "Board to rails",                // required
      intent: "Give the rails 3.3 V and ground from the board.", // one line of why (optional)
      steps: [
        // a wire step: from / to are "part.PIN", "part.edge.PIN" (when the label exists on two edges) or "rail:<id>"
        { from: "mcu.3V3", to: "rail:3v3", color: "3v3", note: "3V3 is the regulator output; 5V is USB in." },
        { from: "mcu.GND", to: "rail:gnd", color: "gnd" },
        // a task step has text only:
        { text: "Plug in USB-C.", note: "The blue LED on GPIO8 may glow; that is normal." },
      ],
      check: "A multimeter between the rails reads about 3.3 V.", // what the user should see (required, or `run`)
    },
    {
      title: "Display",
      intent: "Two power wires, two I2C wires.",
      steps: [
        { from: "oled.VCC", to: "rail:3v3", color: "3v3" },
        { from: "oled.GND", to: "rail:gnd", color: "gnd" },
        { from: "oled.SCL", to: "mcu.9", color: "scl" },
        { from: "oled.SDA", to: "mcu.8", color: "sda", note: "GPIO8/9 are the Arduino default Wire pins on this board." },
      ],
      run: ["arduino-cli compile -b esp32:esp32:esp32c3 -u -p <PORT> firmware", "arduino-cli monitor -p <PORT> -c baudrate=115200"], // string or array; gets a Copy button
      check: "Serial prints `I2C: 0x3C` and the OLED shows the splash text.",
    },
  ],
};
