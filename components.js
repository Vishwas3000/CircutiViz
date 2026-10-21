/* CircutiViz parts catalog. Load before circutiviz.js. A project places a part with
   { id: "beetle", part: "dfrobot-beetle-esp32c6", x: 420, y: 112 } and may override any field inline.
   Entry: name, short, kind ("board"|"module"|"component"), category ("boards"|"sensors"|"displays"|"actuators"|"radio"|"power"|"passives"|"interface"),
   w, h, style (black|blue|green|purple|css colour), decor[], use (one sentence: when/why you reach for it),
   info (2-3 sentences: what, bus, voltage, the gotcha), datasheet (URL), pinOrderVaries (generic clones differ),
   pins: { left|right|top|bottom: [ { id, sub?, io, desc } ] } in physical order (top→bottom / left→right, seen from above, USB at the top),
   io: "power" | "gnd" | "in" | "out" | "io" | "nc". Pin ids are what the silkscreen prints: wire by label.
   Check it with: node validate.js --catalog */
(function () {
const P = (id, io, desc, sub) => sub ? { id, sub, io, desc } : { id, io, desc };
const GND = (desc, id) => P(id || "GND", "gnd", desc || "Ground. Every part in the circuit shares it.");
const VCC = (desc, id) => P(id || "VCC", "power", desc || "Supply input.");
const SCL = (desc, id) => P(id || "SCL", "in", desc || "I2C clock.");
const SDA = (desc, id) => P(id || "SDA", "io", desc || "I2C data.");
const NP = (id) => P(id, "io", "Either end (no polarity).");
const R = (a, b, f) => Array.from({ length: b - a + 1 }, (_, i) => f(a + i)); // numbered pin runs
const B = (desc) => `Pin order differs between sellers; ${desc}`;

/* shared pin rows */
const UNO_LEFT = [P("NC", "nc", "Not connected (reserved)."), P("IOREF", "power", "Logic voltage reference for shields (5 V); not a supply."),
  P("RESET", "in", "Pull low to reset the board."), P("3.3V", "power", "3.3 V output, max ~50 mA; enough for a sensor, not a radio."),
  P("5V", "power", "Regulated 5 V output (from USB or VIN)."), GND(), GND(), P("VIN", "power", "7-12 V input to the on-board regulator; also the DC jack voltage."),
  P("A0", "io", "Analog input 0 (10-bit ADC, 0-5 V); also a digital pin."), P("A1", "io", "Analog input 1."), P("A2", "io", "Analog input 2."), P("A3", "io", "Analog input 3."),
  P("A4", "io", "Analog input 4; hardware I2C SDA (same net as the SDA pin).", "SDA"), P("A5", "io", "Analog input 5; hardware I2C SCL.", "SCL")];
const UNO_RIGHT = [P("SCL", "io", "I2C clock; same net as A5."), P("SDA", "io", "I2C data; same net as A4."), P("AREF", "in", "External ADC reference; leave open unless you use analogReference(EXTERNAL)."), GND(),
  P("13", "io", "Digital 13, SPI SCK, on-board LED.", "SCK"), P("12", "io", "Digital 12, SPI MISO.", "MISO"), P("11", "io", "Digital 11, SPI MOSI, PWM.", "MOSI"),
  P("10", "io", "Digital 10, SPI SS, PWM.", "SS"), P("9", "io", "Digital 9, PWM.", "PWM"), P("8", "io", "Digital 8."), P("7", "io", "Digital 7."),
  P("6", "io", "Digital 6, PWM.", "PWM"), P("5", "io", "Digital 5, PWM.", "PWM"), P("4", "io", "Digital 4."), P("3", "io", "Digital 3, PWM, external interrupt 1.", "INT1"),
  P("2", "io", "Digital 2, external interrupt 0.", "INT0"), P("1", "io", "Digital 1, UART TX; busy while the USB serial is used.", "TX"), P("0", "io", "Digital 0, UART RX; busy while the USB serial is used.", "RX")];
const PICO = {
  left: [P("GP0", "io", "Pin 1. UART0 TX, I2C0 SDA, SPI0 RX.", "TX"), P("GP1", "io", "Pin 2. UART0 RX, I2C0 SCL, SPI0 CSn.", "RX"), GND("Pin 3. Ground."), P("GP2", "io", "Pin 4. I2C1 SDA, SPI0 SCK."), P("GP3", "io", "Pin 5. I2C1 SCL, SPI0 TX."),
    P("GP4", "io", "Pin 6. I2C0 SDA (default Wire).", "SDA"), P("GP5", "io", "Pin 7. I2C0 SCL (default Wire).", "SCL"), GND("Pin 8. Ground."), P("GP6", "io", "Pin 9. I2C1 SDA, SPI0 SCK."), P("GP7", "io", "Pin 10. I2C1 SCL, SPI0 TX."),
    P("GP8", "io", "Pin 11. UART1 TX, I2C0 SDA."), P("GP9", "io", "Pin 12. UART1 RX, I2C0 SCL."), GND("Pin 13. Ground."), P("GP10", "io", "Pin 14. SPI1 SCK."), P("GP11", "io", "Pin 15. SPI1 TX."),
    P("GP12", "io", "Pin 16. SPI1 RX."), P("GP13", "io", "Pin 17. SPI1 CSn."), GND("Pin 18. Ground."), P("GP14", "io", "Pin 19. SPI1 SCK."), P("GP15", "io", "Pin 20. SPI1 TX.")],
  right: [P("VBUS", "power", "Pin 40. 5 V from USB; 0 V when USB is unplugged."), P("VSYS", "power", "Pin 39. Main input 1.8-5.5 V (battery goes here)."), GND("Pin 38. Ground."), P("3V3_EN", "in", "Pin 37. Pull low to switch off the 3.3 V regulator."),
    P("3V3", "power", "Pin 36. Regulated 3.3 V output, ~300 mA.", "OUT"), P("ADC_VREF", "in", "Pin 35. ADC reference; leave open."), P("GP28", "io", "Pin 34. ADC2.", "ADC2"), P("AGND", "gnd", "Pin 33. Analog ground."),
    P("GP27", "io", "Pin 32. ADC1.", "ADC1"), P("GP26", "io", "Pin 31. ADC0.", "ADC0"), P("RUN", "in", "Pin 30. Pull low to reset."), P("GP22", "io", "Pin 29."), GND("Pin 28. Ground."),
    P("GP21", "io", "Pin 27. I2C0 SCL."), P("GP20", "io", "Pin 26. I2C0 SDA."), P("GP19", "io", "Pin 25. SPI0 TX (MOSI).", "MOSI"), P("GP18", "io", "Pin 24. SPI0 SCK.", "SCK"), GND("Pin 23. Ground."),
    P("GP17", "io", "Pin 22. SPI0 CSn.", "CS"), P("GP16", "io", "Pin 21. SPI0 RX (MISO).", "MISO")] };
const XIAO_RIGHT = (mosi, miso, sck, rx) => [P("5V", "power", "5 V from USB-C (or feed 5 V in)."), GND(), P("3V3", "power", "Regulated 3.3 V output, up to ~700 mA."),
  P("D10", "io", `${mosi}, SPI MOSI.`, "MOSI"), P("D9", "io", `${miso}, SPI MISO.`, "MISO"), P("D8", "io", `${sck}, SPI SCK.`, "SCK"), P("D7", "io", `${rx}, UART RX.`, "RX")];
const D1 = { D0: "GPIO16, no PWM/interrupt; wakes from deep sleep (wire to RST).", D1: "GPIO5, I2C SCL.", D2: "GPIO4, I2C SDA.", D3: "GPIO0, FLASH button; must be high at boot.",
  D4: "GPIO2, on-board LED (active low); must be high at boot.", D5: "GPIO14, SPI SCK.", D6: "GPIO12, SPI MISO.", D7: "GPIO13, SPI MOSI.", D8: "GPIO15, SPI SS; must be low at boot." };
const DP = (id, sub) => P(id, "io", D1[id], sub);

window.CIRCUTIVIZ_PARTS = {

/* ===================== boards ===================== */
"dfrobot-beetle-esp32c6": {
  name: "Beetle ESP32-C6", short: "Beetle", kind: "board", category: "boards", w: 160, h: 210, style: "black",
  decor: [{ type: "usb" }, { type: "chip", label: "ESP32-C6" }, { type: "button", label: "B", at: "tl" }, { type: "button", label: "R", at: "tr" }, { type: "led", label: "LED 15" }],
  use: "Use it when a project must be tiny and battery powered but still wants Wi-Fi 6, BLE and a charger on board.",
  info: "DFRobot's coin-sized ESP32-C6 board: Wi-Fi 6, BLE 5, Zigbee/Thread, USB-C and a Li-ion charger. 3.3 V logic on every pad. 3V3 is the regulated output that powers modules; VIN and BAT are inputs.",
  datasheet: "https://wiki.dfrobot.com/SKU_DFR1117_Beetle_ESP32_C6",
  pins: {
    left: [GND(), P("3V3", "power", "Regulated 3.3 V output from the on-board LDO; power modules from here."),
      P("4", "io", "GPIO4, ADC1_CH4; strapping pin at boot (SDIO edge), fine as an output.", "A3"), P("5", "io", "GPIO5, ADC1_CH5; strapping pin at boot (JTAG select), fine as an output.", "A4"),
      P("23", "io", "GPIO23, hardware SPI clock in the Arduino variant.", "SCK"), P("22", "io", "GPIO22, hardware SPI MOSI (data to the display).", "MOSI"),
      P("21", "io", "GPIO21, hardware SPI MISO; free as a GPIO when the device never sends back.", "MISO"), P("7", "io", "GPIO7, LP GPIO; general purpose, no ADC.")],
    right: [P("BAT", "power", "Li-ion battery + (3.7 V), charged over USB by the on-board charger."), GND(), P("VIN", "power", "5 V from USB (or feed 5 V in here). Never into a module signal pin.", "5V in"),
      P("17", "io", "GPIO17, UART0 RX (the USB-serial console); free when you use USB CDC.", "RX"), P("16", "io", "GPIO16, UART0 TX.", "TX"),
      P("19", "io", "GPIO19, I2C SDA in the Arduino variant.", "SDA"), P("20", "io", "GPIO20, I2C SCL in the Arduino variant.", "SCL"), P("6", "io", "GPIO6, ADC1_CH6; general purpose.")] } },

"arduino-uno-r3": {
  name: "Arduino Uno R3", short: "Uno", kind: "board", category: "boards", w: 260, h: 430, style: "blue",
  decor: [{ type: "usb" }, { type: "chip", label: "ATmega328P" }, { type: "button", label: "RST", at: "tr" }, { type: "led", label: "LED 13" }],
  use: "Use it for a first project or anything 5 V: every tutorial, shield and library on earth assumes an Uno.",
  info: "The classic 8-bit board (ATmega328P, 16 MHz). 5 V logic: 3.3 V-only modules need a level shifter on inputs. Drawn with the USB-B jack at the top; the digital header is on the right, power and analog on the left.",
  datasheet: "https://docs.arduino.cc/hardware/uno-rev3/", pins: { left: UNO_LEFT, right: UNO_RIGHT } },

"arduino-mega-2560": {
  name: "Arduino Mega 2560", short: "Mega", kind: "board", category: "boards", w: 740, h: 600, style: "blue",
  decor: [{ type: "usb" }, { type: "chip", label: "ATmega2560" }],
  use: "Use it when a project runs out of pins or needs several hardware serial ports; it is the Uno's big brother with 54 digital and 16 analog pins.",
  info: "ATmega2560 at 16 MHz, 5 V logic, 256 KB flash. Drawn with USB at the top: power + analog on the left, digital 0-21 on the right and the 36-pin double-row header 22-53 as one row along the bottom. Gotcha: SPI is on 50-53 (and the ICSP header), not 11-13 like the Uno.",
  datasheet: "https://docs.arduino.cc/hardware/mega-2560/",
  pins: { left: [...UNO_LEFT, ...R(6, 15, n => P("A" + n, "io", `Analog input ${n}.`))],
    right: [...UNO_RIGHT, P("14", "io", "Digital 14, UART3 TX.", "TX3"), P("15", "io", "Digital 15, UART3 RX.", "RX3"), P("16", "io", "Digital 16, UART2 TX.", "TX2"), P("17", "io", "Digital 17, UART2 RX.", "RX2"),
      P("18", "io", "Digital 18, UART1 TX, interrupt 5.", "TX1"), P("19", "io", "Digital 19, UART1 RX, interrupt 4.", "RX1"), P("20", "io", "Digital 20, I2C SDA, interrupt 3.", "SDA"), P("21", "io", "Digital 21, I2C SCL, interrupt 2.", "SCL")],
    bottom: R(22, 53, n => P(String(n), "io", `Digital ${n}${n >= 44 && n <= 46 ? ", PWM" : ""}${{ 50: ", SPI MISO", 51: ", SPI MOSI", 52: ", SPI SCK", 53: ", SPI SS" }[n] || ""}.`)) } },

"arduino-nano": {
  name: "Arduino Nano", short: "Nano", kind: "board", category: "boards", w: 130, h: 350, style: "blue",
  decor: [{ type: "usb" }, { type: "chip", label: "328P" }, { type: "button", label: "RST", at: "bl" }],
  use: "Use it when you want an Uno that plugs straight into a breadboard; same chip, same 5 V logic, a fifth of the size.",
  info: "Breadboard-sized ATmega328P board, 5 V logic, mini-USB at the top. A6/A7 are analog-only. Gotcha: cheap clones use a CH340 USB chip and often the old bootloader (choose 'ATmega328P (Old Bootloader)' when uploads fail).",
  datasheet: "https://docs.arduino.cc/hardware/nano/",
  pins: {
    left: [P("D13", "io", "Digital 13, SPI SCK, on-board LED.", "SCK"), P("3V3", "power", "3.3 V output from the USB chip, only a few mA."), P("REF", "in", "External ADC reference; leave open."),
      P("A0", "io", "Analog input 0 (0-5 V)."), P("A1", "io", "Analog input 1."), P("A2", "io", "Analog input 2."), P("A3", "io", "Analog input 3."),
      P("A4", "io", "Analog input 4; I2C SDA.", "SDA"), P("A5", "io", "Analog input 5; I2C SCL.", "SCL"), P("A6", "io", "Analog input only (no digital)."), P("A7", "io", "Analog input only (no digital)."),
      P("5V", "power", "Regulated 5 V output."), P("RST", "in", "Pull low to reset."), GND(), P("VIN", "power", "7-12 V input to the regulator.")],
    right: [P("D12", "io", "Digital 12, SPI MISO.", "MISO"), P("D11", "io", "Digital 11, SPI MOSI, PWM.", "MOSI"), P("D10", "io", "Digital 10, SPI SS, PWM.", "SS"), P("D9", "io", "Digital 9, PWM.", "PWM"),
      P("D8", "io", "Digital 8."), P("D7", "io", "Digital 7."), P("D6", "io", "Digital 6, PWM.", "PWM"), P("D5", "io", "Digital 5, PWM.", "PWM"), P("D4", "io", "Digital 4."),
      P("D3", "io", "Digital 3, PWM, interrupt 1.", "INT1"), P("D2", "io", "Digital 2, interrupt 0.", "INT0"), GND(), P("RST", "in", "Pull low to reset."),
      P("RX0", "io", "Digital 0, UART RX; busy while USB serial is in use.", "D0"), P("TX1", "io", "Digital 1, UART TX.", "D1")] } },

"arduino-pro-mini": {
  name: "Arduino Pro Mini", short: "Pro Mini", kind: "board", category: "boards", w: 150, h: 290, style: "blue", pinOrderVaries: true,
  decor: [{ type: "chip", label: "328P" }],
  use: "Use it for the smallest, cheapest permanent ATmega328P build; no USB on board, you program it through an FTDI adapter.",
  info: "ATmega328P without USB; comes as 5 V/16 MHz or 3.3 V/8 MHz (check the back). The 6-pin FTDI header is drawn along the top; A4-A7 are inner pads not drawn here. Gotcha: match the FTDI adapter voltage to the board and pick the right board variant in the IDE.",
  datasheet: "https://docs.arduino.cc/retired/boards/arduino-pro-mini/",
  pins: { top: [P("BLK", "gnd", "FTDI header: GND (black wire end)."), GND("FTDI header: GND/CTS."), VCC("FTDI header: VCC (3.3 or 5 V, matches the board)."), P("RXI", "in", "FTDI header: serial in."), P("TXO", "out", "FTDI header: serial out."), P("GRN", "in", "FTDI header: DTR, auto-reset (green wire end).")],
    left: [P("TXO", "out", "Digital 1, UART TX."), P("RXI", "in", "Digital 0, UART RX."), P("RST", "in", "Pull low to reset."), GND(), P("2", "io", "Digital 2, interrupt 0."), P("3", "io", "Digital 3, PWM, interrupt 1."), P("4", "io", "Digital 4."), P("5", "io", "Digital 5, PWM."), P("6", "io", "Digital 6, PWM."), P("7", "io", "Digital 7."), P("8", "io", "Digital 8."), P("9", "io", "Digital 9, PWM.")],
    right: [P("RAW", "power", "Unregulated input to the on-board regulator (up to 12 V)."), GND(), P("RST", "in", "Pull low to reset."), VCC("Regulated 3.3 or 5 V (output, or input when RAW is unused)."), P("A3", "io", "Analog input 3."), P("A2", "io", "Analog input 2."), P("A1", "io", "Analog input 1."), P("A0", "io", "Analog input 0."),
      P("13", "io", "Digital 13, SPI SCK, LED.", "SCK"), P("12", "io", "Digital 12, SPI MISO.", "MISO"), P("11", "io", "Digital 11, SPI MOSI, PWM.", "MOSI"), P("10", "io", "Digital 10, SPI SS, PWM.", "SS")] } },

"esp32-devkitc-30": {
  name: "ESP32 DevKit V1 (30-pin)", short: "ESP32", kind: "board", category: "boards", w: 170, h: 360, style: "black",
  decor: [{ type: "usb", y: 360 }, { type: "chip", label: "ESP32" }, { type: "button", label: "EN", at: "bl" }, { type: "button", label: "BOOT", at: "br" }],
  use: "Use it as the default Wi-Fi/Bluetooth board: cheap, dual-core, lots of pins and every ESP32 example targets it.",
  info: "The common 30-pin ESP32-WROOM dev board (DOIT DevKit V1). 3.3 V logic; VIN takes 5 V from USB. Drawn with the micro-USB at the bottom, like the usual pinout images. Gotcha: GPIO34/35/36/39 are input-only, GPIO12 must be low at boot, GPIO0/2/15 are strapping pins.",
  datasheet: "https://docs.espressif.com/projects/esp-idf/en/latest/esp32/hw-reference/esp32/get-started-devkitc.html",
  pins: {
    left: [P("EN", "in", "Chip enable / reset; pull low to reset."), P("VP", "in", "GPIO36, ADC1_CH0, input only.", "GPIO36"), P("VN", "in", "GPIO39, ADC1_CH3, input only.", "GPIO39"),
      P("D34", "in", "GPIO34, ADC1_CH6, input only, no pull-ups."), P("D35", "in", "GPIO35, ADC1_CH7, input only, no pull-ups."), P("D32", "io", "GPIO32, ADC1_CH4, touch."), P("D33", "io", "GPIO33, ADC1_CH5, touch."),
      P("D25", "io", "GPIO25, DAC1, ADC2."), P("D26", "io", "GPIO26, DAC2, ADC2."), P("D27", "io", "GPIO27, ADC2, touch."), P("D14", "io", "GPIO14, HSPI CLK, ADC2."),
      P("D12", "io", "GPIO12, strapping pin: must be low at boot or the chip will not start."), P("D13", "io", "GPIO13, HSPI MOSI, ADC2."), GND(), P("VIN", "power", "5 V in (from USB) to the 3.3 V regulator; can feed 5 V parts.")],
    right: [P("D23", "io", "GPIO23, VSPI MOSI (default SPI MOSI).", "MOSI"), P("D22", "io", "GPIO22, default I2C SCL.", "SCL"), P("TX0", "io", "GPIO1, UART0 TX (USB console).", "GPIO1"), P("RX0", "io", "GPIO3, UART0 RX (USB console).", "GPIO3"),
      P("D21", "io", "GPIO21, default I2C SDA.", "SDA"), P("D19", "io", "GPIO19, VSPI MISO.", "MISO"), P("D18", "io", "GPIO18, VSPI SCK.", "SCK"), P("D5", "io", "GPIO5, VSPI SS; strapping pin, fine as output.", "SS"),
      P("TX2", "io", "GPIO17, UART2 TX.", "GPIO17"), P("RX2", "io", "GPIO16, UART2 RX.", "GPIO16"), P("D4", "io", "GPIO4, ADC2, touch."), P("D2", "io", "GPIO2, on-board LED, strapping pin."),
      P("D15", "io", "GPIO15, strapping pin (boot log), fine as output."), GND(), P("3V3", "power", "Regulated 3.3 V output, up to ~500 mA.")] } },

"esp32-s3-devkitc-1": {
  name: "ESP32-S3-DevKitC-1", short: "ESP32-S3", kind: "board", category: "boards", w: 190, h: 510, style: "black",
  decor: [{ type: "usb", y: 510, x: 60 }, { type: "usb", y: 510, x: 130 }, { type: "chip", label: "S3-WROOM" }, { type: "button", label: "RST", at: "bl" }, { type: "button", label: "BOOT", at: "br" }],
  use: "Use it when you need USB-OTG, AI/vector instructions, more RAM (PSRAM) or a native USB keyboard/mouse device; it is the modern ESP32.",
  info: "Espressif's official ESP32-S3 board with two USB-C ports (UART and native USB) at the bottom, 3.3 V logic. GPIO19/20 are the USB D-/D+ pins. Gotcha: on N8R8 (octal PSRAM) modules GPIO35-37 are taken by the PSRAM, GPIO0 is BOOT, and the RGB LED is on GPIO48 (v1.0) or GPIO38 (v1.1).",
  datasheet: "https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/hw-reference/esp32s3/user-guide-devkitc-1.html",
  pins: {
    left: [P("3V3", "power", "Regulated 3.3 V output."), P("3V3", "power", "Regulated 3.3 V output (second pad)."), P("RST", "in", "Chip enable; pull low to reset."), P("4", "io", "GPIO4, ADC1_CH3, touch."), P("5", "io", "GPIO5, ADC1_CH4, touch."), P("6", "io", "GPIO6, ADC1_CH5, touch."), P("7", "io", "GPIO7, ADC1_CH6, touch."),
      P("15", "io", "GPIO15, ADC2_CH4, 32 kHz crystal option."), P("16", "io", "GPIO16, ADC2_CH5."), P("17", "io", "GPIO17, ADC2_CH6."), P("18", "io", "GPIO18, ADC2_CH7."), P("8", "io", "GPIO8, ADC1_CH7, default I2C SDA.", "SDA"), P("3", "io", "GPIO3, strapping pin (JTAG source)."),
      P("46", "io", "GPIO46, strapping pin, input only at boot."), P("9", "io", "GPIO9, ADC1_CH8, default I2C SCL.", "SCL"), P("10", "io", "GPIO10, ADC1_CH9, FSPI CS.", "SS"), P("11", "io", "GPIO11, FSPI MOSI.", "MOSI"), P("12", "io", "GPIO12, FSPI SCK.", "SCK"), P("13", "io", "GPIO13, FSPI MISO.", "MISO"), P("14", "io", "GPIO14, ADC2_CH3."),
      P("5V", "power", "5 V from USB (or feed 5 V in)."), GND()],
    right: [GND(), P("TX", "io", "GPIO43, UART0 TX (USB-UART port).", "GPIO43"), P("RX", "io", "GPIO44, UART0 RX.", "GPIO44"), P("1", "io", "GPIO1, ADC1_CH0, touch."), P("2", "io", "GPIO2, ADC1_CH1, touch."), P("42", "io", "GPIO42, JTAG MTMS."), P("41", "io", "GPIO41, JTAG MTDI."), P("40", "io", "GPIO40, JTAG MTDO."), P("39", "io", "GPIO39, JTAG MTCK."),
      P("38", "io", "GPIO38 (RGB LED on v1.1 boards)."), P("37", "io", "GPIO37; used by octal PSRAM on N8R8."), P("36", "io", "GPIO36; used by octal PSRAM on N8R8."), P("35", "io", "GPIO35; used by octal PSRAM on N8R8."), P("0", "io", "GPIO0, BOOT button, strapping pin."), P("45", "io", "GPIO45, strapping pin (VDD_SPI voltage)."),
      P("48", "io", "GPIO48, RGB LED (v1.0 boards)."), P("47", "io", "GPIO47."), P("21", "io", "GPIO21."), P("20", "io", "GPIO20, USB D+ (native USB).", "D+"), P("19", "io", "GPIO19, USB D- (native USB).", "D-"), GND(), GND()] } },

"esp32-cam": {
  name: "ESP32-CAM (AI-Thinker)", short: "ESP32-CAM", kind: "board", category: "boards", w: 150, h: 200, style: "black", pinOrderVaries: true,
  decor: [{ type: "chip", label: "ESP32" }, { type: "screen", y: 60 }],
  use: "Use it when the project needs a camera (streaming, snapshots, QR codes) for a few dollars; it is an ESP32 with an OV2640 and a microSD slot.",
  info: "ESP32-S module with camera connector and microSD, no USB: program it through U0T/U0R with a USB-serial adapter (or the ESP32-CAM-MB base) with IO0 tied to GND during upload. 5 V in; 3.3 V logic. Gotcha: few free pins (IO2/4/12/13/14/15 belong to the SD card), IO4 is the flash LED, and Wi-Fi needs a solid 5 V supply (brown-outs reboot it).",
  datasheet: "https://docs.ai-thinker.com/en/esp32-cam",
  pins: { left: [P("5V", "power", "5 V in (preferred; the 3V3 pad also works but is less reliable)."), GND(), P("IO12", "io", "GPIO12, SD DATA2; strapping pin (keep low at boot)."), P("IO13", "io", "GPIO13, SD DATA3."), P("IO15", "io", "GPIO15, SD CMD."), P("IO14", "io", "GPIO14, SD CLK."), P("IO2", "io", "GPIO2, SD DATA0."), P("IO4", "io", "GPIO4, flash LED / SD DATA1.")],
    right: [P("3V3", "power", "3.3 V in/out."), P("IO16", "io", "GPIO16, free (PSRAM CS on some)."), P("IO0", "io", "GPIO0, tie to GND to enter flash mode."), GND(), VCC("3.3 V output from the regulator."), P("U0R", "in", "UART0 RX (programming).", "RX"), P("U0T", "out", "UART0 TX (programming).", "TX"), GND()] } },

"esp32-c3-supermini": {
  name: "ESP32-C3 SuperMini", short: "C3 Mini", kind: "board", category: "boards", w: 110, h: 200, style: "black", pinOrderVaries: true,
  decor: [{ type: "usb" }, { type: "chip", label: "C3" }, { type: "button", label: "B", at: "bl" }, { type: "button", label: "R", at: "br" }],
  use: "Use it for the cheapest possible Wi-Fi/BLE node in a tiny footprint; a dollar board for sensors and buttons.",
  info: "Tiny generic ESP32-C3 board with USB-C, Wi-Fi 4 and BLE 5, 3.3 V logic. 5V is USB power in, 3V3 is the regulator output. Gotcha: GPIO8 drives the blue LED (active low) and GPIO9 is the BOOT button; both are strapping pins, and many clones have a weak antenna.",
  datasheet: "https://www.espboards.dev/esp32/esp32-c3-super-mini/",
  pins: { left: [P("5V", "power", "5 V from USB-C (or feed 5 V in)."), GND(), P("3V3", "power", "Regulated 3.3 V output."), P("4", "io", "GPIO4, ADC1_CH4, SPI SCK in Arduino.", "A4"), P("3", "io", "GPIO3, ADC1_CH3.", "A3"), P("2", "io", "GPIO2, ADC1_CH2; strapping pin, fine as output.", "A2"), P("1", "io", "GPIO1, ADC1_CH1.", "A1"), P("0", "io", "GPIO0, ADC1_CH0.", "A0")],
    right: [P("5", "io", "GPIO5, ADC2, SPI MISO in Arduino.", "MISO"), P("6", "io", "GPIO6, SPI MOSI in Arduino.", "MOSI"), P("7", "io", "GPIO7, SPI SS in Arduino.", "SS"), P("8", "io", "GPIO8, I2C SDA in Arduino; blue LED (active low); strapping pin.", "SDA"), P("9", "io", "GPIO9, I2C SCL in Arduino; BOOT button, strapping pin.", "SCL"), P("10", "io", "GPIO10, general purpose."), P("20", "io", "GPIO20, UART0 RX.", "RX"), P("21", "io", "GPIO21, UART0 TX.", "TX")] } },

"seeed-xiao-esp32c3": {
  name: "Seeed XIAO ESP32C3", short: "XIAO", kind: "board", category: "boards", w: 110, h: 180, style: "black",
  decor: [{ type: "usb" }, { type: "chip", label: "C3" }, { type: "button", label: "B", at: "bl" }, { type: "button", label: "R", at: "br" }],
  use: "Use it when the build must be thumb-sized and battery powered (it has charger pads) and still speak Wi-Fi and BLE.",
  info: "Thumb-sized ESP32-C3 board with USB-C, Wi-Fi and BLE, external antenna, battery pads on the back. 3.3 V logic. Gotcha: D9 (GPIO9) is the BOOT strapping pin, there is no user LED, and the Dn names map to different GPIO numbers (shown as sub-labels).",
  datasheet: "https://wiki.seeedstudio.com/XIAO_ESP32C3_Getting_Started/",
  pins: { left: [P("D0", "io", "GPIO2, ADC1_CH2; strapping pin, fine as output.", "A0"), P("D1", "io", "GPIO3, ADC1_CH3.", "A1"), P("D2", "io", "GPIO4, ADC1_CH4.", "A2"), P("D3", "io", "GPIO5, ADC2_CH0.", "A3"), P("D4", "io", "GPIO6, I2C SDA.", "SDA"), P("D5", "io", "GPIO7, I2C SCL.", "SCL"), P("D6", "io", "GPIO21, UART TX.", "TX")],
    right: XIAO_RIGHT("GPIO10", "GPIO9 (BOOT strapping pin)", "GPIO8", "GPIO20") } },

"seeed-xiao-esp32s3": {
  name: "Seeed XIAO ESP32S3", short: "XIAO S3", kind: "board", category: "boards", w: 110, h: 180, style: "black",
  decor: [{ type: "usb" }, { type: "chip", label: "S3" }, { type: "button", label: "B", at: "bl" }, { type: "button", label: "R", at: "br" }],
  use: "Use it for tiny projects that need more muscle than the C3: dual-core, PSRAM, native USB, and (Sense version) a camera and microphone.",
  info: "XIAO-footprint ESP32-S3 with USB-C, Wi-Fi, BLE 5, 8 MB PSRAM and a battery charger. 3.3 V logic; user LED on GPIO21 (active low). Gotcha: the Sense add-on uses many GPIOs for the camera and SD card; check the wiki before reusing D-pins.",
  datasheet: "https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/",
  pins: { left: [P("D0", "io", "GPIO1, ADC1_CH0.", "A0"), P("D1", "io", "GPIO2, ADC1_CH1.", "A1"), P("D2", "io", "GPIO3, ADC1_CH2.", "A2"), P("D3", "io", "GPIO4, ADC1_CH3.", "A3"), P("D4", "io", "GPIO5, I2C SDA.", "SDA"), P("D5", "io", "GPIO6, I2C SCL.", "SCL"), P("D6", "io", "GPIO43, UART TX.", "TX")],
    right: XIAO_RIGHT("GPIO9", "GPIO8", "GPIO7", "GPIO44") } },

"seeed-xiao-esp32c6": {
  name: "Seeed XIAO ESP32C6", short: "XIAO C6", kind: "board", category: "boards", w: 110, h: 180, style: "black",
  decor: [{ type: "usb" }, { type: "chip", label: "C6" }, { type: "button", label: "B", at: "bl" }, { type: "button", label: "R", at: "br" }],
  use: "Use it when a tiny board must do Wi-Fi 6, Thread/Zigbee or Matter; same footprint as the other XIAOs.",
  info: "XIAO-footprint ESP32-C6 with USB-C, Wi-Fi 6, BLE 5, 802.15.4 and a battery charger; 3.3 V logic, user LED on GPIO15. Gotcha: GPIO3 and GPIO14 switch between the built-in and external antenna; A0-A2 are the only ADC pins exposed.",
  datasheet: "https://wiki.seeedstudio.com/xiao_esp32c6_getting_started/",
  pins: { left: [P("D0", "io", "GPIO0, ADC1_CH0.", "A0"), P("D1", "io", "GPIO1, ADC1_CH1.", "A1"), P("D2", "io", "GPIO2, ADC1_CH2.", "A2"), P("D3", "io", "GPIO21."), P("D4", "io", "GPIO22, I2C SDA.", "SDA"), P("D5", "io", "GPIO23, I2C SCL.", "SCL"), P("D6", "io", "GPIO16, UART TX.", "TX")],
    right: XIAO_RIGHT("GPIO18", "GPIO20", "GPIO19", "GPIO17") } },

"rpi-pico": {
  name: "Raspberry Pi Pico", short: "Pico", kind: "board", category: "boards", w: 150, h: 470, style: "green",
  decor: [{ type: "usb" }, { type: "chip", label: "RP2040" }, { type: "button", label: "BOOTSEL", at: "tr" }],
  use: "Use it when you want lots of 3.3 V GPIO, PIO state machines for odd protocols, and MicroPython or C without Wi-Fi.",
  info: "RP2040 board, 3.3 V logic, micro-USB at the top. The top silkscreen shows only pin numbers; GP names are printed underneath. Gotcha: 3V3 is an output (max ~300 mA), VSYS is the input for batteries (1.8-5.5 V), and the GPIOs are not 5 V tolerant.",
  datasheet: "https://datasheets.raspberrypi.com/pico/Pico-R3-A4-Pinout.pdf", pins: PICO },

"rpi-pico-w": {
  name: "Raspberry Pi Pico W", short: "Pico W", kind: "board", category: "boards", w: 150, h: 470, style: "green",
  decor: [{ type: "usb" }, { type: "chip", label: "RP2040" }, { type: "button", label: "BOOTSEL", at: "tr" }],
  use: "Use it when a Pico project also needs Wi-Fi or Bluetooth; same pins and footprint as the Pico.",
  info: "Pico with a CYW43439 Wi-Fi/Bluetooth chip; identical header pinout. 3.3 V logic. Gotcha: the on-board LED is driven by the wireless chip, not GP25 (use LED_BUILTIN / 'LED' in MicroPython), and the antenna end must stay clear of metal.",
  datasheet: "https://datasheets.raspberrypi.com/picow/PicoW-A4-Pinout.pdf", pins: PICO },

"stm32-blue-pill": {
  name: "STM32F103 Blue Pill", short: "Blue Pill", kind: "board", category: "boards", w: 150, h: 470, style: "blue", pinOrderVaries: true,
  decor: [{ type: "usb" }, { type: "chip", label: "F103C8" }, { type: "button", label: "RST", at: "bl" }],
  use: "Use it when you want a fast 32-bit ARM with real timers, 12-bit ADC and USB for the price of a Nano, and are willing to flash it with an ST-Link.",
  info: "STM32F103C8T6 at 72 MHz, 3.3 V logic (most pins 5 V tolerant, check the datasheet), USB at the top, SWD header at the bottom. Program with an ST-Link or a USB-serial adapter on A9/A10 with BOOT0 high. Gotcha: many clones carry fake chips and a wrong USB pull-up (1.5 kOhm on A12 should be 1.5 k, often 10 k).",
  datasheet: "https://stm32-base.org/boards/STM32F103C8T6-Blue-Pill.html",
  pins: { bottom: [P("GND", "gnd", "SWD header: ground."), P("CLK", "in", "SWD header: SWCLK."), P("DIO", "io", "SWD header: SWDIO."), P("3.3", "power", "SWD header: 3.3 V.")],
    left: [P("VB", "power", "VBAT, RTC backup supply (tie to 3.3 if unused)."), P("C13", "io", "PC13, on-board LED (active low), weak drive."), P("C14", "io", "PC14, 32 kHz crystal (OSC32_IN)."), P("C15", "io", "PC15, 32 kHz crystal (OSC32_OUT)."), P("A0", "io", "PA0, ADC0, wake-up."), P("A1", "io", "PA1, ADC1."), P("A2", "io", "PA2, ADC2, UART2 TX."), P("A3", "io", "PA3, ADC3, UART2 RX."),
      P("A4", "io", "PA4, ADC4, SPI1 NSS."), P("A5", "io", "PA5, ADC5, SPI1 SCK.", "SCK"), P("A6", "io", "PA6, ADC6, SPI1 MISO.", "MISO"), P("A7", "io", "PA7, ADC7, SPI1 MOSI.", "MOSI"), P("B0", "io", "PB0, ADC8."), P("B1", "io", "PB1, ADC9."), P("B10", "io", "PB10, I2C2 SCL, UART3 TX."), P("B11", "io", "PB11, I2C2 SDA, UART3 RX."),
      P("R", "in", "Reset, active low."), P("3.3", "power", "3.3 V from the regulator (output)."), GND(), GND()],
    right: [P("B12", "io", "PB12, SPI2 NSS."), P("B13", "io", "PB13, SPI2 SCK."), P("B14", "io", "PB14, SPI2 MISO."), P("B15", "io", "PB15, SPI2 MOSI."), P("A8", "io", "PA8, TIM1 PWM."), P("A9", "io", "PA9, UART1 TX (bootloader).", "TX1"), P("A10", "io", "PA10, UART1 RX (bootloader).", "RX1"), P("A11", "io", "PA11, USB D-."), P("A12", "io", "PA12, USB D+."),
      P("A15", "io", "PA15, JTAG TDI (free after disabling JTAG)."), P("B3", "io", "PB3, JTAG TDO."), P("B4", "io", "PB4, JTAG TRST."), P("B5", "io", "PB5."), P("B6", "io", "PB6, I2C1 SCL.", "SCL"), P("B7", "io", "PB7, I2C1 SDA.", "SDA"), P("B8", "io", "PB8, CAN RX, PWM."), P("B9", "io", "PB9, CAN TX, PWM."),
      P("5V", "power", "5 V from USB (or in)."), GND(), P("3.3", "power", "3.3 V from the regulator (output).")] } },

"digispark-attiny85": {
  name: "Digispark ATtiny85", short: "Digispark", kind: "board", category: "boards", w: 90, h: 150, style: "purple", pinOrderVaries: true,
  decor: [{ type: "usb" }, { type: "chip", label: "t85" }],
  use: "Use it for a one-trick gadget (a USB keyboard macro, a blinking badge) where 6 pins and 6 KB are enough and the board must cost a dollar.",
  info: "ATtiny85 with a V-USB bootloader: plug it in within 5 s of starting the upload. 5 V logic, 6 I/O pins. Gotcha: P3/P4 are the USB data lines (P3 has a 1.5 k pull-up) and P5 is reset unless you burn a fuse; serial debugging needs DigiCDC or a software serial.",
  datasheet: "http://digistump.com/wiki/digispark",
  pins: { left: [P("P0", "io", "PB0, MOSI, PWM, I2C SDA.", "SDA"), P("P1", "io", "PB1, MISO, PWM, on-board LED.", "LED"), P("P2", "io", "PB2, SCK, I2C SCL, ADC1.", "SCL"), P("P3", "io", "PB3, USB D-, ADC3 (1.5 k pull-up)."), P("P4", "io", "PB4, USB D+, ADC2, PWM."), P("P5", "io", "PB5, reset / ADC0 (needs the reset-disable fuse).")],
    right: [P("5V", "power", "5 V from USB (or regulator output)."), P("VIN", "power", "7-35 V into the on-board regulator."), GND()] } },

"teensy-40": {
  name: "Teensy 4.0", short: "Teensy", kind: "board", category: "boards", w: 110, h: 330, style: "green",
  decor: [{ type: "usb" }, { type: "chip", label: "iMXRT" }, { type: "button", label: "PGM", at: "br" }],
  use: "Use it when you need serious speed (600 MHz), audio processing, USB MIDI/HID or many hardware serial ports in an Arduino-compatible board.",
  info: "NXP i.MX RT1062 at 600 MHz, 3.3 V logic, micro-USB at the top; outer pins 0-23 drawn (24-33 are bottom pads). Gotcha: pins are NOT 5 V tolerant, and VIN/VUSB are joined by a cuttable trace (cut it when powering from both).",
  datasheet: "https://www.pjrc.com/store/teensy40.html",
  pins: { left: [GND(), P("0", "io", "Digital 0, Serial1 RX, CRX2.", "RX1"), P("1", "io", "Digital 1, Serial1 TX, CTX2.", "TX1"), P("2", "io", "Digital 2, PWM."), P("3", "io", "Digital 3, PWM, CAN."), P("4", "io", "Digital 4, PWM."), P("5", "io", "Digital 5, PWM."), P("6", "io", "Digital 6, PWM."), P("7", "io", "Digital 7, Serial2 RX."), P("8", "io", "Digital 8, Serial2 TX."), P("9", "io", "Digital 9, PWM."),
      P("10", "io", "Digital 10, SPI CS.", "CS"), P("11", "io", "Digital 11, SPI MOSI.", "MOSI"), P("12", "io", "Digital 12, SPI MISO.", "MISO")],
    right: [P("VIN", "power", "3.6-5.5 V in (joined to VUSB by default)."), GND(), P("3.3V", "power", "3.3 V output, 250 mA."), P("23", "io", "Digital 23, A9, PWM.", "A9"), P("22", "io", "Digital 22, A8, PWM.", "A8"), P("21", "io", "Digital 21, A7, Serial5 RX.", "A7"), P("20", "io", "Digital 20, A6, Serial5 TX.", "A6"), P("19", "io", "Digital 19, A5, I2C SCL.", "SCL"), P("18", "io", "Digital 18, A4, I2C SDA.", "SDA"),
      P("17", "io", "Digital 17, A3, Serial4 TX.", "A3"), P("16", "io", "Digital 16, A2, Serial4 RX.", "A2"), P("15", "io", "Digital 15, A1, Serial3 RX.", "A1"), P("14", "io", "Digital 14, A0, Serial3 TX.", "A0"), P("13", "io", "Digital 13, SPI SCK, LED.", "SCK")] } },

"nodemcu-esp8266": {
  name: "NodeMCU ESP8266 (30-pin)", short: "NodeMCU", kind: "board", category: "boards", w: 180, h: 350, style: "black", pinOrderVaries: true,
  decor: [{ type: "usb", y: 350 }, { type: "chip", label: "ESP-12E" }, { type: "button", label: "RST", at: "bl" }, { type: "button", label: "FLASH", at: "br" }],
  use: "Use it for a cheap Wi-Fi-only project with a handful of pins (one ADC, no Bluetooth); the ESP8266 is still everywhere in home automation.",
  info: "ESP-12E module on a 30-pin board, 3.3 V logic, micro-USB at the bottom. D1 names map to GPIO numbers (sub-labels). Gotcha: only ~4 pins are free of boot constraints (D1, D2, D5, D6, D7), A0 takes 0-3.3 V on NodeMCU (0-1 V on the bare chip), and the SD/CMD/CLK pins belong to the flash chip.",
  datasheet: "https://www.espressif.com/sites/default/files/documentation/0a-esp8266ex_datasheet_en.pdf",
  pins: { left: [P("A0", "in", "ADC, 0-3.3 V (divider on board), 10-bit."), P("RSV", "nc", "Reserved."), P("RSV", "nc", "Reserved."), P("SD3", "io", "GPIO10, flash chip; avoid."), P("SD2", "io", "GPIO9, flash chip; avoid."), P("SD1", "nc", "Flash chip; do not use."), P("CMD", "nc", "Flash chip; do not use."), P("SD0", "nc", "Flash chip; do not use."), P("CLK", "nc", "Flash chip; do not use."), GND(), P("3V3", "power", "3.3 V output."), P("EN", "in", "Chip enable; keep high."), P("RST", "in", "Reset, active low."), GND(), P("VIN", "power", "5 V in (from USB or external).")],
    right: [DP("D0", "GPIO16"), DP("D1", "SCL"), DP("D2", "SDA"), DP("D3", "GPIO0"), DP("D4", "LED"), P("3V3", "power", "3.3 V output."), GND(), DP("D5", "SCK"), DP("D6", "MISO"), DP("D7", "MOSI"), DP("D8", "SS"), P("RX", "io", "GPIO3, UART0 RX (USB console).", "GPIO3"), P("TX", "io", "GPIO1, UART0 TX (USB console).", "GPIO1"), GND(), P("3V3", "power", "3.3 V output.")] } },

"wemos-d1-mini": {
  name: "Wemos D1 mini", short: "D1 mini", kind: "board", category: "boards", w: 110, h: 200, style: "blue",
  decor: [{ type: "usb" }, { type: "chip", label: "ESP-12F" }, { type: "button", label: "RST", at: "bl" }],
  use: "Use it for the smallest ESP8266 build with stackable shields (OLED, relay, battery); the home-automation classic.",
  info: "ESP-12F on a 16-pin board, 3.3 V logic, micro-USB at the top; 5V pin takes USB or external 5 V. Gotcha: same boot-pin rules as every ESP8266 (D3/D4/D8 have jobs at boot, D0 cannot PWM), and A0 is 0-3.2 V through the on-board divider.",
  datasheet: "https://www.wemos.cc/en/latest/d1/d1_mini.html",
  pins: { left: [P("RST", "in", "Reset, active low."), P("A0", "in", "ADC, 0-3.2 V, 10-bit."), DP("D0", "GPIO16"), DP("D5", "SCK"), DP("D6", "MISO"), DP("D7", "MOSI"), DP("D8", "SS"), P("3V3", "power", "3.3 V output.")],
    right: [P("TX", "io", "GPIO1, UART TX (USB console).", "GPIO1"), P("RX", "io", "GPIO3, UART RX.", "GPIO3"), DP("D1", "SCL"), DP("D2", "SDA"), DP("D3", "GPIO0"), DP("D4", "LED"), GND(), P("5V", "power", "5 V from USB or in.")] } },

/* ===================== sensors ===================== */
"gy-521-mpu6050": {
  name: "GY-521 (MPU-6050 IMU)", short: "GY-521", kind: "module", category: "sensors", w: 160, h: 220, style: "blue", pinOrderVaries: true, decor: [{ type: "chip", label: "MPU-6050" }],
  use: "Use it when a project needs to know its tilt or motion; it is the cheapest IMU and every library supports it.",
  info: "6-axis IMU (3-axis gyro + 3-axis accelerometer) on I2C at 0x68. Powered from 3.3 V or 5 V thanks to its regulator; logic lines are 3.3 V. Gotcha: SDA/SCL on the module already have pull-ups, so do not add more when several modules share the bus.",
  datasheet: "https://invensense.tdk.com/products/motion-tracking/6-axis/mpu-6050/",
  pins: { left: [VCC("3.3-5 V in; the module's regulator feeds the chip 3.3 V."), GND(), SCL("I2C clock (pull-up already on the module)."), SDA(), P("XDA", "io", "Auxiliary I2C data for an external magnetometer; usually unused."), P("XCL", "io", "Auxiliary I2C clock; usually unused."), P("AD0", "in", "Address select: open/low = 0x68, high = 0x69."), P("INT", "out", "Data-ready / motion interrupt, 3.3 V; optional.")] } },
"gy-271-qmc5883l": {
  name: "GY-271 (QMC5883L compass)", short: "GY-271", kind: "module", category: "sensors", w: 160, h: 120, style: "blue", pinOrderVaries: true, decor: [{ type: "chip", label: "QMC5883L" }],
  use: "Use it when the project needs a compass heading (which way is north) rather than motion.",
  info: "3-axis magnetometer on I2C at 0x0D (QMC5883L). 3.3-5 V in, 3.3 V logic. Gotcha: boards sold as GY-271 may carry an HMC5883L (0x1E) or QMC5883P (0x2C), which need a different driver; check the I2C scan.",
  datasheet: "https://www.qstcorp.com/upload/pdf/202202/QMC5883L%20Datasheet%201.0.pdf",
  pins: { left: [VCC("3.3-5 V in (regulator on board)."), GND(), SCL(), SDA(), P("DRDY", "out", "Data-ready pulse; optional, leave unconnected.")] } },
"gy-273-hmc5883l": {
  name: "GY-273 (HMC5883L compass)", short: "GY-273", kind: "module", category: "sensors", w: 160, h: 120, style: "blue", pinOrderVaries: true, decor: [{ type: "chip", label: "HMC5883L" }],
  use: "Use it when an older tutorial or library asks for the HMC5883L compass; new builds should assume a QMC5883L arrives instead.",
  info: "Honeywell 3-axis magnetometer on I2C at 0x1E, 3.3-5 V in. The chip is discontinued, so most boards sold under this name now carry a QMC5883L (0x0D). Gotcha: scan the bus first and pick the driver that matches.",
  pins: { left: [VCC("3.3-5 V in."), GND(), SCL(), SDA(), P("DRDY", "out", "Data-ready pulse; optional.")] } },
"mpu-9250": {
  name: "GY-9250 (MPU-9250 9-axis)", short: "MPU-9250", kind: "module", category: "sensors", w: 160, h: 260, style: "blue", pinOrderVaries: true, decor: [{ type: "chip", label: "MPU-9250" }],
  use: "Use it when you need orientation that does not drift: gyro, accelerometer and a magnetometer in one part for AHRS/quaternion fusion.",
  info: "9-axis IMU on I2C (0x68/0x69) or SPI; the AK8963 magnetometer sits behind it at 0x0C (enable bypass). 3.3-5 V in, 3.3 V logic. Gotcha: many boards sold as MPU-9250 contain an MPU-6500 with no magnetometer; check WHO_AM_I (0x71 = 9250).",
  datasheet: "https://invensense.tdk.com/products/motion-tracking/9-axis/mpu-9250/",
  pins: { left: [VCC("3.3-5 V in."), GND(), SCL("I2C clock / SPI SCK."), SDA("I2C data / SPI MOSI."), P("EDA", "io", "Auxiliary I2C data; unused."), P("ECL", "io", "Auxiliary I2C clock; unused."), P("AD0", "in", "Address select (0x68 low, 0x69 high) / SPI MISO."), P("INT", "out", "Interrupt out."), P("NCS", "in", "SPI chip select; leave open for I2C."), P("FSYNC", "in", "Frame sync; tie to GND.")] } },
"adxl345": {
  name: "GY-291 (ADXL345 accelerometer)", short: "ADXL345", kind: "module", category: "sensors", w: 160, h: 220, style: "blue", pinOrderVaries: true, decor: [{ type: "chip", label: "ADXL345" }],
  use: "Use it for tilt, taps, free-fall and step detection with very low power; it is a 3-axis accelerometer only (no gyro).",
  info: "13-bit, up to 16 g accelerometer on I2C (0x53, or 0x1D with SDO high) or SPI. 3.3-5 V in via the on-board regulator, 3.3 V logic. Gotcha: for I2C leave CS high (the module pulls it up); built-in tap and activity interrupts save polling.",
  datasheet: "https://www.analog.com/media/en/technical-documentation/data-sheets/adxl345.pdf",
  pins: { left: [GND(), VCC("3.3-5 V in."), P("CS", "in", "High for I2C (pulled up); low selects SPI."), P("INT1", "out", "Interrupt 1 (tap, activity)."), P("INT2", "out", "Interrupt 2."), P("SDO", "in", "Address select (low 0x53, high 0x1D) / SPI MISO."), SDA(), SCL()] } },
"lsm6ds3": {
  name: "LSM6DS3 6-axis IMU", short: "LSM6DS3", kind: "module", category: "sensors", w: 150, h: 220, style: "purple", pinOrderVaries: true, decor: [{ type: "chip", label: "LSM6DS3" }],
  use: "Use it when you want a modern, low-noise IMU with a FIFO and built-in step counter; it is the chip inside many Seeed/Arduino boards.",
  info: "ST 6-axis gyro + accelerometer, I2C (0x6A, or 0x6B with SA0 high) or SPI, 1.7-3.6 V (breakouts add a regulator). Gotcha: a bare LSM6DS3 is 3.3 V only; check your breakout before using 5 V.",
  datasheet: "https://www.st.com/resource/en/datasheet/lsm6ds3.pdf",
  pins: { left: [VCC("3.3 V (5 V only with a regulator on board).", "VIN"), GND(), SCL(), SDA(), P("SA0", "in", "Address select: low 0x6A, high 0x6B."), P("CS", "in", "High for I2C; low for SPI."), P("INT1", "out", "Interrupt 1."), P("INT2", "out", "Interrupt 2.")] } },
"bme280-i2c": {
  name: "BME280 (temp/humidity/pressure)", short: "BME280", kind: "module", category: "sensors", w: 110, h: 110, style: "purple", pinOrderVaries: true, decor: [{ type: "chip", label: "BME280" }],
  use: "Use it for a weather station or room monitor: one tiny I2C part gives temperature, humidity and pressure.",
  info: "Temperature, humidity and pressure on I2C at 0x76 (0x77 on some boards). 3.3 V part; most purple boards include a regulator and accept 5 V. Gotcha: cheap boards sold as BME280 are often BMP280 (no humidity): chip id 0x58 vs 0x60.",
  datasheet: "https://www.bosch-sensortec.com/products/environmental-sensors/humidity-sensors-bme280/",
  pins: { left: [VCC("3.3 V (5 V only if the board has a regulator)."), GND(), SCL(), SDA()] } },
"bmp280": {
  name: "BMP280 (temp/pressure)", short: "BMP280", kind: "module", category: "sensors", w: 110, h: 110, style: "purple", pinOrderVaries: true, decor: [{ type: "chip", label: "BMP280" }],
  use: "Use it for altitude or barometric pressure when you do not need humidity; it is the cheapest Bosch barometer.",
  info: "Pressure + temperature on I2C at 0x76 (0x77 with SDO high) or SPI; 1.7-3.6 V (some boards have a regulator for 5 V). Gotcha: the 6-pin version exposes CSB/SDO; for I2C tie CSB high (most boards do).",
  datasheet: "https://www.bosch-sensortec.com/products/environmental-sensors/pressure-sensors/bmp280/",
  pins: { left: [VCC("3.3 V (5 V only with a regulator)."), GND(), SCL(), SDA()] } },
"bme680": {
  name: "BME680 (gas/temp/humidity/pressure)", short: "BME680", kind: "module", category: "sensors", w: 110, h: 110, style: "purple", pinOrderVaries: true, decor: [{ type: "chip", label: "BME680" }],
  use: "Use it for indoor air quality (VOC gas resistance) on top of temperature, humidity and pressure.",
  info: "Bosch 4-in-1 environmental sensor on I2C at 0x76/0x77 (SDO selects) or SPI, 1.7-3.6 V. Gotcha: raw gas resistance is not an IAQ number; Bosch's closed BSEC library computes IAQ, and the heater warms the temperature reading by ~1-2 °C.",
  datasheet: "https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme680/",
  pins: { left: [VCC("3.3 V (5 V only with a regulator)."), GND(), SCL(), SDA()] } },
"dht22": {
  name: "DHT22 / AM2302", short: "DHT22", kind: "module", category: "sensors", w: 110, h: 90, style: "#d9dde3", pinOrderVaries: true,
  use: "Use it for cheap temperature and humidity on one GPIO when ±0.5 °C and a reading every 2 s are good enough.",
  info: "Temperature + humidity over a single-wire protocol (not Dallas 1-Wire). 3.3-5.5 V. Gotcha: the bare sensor needs a 10 kOhm pull-up from DATA to VCC (3-pin modules include it) and at least 2 s between reads.",
  datasheet: "https://cdn-shop.adafruit.com/datasheets/Digital+humidity+and+temperature+sensor+AM2302.pdf",
  pins: { bottom: [VCC("3.3-5.5 V."), P("DATA", "io", "Single-wire data; pull up to VCC with 10 kOhm."), P("NC", "nc", "Not connected."), GND()] } },
"dht11": {
  name: "DHT11", short: "DHT11", kind: "module", category: "sensors", w: 100, h: 80, style: "#2f6fd1", pinOrderVaries: true,
  use: "Use it only when cost is everything and ±2 °C / ±5 % RH is acceptable; otherwise pick the DHT22 or a BME280.",
  info: "Basic temperature + humidity sensor, same single-wire protocol as the DHT22, 3-5.5 V, one reading per second. Gotcha: integer-only readings and 20-80 % RH range; needs the 10 kOhm pull-up on DATA unless on a module.",
  pins: { bottom: [VCC("3-5.5 V."), P("DATA", "io", "Single-wire data; 10 kOhm pull-up."), P("NC", "nc", "Not connected."), GND()] } },
"hc-sr04": {
  name: "HC-SR04 ultrasonic", short: "HC-SR04", kind: "module", category: "sensors", w: 180, h: 70, style: "blue",
  use: "Use it to measure distance to a wall or obstacle (2-400 cm) for robots, parking sensors and tank levels.",
  info: "Ultrasonic range finder, 2-400 cm: pulse Trig for 10 us, then time the Echo pulse. 5 V part. Gotcha: Echo is a 5 V output, so on a 3.3 V board put a divider (1 kOhm + 2 kOhm) on Echo; Trig accepts 3.3 V.",
  datasheet: "https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf",
  pins: { bottom: [VCC("5 V."), P("Trig", "in", "10 us high pulse starts a measurement; 3.3 V is enough."), P("Echo", "out", "High for the round-trip time; 5 V level, divide for 3.3 V boards."), GND()] } },
"vl53l0x": {
  name: "VL53L0X time-of-flight", short: "VL53L0X", kind: "module", category: "sensors", w: 120, h: 140, style: "purple", pinOrderVaries: true, decor: [{ type: "chip", label: "VL53L0X" }],
  use: "Use it for precise short-range distance (3 cm to 1-2 m) with a narrow beam where ultrasonic is too wide or too slow.",
  info: "Laser time-of-flight ranger on I2C at 0x29, 2.6-5.5 V on breakouts (regulator + level shift on board). Gotcha: every unit boots at 0x29, so several sensors need XSHUT pins to wake them one at a time and assign new addresses; bright sunlight shortens the range.",
  datasheet: "https://www.st.com/resource/en/datasheet/vl53l0x.pdf",
  pins: { left: [VCC("2.6-5.5 V in.", "VIN"), GND(), SCL(), SDA(), P("GPIO1", "out", "Interrupt (data ready); optional."), P("XSHUT", "in", "Shutdown, active low; pull up or drive high to enable.")] } },
"tcs34725": {
  name: "TCS34725 colour sensor", short: "TCS34725", kind: "module", category: "sensors", w: 120, h: 130, style: "purple", pinOrderVaries: true, decor: [{ type: "chip", label: "TCS34725" }],
  use: "Use it to read the colour of an object or ambient light (RGB + clear) for sorters, colour pickers and auto-brightness.",
  info: "RGB + clear light sensor with IR filter on I2C at 0x29, 3.3-5 V (regulator on board), with a white LED for illumination. Gotcha: readings depend on distance and the LED; pull the LED pin low to switch it off, and calibrate against a white card.",
  datasheet: "https://cdn-shop.adafruit.com/datasheets/TCS34725.pdf",
  pins: { left: [VCC("3.3-5 V in.", "VIN"), GND(), SCL(), SDA(), P("INT", "out", "Threshold interrupt; optional."), P("LED", "in", "White LED control: low = off, open = on.")] } },
"mq-2": {
  name: "MQ-2 gas sensor", short: "MQ-2", kind: "module", category: "sensors", w: 110, h: 110, style: "blue", pinOrderVaries: true, decor: [{ type: "screen" }],
  use: "Use it to detect smoke, LPG, propane or methane in a room as a cheap alarm (not a calibrated meter).",
  info: "Tin-oxide gas sensor with a heater: 5 V, ~150 mA, analog output rising with gas concentration plus a digital threshold (pot). Gotcha: 24-48 h burn-in before readings settle, and AO is 0-5 V so use a divider on 3.3 V boards.",
  pins: { bottom: [VCC("5 V (heater draws ~150 mA)."), GND(), P("DO", "out", "Digital threshold output (pot sets it)."), P("AO", "out", "Analog 0-5 V, higher with more gas.")] } },
"soil-moisture-cap": {
  name: "Capacitive soil moisture v1.2", short: "Soil", kind: "module", category: "sensors", w: 70, h: 160, style: "black", pinOrderVaries: true,
  use: "Use it to water plants automatically; capacitive probes do not corrode like the cheap resistive forks.",
  info: "Capacitive probe with a 555 oscillator; analog output falls as the soil gets wetter (~3 V dry, ~1.5 V wet). 3.3-5.5 V. Gotcha: many v1.2 clones have a wrong resistor and do not work at 3.3 V (feed 5 V, output stays under 3 V), and the top edge must stay dry.",
  pins: { bottom: [VCC("3.3-5.5 V (5 V safest on clones)."), GND(), P("AOUT", "out", "Analog, lower = wetter.")] } },
"acs712": {
  name: "ACS712 current sensor", short: "ACS712", kind: "module", category: "sensors", w: 110, h: 90, style: "blue", pinOrderVaries: true, decor: [{ type: "chip", label: "ACS712" }],
  use: "Use it to measure the current of a motor or load in series without cutting into the ground path; it is isolated by the Hall effect.",
  info: "Hall-effect current sensor, 5 V supply, output 2.5 V at zero current, 185/100/66 mV per A for the 5/20/30 A versions, AC or DC. Gotcha: noisy (average many samples) and the output is 0-5 V, so divide for 3.3 V boards.",
  datasheet: "https://www.allegromicro.com/-/media/files/datasheets/acs712-datasheet.ashx",
  pins: { left: [VCC("5 V."), P("OUT", "out", "Analog, 2.5 V ± (mV/A) × I."), GND()], right: [P("IP+", "io", "Screw terminal: load current in."), P("IP-", "io", "Screw terminal: load current out.")] } },
"ina219": {
  name: "INA219 power monitor", short: "INA219", kind: "module", category: "sensors", w: 120, h: 110, style: "purple", pinOrderVaries: true, decor: [{ type: "chip", label: "INA219" }],
  use: "Use it to log voltage, current and power of a battery or solar panel over I2C with 1 mA resolution.",
  info: "High-side current/voltage monitor on I2C at 0x40 (A0/A1 solder jumpers give 0x40-0x45), 3-5.5 V, up to 26 V and ±3.2 A through the 0.1 Ohm shunt. Gotcha: the load goes in series between VIN+ and VIN-; measuring on the ground side gives nonsense.",
  datasheet: "https://www.ti.com/lit/ds/symlink/ina219.pdf",
  pins: { left: [VCC("3-5.5 V.", "VIN"), GND(), SCL(), SDA()], right: [P("VIN+", "io", "Screw terminal: from the supply."), P("VIN-", "io", "Screw terminal: to the load.")] } },
"ds3231": {
  name: "DS3231 RTC (ZS-042)", short: "DS3231", kind: "module", category: "sensors", w: 130, h: 160, style: "blue", pinOrderVaries: true, decor: [{ type: "chip", label: "DS3231" }],
  use: "Use it when the project must keep accurate time through power loss; its temperature-compensated crystal drifts only minutes per year.",
  info: "I2C real-time clock at 0x68 with a CR2032 backup and an AT24C32 EEPROM at 0x57 on the same board; 3.3-5.5 V. Gotcha: the ZS-042 board tries to charge the coin cell; with a non-rechargeable CR2032 remove the charging resistor/diode, and 0x68 collides with an MPU-6050.",
  datasheet: "https://www.analog.com/media/en/technical-documentation/data-sheets/DS3231.pdf",
  pins: { left: [P("32K", "out", "32.768 kHz output."), P("SQW", "out", "Square wave / alarm interrupt, open drain."), SCL(), SDA(), VCC("3.3-5.5 V."), GND()] } },
"max30102": {
  name: "MAX30102 pulse oximeter", short: "MAX30102", kind: "module", category: "sensors", w: 120, h: 170, style: "purple", pinOrderVaries: true, decor: [{ type: "chip", label: "MAX30102" }],
  use: "Use it to read heart rate and blood-oxygen (SpO2) from a fingertip with red and IR LEDs.",
  info: "Optical HR/SpO2 sensor on I2C at 0x57, 3.3-5 V on breakouts. Gotcha: many cheap boards wire the I2C pull-ups to 1.8 V, so the bus fails until you move the pull-ups to 3.3 V (or remove them and rely on the host); readings need a steady finger and a library's algorithm.",
  datasheet: "https://www.analog.com/media/en/technical-documentation/data-sheets/MAX30102.pdf",
  pins: { left: [VCC("3.3-5 V in.", "VIN"), SCL(), SDA(), P("INT", "out", "Data-ready interrupt, open drain."), P("IRD", "in", "IR LED driver test point; leave open."), P("RD", "in", "Red LED driver test point; leave open."), GND()] } },
"lm35": {
  name: "LM35 temperature sensor", short: "LM35", kind: "component", category: "sensors", w: 74, h: 44, style: "#1c1c21",
  use: "Use it for a simple analog thermometer (10 mV per °C) when you have an ADC and no I2C; no calibration needed.",
  info: "Analog temperature sensor in a TO-92: 10 mV/°C, 0 V at 0 °C, 4-30 V supply. Flat face toward you, legs down: +Vs, Vout, GND. Gotcha: 25 °C is only 250 mV, so use the ADC's low reference (1.1 V on AVR) or an amplifier for resolution.",
  datasheet: "https://www.ti.com/lit/ds/symlink/lm35.pdf",
  pins: { bottom: [P("+Vs", "power", "4-30 V."), P("Vout", "out", "10 mV per °C."), GND()] } },
"ntc-module": {
  name: "NTC thermistor module (KY-013)", short: "NTC", kind: "module", category: "sensors", w: 70, h: 90, style: "black", pinOrderVaries: true,
  use: "Use it to measure temperature where a cheap analog divider is enough (heaters, fans, battery packs).",
  info: "10 kOhm NTC in a divider with a 10 kOhm resistor; read the analog pin and convert with the Steinhart-Hart (B = 3950) formula. 3.3-5 V. Gotcha: the output is nonlinear, so a library or lookup table is needed for real degrees.",
  pins: { bottom: [P("S", "out", "Analog divider output."), P("+", "power", "3.3-5 V."), P("-", "gnd", "Ground.")] } },
"hx711": {
  name: "HX711 load cell amplifier", short: "HX711", kind: "module", category: "sensors", w: 140, h: 170, style: "green", decor: [{ type: "chip", label: "HX711" }],
  use: "Use it to build a scale: it turns a load cell's microvolts into a 24-bit number over two wires.",
  info: "24-bit ADC for bridge load cells, 2.6-5.5 V, 10 or 80 samples/s (jumper). Load cell wires: red E+, black E-, white A-, green A+. Gotcha: tare at power-up and calibrate with a known weight; keep the cell wires short and away from motors.",
  datasheet: "https://cdn.sparkfun.com/datasheets/Sensors/ForceFlex/hx711_english.pdf",
  pins: { left: [P("E+", "out", "Load cell excitation + (red)."), P("E-", "out", "Load cell excitation - (black)."), P("A-", "in", "Channel A - (white)."), P("A+", "in", "Channel A + (green)."), P("B-", "in", "Channel B - (optional second cell)."), P("B+", "in", "Channel B +.")],
    right: [GND(), P("DT", "out", "Data out (DOUT).", "DOUT"), P("SCK", "in", "Clock in (PD_SCK)."), VCC("2.6-5.5 V.")] } },
"ttp223": {
  name: "TTP223 touch button", short: "Touch", kind: "module", category: "sensors", w: 70, h: 70, style: "blue", pinOrderVaries: true,
  use: "Use it as a capacitive touch button that works through thin plastic or glass instead of a mechanical switch.",
  info: "Single-key capacitive touch sensor, 2-5.5 V, output high while touched (solder pads A/B select toggle mode and active level). Gotcha: it self-calibrates at power-up, so do not touch it while powering on.",
  pins: { bottom: [VCC("2-5.5 V."), P("I/O", "out", "High while touched (default)."), GND()] } },
"joystick": {
  name: "Joystick module (KY-023)", short: "Joystick", kind: "module", category: "sensors", w: 120, h: 120, style: "black", decor: [{ type: "screen" }],
  use: "Use it for a two-axis analog control plus a push button, the classic input for robots and menus.",
  info: "Two 10 kOhm potentiometers (X, Y) and a push switch to GND; 3.3 or 5 V. Gotcha: the centre reads about half the supply and varies ±10 % per unit, so add a dead zone, and SW needs a pull-up (INPUT_PULLUP).",
  pins: { left: [GND(), P("+5V", "power", "3.3-5 V (sets the analog full scale).", "VCC"), P("VRx", "out", "Analog X, 0-VCC."), P("VRy", "out", "Analog Y, 0-VCC."), P("SW", "out", "Button, closes to GND.")] } },
"inmp441": {
  name: "INMP441 I2S microphone", short: "INMP441", kind: "module", category: "sensors", w: 70, h: 150, style: "purple", pinOrderVaries: true,
  use: "Use it for clean digital audio capture (voice commands, sound level, recording) on an ESP32 with I2S.",
  info: "MEMS microphone with an I2S digital output, 3.3 V only, 24-bit at up to 48 kHz. Gotcha: L/R to GND selects the left channel (most examples), keep the wires short, and the ESP32 must be set to 32-bit samples to read it.",
  datasheet: "https://invensense.tdk.com/products/digital/inmp441/",
  pins: { left: [VCC("3.3 V only.", "VDD"), GND(), P("SD", "out", "I2S serial data."), P("L/R", "in", "Channel select: GND = left, VDD = right."), P("WS", "in", "I2S word select (LRCLK)."), P("SCK", "in", "I2S bit clock.")] } },
"max4466": {
  name: "MAX4466 microphone amp", short: "MAX4466", kind: "module", category: "sensors", w: 70, h: 80, style: "black", pinOrderVaries: true,
  use: "Use it to feed an analog microphone signal to an ADC for sound-reactive lights or simple loudness detection.",
  info: "Electret microphone with an adjustable-gain amplifier, 2.4-5.5 V, output centred at VCC/2. Gotcha: sample fast (≥ 8 kHz) and measure peak-to-peak over a window; power it from a clean 3.3 V rail, not a noisy 5 V.",
  pins: { bottom: [VCC("2.4-5.5 V, clean."), GND(), P("OUT", "out", "Analog audio around VCC/2.")] } },
"rcwl-0516": {
  name: "RCWL-0516 microwave radar", short: "RCWL-0516", kind: "module", category: "sensors", w: 90, h: 130, style: "blue",
  use: "Use it to detect motion through thin walls or plastic enclosures where a PIR cannot see; no lens needed.",
  info: "Doppler radar motion detector, 4-28 V on VIN, 3.3 V logic output high for ~2 s on motion, ~7 m range in all directions. Gotcha: it triggers through walls and on moving fans, and needs 30 s to settle after power-up.",
  pins: { left: [P("3V3", "power", "3.3 V output (100 mA) from the on-board regulator."), GND(), P("OUT", "out", "3.3 V high for ~2 s on motion."), VCC("4-28 V in.", "VIN"), P("CDS", "in", "Optional LDR to disable in daylight.")] } },
"hc-sr501-pir": {
  name: "HC-SR501 PIR motion", short: "PIR", kind: "module", category: "sensors", w: 130, h: 110, style: "green", pinOrderVaries: true, decor: [{ type: "screen" }],
  use: "Use it to detect a person moving in a room for lights, alarms and wake-up triggers.",
  info: "Passive infrared motion module. 5-20 V in; its output is 3.3 V, safe for any board. Gotcha: about 60 s warm-up after power-up, and the two trimmers set sensitivity and hold time (3 s to 5 min).",
  datasheet: "https://www.mpja.com/download/31227sc.pdf",
  pins: { bottom: [VCC("5-20 V in."), P("OUT", "out", "3.3 V high while motion is detected."), GND()] } },
"ir-obstacle": {
  name: "IR obstacle sensor (FC-51)", short: "IR obst.", kind: "module", category: "sensors", w: 70, h: 120, style: "black", pinOrderVaries: true,
  use: "Use it as a cheap near/far detector (2-30 cm) for line followers, drop-off detection and object counting.",
  info: "IR LED + photodiode with a comparator; OUT goes low when something reflects the beam, range set by the pot. 3.3-5 V. Gotcha: sunlight and dark surfaces fool it; it answers yes/no, not a distance.",
  pins: { bottom: [VCC("3.3-5 V."), GND(), P("OUT", "out", "Low when an obstacle is seen.")] } },
"ky-038": {
  name: "KY-038 sound sensor", short: "KY-038", kind: "module", category: "sensors", w: 90, h: 90, style: "blue", pinOrderVaries: true,
  use: "Use it for clap switches and loud-noise alarms; it reports a threshold hit and a rough analog level.",
  info: "Electret microphone with an LM393 comparator: DO goes high above the pot threshold, AO is the raw mic level. 5 V (3.3 V works with less range). Gotcha: it cannot record audio and the threshold drifts with temperature.",
  pins: { bottom: [P("AO", "out", "Analog mic level."), P("G", "gnd", "Ground."), P("+", "power", "3.3-5 V."), P("DO", "out", "High above the threshold.")] } },
"reed-switch-module": {
  name: "Reed switch module (KY-021)", short: "Reed", kind: "module", category: "sensors", w: 70, h: 90, style: "black", pinOrderVaries: true,
  use: "Use it to sense a door or lid with a magnet; no power is needed by the switch itself.",
  info: "Glass reed switch with a 10 kOhm pull-up: S reads low while a magnet is near. 3.3-5 V. Gotcha: the glass is fragile and the contacts bounce, so debounce in software.",
  pins: { bottom: [P("-", "gnd", "Ground."), P("+", "power", "3.3-5 V."), P("S", "out", "Low while a magnet is near.")] } },
"tilt-switch": {
  name: "Tilt switch module (KY-020)", short: "Tilt", kind: "module", category: "sensors", w: 70, h: 90, style: "black", pinOrderVaries: true,
  use: "Use it to know whether something has been tipped over or picked up without an IMU.",
  info: "Ball tilt switch with a pull-up: S changes level when the module is tilted past ~45°. 3.3-5 V. Gotcha: it is a crude on/off, rattles with vibration, and needs debouncing.",
  pins: { bottom: [P("-", "gnd", "Ground."), P("+", "power", "3.3-5 V."), P("S", "out", "Level changes when tilted.")] } },
"ky-003-hall": {
  name: "KY-003 hall switch (A3144)", short: "Hall", kind: "module", category: "sensors", w: 70, h: 90, style: "black", pinOrderVaries: true,
  use: "Use it to count wheel revolutions or detect a magnet passing (speedometers, end stops, door sensors).",
  info: "Digital hall-effect switch: S goes low when a magnet's south pole is near, high otherwise (open collector, 10 kOhm pull-up on the module). Rated 4.5-24 V. Gotcha: at 3.3 V it is out of spec; feed + from 5 V and pull S up to 3.3 V, or use a 3.3 V part.",
  datasheet: "https://www.allegromicro.com/-/media/files/datasheets/a3141-2-3-4-datasheet.ashx",
  pins: { bottom: [P("-", "gnd", "Ground."), P("+", "power", "4.5-24 V (5 V typical)."), P("S", "out", "Signal, open collector: low with a magnet present.")] } },
"ds18b20": {
  name: "DS18B20 (1-Wire temp)", short: "DS18B20", kind: "component", category: "sensors", w: 74, h: 44, style: "#1c1c21",
  use: "Use it when you need several accurate temperature probes (waterproof versions exist) on a single wire.",
  info: "1-Wire digital thermometer, 3.0-5.5 V, many sensors on one pin. Flat face toward you, legs down: GND, DQ, VDD. Gotcha: DQ needs a 4.7 kOhm pull-up to VDD; swapping GND and VDD makes it hot fast.",
  datasheet: "https://www.analog.com/media/en/technical-documentation/data-sheets/DS18B20.pdf",
  pins: { bottom: [GND(), P("DQ", "io", "1-Wire data; 4.7 kOhm pull-up to VDD."), P("VDD", "power", "3.0-5.5 V.")] } },
"photoresistor": {
  name: "Photoresistor (LDR)", short: "LDR", kind: "component", category: "sensors", w: 44, h: 50, style: "#6b4a1e",
  use: "Use it to tell dark from light (night lights, auto-brightness) with one resistor and an ADC pin.",
  info: "Light-dependent resistor, no polarity: ~1 kOhm in bright light, ~1 MOhm in the dark. Read it as a divider: LDR from 3V3 to an ADC pin, 10 kOhm from that pin to GND. Gotcha: slow (tens of ms) and uncalibrated.",
  pins: { bottom: [NP("1"), NP("2")] } },

/* ===================== displays ===================== */
"gc9a01-round-128": {
  name: "1.28\" round TFT (GC9A01)", short: "Display", kind: "module", category: "displays", w: 220, h: 230, style: "black", pinOrderVaries: true, decor: [{ type: "screen" }],
  use: "Use it for a watch face, gauge or compass dial: a bright round colour screen that looks great behind a round bezel.",
  info: "240x240 round IPS TFT on SPI (GC9A01 controller), 3.3 V power and logic. Gotcha: SCL/SDA here are the SPI clock and MOSI, not I2C; the 7-pin version has no BLK pin (backlight always on).",
  datasheet: "https://www.waveshare.com/wiki/1.28inch_LCD_Module",
  pins: { left: [VCC("3.3 V (some boards accept 5 V, check the silkscreen)."), GND(), P("SCL", "in", "SPI clock (SCK), not I2C."), P("SDA", "in", "SPI data in (MOSI); the display never sends back."), P("RES", "in", "Reset, active low."), P("DC", "in", "Data/command select."), P("CS", "in", "Chip select, active low."), P("BLK", "in", "Backlight: high or PWM = on; left open = on.")] } },
"ssd1306-oled-i2c": {
  name: "0.96\" OLED (SSD1306, I2C)", short: "OLED", kind: "module", category: "displays", w: 130, h: 100, style: "blue", pinOrderVaries: true, decor: [{ type: "panel", y: 62, h: 50 }],
  use: "Use it as the default tiny status screen: two wires, every library, readable text and simple graphics.",
  info: "128x64 monochrome OLED on I2C at 0x3C (0x3D on some). 3.3-5 V. Gotcha: pin order differs between boards (GND-VCC-SCL-SDA vs VCC-GND-SCL-SDA); swapping power kills it, so read the silkscreen.",
  datasheet: "https://cdn-shop.adafruit.com/datasheets/SSD1306.pdf", pins: { top: [GND(), VCC("3.3-5 V."), SCL(), SDA()] } },
"sh1106-13": {
  name: "1.3\" OLED (SH1106, I2C)", short: "OLED 1.3", kind: "module", category: "displays", w: 150, h: 110, style: "blue", pinOrderVaries: true, decor: [{ type: "panel", y: 68, h: 56 }],
  use: "Use it when the 0.96\" OLED is too small to read at arm's length; same wiring, bigger glass.",
  info: "128x64 OLED on I2C at 0x3C, 3.3-5 V. Gotcha: it is an SH1106, not an SSD1306: SSD1306 code shows a shifted, garbled image, so pick the SH1106 driver (U8g2 or Adafruit_SH110X).",
  pins: { top: [GND(), VCC("3.3-5 V."), SCL(), SDA()] } },
"st7789-130": {
  name: "1.3\" TFT (ST7789, SPI)", short: "TFT", kind: "module", category: "displays", w: 180, h: 190, style: "black", pinOrderVaries: true, decor: [{ type: "panel" }],
  use: "Use it for a small, bright colour screen with fast SPI updates (gauges, images, menus).",
  info: "1.3\" 240x240 IPS TFT on SPI (ST7789), 3.3 V. The common 7-pin module has no CS pin (tied low inside). Gotcha: without CS it cannot share the SPI bus with another device and needs SPI mode 3.",
  datasheet: "https://www.waveshare.com/wiki/1.3inch_LCD_Module",
  pins: { left: [GND(), VCC("3.3 V."), P("SCL", "in", "SPI clock (SCK), not I2C."), P("SDA", "in", "SPI MOSI."), P("RES", "in", "Reset, active low."), P("DC", "in", "Data/command select."), P("BLK", "in", "Backlight on/off or PWM.")] } },
"st7735-18": {
  name: "1.8\" TFT (ST7735, SPI)", short: "TFT 1.8", kind: "module", category: "displays", w: 190, h: 230, style: "#8a1c14", pinOrderVaries: true, decor: [{ type: "panel", w: 110, h: 150, x: 70 }],
  use: "Use it for a cheap 128x160 colour screen with an SD slot on the back; the classic Arduino TFT.",
  info: "ST7735 160x128 TFT on SPI, 3.3 V logic (many red boards take 5 V on VCC and have series resistors). A0 is the data/command pin. Gotcha: colour order and offsets differ between clones (set the right init tab in the library), and the SD slot pins are on the other edge.",
  pins: { left: [P("LED", "in", "Backlight; 3.3 V or PWM."), P("SCK", "in", "SPI clock."), P("SDA", "in", "SPI MOSI."), P("A0", "in", "Data/command (DC)."), P("RESET", "in", "Reset, active low."), P("CS", "in", "Chip select."), GND(), VCC("3.3 V (5 V on boards with a regulator).")] } },
"ili9341-28": {
  name: "2.8\" TFT (ILI9341, SPI + touch)", short: "ILI9341", kind: "module", category: "displays", w: 240, h: 340, style: "#8a1c14", pinOrderVaries: true, decor: [{ type: "panel", w: 150, h: 230, x: 95 }],
  use: "Use it when you need a real screen with a resistive touch panel for a UI, a game or a dashboard.",
  info: "320x240 TFT on SPI with an XPT2046 touch controller on the same bus (own CS), 3.3 V logic, VCC 3.3-5 V (regulator on board). Gotcha: SDO (MISO) is not tri-stated on many boards, so other SPI devices on the bus break; wire the touch pins to a separate CS and keep the LED pin on 3.3 V or PWM.",
  pins: { left: [VCC("3.3-5 V."), GND(), P("CS", "in", "Display chip select."), P("RESET", "in", "Reset, active low."), P("DC", "in", "Data/command."), P("SDI", "in", "SPI MOSI.", "MOSI"), P("SCK", "in", "SPI clock."), P("LED", "in", "Backlight, 3.3 V or PWM."), P("SDO", "out", "SPI MISO (not tri-stated on cheap boards).", "MISO"),
    P("T_CLK", "in", "Touch SPI clock (share SCK)."), P("T_CS", "in", "Touch chip select."), P("T_DIN", "in", "Touch MOSI (share)."), P("T_DO", "out", "Touch MISO (share)."), P("T_IRQ", "out", "Touch pen-down interrupt, active low.")] } },
"lcd1602-i2c": {
  name: "16x2 LCD + I2C backpack", short: "LCD", kind: "module", category: "displays", w: 260, h: 110, style: "green", pinOrderVaries: true, decor: [{ type: "panel", w: 200, h: 60 }],
  use: "Use it for two lines of big readable text (a thermostat, a counter) with just two signal wires.",
  info: "16x2 character LCD with a PCF8574 I2C backpack at 0x27 (or 0x3F). Needs 5 V for full contrast; the I2C lines are fine from a 3.3 V board. Gotcha: if it shows a row of blank boxes, turn the contrast trimmer on the backpack.",
  datasheet: "https://www.handsontec.com/dataspecs/module/I2C_1602_LCD.pdf", pins: { left: [GND(), VCC("5 V."), SDA(), SCL()] } },
"lcd2004-i2c": {
  name: "20x4 LCD + I2C backpack", short: "LCD 20x4", kind: "module", category: "displays", w: 300, h: 130, style: "green", pinOrderVaries: true, decor: [{ type: "panel", w: 240, h: 80 }],
  use: "Use it when two lines are not enough: four lines of 20 characters for menus and multi-sensor readouts.",
  info: "20x4 character LCD with a PCF8574 backpack at 0x27/0x3F, 5 V. Gotcha: same as the 16x2: contrast trimmer, and the LiquidCrystal_I2C library must be told 20 columns and 4 rows.",
  pins: { left: [GND(), VCC("5 V."), SDA(), SCL()] } },
"max7219-matrix": {
  name: "MAX7219 8x8 LED matrix", short: "MAX7219", kind: "module", category: "displays", w: 150, h: 150, style: "black", decor: [{ type: "panel", w: 100, h: 100 }],
  use: "Use it for scrolling text, pixel icons and simple animations; modules chain into a long display.",
  info: "8x8 LED matrix driven by a MAX7219 over a 3-wire SPI-like link, 5 V (works marginally at 3.3 V logic). Input pins on one edge, output on the other for chaining. Gotcha: each module can draw up to 300 mA at full brightness; set intensity low and power from 5 V, not the board's 3.3 V.",
  datasheet: "https://www.analog.com/media/en/technical-documentation/data-sheets/MAX7219-MAX7221.pdf",
  pins: { left: [VCC("5 V."), GND(), P("DIN", "in", "Data in (MOSI)."), P("CS", "in", "Load/chip select."), P("CLK", "in", "Clock.")], right: [VCC("5 V pass-through."), GND(), P("DOUT", "out", "Data out to the next module."), P("CS", "io", "CS pass-through."), P("CLK", "io", "Clock pass-through.")] } },
"tm1637": {
  name: "TM1637 4-digit display", short: "TM1637", kind: "module", category: "displays", w: 130, h: 70, style: "black", decor: [{ type: "panel", w: 90, h: 36 }],
  use: "Use it for a clock, a counter or a temperature readout with only two signal pins.",
  info: "Four 7-segment digits with a colon, driven by a TM1637 over a 2-wire protocol (CLK/DIO, not I2C). 3.3-5 V. Gotcha: the protocol looks like I2C but is not, so it cannot share the I2C bus; use the TM1637Display library.",
  pins: { bottom: [P("CLK", "in", "Clock."), P("DIO", "io", "Data."), VCC("3.3-5 V."), GND()] } },
"seg7-cc": {
  name: "7-segment digit (common cathode)", short: "7-seg", kind: "component", category: "displays", w: 130, h: 100, style: "#1c1c21", decor: [{ type: "panel", w: 40, h: 60 }],
  use: "Use it to show one digit directly from GPIOs when learning how displays work (or with a 74HC595).",
  info: "Single digit with segments a-g plus the decimal point; the two COM pins are the shared cathode (GND). Each segment needs its own 220-330 Ohm resistor from a GPIO. Gotcha: common-anode parts look identical but need COM on VCC and inverted logic.",
  pins: { top: [P("g", "in", "Segment g (middle)."), P("f", "in", "Segment f (top left)."), P("COM", "gnd", "Common cathode to GND."), P("a", "in", "Segment a (top)."), P("b", "in", "Segment b (top right).")],
    bottom: [P("e", "in", "Segment e (bottom left)."), P("d", "in", "Segment d (bottom)."), P("COM", "gnd", "Common cathode to GND."), P("c", "in", "Segment c (bottom right)."), P("DP", "in", "Decimal point.")] } },
"ws2812-strip": {
  name: "WS2812 LED strip (NeoPixel)", short: "Strip", kind: "module", category: "displays", w: 200, h: 70, style: "black",
  use: "Use it for colour-addressable lighting (effects, status bars, ambient light) controlled from one pin.",
  info: "Addressable RGB LEDs: 5 V power and one data line into DIN at the arrow end. Gotcha: 60 mA per LED at full white, so power from a proper 5 V supply with a common GND; 3.3 V data usually works for short runs, otherwise level-shift; put 330 Ohm in the data line and 1000 uF across the supply.",
  datasheet: "https://cdn-shop.adafruit.com/datasheets/WS2812B.pdf",
  pins: { left: [P("5V", "power", "5 V supply, not from the board's 3.3 V."), P("DIN", "in", "Data in (800 kHz single wire), at the arrow end of the strip."), GND("Ground, shared with the board.")] } },
"ws2812-ring": {
  name: "WS2812 LED ring", short: "Ring", kind: "module", category: "displays", w: 150, h: 150, style: "black", decor: [{ type: "screen" }],
  use: "Use it for a circular indicator (a clock, a volume dial, a halo around a button) with addressable colours.",
  info: "Ring of 8-24 WS2812 LEDs, 5 V, one data input; DOUT chains to another ring. Gotcha: the same current rule as strips (60 mA per LED at full white), and the first pixel is wherever the DIN pad sits, not at the top.",
  pins: { left: [P("5V", "power", "5 V supply."), P("DIN", "in", "Data in."), GND()], right: [P("DOUT", "out", "Data out to the next ring.")] } },
"epaper-213": {
  name: "2.13\" e-paper (Waveshare)", short: "e-paper", kind: "module", category: "displays", w: 220, h: 190, style: "#d9dde3", pinOrderVaries: true, decor: [{ type: "panel", w: 170, h: 70 }],
  use: "Use it for a display that keeps its image with zero power: labels, badges, weather dashboards that update every few minutes.",
  info: "250x122 black/white e-paper on SPI, 3.3 V, image stays without power. Gotcha: a full refresh takes ~2 s with flashing, partial refresh needs the matching driver version (V2/V3/V4 boards differ), and refreshing more than every few minutes shortens its life.",
  datasheet: "https://www.waveshare.com/wiki/2.13inch_e-Paper_HAT",
  pins: { left: [VCC("3.3 V."), GND(), P("DIN", "in", "SPI MOSI."), P("CLK", "in", "SPI clock."), P("CS", "in", "Chip select."), P("DC", "in", "Data/command."), P("RST", "in", "Reset."), P("BUSY", "out", "High while the panel refreshes; wait for it.")] } },
"nokia-5110": {
  name: "Nokia 5110 LCD (PCD8544)", short: "5110", kind: "module", category: "displays", w: 190, h: 170, style: "#2f6fd1", pinOrderVaries: true, decor: [{ type: "panel", w: 110, h: 90 }],
  use: "Use it for a cheap, sunlight-readable 84x48 monochrome screen that sips power; retro but handy.",
  info: "PCD8544 LCD on SPI, 3.3 V logic. Gotcha: red and blue boards use different pin orders (RST CE DC DIN CLK VCC LIGHT GND vs VCC GND SCE RST D/C DN SCLK LED), the contrast register must be tuned per unit, and 5 V boards need resistors or a level shifter.",
  pins: { bottom: [P("RST", "in", "Reset."), P("CE", "in", "Chip enable (CS)."), P("DC", "in", "Data/command."), P("DIN", "in", "SPI MOSI."), P("CLK", "in", "SPI clock."), VCC("3.3 V."), P("LIGHT", "in", "Backlight (to GND on some boards, VCC on others)."), GND()] } },

/* ===================== actuators & drivers ===================== */
"sg90-servo": {
  name: "SG90 micro servo", short: "Servo", kind: "module", category: "actuators", w: 120, h: 80, style: "#2f5f8a",
  use: "Use it to move something to an angle (a flag, a lid, a steering arm) with one PWM pin and no driver.",
  info: "Micro servo, 0-180 degrees, driven by a 50 Hz pulse of 1-2 ms. Power 4.8-6 V from 5 V/VIN, not from the board's 3.3 V regulator; a 3.3 V signal pin works. Gotcha: it draws 500+ mA when stalled, so share GND and use a solid 5 V source.",
  datasheet: "http://www.ee.ic.ac.uk/pcheung/teaching/DE1_EE/stores/sg90_datasheet.pdf",
  pins: { left: [GND("Ground (brown wire).", "GND"), P("VCC", "power", "4.8-6 V (red wire).", "red"), P("SIG", "in", "50 Hz PWM, 1-2 ms pulse (orange wire).", "orange")] } },
"mg996r-servo": {
  name: "MG996R servo", short: "MG996R", kind: "module", category: "actuators", w: 130, h: 90, style: "#1c1c21",
  use: "Use it when the SG90 is too weak: metal gears and ~10 kg·cm torque for robot arms and steering.",
  info: "Standard-size metal-gear servo, 4.8-7.2 V, same 50 Hz 1-2 ms control as the SG90. Gotcha: stall current reaches 2.5 A, so it needs its own supply (never a USB port) and a common GND with the board.",
  pins: { left: [GND("Ground (brown).", "GND"), P("VCC", "power", "4.8-7.2 V (red).", "red"), P("SIG", "in", "50 Hz PWM (orange).", "orange")] } },
"pca9685": {
  name: "PCA9685 16-channel PWM/servo driver", short: "PCA9685", kind: "module", category: "actuators", w: 220, h: 140, style: "blue", decor: [{ type: "chip", label: "PCA9685" }],
  use: "Use it to drive many servos or LEDs from two I2C pins; a hexapod or a 16-LED dimmer board.",
  info: "16 channels of 12-bit PWM over I2C at 0x40 (solder jumpers up to 0x7F), logic 3.3 or 5 V on VCC, servo power 5-6 V on V+ (screw terminal). Gotcha: V+ never comes from the board; feed it from a 5 V supply with a common GND and budget ~1 A per 4 servos.",
  datasheet: "https://www.nxp.com/docs/en/data-sheet/PCA9685.pdf",
  pins: { left: [GND(), P("OE", "in", "Output enable, active low (pulled down)."), SCL(), SDA(), VCC("Logic 3.3-5 V."), P("V+", "power", "Servo power 5-6 V (also on the screw terminal).")] } },
"l298n": {
  name: "L298N dual H-bridge", short: "L298N", kind: "module", category: "actuators", w: 180, h: 140, style: "#8a1c14", decor: [{ type: "chip", label: "L298N" }],
  use: "Use it to run two DC motors (or one stepper) forward and backward from a 6-12 V battery with any board.",
  info: "Dual H-bridge up to 2 A per channel, 5-35 V motor supply; with the 5V-EN jumper in place the on-board regulator gives 5 V out from 7-12 V in. Gotcha: it drops ~2 V (motors run slower than the supply), ENA/ENB jumpers mean full speed (remove them for PWM), and above 12 V pull the jumper and feed 5 V yourself.",
  pins: { top: [P("12V", "power", "Motor supply 5-35 V (screw)."), GND("Ground (screw)."), P("5V", "power", "5 V out (jumper on) or in (jumper off).")],
    left: [P("OUT1", "out", "Motor A terminal."), P("OUT2", "out", "Motor A terminal.")], right: [P("OUT3", "out", "Motor B terminal."), P("OUT4", "out", "Motor B terminal.")],
    bottom: [P("ENA", "in", "Enable A / PWM speed (jumper = always on)."), P("IN1", "in", "Direction A."), P("IN2", "in", "Direction A."), P("IN3", "in", "Direction B."), P("IN4", "in", "Direction B."), P("ENB", "in", "Enable B / PWM speed.")] } },
"tb6612fng": {
  name: "TB6612FNG motor driver", short: "TB6612", kind: "module", category: "actuators", w: 150, h: 220, style: "#8a1c14", decor: [{ type: "chip", label: "TB6612" }],
  use: "Use it instead of the L298N for small motors: MOSFET bridge, almost no voltage drop, tiny and cool.",
  info: "Dual H-bridge, 1.2 A per channel (3 A peak), motor supply 2.5-13.5 V on VM, logic 2.7-5.5 V on VCC. Gotcha: STBY must be pulled high or nothing moves; PWMA/PWMB take the speed, AIN1/AIN2 the direction.",
  datasheet: "https://toshiba.semicon-storage.com/info/TB6612FNG_datasheet_en_20141001.pdf",
  pins: { left: [P("VM", "power", "Motor supply 2.5-13.5 V."), VCC("Logic 2.7-5.5 V."), GND(), P("A01", "out", "Motor A terminal."), P("A02", "out", "Motor A terminal."), P("B02", "out", "Motor B terminal."), P("B01", "out", "Motor B terminal."), GND()],
    right: [P("PWMA", "in", "Speed A (PWM)."), P("AIN2", "in", "Direction A."), P("AIN1", "in", "Direction A."), P("STBY", "in", "Standby; HIGH to enable."), P("BIN1", "in", "Direction B."), P("BIN2", "in", "Direction B."), P("PWMB", "in", "Speed B (PWM)."), GND()] } },
"28byj-48-uln2003": {
  name: "28BYJ-48 stepper + ULN2003", short: "ULN2003", kind: "module", category: "actuators", w: 140, h: 150, style: "green", pinOrderVaries: true, decor: [{ type: "chip", label: "ULN2003" }],
  use: "Use it for slow, precise, cheap positioning (a dial, a camera pan, a curtain) with the stepper that ships with every kit.",
  info: "5 V unipolar stepper (2048 steps per turn with gearing) driven by a ULN2003 board; the motor plugs into the 5-pin socket. Gotcha: top speed is ~15 rpm, the coils draw ~240 mA (power from 5 V, not the board), and some libraries need the IN1-IN3-IN2-IN4 order to turn the right way.",
  pins: { left: [P("IN1", "in", "Coil phase 1."), P("IN2", "in", "Coil phase 2."), P("IN3", "in", "Coil phase 3."), P("IN4", "in", "Coil phase 4."), P("-", "gnd", "Ground."), P("+", "power", "5-12 V motor supply.")] } },
"a4988": {
  name: "A4988 stepper driver", short: "A4988", kind: "module", category: "actuators", w: 110, h: 220, style: "#8a1c14", decor: [{ type: "chip", label: "A4988" }],
  use: "Use it to run a NEMA17 bipolar stepper (3D printers, CNC) with just STEP and DIR pins.",
  info: "Bipolar stepper driver to 2 A (with cooling), 8-35 V motor supply, 3.3 or 5 V logic, up to 1/16 microstepping via MS1-3. Gotcha: set the current limit with the Vref pot BEFORE connecting a motor, put 100 uF across VMOT, tie RESET to SLEEP, and never unplug the motor while powered.",
  datasheet: "https://www.pololu.com/product/1182",
  pins: { left: [P("ENABLE", "in", "Low = enabled (pulled low)."), P("MS1", "in", "Microstep select 1."), P("MS2", "in", "Microstep select 2."), P("MS3", "in", "Microstep select 3."), P("RESET", "in", "Active low; tie to SLEEP."), P("SLEEP", "in", "Active low; tie to RESET."), P("STEP", "in", "One pulse = one (micro)step."), P("DIR", "in", "Direction.")],
    right: [P("VMOT", "power", "Motor supply 8-35 V + 100 uF."), GND("Motor ground."), P("2B", "out", "Coil 2."), P("2A", "out", "Coil 2."), P("1A", "out", "Coil 1."), P("1B", "out", "Coil 1."), P("VDD", "power", "Logic 3-5.5 V."), GND("Logic ground.")] } },
"drv8825": {
  name: "DRV8825 stepper driver", short: "DRV8825", kind: "module", category: "actuators", w: 110, h: 220, style: "purple", decor: [{ type: "chip", label: "DRV8825" }],
  use: "Use it as the A4988's stronger sibling: higher voltage, 1/32 microstepping, same footprint and wiring.",
  info: "Bipolar stepper driver to 2.2 A, 8.2-45 V, 1/32 microstepping, logic from 3.3 or 5 V STEP/DIR (no VDD pin). Gotcha: Vref = current / 2 (different from the A4988), the pot is at the opposite end so check orientation before dropping it into an A4988 socket, and FAULT is an output.",
  datasheet: "https://www.pololu.com/product/2133",
  pins: { left: [P("EN", "in", "Low = enabled."), P("M0", "in", "Microstep select 0."), P("M1", "in", "Microstep select 1."), P("M2", "in", "Microstep select 2."), P("RST", "in", "Active low; tie high."), P("SLP", "in", "Active low; tie high."), P("STEP", "in", "Step pulse."), P("DIR", "in", "Direction.")],
    right: [P("VMOT", "power", "Motor supply 8.2-45 V + 100 uF."), GND("Motor ground."), P("B2", "out", "Coil B."), P("B1", "out", "Coil B."), P("A1", "out", "Coil A."), P("A2", "out", "Coil A."), P("FAULT", "out", "Low on over-current/temperature."), GND("Logic ground.")] } },
"dc-motor": {
  name: "DC motor (brushed)", short: "Motor", kind: "component", category: "actuators", w: 70, h: 50, style: "#55575f",
  use: "Use it for wheels, fans and pumps; speed follows voltage, direction follows polarity, so pair it with an H-bridge.",
  info: "Two-wire brushed motor, 3-12 V typical, no polarity (swap the wires to reverse). Gotcha: never drive it straight from a GPIO; use a MOSFET or H-bridge with a flyback diode, and a 100 nF cap across the terminals cuts brush noise.",
  pins: { left: [P("M1", "io", "Motor terminal.")], right: [P("M2", "io", "Motor terminal.")] } },
"relay-1ch": {
  name: "1-channel relay module", short: "Relay", kind: "module", category: "actuators", w: 150, h: 110, style: "blue", pinOrderVaries: true,
  use: "Use it to switch a mains lamp, a pump or any load a transistor cannot, with isolation from the board.",
  info: "Single relay with an optocoupler/transistor driver; the switched side is on screw terminals. Coil needs 5 V (3.3 V versions exist). Gotcha: most are active LOW (IN low = relay on) and a 3.3 V pin may not switch a 5 V module reliably; look for a JD-VCC jumper or drive it through a transistor.",
  datasheet: "https://www.handsontec.com/dataspecs/module/1Ch-relay.pdf",
  pins: { left: [VCC("5 V (coil supply)."), GND(), P("IN", "in", "Control input; usually active low.")], right: [P("NO", "io", "Normally open contact (closed while the relay is on)."), P("COM", "io", "Common contact."), P("NC", "io", "Normally closed contact (open while the relay is on).")] } },
"relay-2ch": {
  name: "2-channel relay module", short: "Relay x2", kind: "module", category: "actuators", w: 170, h: 160, style: "blue", pinOrderVaries: true,
  use: "Use it to switch two independent loads (two lamps, a pump and a valve) from two GPIOs.",
  info: "Two 5 V relays with optocouplers, screw terminals for each contact set. Gotcha: active LOW inputs on most boards, a JD-VCC jumper separates relay power from logic power, and both relays on at once draw ~150 mA from 5 V.",
  pins: { left: [VCC("5 V."), GND(), P("IN1", "in", "Relay 1 control (active low)."), P("IN2", "in", "Relay 2 control (active low).")], right: [P("NO1", "io", "Relay 1 normally open."), P("COM1", "io", "Relay 1 common."), P("NC1", "io", "Relay 1 normally closed."), P("NO2", "io", "Relay 2 normally open."), P("COM2", "io", "Relay 2 common."), P("NC2", "io", "Relay 2 normally closed.")] } },
"relay-4ch": {
  name: "4-channel relay module", short: "Relay x4", kind: "module", category: "actuators", w: 190, h: 290, style: "blue", pinOrderVaries: true,
  use: "Use it for home-automation style switching of four loads, typically with an ESP board.",
  info: "Four 5 V relays with optocouplers and a JD-VCC jumper. Gotcha: active LOW inputs; with all four on it draws ~300 mA, so power the relays from a separate 5 V and keep the board's logic on VCC.",
  pins: { left: [VCC("Logic 5 V (3.3 V on some)."), GND(), P("IN1", "in", "Relay 1 (active low)."), P("IN2", "in", "Relay 2."), P("IN3", "in", "Relay 3."), P("IN4", "in", "Relay 4.")],
    right: [...[1, 2, 3, 4].flatMap(n => [P("NO" + n, "io", `Relay ${n} normally open.`), P("COM" + n, "io", `Relay ${n} common.`), P("NC" + n, "io", `Relay ${n} normally closed.`)])] } },
"irf520-module": {
  name: "IRF520 MOSFET module", short: "IRF520", kind: "module", category: "actuators", w: 130, h: 110, style: "blue", pinOrderVaries: true,
  use: "Use it to PWM a small 12 V load (LED strip, fan, heater) from one GPIO when a relay is too slow.",
  info: "N-channel MOSFET breakout: SIG from a GPIO switches the load between V+ and V-, up to 24 V. Gotcha: the IRF520 is not a logic-level MOSFET; with a 3.3 V gate it passes well under 1 A and gets hot, so for real current use an IRLZ44N or a logic-level module.",
  pins: { left: [P("SIG", "in", "Gate: PWM or digital."), VCC("Logic reference (3.3-5 V)."), GND()], right: [P("VIN+", "power", "Load supply + (screw)."), P("VIN-", "gnd", "Load supply - (screw)."), P("V+", "out", "To the load + (screw)."), P("V-", "out", "To the load - (screw).")] } },
"buzzer-active": {
  name: "Active buzzer", short: "Buzzer", kind: "component", category: "actuators", w: 50, h: 50, style: "#1c1c21",
  use: "Use it for a simple beep (alarm, confirmation) when you do not care about the pitch.",
  info: "Active buzzer: apply 3.3-5 V and it beeps at its own fixed tone (no PWM needed). Polarity matters: the longer leg or the + mark is positive. Gotcha: a passive buzzer looks identical but is silent on DC; it needs a tone() signal.",
  pins: { bottom: [P("+", "power", "Positive (longer leg / + mark); drive from a GPIO or through a transistor."), P("-", "gnd", "Negative.")] } },
"buzzer-passive": {
  name: "Passive buzzer", short: "Piezo buzzer", kind: "component", category: "actuators", w: 50, h: 50, style: "#1c1c21",
  use: "Use it to play melodies or different pitches with tone()/PWM; it is a tiny speaker.",
  info: "Piezo element without an oscillator: it only sounds when driven with a square wave (1-5 kHz loudest). 3.3-5 V. Gotcha: DC does nothing (that is the active buzzer), and drive it through a 100 Ohm resistor or a transistor for volume.",
  pins: { bottom: [P("+", "in", "Square wave / PWM in."), P("-", "gnd", "Negative.")] } },
"vibration-motor": {
  name: "Vibration motor (coin)", short: "Vibe", kind: "component", category: "actuators", w: 50, h: 50, style: "#55575f",
  use: "Use it for haptic feedback in wearables and controllers.",
  info: "Coin/pancake motor, 3 V at ~80 mA. Gotcha: too much for a GPIO; switch it with a transistor or MOSFET and add a flyback diode (or use a driver like the DRV2605).",
  pins: { bottom: [P("+", "power", "3 V via a transistor."), P("-", "gnd", "Negative.")] } },
"solenoid-5v": {
  name: "5 V push-pull solenoid", short: "Solenoid", kind: "component", category: "actuators", w: 70, h: 50, style: "#55575f",
  use: "Use it for a lock latch, a kick or a valve that needs a short strong push.",
  info: "Electromagnet plunger, 5-6 V at ~1 A while energised. Gotcha: never from a GPIO; use a MOSFET with a flyback diode across the coil, power it from a supply that can give 1 A, and keep on-time short (it heats fast).",
  pins: { left: [P("+", "power", "5-6 V via MOSFET.")], right: [P("-", "gnd", "Return to the MOSFET drain.")] } },
"water-pump-mini": {
  name: "Mini submersible water pump", short: "Pump", kind: "component", category: "actuators", w: 70, h: 50, style: "#2f6fd1",
  use: "Use it for plant watering and small fountains; a 3-6 V pump moves ~100 L/h.",
  info: "Brushed submersible pump, 3-6 V, 100-200 mA. Gotcha: drive it with a relay or MOSFET plus a flyback diode, keep it below the water line (it must not run dry), and it has no polarity protection.",
  pins: { left: [P("+", "power", "3-6 V via MOSFET/relay.")], right: [P("-", "gnd", "Return.")] } },

/* ===================== radio & comms ===================== */
"hc-05": {
  name: "HC-05 Bluetooth serial", short: "HC-05", kind: "module", category: "radio", w: 130, h: 170, style: "blue", pinOrderVaries: true, decor: [{ type: "chip", label: "HC-05" }],
  use: "Use it to talk to an Android phone or a PC over classic Bluetooth as if it were a serial cable.",
  info: "Classic Bluetooth SPP serial bridge (pairs with phones and PCs, not with iOS BLE). VCC 3.6-6 V, 9600 baud by default. Gotcha: RXD is a 3.3 V input (use a divider from a 5 V board), TXD into the board's RX is fine; hold EN high at power-up for AT mode at 38400 baud.",
  datasheet: "https://components101.com/wireless/hc-05-bluetooth-module",
  pins: { left: [P("EN", "in", "AT-command mode when high at power-up (also called KEY); leave open normally."), VCC("3.6-6 V (5 V typical)."), GND(), P("TXD", "out", "Serial out, 3.3 V: to the board's RX."), P("RXD", "in", "Serial in, 3.3 V tolerant only: from the board's TX (divider from 5 V)."), P("STATE", "out", "High while connected.")] } },
"hc-06": {
  name: "HC-06 Bluetooth serial (slave)", short: "HC-06", kind: "module", category: "radio", w: 130, h: 130, style: "blue", pinOrderVaries: true, decor: [{ type: "chip", label: "HC-06" }],
  use: "Use it as the cheapest classic-Bluetooth serial link when the module only needs to be connected to (slave only).",
  info: "Slave-only SPP module, 3.6-6 V, 9600 baud, AT commands without line endings while unpaired. Gotcha: like the HC-05, RXD is 3.3 V only; it cannot initiate connections and does not work with iPhones.",
  pins: { left: [VCC("3.6-6 V."), GND(), P("TXD", "out", "Serial out, 3.3 V."), P("RXD", "in", "Serial in, 3.3 V only (divider from 5 V).")] } },
"hm-10": {
  name: "HM-10 BLE serial", short: "HM-10", kind: "module", category: "radio", w: 130, h: 170, style: "blue", pinOrderVaries: true, decor: [{ type: "chip", label: "CC2541" }],
  use: "Use it for a serial-over-BLE link that also works with iPhones and modern Android apps.",
  info: "BLE 4.0 UART bridge (CC2541), 3.3 V logic, 5 V tolerant VCC on breakouts, 9600 baud, AT commands. Gotcha: many clones (MLT-BT05, CC41-A, BT05) answer different AT commands and firmware; RXD needs a divider from a 5 V board.",
  pins: { left: [P("STATE", "out", "High while connected."), P("RXD", "in", "Serial in, 3.3 V."), P("TXD", "out", "Serial out."), GND(), VCC("3.3-6 V (breakout)."), P("EN", "in", "Break/enable; leave open.", "BRK")] } },
"esp-01": {
  name: "ESP-01 (ESP8266)", short: "ESP-01", kind: "module", category: "radio", w: 190, h: 110, style: "black", decor: [{ type: "chip", label: "ESP8266" }],
  use: "Use it to add Wi-Fi to an Arduino over serial (AT firmware) or as a 2-GPIO Wi-Fi node of its own.",
  info: "The tiny 8-pin ESP8266 board, 3.3 V ONLY, 2x4 header drawn here as one row (GND GPIO2 GPIO0 RX / TX EN RST VCC). Gotcha: 300 mA peaks (an Arduino's 3.3 V pin cannot feed it), EN must be high to run, GPIO0 low at power-up to flash.",
  pins: { bottom: [GND(), P("GPIO2", "io", "GPIO2 (LED on some); must be high at boot."), P("GPIO0", "io", "GPIO0; low at boot = flash mode."), P("RX", "in", "UART RX, 3.3 V."), P("TX", "out", "UART TX."), P("EN", "in", "Chip enable; tie high (10 k to VCC).", "CH_PD"), P("RST", "in", "Reset, active low."), VCC("3.3 V only, 300 mA.")] } },
"lora-sx1278": {
  name: "LoRa SX1278 / RFM95 (Ra-02)", short: "LoRa", kind: "module", category: "radio", w: 160, h: 160, style: "black", pinOrderVaries: true, decor: [{ type: "chip", label: "SX1278" }],
  use: "Use it for kilometres of low-rate radio (sensor telemetry, remote switches) without any network.",
  info: "SPI LoRa transceiver, 3.3 V ONLY, 433/868/915 MHz depending on the variant (match your region). Gotcha: always attach the antenna before powering (transmitting without one kills the PA), budget 120 mA on TX, and DIO0 is needed for RX-done interrupts in most libraries.",
  datasheet: "https://www.semtech.com/products/wireless-rf/lora-connect/sx1278",
  pins: { left: [P("3V3", "power", "3.3 V only, 120 mA peaks."), GND(), P("RST", "in", "Reset, active low."), P("DIO0", "out", "TX/RX done interrupt."), P("DIO1", "out", "Timeout interrupt (optional)."), P("DIO2", "out", "Optional.")],
    right: [P("NSS", "in", "SPI chip select."), P("SCK", "in", "SPI clock."), P("MOSI", "in", "SPI data in."), P("MISO", "out", "SPI data out."), GND(), P("ANT", "io", "Antenna (u.FL or spring).")] } },
"sim800l": {
  name: "SIM800L GSM/GPRS", short: "SIM800L", kind: "module", category: "radio", w: 150, h: 170, style: "#8a1c14", pinOrderVaries: true, decor: [{ type: "chip", label: "SIM800L" }],
  use: "Use it to send SMS or make a 2G data connection from anywhere with a SIM card (alarms, remote relays).",
  info: "2G GSM/GPRS modem over serial at 9600-115200 baud. Gotcha: it needs 3.4-4.4 V (a LiPo cell or a 4 V buck, NOT 5 V and NOT 3.3 V) with 2 A bursts (1000 uF across VCC/GND), its RXD is 2.8 V logic (divider), and 2G networks are switched off in many countries.",
  pins: { left: [P("NET", "io", "Antenna / network LED."), VCC("3.4-4.4 V, 2 A bursts."), P("RST", "in", "Reset, active low."), P("RXD", "in", "Serial in, 2.8 V logic (divider)."), P("TXD", "out", "Serial out."), GND()],
    right: [P("RING", "out", "Ring indicator."), P("DTR", "in", "Sleep control."), P("MIC+", "in", "Microphone +."), P("MIC-", "in", "Microphone -."), P("SPK+", "out", "Speaker +."), P("SPK-", "out", "Speaker -.")] } },
"rc522": {
  name: "RC522 RFID reader", short: "RC522", kind: "module", category: "radio", w: 150, h: 200, style: "blue", decor: [{ type: "chip", label: "MFRC522" }],
  use: "Use it to read 13.56 MHz cards and key fobs for door locks, attendance and toy NFC.",
  info: "MFRC522 reader on SPI, 3.3 V on VCC (never 5 V); its logic pins survive 5 V boards in practice. Gotcha: SDA is the SPI chip select (not I2C), IRQ is optional, and the antenna reads only a few centimetres.",
  datasheet: "https://www.nxp.com/docs/en/data-sheet/MFRC522.pdf",
  pins: { left: [P("SDA", "in", "SPI chip select (SS).", "SS"), P("SCK", "in", "SPI clock."), P("MOSI", "in", "SPI data in."), P("MISO", "out", "SPI data out."), P("IRQ", "out", "Interrupt; optional."), GND(), P("RST", "in", "Reset, active low."), P("3.3V", "power", "3.3 V only.")] } },
"vs1838b": {
  name: "VS1838B IR receiver", short: "IR rx", kind: "component", category: "radio", w: 74, h: 44, style: "#1c1c21",
  use: "Use it to control a project with any TV remote; one pin, IRremote library.",
  info: "38 kHz infrared receiver with demodulated output, 2.7-5.5 V. Dome facing you, legs down: OUT, GND, VCC. Gotcha: output is active low; keep it away from sunlight and LED strips (noise), and add a 100 nF cap on VCC.",
  pins: { bottom: [P("OUT", "out", "Demodulated signal, active low."), GND(), VCC("2.7-5.5 V.")] } },
"rf433-tx": {
  name: "433 MHz transmitter (FS1000A)", short: "433 TX", kind: "module", category: "radio", w: 70, h: 90, style: "green", pinOrderVaries: true,
  use: "Use it for the cheapest one-way wireless (a remote button, a sensor beacon) with the rc-switch or RadioHead library.",
  info: "ASK/OOK transmitter, 3-12 V (more volts = more range), data pin from any GPIO. Gotcha: solder a 17.3 cm wire antenna or the range is centimetres, and there is no error checking: send each message a few times.",
  pins: { bottom: [P("DATA", "in", "Data in."), VCC("3-12 V."), GND()] } },
"rf433-rx": {
  name: "433 MHz receiver (MX-RM-5V)", short: "433 RX", kind: "module", category: "radio", w: 110, h: 90, style: "green", pinOrderVaries: true,
  use: "Use it with the 433 MHz transmitter to receive those simple one-way messages.",
  info: "Super-regenerative receiver, 5 V only, two DATA pins in parallel. Gotcha: noisy output when nothing is sent (libraries filter it), 5 V logic out (divider for 3.3 V boards), and the same 17.3 cm antenna rule.",
  pins: { bottom: [VCC("5 V."), P("DATA", "out", "Received data (5 V level)."), P("DATA", "out", "Same signal, second pin."), GND()] } },
"mcp2515": {
  name: "MCP2515 CAN bus module", short: "MCP2515", kind: "module", category: "radio", w: 150, h: 180, style: "blue", decor: [{ type: "chip", label: "MCP2515" }],
  use: "Use it to read or send CAN frames (cars via OBD-II, industrial buses) over SPI.",
  info: "MCP2515 controller + TJA1050 transceiver on SPI, 5 V module (the transceiver needs 5 V). Gotcha: SO (MISO) is 5 V logic, so divide it for a 3.3 V board (or cut the 5 V trace and feed VCC 3.3 V to the MCP2515); set the 8 MHz crystal in the library and the J1 120 Ohm terminator at bus ends.",
  datasheet: "https://ww1.microchip.com/downloads/en/DeviceDoc/MCP2515-Stand-Alone-CAN-Controller-with-SPI-20001801J.pdf",
  pins: { left: [P("INT", "out", "Message interrupt, active low."), P("SCK", "in", "SPI clock."), P("SI", "in", "SPI MOSI.", "MOSI"), P("SO", "out", "SPI MISO (5 V level).", "MISO"), P("CS", "in", "Chip select."), GND(), VCC("5 V.")], right: [P("CAN_H", "io", "CAN high (screw)."), P("CAN_L", "io", "CAN low (screw).")] } },
"max485": {
  name: "MAX485 RS-485 module", short: "MAX485", kind: "module", category: "radio", w: 130, h: 120, style: "blue", decor: [{ type: "chip", label: "MAX485" }],
  use: "Use it for long wired serial links (Modbus sensors, DMX, 100 m of twisted pair) from a UART.",
  info: "TTL-to-RS-485 transceiver, 5 V (3.3 V versions exist), half duplex: tie RE and DE together and drive them high to transmit. Gotcha: A/B polarity matters, 120 Ohm termination at each bus end, and the receiver output RO is 5 V logic on 5 V modules.",
  pins: { left: [P("RO", "out", "Receiver out to the board's RX."), P("RE", "in", "Receiver enable (active low)."), P("DE", "in", "Driver enable (active high); tie to RE."), P("DI", "in", "Driver in from the board's TX.")], right: [VCC("5 V."), P("B", "io", "RS-485 B (-)."), P("A", "io", "RS-485 A (+)."), GND()] } },
"w5500-lite": {
  name: "W5500 Ethernet module", short: "W5500", kind: "module", category: "radio", w: 150, h: 220, style: "blue", pinOrderVaries: true, decor: [{ type: "chip", label: "W5500" }],
  use: "Use it for wired Ethernet where Wi-Fi is unreliable or forbidden; the Ethernet library drives it over SPI.",
  info: "Hardwired TCP/IP chip with a MagJack, SPI up to 80 MHz, 3.3 V (some boards also take 5 V into an LDO), ~130 mA. Gotcha: hold RST low briefly at boot on some boards, and the SPI bus must not share a non-tri-stated display.",
  pins: { left: [P("3V3", "power", "3.3 V, 150 mA."), GND(), P("MOSI", "in", "SPI data in."), P("MISO", "out", "SPI data out."), P("SCK", "in", "SPI clock."), P("SCS", "in", "Chip select.", "CS"), P("INT", "out", "Interrupt (optional)."), P("RST", "in", "Reset, active low.")] } },
"neo-6m-gps": {
  name: "NEO-6M GPS", short: "GPS", kind: "module", category: "radio", w: 150, h: 110, style: "blue", pinOrderVaries: true, decor: [{ type: "chip", label: "NEO-6M" }],
  use: "Use it to know where (and when) the project is: position, speed and UTC time over a serial port.",
  info: "u-blox NEO-6M GPS on a serial port, 9600 baud NMEA by default. 3.3-5 V in (regulator on board), 3.3 V logic. Gotcha: needs open sky; the first fix after power-up takes 1-5 min, and the module's RX goes to the board's TX.",
  datasheet: "https://content.u-blox.com/sites/default/files/products/documents/NEO-6_DataSheet_%28GPS.G6-HW-09005%29.pdf",
  pins: { left: [VCC("3.3-5 V in."), P("RX", "in", "Serial in: connect to the board's TX (only needed to configure the module)."), P("TX", "out", "Serial out (NMEA sentences): connect to the board's RX."), GND()] } },
"gy-neo-m8n": {
  name: "GY-NEO-M8N GPS", short: "M8N", kind: "module", category: "radio", w: 150, h: 110, style: "blue", pinOrderVaries: true, decor: [{ type: "chip", label: "NEO-M8N" }],
  use: "Use it when the NEO-6M is too slow or weak: faster fixes, GLONASS/Galileo, 10 Hz updates for vehicles and drones.",
  info: "u-blox NEO-M8N module (often with a compass on the same board), serial 9600 baud NMEA, 3.3-5 V in, 3.3 V logic. Gotcha: many are clones with fake chips; configure with u-center over the serial port, and the battery-backed clock only helps if the small cell is charged.",
  pins: { left: [VCC("3.3-5 V in."), GND(), P("TX", "out", "NMEA out: to the board's RX."), P("RX", "in", "Config in: from the board's TX.")] } },
"nrf24l01": {
  name: "nRF24L01 2.4 GHz radio", short: "nRF24", kind: "module", category: "radio", w: 220, h: 110, style: "black", decor: [{ type: "chip", label: "nRF24L01" }],
  use: "Use it for fast short-range links between two boards (remote controls, sensor networks) without Wi-Fi.",
  info: "2.4 GHz transceiver on SPI. 3.3 V ONLY on VCC (5 V kills it); the SPI inputs tolerate 5 V logic. Gotcha: it needs a 10-100 uF capacitor across VCC/GND right at the module, and its 2x4 header is drawn here as one row in pin order (pin 1 = GND, the square pad).",
  datasheet: "https://www.sparkfun.com/datasheets/Components/SMD/nRF24L01Pluss_Preliminary_Product_Specification_v1_0.pdf",
  pins: { bottom: [GND("Pin 1 (square pad). Ground."), VCC("Pin 2. 3.3 V only."), P("CE", "in", "Pin 3. Chip enable (TX/RX mode)."), P("CSN", "in", "Pin 4. SPI chip select, active low."), P("SCK", "in", "Pin 5. SPI clock."), P("MOSI", "in", "Pin 6. SPI data in."), P("MISO", "out", "Pin 7. SPI data out."), P("IRQ", "out", "Pin 8. Interrupt, active low; optional.")] } },

/* ===================== power ===================== */
"tp4056": {
  name: "TP4056 Li-ion charger", short: "Charger", kind: "module", category: "power", w: 120, h: 120, style: "blue", decor: [{ type: "usb" }],
  use: "Use it to charge a single Li-ion/LiPo cell from USB and protect it from over-discharge.",
  info: "Li-ion charger with protection (TP4056 + DW01). Charge from USB or IN+/IN-, battery on B+/B-, load on OUT+/OUT-. Gotcha: OUT is the battery voltage (3.0-4.2 V), not 5 V, and the default 1 A charge current is too high for small cells (change R3; 5 kOhm = about 250 mA).",
  datasheet: "https://dlnmh9ip6v2uc.cloudfront.net/datasheets/Prototyping/TP4056.pdf",
  pins: { left: [P("IN+", "power", "5 V in (alternative to the USB jack)."), P("IN-", "gnd", "Input ground.")], right: [P("B+", "power", "Battery +."), P("B-", "gnd", "Battery -."), P("OUT+", "power", "Protected output, battery voltage."), P("OUT-", "gnd", "Output ground.")] } },
"buck-mp1584": {
  name: "Buck converter (MP1584 / LM2596)", short: "Buck", kind: "module", category: "power", w: 130, h: 80, style: "blue",
  use: "Use it to make 5 V or 3.3 V from a 7-24 V battery or adapter efficiently (no heat like a linear regulator).",
  info: "Step-down regulator module; the trimmer sets the output voltage. Gotcha: set and measure the output with a multimeter BEFORE connecting the load (new boards sit at a random voltage); the LM2596 needs about 1.5 V more in than out and cannot step up.",
  datasheet: "https://www.monolithicpower.com/en/mp1584.html",
  pins: { left: [P("IN+", "power", "4.5-28 V in."), P("IN-", "gnd", "Input ground.")], right: [P("OUT+", "power", "Regulated output (set with the trimmer)."), P("OUT-", "gnd", "Output ground (same net as IN-).")] } },
"mt3608": {
  name: "MT3608 boost converter", short: "Boost", kind: "module", category: "power", w: 130, h: 80, style: "blue",
  use: "Use it to get 5 V (or up to 28 V) from a single LiPo or two AA cells.",
  info: "Step-up module, 2-24 V in, output up to 28 V, 2 A switch (about 1 A at 5 V from a LiPo). Gotcha: the trimmer needs ~10 turns before the output starts changing, output must be above input (it cannot buck), and set it with no load attached.",
  pins: { left: [P("VIN+", "power", "2-24 V in."), P("VIN-", "gnd", "Input ground.")], right: [P("VOUT+", "power", "Set output, up to 28 V."), P("VOUT-", "gnd", "Output ground.")] } },
"ams1117-33": {
  name: "AMS1117 3.3 V regulator module", short: "AMS1117", kind: "module", category: "power", w: 90, h: 60, style: "#8a1c14",
  use: "Use it to feed 3.3 V parts (ESP-01, radios, sensors) from a 5 V supply when the board's own 3.3 V pin is too weak.",
  info: "Linear 3.3 V regulator, 4.75-12 V in, up to 800 mA with a 1.1 V dropout. Gotcha: it burns (Vin - 3.3) x I as heat, so from 12 V keep the load under ~300 mA; add 10 uF on in and out.",
  pins: { bottom: [P("VIN", "power", "4.75-12 V in."), GND(), P("VOUT", "power", "3.3 V out.")] } },
"lm7805": {
  name: "LM7805 5 V regulator", short: "7805", kind: "component", category: "power", w: 80, h: 50, style: "#1c1c21",
  use: "Use it for a simple, robust 5 V rail from a 9-12 V battery or adapter when efficiency does not matter.",
  info: "Linear 5 V regulator in a TO-220, 7-35 V in, 1 A with a heatsink. Label facing you, legs down: IN, GND, OUT. Gotcha: needs ~2 V of headroom and 0.33 uF / 0.1 uF caps on in/out; from 12 V it gets hot above ~300 mA.",
  datasheet: "https://www.ti.com/lit/ds/symlink/lm340.pdf",
  pins: { bottom: [P("IN", "power", "7-35 V in."), GND(), P("OUT", "power", "5 V out.")] } },
"18650-holder": {
  name: "18650 battery holder", short: "18650", kind: "module", category: "power", w: 160, h: 60, style: "#1c1c21",
  use: "Use it for a rechargeable 3.7 V cell with real capacity (2000-3500 mAh) in portable projects.",
  info: "Holder for one 18650 Li-ion cell, 3.0-4.2 V. Gotcha: pair it with a TP4056 (charging + protection), mind the + / - marks (a reversed cell can burn), and buy cells from a known brand.",
  pins: { left: [P("+", "power", "Cell positive, 3.0-4.2 V.")], right: [P("-", "gnd", "Cell negative.")] } },
"lipo-1s": {
  name: "1S LiPo cell (JST-PH)", short: "LiPo", kind: "module", category: "power", w: 110, h: 70, style: "#55575f",
  use: "Use it for the thinnest, lightest rechargeable power for wearables and boards with a JST battery connector.",
  info: "Single-cell lithium polymer, 3.7 V nominal (4.2 V full, 3.0 V empty), JST-PH 2-pin plug. Gotcha: the plug's polarity differs between vendors (check red = + before plugging into a board), never discharge below 3.0 V, and never puncture it.",
  pins: { left: [P("+", "power", "Red wire, 3.0-4.2 V.")], right: [P("-", "gnd", "Black wire.")] } },
"battery-9v-clip": {
  name: "9 V battery clip", short: "9V", kind: "module", category: "power", w: 90, h: 70, style: "#1c1c21",
  use: "Use it to feed VIN on an Uno/Nano for a quick portable test; fine for small loads, poor for Wi-Fi boards.",
  info: "Snap connector for a 9 V block, red = +, black = -. Gotcha: a 9 V alkaline holds only ~500 mAh and sags under load, so it will not run motors or Wi-Fi for long; it goes to VIN/RAW, never to 5 V or 3.3 V pins.",
  pins: { left: [P("+", "power", "Red, 9 V.")], right: [P("-", "gnd", "Black.")] } },
"usb-c-breakout": {
  name: "USB-C breakout", short: "USB-C", kind: "module", category: "power", w: 140, h: 90, style: "black", decor: [{ type: "usb" }],
  use: "Use it to power a project from any USB-C charger or expose the data lines to a bare chip.",
  info: "USB-C receptacle on a board with VBUS, GND, D+, D- and the CC pins. Gotcha: a C-to-C cable only supplies 5 V when CC1 and CC2 each have a 5.1 kOhm pull-down to GND (cheap breakouts omit them, so only A-to-C cables work).",
  pins: { bottom: [P("VBUS", "power", "5 V from the charger."), GND(), P("D+", "io", "USB data +."), P("D-", "io", "USB data -."), P("CC1", "io", "Config channel 1 (5.1 k to GND for sink)."), P("CC2", "io", "Config channel 2 (5.1 k to GND).")] } },
"switch-slide": {
  name: "Slide switch (SPDT)", short: "Switch", kind: "component", category: "power", w: 70, h: 30, style: "#55575f",
  use: "Use it as a power switch or a mode selector; the middle pin is common.",
  info: "Single-pole double-throw slide switch: the centre pin connects to one outer pin or the other. Gotcha: rated for small currents (~300 mA); switch the input of a regulator, not a motor.",
  pins: { bottom: [P("1", "io", "Position A."), P("2", "io", "Common (middle)."), P("3", "io", "Position B.")] } },
"diode-1n4007": {
  name: "1N4007 diode", short: "1N4007", kind: "component", category: "power", w: 60, h: 20, style: "#1c1c21",
  use: "Use it as a flyback diode across relays and motors, or to block reversed supplies.",
  info: "General-purpose rectifier, 1 A, 1000 V, ~0.7 V drop, slow. The band marks the cathode (K). Gotcha: too slow for switching regulators; use a Schottky there.",
  pins: { left: [P("A", "in", "Anode (current enters).")], right: [P("K", "out", "Cathode (band).")] } },
"diode-1n5819": {
  name: "1N5819 Schottky diode", short: "1N5819", kind: "component", category: "power", w: 60, h: 20, style: "#1c1c21",
  use: "Use it where the 0.7 V of a normal diode is too much: reverse-polarity protection, OR-ing two supplies, buck converters.",
  info: "Schottky, 1 A, 40 V, ~0.3 V drop, fast. Band = cathode. Gotcha: more leakage than a silicon diode and only 40 V.",
  pins: { left: [P("A", "in", "Anode.")], right: [P("K", "out", "Cathode (band).")] } },
"zener-5v1": {
  name: "Zener diode (5.1 V)", short: "Zener", kind: "component", category: "power", w: 60, h: 20, style: "#1c1c21",
  use: "Use it to clamp or crudely regulate a voltage (protect an input, derive a reference) with a series resistor.",
  info: "Reverse-biased it holds its zener voltage (e.g. 5.1 V) once current flows through a series resistor. Band = cathode (goes to the positive side). Gotcha: it needs a few mA to regulate and cannot supply real load current.",
  pins: { left: [P("A", "io", "Anode (to the lower potential).")], right: [P("K", "io", "Cathode (band, to the higher potential).")] } },
"fuse-holder": {
  name: "Fuse holder", short: "Fuse", kind: "component", category: "power", w: 70, h: 24, style: "#55575f",
  use: "Use it on the battery lead of anything with motors or LiPos so a short blows a fuse instead of a wire.",
  info: "Inline or PCB holder for a 5x20 mm glass fuse; pick a fast-blow rating ~1.5x the normal current. Gotcha: a resettable polyfuse is friendlier for low-current boards.",
  pins: { left: [NP("1")], right: [NP("2")] } },

/* ===================== passives ===================== */
"led": {
  name: "LED", short: "LED", kind: "component", category: "passives", w: 44, h: 54, style: "#8a1c14",
  use: "Use it as the universal indicator: power, status, blink tests; add a resistor and it lasts forever.",
  info: "Standard 5 mm LED. Current flows from A (anode, long leg) to K (cathode, short leg, flat edge). Gotcha: always add a series resistor, 220-330 Ohm on 3.3 V or 5 V.",
  pins: { bottom: [P("A", "in", "Anode (+), the long leg; connect through the series resistor.", "long"), P("K", "gnd", "Cathode (-), the short leg / flat edge; to GND.", "short")] } },
"resistor": {
  name: "Resistor", short: "R", kind: "component", category: "passives", w: 70, h: 26, style: "#5b4a2f",
  use: "Use it to limit LED current, pull a pin up or down, or divide a voltage; the most used part of all.",
  info: "Fixed resistor, no polarity. Put the value in the part's name (e.g. 220 Ohm). Gotcha: colour bands: 220 Ohm = red-red-brown, 4.7 kOhm = yellow-violet-red, 10 kOhm = brown-black-orange.",
  pins: { left: [NP("1")], right: [NP("2")] } },
"cap-ceramic": {
  name: "Ceramic capacitor", short: "C", kind: "component", category: "passives", w: 46, h: 36, style: "#d8c7a1",
  use: "Use a 100 nF one next to every chip's VCC pin to kill noise (decoupling); it fixes many 'random reset' problems.",
  info: "Small non-polarised capacitor, pF to a few uF; code 104 = 100 nF, 103 = 10 nF. Gotcha: no polarity, but keep the leads short and place it as close to the chip as possible.",
  pins: { bottom: [NP("1"), NP("2")] } },
"cap-electrolytic": {
  name: "Electrolytic capacitor", short: "C el.", kind: "component", category: "passives", w: 44, h: 60, style: "#1c3a6b",
  use: "Use 100-1000 uF across a supply to smooth it for motors, LED strips, radios and servos.",
  info: "Polarised bulk capacitor, 1-4700 uF; the stripe marks the negative lead (the longer leg is +). Gotcha: reversed polarity or over-voltage makes it vent or pop; choose a voltage rating at least 1.5x the supply.",
  pins: { bottom: [P("+", "power", "Positive (longer leg)."), P("-", "gnd", "Negative (stripe).")] } },
"transistor-2n2222": {
  name: "2N2222 NPN transistor", short: "2N2222", kind: "component", category: "passives", w: 74, h: 44, style: "#1c1c21", pinOrderVaries: true,
  use: "Use it to switch a small load (relay coil, buzzer, LED string up to ~500 mA) from a GPIO through a base resistor.",
  info: "General-purpose NPN, 800 mA, 40 V. The TO-92 PN2222A reads E-B-C with the flat face toward you, but some makers ship C-B-E. Gotcha: check the datasheet for your exact part, use ~1 kOhm on the base from a GPIO, and add a flyback diode for coils.",
  pins: { bottom: [P("E", "gnd", "Emitter (to GND for low-side switching)."), P("B", "in", "Base, via ~1 kOhm."), P("C", "io", "Collector (to the load).")] } },
"transistor-bc547": {
  name: "BC547 NPN transistor", short: "BC547", kind: "component", category: "passives", w: 74, h: 44, style: "#1c1c21",
  use: "Use it for small signal switching and amplification (LEDs, logic level shifting, 100 mA loads).",
  info: "Small NPN, 100 mA, 45 V, high gain. Flat face toward you, legs down: C, B, E. Gotcha: 100 mA max, so no relays or motors; the BC337 is its 800 mA brother.",
  pins: { bottom: [P("C", "io", "Collector."), P("B", "in", "Base via 1-10 kOhm."), P("E", "gnd", "Emitter.")] } },
"mosfet-irlz44n": {
  name: "IRLZ44N logic-level MOSFET", short: "IRLZ44N", kind: "component", category: "passives", w: 80, h: 50, style: "#1c1c21",
  use: "Use it to PWM big loads (LED strips, heaters, motors to tens of amps) straight from a 3.3 V or 5 V pin.",
  info: "Logic-level N-channel MOSFET in a TO-220, 47 A, 55 V, fully on at 3.3 V gate. Label facing you, legs down: G, D, S. Gotcha: 100 Ohm gate resistor plus 10 kOhm gate pull-down, flyback diode for inductive loads, heatsink above ~10 A.",
  datasheet: "https://www.infineon.com/dgdl/irlz44npbf.pdf?fileId=5546d462533600a40153567217c32725",
  pins: { bottom: [P("G", "in", "Gate (PWM via 100 Ohm)."), P("D", "io", "Drain (to the load)."), P("S", "gnd", "Source (to GND).")] } },
"pc817": {
  name: "PC817 optocoupler", short: "PC817", kind: "component", category: "passives", w: 70, h: 60, style: "#1c1c21",
  use: "Use it to pass a signal between two circuits that must not share a ground (mains-side sensing, isolating a noisy motor driver).",
  info: "DIP-4 optocoupler: an LED (pins 1-2) lights a phototransistor (pins 4-3). Drive the LED with ~10 mA (220-330 Ohm from 5 V); the output switches up to 50 mA / 35 V. Gotcha: it is slow (tens of us) and the output needs its own pull-up on the isolated side.",
  pins: { left: [P("1", "in", "LED anode (A).", "A"), P("2", "gnd", "LED cathode (K).", "K")], right: [P("4", "io", "Phototransistor collector (C).", "C"), P("3", "io", "Phototransistor emitter (E).", "E")] } },
"piezo-disc": {
  name: "Piezo disc", short: "Piezo", kind: "component", category: "passives", w: 60, h: 60, style: "#d9a93c", decor: [{ type: "screen" }],
  use: "Use it as a knock/vibration sensor on an analog pin, or as a tiny speaker with PWM.",
  info: "Brass disc with a ceramic element: it makes a voltage spike when struck and buzzes when driven. Gotcha: as a sensor put 1 MOhm across it and a 5.1 V zener to protect the ADC; the spikes can exceed 20 V.",
  pins: { bottom: [P("+", "io", "Ceramic side (red wire)."), P("-", "gnd", "Brass side (black wire).")] } },
"crystal-16mhz": {
  name: "16 MHz crystal", short: "XTAL", kind: "component", category: "passives", w: 60, h: 24, style: "#cfd5dc",
  use: "Use it with two 22 pF caps when running a bare ATmega328P on a breadboard at 16 MHz.",
  info: "Quartz crystal, no polarity, between XTAL1 and XTAL2 with a 22 pF cap from each leg to GND. Gotcha: keep it within a centimetre of the chip; a 16 MHz crystal needs 5 V on an AVR (3.3 V boards use 8 MHz).",
  pins: { left: [NP("1")], right: [NP("2")] } },

/* ===================== interface ===================== */
"button-tactile": {
  name: "Tactile push button", short: "Button", kind: "component", category: "interface", w: 56, h: 56, style: "#2b3a4e",
  use: "Use it for any momentary input (menu, reset, mode) with INPUT_PULLUP and no extra parts.",
  info: "4-leg tactile push button. The two legs on the same side of the body are one contact; pressing joins the two sides. Gotcha: if it reads pressed all the time you used two legs of the same side; rotate it 90 degrees (straddle the breadboard gap and wire across it).",
  pins: { left: [P("1", "io", "Contact A (same as 2)."), P("2", "io", "Contact A (same as 1).")], right: [P("3", "io", "Contact B (same as 4)."), P("4", "io", "Contact B (same as 3).")] } },
"potentiometer": {
  name: "Potentiometer", short: "Pot", kind: "component", category: "interface", w: 70, h: 60, style: "#2f5f8a",
  use: "Use it as a knob: brightness, volume, speed, a threshold you tune by hand.",
  info: "Variable resistor: ends 1 and 3 across 3V3 and GND, the wiper (2) gives 0-3.3 V to an ADC pin. Gotcha: never put 5 V across it when reading with a 3.3 V board's ADC.",
  pins: { bottom: [P("1", "io", "One end of the track."), P("2", "out", "Wiper: 0-100 % of the voltage across 1 and 3.", "wiper"), P("3", "io", "Other end of the track.")] } },
"pot-slide": {
  name: "Slide potentiometer", short: "Slider", kind: "component", category: "interface", w: 120, h: 30, style: "#2f5f8a",
  use: "Use it as a fader for mixers, light dimmers and anything where a linear travel reads better than a knob.",
  info: "Linear potentiometer, same three terminals as a rotary pot (ends across supply, wiper to ADC). Gotcha: the wiper pin position differs between makers; check with a multimeter.",
  pins: { bottom: [P("1", "io", "Track end."), P("2", "out", "Wiper.", "wiper"), P("3", "io", "Track end.")] } },
"ky-040-encoder": {
  name: "KY-040 rotary encoder", short: "Encoder", kind: "module", category: "interface", w: 120, h: 130, style: "black", pinOrderVaries: true, decor: [{ type: "screen" }],
  use: "Use it for an endless knob with a click: menus, volume, setting values without end stops.",
  info: "Incremental rotary encoder with a push switch. CLK/DT are quadrature outputs, SW is the button (closes to GND). 3.3 or 5 V. Gotcha: the contacts bounce; use INPUT_PULLUP and debounce (or a library).",
  datasheet: "https://www.handsontec.com/dataspecs/module/Rotary%20Encoder.pdf",
  pins: { left: [P("CLK", "out", "Quadrature output A."), P("DT", "out", "Quadrature output B (direction)."), P("SW", "out", "Push switch to GND; use a pull-up."), P("+", "power", "3.3-5 V (feeds the on-board pull-ups)."), GND()] } },
"dip-switch-4": {
  name: "DIP switch (4-way)", short: "DIP sw", kind: "component", category: "interface", w: 70, h: 100, style: "#8a1c14",
  use: "Use it for configuration bits you set once (address, mode) instead of rebuilding firmware.",
  info: "Four independent switches; switch n connects the left pin n to the right pin across from it. Gotcha: each needs a pull-up (INPUT_PULLUP) with the other side on GND; not rated for frequent use.",
  pins: { left: [P("1", "io", "Switch 1 side A."), P("2", "io", "Switch 2 side A."), P("3", "io", "Switch 3 side A."), P("4", "io", "Switch 4 side A.")], right: [P("8", "io", "Switch 1 side B."), P("7", "io", "Switch 2 side B."), P("6", "io", "Switch 3 side B."), P("5", "io", "Switch 4 side B.")] } },
"level-shifter-4ch": {
  name: "4-channel bidirectional level shifter", short: "Shifter", kind: "module", category: "interface", w: 120, h: 160, style: "blue", pinOrderVaries: true,
  use: "Use it between a 3.3 V board and 5 V sensors or displays for I2C, UART and slow GPIO.",
  info: "Four BSS138 MOSFET channels shifting in both directions; feed LV with 3.3 V, HV with 5 V, and a shared GND. Gotcha: fine for I2C and UART, too slow for fast SPI (> ~2 MHz) and for WS2812 data (use a 74AHCT125 there).",
  pins: { left: [P("LV1", "io", "Low-side channel 1."), P("LV2", "io", "Low-side channel 2."), P("LV", "power", "3.3 V reference."), GND(), P("LV3", "io", "Low-side channel 3."), P("LV4", "io", "Low-side channel 4.")],
    right: [P("HV1", "io", "High-side channel 1."), P("HV2", "io", "High-side channel 2."), P("HV", "power", "5 V reference."), GND(), P("HV3", "io", "High-side channel 3."), P("HV4", "io", "High-side channel 4.")] } },
"tca9548a": {
  name: "TCA9548A I2C multiplexer", short: "I2C mux", kind: "module", category: "interface", w: 170, h: 380, style: "purple", decor: [{ type: "chip", label: "TCA9548A" }],
  use: "Use it to connect several sensors that all have the same fixed I2C address (eight VL53L0X, four OLEDs).",
  info: "Eight switchable I2C channels behind one address (0x70-0x77 via A0-A2), 1.65-5.5 V, channels can run at different voltages. Gotcha: select a channel before every transaction, and pull RST high (most boards do).",
  datasheet: "https://www.ti.com/lit/ds/symlink/tca9548a.pdf",
  pins: { left: [VCC("1.65-5.5 V.", "VIN"), GND(), SDA("Upstream I2C data."), SCL("Upstream I2C clock."), P("RST", "in", "Reset, active low (pull up)."), P("A0", "in", "Address bit 0."), P("A1", "in", "Address bit 1."), P("A2", "in", "Address bit 2.")],
    right: R(0, 7, n => [P("SD" + n, "io", `Channel ${n} SDA.`), P("SC" + n, "io", `Channel ${n} SCL.`)]).flat() } },
"74hc595": {
  name: "74HC595 shift register", short: "74HC595", kind: "component", category: "interface", w: 110, h: 220, style: "#1c1c21", decor: [{ type: "chip", label: "595" }],
  use: "Use it to drive 8 (or 16, 24...) outputs such as LEDs or 7-segment digits from three GPIOs.",
  info: "8-bit serial-in, parallel-out shift register in a DIP-16, 2-6 V; shiftOut() or SPI feeds SER, pulse RCLK to show the byte. Pin 1 is top-left (notch up). Gotcha: tie OE low and SRCLR high, and chain more chips from QH' to the next SER.",
  datasheet: "https://www.ti.com/lit/ds/symlink/sn74hc595.pdf",
  pins: { left: [P("QB", "out", "Pin 1. Output B."), P("QC", "out", "Pin 2. Output C."), P("QD", "out", "Pin 3. Output D."), P("QE", "out", "Pin 4. Output E."), P("QF", "out", "Pin 5. Output F."), P("QG", "out", "Pin 6. Output G."), P("QH", "out", "Pin 7. Output H."), GND("Pin 8. Ground.")],
    right: [VCC("Pin 16. 2-6 V."), P("QA", "out", "Pin 15. Output A."), P("SER", "in", "Pin 14. Serial data in.", "DS"), P("OE", "in", "Pin 13. Output enable, active low (tie to GND)."), P("RCLK", "in", "Pin 12. Latch clock (ST_CP).", "LATCH"), P("SRCLK", "in", "Pin 11. Shift clock (SH_CP).", "CLK"), P("SRCLR", "in", "Pin 10. Clear, active low (tie to VCC)."), P("QH'", "out", "Pin 9. Serial out to the next chip.")] } },
"pcf8574": {
  name: "PCF8574 I2C expander", short: "PCF8574", kind: "module", category: "interface", w: 140, h: 220, style: "blue", decor: [{ type: "chip", label: "PCF8574" }],
  use: "Use it to add 8 slow GPIOs (buttons, LEDs, relays) over I2C when the board runs out of pins.",
  info: "8-bit quasi-bidirectional I/O expander on I2C at 0x20-0x27 (A0-A2 jumpers; 0x38-0x3F for the 'A' part), 2.5-6 V. Gotcha: outputs can only sink current (wire LEDs from VCC to the pin), inputs are weakly pulled high, and INT fires on any change.",
  datasheet: "https://www.ti.com/lit/ds/symlink/pcf8574.pdf",
  pins: { left: [VCC("2.5-6 V."), GND(), SDA(), SCL(), P("INT", "out", "Change interrupt, open drain.")], right: R(0, 7, n => P("P" + n, "io", `I/O ${n} (sink only, weak pull-up).`)) } },
"ads1115": {
  name: "ADS1115 16-bit ADC", short: "ADS1115", kind: "module", category: "interface", w: 130, h: 240, style: "purple", decor: [{ type: "chip", label: "ADS1115" }],
  use: "Use it when the board's ADC is too coarse or noisy (ESP32!) or you need differential inputs for sensors.",
  info: "4-channel 16-bit ADC with a programmable gain amplifier on I2C (0x48-0x4B via ADDR), 2-5.5 V, up to 860 samples/s. Gotcha: inputs must stay between GND and VDD, and the ±6.144 V gain setting still cannot read above the supply.",
  datasheet: "https://www.ti.com/lit/ds/symlink/ads1115.pdf",
  pins: { left: [VCC("2-5.5 V.", "VDD"), GND(), SCL(), SDA(), P("ADDR", "in", "Address: GND 0x48, VDD 0x49, SDA 0x4A, SCL 0x4B."), P("ALRT", "out", "Comparator/ready output."), P("A0", "in", "Analog input 0."), P("A1", "in", "Analog input 1."), P("A2", "in", "Analog input 2."), P("A3", "in", "Analog input 3.")] } },
"mcp4725": {
  name: "MCP4725 12-bit DAC", short: "MCP4725", kind: "module", category: "interface", w: 110, h: 130, style: "purple", pinOrderVaries: true, decor: [{ type: "chip", label: "MCP4725" }],
  use: "Use it to output a true analog voltage (control an amplifier, a lab supply, an old meter) from boards without a DAC.",
  info: "12-bit DAC on I2C at 0x60/0x61 (0x62/0x63 on Adafruit boards), 2.7-5.5 V, output 0 to VDD with an EEPROM for the power-on value. Gotcha: output can source only a few mA; buffer it with an op-amp for loads.",
  datasheet: "https://ww1.microchip.com/downloads/en/DeviceDoc/22039d.pdf",
  pins: { left: [VCC("2.7-5.5 V (sets the output range).", "VDD"), GND(), SCL(), SDA(), P("OUT", "out", "Analog output 0-VDD.")] } },
"sd-card-spi": {
  name: "SD card module (SPI)", short: "SD", kind: "module", category: "interface", w: 150, h: 160, style: "blue", pinOrderVaries: true, decor: [{ type: "panel", w: 90, h: 60, y: 40 }],
  use: "Use it to log data or store images/sounds on a full-size SD card over SPI.",
  info: "SD socket with a 3.3 V LDO and level resistors, 5 V in (or 3.3 V), SPI mode with the SD/SdFat library. Gotcha: cheap modules do not release MISO, so they break other SPI devices on the same bus; format the card FAT32 and keep it under 32 GB.",
  pins: { left: [GND(), VCC("5 V (LDO) or 3.3 V."), P("MISO", "out", "SPI data out."), P("MOSI", "in", "SPI data in."), P("SCK", "in", "SPI clock."), P("CS", "in", "Chip select.")] } },
"microsd-breakout": {
  name: "microSD breakout", short: "microSD", kind: "module", category: "interface", w: 110, h: 160, style: "blue", pinOrderVaries: true, decor: [{ type: "panel", w: 60, h: 50, y: 40 }],
  use: "Use it for storage on 3.3 V boards (ESP32, Pico) in the smallest footprint.",
  info: "microSD socket on SPI; the tiny blue module is 3.3 V ONLY (no regulator), the larger one with VCC + 3V3 pins has an LDO for 5 V. Gotcha: SPI mode wants CS high during init of other devices, and 1-bit SDIO on the ESP32 is faster if the pins allow.",
  pins: { left: [GND(), VCC("3.3 V (5 V only on the LDO version)."), P("MISO", "out", "SPI data out."), P("MOSI", "in", "SPI data in."), P("SCK", "in", "SPI clock."), P("CS", "in", "Chip select.")] } },
"ds1307": {
  name: "DS1307 RTC (Tiny RTC)", short: "DS1307", kind: "module", category: "interface", w: 130, h: 150, style: "blue", pinOrderVaries: true, decor: [{ type: "chip", label: "DS1307" }],
  use: "Use it when a kit already includes it; for new builds the DS3231 is more accurate for the same price.",
  info: "I2C real-time clock at 0x68 with a CR2032 backup and a pad for a DS18B20, 5 V only (the I2C pull-ups go to 5 V). Gotcha: drifts minutes per month, dies at 3.3 V, and the board's LIR2032 charger must be disabled for a non-rechargeable cell.",
  datasheet: "https://www.analog.com/media/en/technical-documentation/data-sheets/DS1307.pdf",
  pins: { left: [P("SQ", "out", "Square wave output."), P("DS", "io", "DS18B20 data pad (optional)."), SCL(), SDA(), VCC("5 V."), GND()] } },
"at24c32": {
  name: "AT24C32 EEPROM module", short: "EEPROM", kind: "module", category: "interface", w: 110, h: 110, style: "blue", decor: [{ type: "chip", label: "24C32" }],
  use: "Use it to store settings, logs or calibration that must survive power loss and firmware updates.",
  info: "4 KB I2C EEPROM at 0x50-0x57 (A0-A2), 2.7-5.5 V, 1 million writes per cell. Gotcha: writes happen in 32-byte pages and need a 5 ms pause; do not write in a tight loop or you wear it out.",
  datasheet: "https://ww1.microchip.com/downloads/en/devicedoc/doc0336.pdf",
  pins: { left: [VCC("2.7-5.5 V."), GND(), SCL(), SDA(), P("WP", "in", "Write protect: high = read only.")] } },
"led-bar-10": {
  name: "10-segment LED bar (logic probe)", short: "LED bar", kind: "component", category: "interface", w: 110, h: 240, style: "#8a1c14",
  use: "Use it to show ten signals or levels at once (a VU meter, a battery gauge, a logic probe for 10 pins).",
  info: "Ten LEDs in a DIP-20: anodes on one side, cathodes directly across. Each LED needs its own 220-330 Ohm resistor (or a 74HC595 with resistors). Gotcha: 10 LEDs at 20 mA is 200 mA, more than an AVR can source at once; keep each at ~5 mA.",
  pins: { left: R(1, 10, n => P("A" + n, "in", `Anode of LED ${n}.`)), right: R(1, 10, n => P("K" + n, "gnd", `Cathode of LED ${n}.`)) } },
};
})();
