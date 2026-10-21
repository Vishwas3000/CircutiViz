/* Demo project: LED + resistor + push button on a Seeed XIAO ESP32C3. Proves the engine on a second data set. */
window.CIRCUIT = {
  id: "blink-demo",
  title: "Blink + button demo",
  subtitle: "A XIAO ESP32C3 blinks an LED and reads a push button",
  notes: ["The XIAO is 3.3 V logic. The LED needs its 220 Ω resistor; the button uses the internal pull-up, so it reads LOW when pressed."],
  canvas: { w: 900, h: 520 },
  colors: { led: { light: "#d8640f", dark: "#ff9a4d" }, btn: { light: "#7a3fbf", dark: "#b48cff" } },
  rails: [
    { id: "3v3", label: "3V3 rail (+)", y: 46, x1: 40, x2: 860 },
    { id: "gnd", label: "GND rail (−)", y: 70, x1: 40, x2: 860 },
  ],
  parts: [
    { id: "xiao", part: "seeed-xiao-esp32c3", x: 400, y: 130 },
    { id: "res", part: "resistor", name: "220 Ω", x: 180, y: 200 },
    { id: "led", part: "led", name: "LED (red)", x: 60, y: 300 },
    { id: "btn", part: "button-tactile", x: 620, y: 220 },
  ],
  stages: [
    {
      title: "Power",
      intent: "Feed the breadboard rails from the XIAO.",
      steps: [
        { from: "xiao.GND", to: "rail:gnd", color: "gnd" },
        { from: "xiao.3V3", to: "rail:3v3", color: "3v3", note: "3V3 is an output from the XIAO's regulator; 5V is USB power in." },
      ],
      check: "Plug in USB-C. A multimeter between the two rails reads about 3.3 V.",
    },
    {
      title: "LED",
      intent: "D2 drives the LED through the resistor; the LED returns to ground.",
      steps: [
        { from: "xiao.D2", to: "res.2", color: "led" },
        { from: "res.1", to: "led.A", color: "led", note: "A is the long leg. The resistor has no polarity." },
        { from: "led.K", to: "rail:gnd", color: "gnd" },
      ],
      run: "arduino-cli compile -b esp32:esp32:XIAO_ESP32C3 -u -p <PORT> examples/blink",
      check: "The LED blinks once a second. If it never lights, turn the LED around (long leg to the resistor).",
    },
    {
      title: "Button",
      intent: "One leg to a GPIO with INPUT_PULLUP, the opposite leg to ground.",
      steps: [
        { from: "btn.1", to: "xiao.D7", color: "btn", note: "Legs 1 and 2 are the same contact; use 1 and 3 (opposite sides)." },
        { from: "btn.3", to: "rail:gnd", color: "gnd" },
      ],
      check: "Hold the button: the LED stays on. Release: it blinks again. If it reads pressed all the time, rotate the button 90°.",
    },
  ],
};
