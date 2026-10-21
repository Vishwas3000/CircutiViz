/* CircutiViz parts catalog. Load before circutiviz.js. A project places a part with
   { id: "beetle", part: "dfrobot-beetle-esp32c6", x: 420, y: 112 } and may override any field inline.
   Entry: name, kind ("board"|"module"|"component"), w, h, style (black|blue|green|purple|css colour), decor[],
   info (2-3 sentences: what, bus, voltage, the gotcha), datasheet (URL), pinOrderVaries (generic clones differ),
   pins: { left|right|top|bottom: [ { id, sub?, io, desc } ] } in physical order (top→bottom / left→right),
   io: "power" | "gnd" | "in" | "out" | "io" | "nc". Pin ids are what the silkscreen prints: wire by label. */
(function () {
const P = (id, io, desc, sub) => sub ? { id, sub, io, desc } : { id, io, desc };
const GND = (desc) => P("GND", "gnd", desc || "Ground. Every part in the circuit shares it.");
const VCC = (desc, id) => P(id || "VCC", "power", desc);
const SCL = (desc) => P("SCL", "in", desc || "I2C clock.");
const SDA = (desc) => P("SDA", "io", desc || "I2C data.");

window.CIRCUTIVIZ_PARTS = {

/* ===================== boards ===================== */
"dfrobot-beetle-esp32c6": {
  name: "Beetle ESP32-C6", short: "Beetle", kind: "board", w: 160, h: 210, style: "black",
  decor: [{ type: "usb" }, { type: "chip", label: "ESP32-C6" }, { type: "button", label: "B", at: "tl" }, { type: "button", label: "R", at: "tr" }, { type: "led", label: "LED 15" }],
  info: "DFRobot's coin-sized ESP32-C6 board: Wi-Fi 6, BLE 5, Zigbee/Thread, USB-C and a Li-ion charger. 3.3 V logic on every pad. 3V3 is the regulated output that powers modules; VIN and BAT are inputs.",
  datasheet: "https://wiki.dfrobot.com/SKU_DFR1117_Beetle_ESP32_C6",
  pins: {
    left: [GND(), P("3V3", "power", "Regulated 3.3 V output from the on-board LDO; power modules from here."),
      P("4", "io", "GPIO4, ADC1_CH4; strapping pin at boot (SDIO edge), fine as an output.", "A3"),
      P("5", "io", "GPIO5, ADC1_CH5; strapping pin at boot (JTAG select), fine as an output.", "A4"),
      P("23", "io", "GPIO23, hardware SPI clock in the Arduino variant.", "SCK"),
      P("22", "io", "GPIO22, hardware SPI MOSI (data to the display).", "MOSI"),
      P("21", "io", "GPIO21, hardware SPI MISO; free as a GPIO when the device never sends back.", "MISO"),
      P("7", "io", "GPIO7, LP GPIO; general purpose, no ADC.")],
    right: [P("BAT", "power", "Li-ion battery + (3.7 V), charged over USB by the on-board charger."), GND(),
      P("VIN", "power", "5 V from USB (or feed 5 V in here). Never into a module signal pin.", "5V in"),
      P("17", "io", "GPIO17, UART0 RX (the USB-serial console); free when you use USB CDC.", "RX"),
      P("16", "io", "GPIO16, UART0 TX.", "TX"),
      P("19", "io", "GPIO19, I2C SDA in the Arduino variant.", "SDA"),
      P("20", "io", "GPIO20, I2C SCL in the Arduino variant.", "SCL"),
      P("6", "io", "GPIO6, ADC1_CH6; general purpose.")] } },

"arduino-uno-r3": {
  name: "Arduino Uno R3", short: "Uno", kind: "board", w: 260, h: 430, style: "blue",
  decor: [{ type: "usb" }, { type: "chip", label: "ATmega328P" }, { type: "button", label: "RST", at: "tr" }, { type: "led", label: "LED 13" }],
  info: "The classic 8-bit board (ATmega328P, 16 MHz). 5 V logic: 3.3 V-only modules need a level shifter on inputs. Drawn with the USB-B jack at the top; the digital header is on the right, power and analog on the left.",
  datasheet: "https://docs.arduino.cc/hardware/uno-rev3/",
  pins: {
    left: [P("NC", "nc", "Not connected (reserved)."), P("IOREF", "power", "Logic voltage reference for shields (5 V); not a supply."),
      P("RESET", "in", "Pull low to reset the board."), P("3.3V", "power", "3.3 V output, max ~50 mA; enough for a sensor, not a radio."),
      P("5V", "power", "Regulated 5 V output (from USB or VIN)."), GND(), GND(), P("VIN", "power", "7-12 V input to the on-board regulator; also the DC jack voltage."),
      P("A0", "io", "Analog input 0 (10-bit ADC, 0-5 V); also a digital pin."), P("A1", "io", "Analog input 1."), P("A2", "io", "Analog input 2."), P("A3", "io", "Analog input 3."),
      P("A4", "io", "Analog input 4; hardware I2C SDA (same net as the SDA pin).", "SDA"), P("A5", "io", "Analog input 5; hardware I2C SCL.", "SCL")],
    right: [P("SCL", "io", "I2C clock; same net as A5."), P("SDA", "io", "I2C data; same net as A4."), P("AREF", "in", "External ADC reference; leave open unless you use analogReference(EXTERNAL)."), GND(),
      P("13", "io", "Digital 13, SPI SCK, on-board LED.", "SCK"), P("12", "io", "Digital 12, SPI MISO.", "MISO"), P("11", "io", "Digital 11, SPI MOSI, PWM.", "MOSI"),
      P("10", "io", "Digital 10, SPI SS, PWM.", "SS"), P("9", "io", "Digital 9, PWM.", "PWM"), P("8", "io", "Digital 8."), P("7", "io", "Digital 7."),
      P("6", "io", "Digital 6, PWM.", "PWM"), P("5", "io", "Digital 5, PWM.", "PWM"), P("4", "io", "Digital 4."), P("3", "io", "Digital 3, PWM, external interrupt 1.", "INT1"),
      P("2", "io", "Digital 2, external interrupt 0.", "INT0"), P("1", "io", "Digital 1, UART TX; busy while the USB serial is used.", "TX"), P("0", "io", "Digital 0, UART RX; busy while the USB serial is used.", "RX")] } },

"arduino-nano": {
  name: "Arduino Nano", short: "Nano", kind: "board", w: 130, h: 350, style: "blue",
  decor: [{ type: "usb" }, { type: "chip", label: "328P" }, { type: "button", label: "RST", at: "bl" }],
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

"esp32-devkitc-30": {
  name: "ESP32 DevKit V1 (30-pin)", short: "ESP32", kind: "board", w: 170, h: 360, style: "black",
  decor: [{ type: "usb", y: 360 }, { type: "chip", label: "ESP32" }, { type: "button", label: "EN", at: "bl" }, { type: "button", label: "BOOT", at: "br" }],
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

"esp32-c3-supermini": {
  name: "ESP32-C3 SuperMini", short: "C3 Mini", kind: "board", w: 110, h: 200, style: "black", pinOrderVaries: true,
  decor: [{ type: "usb" }, { type: "chip", label: "C3" }, { type: "button", label: "B", at: "bl" }, { type: "button", label: "R", at: "br" }],
  info: "Tiny generic ESP32-C3 board with USB-C, Wi-Fi 4 and BLE 5, 3.3 V logic. 5V is USB power in, 3V3 is the regulator output. Gotcha: GPIO8 drives the blue LED (active low) and GPIO9 is the BOOT button; both are strapping pins, and many clones have a weak antenna.",
  datasheet: "https://www.espboards.dev/esp32/esp32-c3-super-mini/",
  pins: {
    left: [P("5V", "power", "5 V from USB-C (or feed 5 V in)."), GND(), P("3V3", "power", "Regulated 3.3 V output."), P("4", "io", "GPIO4, ADC1_CH4, SPI SCK in Arduino.", "A4"),
      P("3", "io", "GPIO3, ADC1_CH3.", "A3"), P("2", "io", "GPIO2, ADC1_CH2; strapping pin, fine as output.", "A2"), P("1", "io", "GPIO1, ADC1_CH1.", "A1"), P("0", "io", "GPIO0, ADC1_CH0.", "A0")],
    right: [P("5", "io", "GPIO5, ADC2, SPI MISO in Arduino.", "MISO"), P("6", "io", "GPIO6, SPI MOSI in Arduino.", "MOSI"), P("7", "io", "GPIO7, SPI SS in Arduino.", "SS"),
      P("8", "io", "GPIO8, I2C SDA in Arduino; blue LED (active low); strapping pin.", "SDA"), P("9", "io", "GPIO9, I2C SCL in Arduino; BOOT button, strapping pin.", "SCL"),
      P("10", "io", "GPIO10, general purpose."), P("20", "io", "GPIO20, UART0 RX.", "RX"), P("21", "io", "GPIO21, UART0 TX.", "TX")] } },

"seeed-xiao-esp32c3": {
  name: "Seeed XIAO ESP32C3", short: "XIAO", kind: "board", w: 110, h: 180, style: "black",
  decor: [{ type: "usb" }, { type: "chip", label: "C3" }, { type: "button", label: "B", at: "bl" }, { type: "button", label: "R", at: "br" }],
  info: "Thumb-sized ESP32-C3 board with USB-C, Wi-Fi and BLE, external antenna, battery pads on the back. 3.3 V logic. Gotcha: D9 (GPIO9) is the BOOT strapping pin, there is no user LED, and the Dn names map to different GPIO numbers (shown as sub-labels).",
  datasheet: "https://wiki.seeedstudio.com/XIAO_ESP32C3_Getting_Started/",
  pins: {
    left: [P("D0", "io", "GPIO2, ADC1_CH2; strapping pin, fine as output.", "A0"), P("D1", "io", "GPIO3, ADC1_CH3.", "A1"), P("D2", "io", "GPIO4, ADC1_CH4.", "A2"), P("D3", "io", "GPIO5, ADC2_CH0.", "A3"),
      P("D4", "io", "GPIO6, I2C SDA.", "SDA"), P("D5", "io", "GPIO7, I2C SCL.", "SCL"), P("D6", "io", "GPIO21, UART TX.", "TX")],
    right: [P("5V", "power", "5 V from USB-C (or feed 5 V in)."), GND(), P("3V3", "power", "Regulated 3.3 V output, up to ~700 mA."), P("D10", "io", "GPIO10, SPI MOSI.", "MOSI"),
      P("D9", "io", "GPIO9, SPI MISO; BOOT strapping pin.", "MISO"), P("D8", "io", "GPIO8, SPI SCK.", "SCK"), P("D7", "io", "GPIO20, UART RX.", "RX")] } },

"rpi-pico": {
  name: "Raspberry Pi Pico", short: "Pico", kind: "board", w: 150, h: 470, style: "green",
  decor: [{ type: "usb" }, { type: "chip", label: "RP2040" }, { type: "button", label: "BOOTSEL", at: "tr" }],
  info: "RP2040 board, 3.3 V logic, micro-USB at the top. The top silkscreen shows only pin numbers; GP names are printed underneath. Gotcha: 3V3 is an output (max ~300 mA), VSYS is the input for batteries (1.8-5.5 V), and the GPIOs are not 5 V tolerant.",
  datasheet: "https://datasheets.raspberrypi.com/pico/Pico-R3-A4-Pinout.pdf",
  pins: {
    left: [P("GP0", "io", "Pin 1. UART0 TX, I2C0 SDA, SPI0 RX.", "TX"), P("GP1", "io", "Pin 2. UART0 RX, I2C0 SCL, SPI0 CSn.", "RX"), GND("Pin 3. Ground."), P("GP2", "io", "Pin 4. I2C1 SDA, SPI0 SCK."), P("GP3", "io", "Pin 5. I2C1 SCL, SPI0 TX."),
      P("GP4", "io", "Pin 6. I2C0 SDA (default Wire).", "SDA"), P("GP5", "io", "Pin 7. I2C0 SCL (default Wire).", "SCL"), GND("Pin 8. Ground."), P("GP6", "io", "Pin 9. I2C1 SDA, SPI0 SCK."), P("GP7", "io", "Pin 10. I2C1 SCL, SPI0 TX."),
      P("GP8", "io", "Pin 11. UART1 TX, I2C0 SDA."), P("GP9", "io", "Pin 12. UART1 RX, I2C0 SCL."), GND("Pin 13. Ground."), P("GP10", "io", "Pin 14. SPI1 SCK."), P("GP11", "io", "Pin 15. SPI1 TX."),
      P("GP12", "io", "Pin 16. SPI1 RX."), P("GP13", "io", "Pin 17. SPI1 CSn."), GND("Pin 18. Ground."), P("GP14", "io", "Pin 19. SPI1 SCK."), P("GP15", "io", "Pin 20. SPI1 TX.")],
    right: [P("VBUS", "power", "Pin 40. 5 V from USB; 0 V when USB is unplugged."), P("VSYS", "power", "Pin 39. Main input 1.8-5.5 V (battery goes here)."), GND("Pin 38. Ground."), P("3V3_EN", "in", "Pin 37. Pull low to switch off the 3.3 V regulator."),
      P("3V3", "power", "Pin 36. Regulated 3.3 V output, ~300 mA.", "OUT"), P("ADC_VREF", "in", "Pin 35. ADC reference; leave open."), P("GP28", "io", "Pin 34. ADC2.", "ADC2"), P("AGND", "gnd", "Pin 33. Analog ground."),
      P("GP27", "io", "Pin 32. ADC1.", "ADC1"), P("GP26", "io", "Pin 31. ADC0.", "ADC0"), P("RUN", "in", "Pin 30. Pull low to reset."), P("GP22", "io", "Pin 29."), GND("Pin 28. Ground."),
      P("GP21", "io", "Pin 27. I2C0 SCL."), P("GP20", "io", "Pin 26. I2C0 SDA."), P("GP19", "io", "Pin 25. SPI0 TX (MOSI).", "MOSI"), P("GP18", "io", "Pin 24. SPI0 SCK.", "SCK"), GND("Pin 23. Ground."),
      P("GP17", "io", "Pin 22. SPI0 CSn.", "CS"), P("GP16", "io", "Pin 21. SPI0 RX (MISO).", "MISO")] } },

/* ===================== sensors ===================== */
"gy-521-mpu6050": {
  name: "GY-521 (MPU-6050 IMU)", short: "GY-521", kind: "module", w: 160, h: 220, style: "blue", pinOrderVaries: true,
  decor: [{ type: "chip", label: "MPU-6050" }],
  info: "6-axis IMU (3-axis gyro + 3-axis accelerometer) on I2C at 0x68. Powered from 3.3 V or 5 V thanks to its regulator; logic lines are 3.3 V. Gotcha: SDA/SCL on the module already have pull-ups, so do not add more when several modules share the bus.",
  datasheet: "https://invensense.tdk.com/products/motion-tracking/6-axis/mpu-6050/",
  pins: { left: [VCC("3.3-5 V in; the module's regulator feeds the chip 3.3 V."), GND(), SCL("I2C clock (pull-up already on the module)."), SDA(),
    P("XDA", "io", "Auxiliary I2C data for an external magnetometer; usually unused."), P("XCL", "io", "Auxiliary I2C clock; usually unused."),
    P("AD0", "in", "Address select: open/low = 0x68, high = 0x69."), P("INT", "out", "Data-ready / motion interrupt, 3.3 V; optional.")] } },

"gy-271-qmc5883l": {
  name: "GY-271 (QMC5883L compass)", short: "GY-271", kind: "module", w: 160, h: 120, style: "blue", pinOrderVaries: true,
  decor: [{ type: "chip", label: "QMC5883L" }],
  info: "3-axis magnetometer on I2C at 0x0D (QMC5883L). 3.3-5 V in, 3.3 V logic. Gotcha: boards sold as GY-271 may carry an HMC5883L (0x1E) or QMC5883P (0x2C), which need a different driver; check the I2C scan.",
  datasheet: "https://www.qstcorp.com/upload/pdf/202202/QMC5883L%20Datasheet%201.0.pdf",
  pins: { left: [VCC("3.3-5 V in (regulator on board)."), GND(), SCL(), SDA(), P("DRDY", "out", "Data-ready pulse; optional, leave unconnected.")] } },

"bme280-i2c": {
  name: "BME280 (temp/humidity/pressure)", short: "BME280", kind: "module", w: 110, h: 110, style: "purple", pinOrderVaries: true,
  decor: [{ type: "chip", label: "BME280" }],
  info: "Temperature, humidity and pressure on I2C at 0x76 (0x77 on some boards). 3.3 V part; most purple boards include a regulator and accept 5 V. Gotcha: cheap boards sold as BME280 are often BMP280 (no humidity): chip id 0x58 vs 0x60.",
  datasheet: "https://www.bosch-sensortec.com/products/environmental-sensors/humidity-sensors-bme280/",
  pins: { left: [VCC("3.3 V (5 V only if the board has a regulator)."), GND(), SCL(), SDA()] } },

"dht22": {
  name: "DHT22 / AM2302", short: "DHT22", kind: "module", w: 110, h: 90, style: "#d9dde3", pinOrderVaries: true,
  info: "Temperature + humidity over a single-wire protocol (not Dallas 1-Wire). 3.3-5.5 V. Gotcha: the bare sensor needs a 10 kOhm pull-up from DATA to VCC (3-pin modules include it) and at least 2 s between reads.",
  datasheet: "https://cdn-shop.adafruit.com/datasheets/Digital+humidity+and+temperature+sensor+AM2302.pdf",
  pins: { bottom: [VCC("3.3-5.5 V."), P("DATA", "io", "Single-wire data; pull up to VCC with 10 kOhm."), P("NC", "nc", "Not connected."), GND()] } },

"hc-sr04": {
  name: "HC-SR04 ultrasonic", short: "HC-SR04", kind: "module", w: 180, h: 70, style: "blue",
  info: "Ultrasonic range finder, 2-400 cm: pulse Trig for 10 us, then time the Echo pulse. 5 V part. Gotcha: Echo is a 5 V output, so on a 3.3 V board put a divider (1 kOhm + 2 kOhm) on Echo; Trig accepts 3.3 V.",
  datasheet: "https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf",
  pins: { bottom: [VCC("5 V."), P("Trig", "in", "10 us high pulse starts a measurement; 3.3 V is enough."), P("Echo", "out", "High for the round-trip time; 5 V level, divide for 3.3 V boards."), GND()] } },

"neo-6m-gps": {
  name: "NEO-6M GPS", short: "GPS", kind: "module", w: 150, h: 110, style: "blue", pinOrderVaries: true,
  decor: [{ type: "chip", label: "NEO-6M" }],
  info: "u-blox NEO-6M GPS on a serial port, 9600 baud NMEA by default. 3.3-5 V in (regulator on board), 3.3 V logic. Gotcha: needs open sky; the first fix after power-up takes 1-5 min, and the module's RX goes to the board's TX.",
  datasheet: "https://content.u-blox.com/sites/default/files/products/documents/NEO-6_DataSheet_%28GPS.G6-HW-09005%29.pdf",
  pins: { left: [VCC("3.3-5 V in."), P("RX", "in", "Serial in: connect to the board's TX (only needed to configure the module)."), P("TX", "out", "Serial out (NMEA sentences): connect to the board's RX."), GND()] } },

"ky-003-hall": {
  name: "KY-003 hall switch (A3144)", short: "Hall", kind: "module", w: 70, h: 90, style: "black", pinOrderVaries: true,
  info: "Digital hall-effect switch: S goes low when a magnet's south pole is near, high otherwise (open collector, 10 kOhm pull-up on the module). Rated 4.5-24 V. Gotcha: at 3.3 V it is out of spec; feed + from 5 V and pull S up to 3.3 V, or use a 3.3 V part.",
  datasheet: "https://www.allegromicro.com/-/media/files/datasheets/a3141-2-3-4-datasheet.ashx",
  pins: { bottom: [P("-", "gnd", "Ground."), P("+", "power", "4.5-24 V (5 V typical)."), P("S", "out", "Signal, open collector: low with a magnet present.")] } },

"hc-sr501-pir": {
  name: "HC-SR501 PIR motion", short: "PIR", kind: "module", w: 130, h: 110, style: "green", pinOrderVaries: true,
  decor: [{ type: "screen" }],
  info: "Passive infrared motion module. 5-20 V in; its output is 3.3 V, safe for any board. Gotcha: about 60 s warm-up after power-up, and the two trimmers set sensitivity and hold time (3 s to 5 min).",
  datasheet: "https://www.mpja.com/download/31227sc.pdf",
  pins: { bottom: [VCC("5-20 V in."), P("OUT", "out", "3.3 V high while motion is detected."), GND()] } },

"ds18b20": {
  name: "DS18B20 (1-Wire temp)", short: "DS18B20", kind: "component", w: 74, h: 44, style: "#1c1c21",
  info: "1-Wire digital thermometer, 3.0-5.5 V, many sensors on one pin. Flat face toward you, legs down: GND, DQ, VDD. Gotcha: DQ needs a 4.7 kOhm pull-up to VDD; swapping GND and VDD makes it hot fast.",
  datasheet: "https://www.analog.com/media/en/technical-documentation/data-sheets/DS18B20.pdf",
  pins: { bottom: [GND(), P("DQ", "io", "1-Wire data; 4.7 kOhm pull-up to VDD."), P("VDD", "power", "3.0-5.5 V.")] } },

"ky-040-encoder": {
  name: "KY-040 rotary encoder", short: "Encoder", kind: "module", w: 120, h: 130, style: "black", pinOrderVaries: true,
  decor: [{ type: "screen" }],
  info: "Incremental rotary encoder with a push switch. CLK/DT are quadrature outputs, SW is the button (closes to GND). 3.3 or 5 V. Gotcha: the contacts bounce; use INPUT_PULLUP and debounce (or a library).",
  datasheet: "https://www.handsontec.com/dataspecs/module/Rotary%20Encoder.pdf",
  pins: { left: [P("CLK", "out", "Quadrature output A."), P("DT", "out", "Quadrature output B (direction)."), P("SW", "out", "Push switch to GND; use a pull-up."), P("+", "power", "3.3-5 V (feeds the on-board pull-ups)."), GND()] } },

"photoresistor": {
  name: "Photoresistor (LDR)", short: "LDR", kind: "component", w: 44, h: 50, style: "#6b4a1e",
  info: "Light-dependent resistor, no polarity: ~1 kOhm in bright light, ~1 MOhm in the dark. Read it as a divider: LDR from 3V3 to an ADC pin, 10 kOhm from that pin to GND. Gotcha: slow (tens of ms) and uncalibrated.",
  pins: { bottom: [P("1", "io", "Either end (no polarity)."), P("2", "io", "Either end (no polarity).")] } },

/* ===================== displays ===================== */
"gc9a01-round-128": {
  name: "1.28\" round TFT (GC9A01)", short: "Display", kind: "module", w: 220, h: 230, style: "black", pinOrderVaries: true,
  decor: [{ type: "screen" }],
  info: "240x240 round IPS TFT on SPI (GC9A01 controller), 3.3 V power and logic. Gotcha: SCL/SDA here are the SPI clock and MOSI, not I2C; the 7-pin version has no BLK pin (backlight always on).",
  datasheet: "https://www.waveshare.com/wiki/1.28inch_LCD_Module",
  pins: { left: [VCC("3.3 V (some boards accept 5 V, check the silkscreen)."), GND(), P("SCL", "in", "SPI clock (SCK), not I2C."), P("SDA", "in", "SPI data in (MOSI); the display never sends back."),
    P("RES", "in", "Reset, active low."), P("DC", "in", "Data/command select."), P("CS", "in", "Chip select, active low."), P("BLK", "in", "Backlight: high or PWM = on; left open = on.")] } },

"ssd1306-oled-i2c": {
  name: "0.96\" OLED (SSD1306, I2C)", short: "OLED", kind: "module", w: 130, h: 100, style: "blue", pinOrderVaries: true,
  decor: [{ type: "panel", y: 62, h: 50 }],
  info: "128x64 monochrome OLED on I2C at 0x3C (0x3D on some). 3.3-5 V. Gotcha: pin order differs between boards (GND-VCC-SCL-SDA vs VCC-GND-SCL-SDA); swapping power kills it, so read the silkscreen.",
  datasheet: "https://cdn-shop.adafruit.com/datasheets/SSD1306.pdf",
  pins: { top: [GND(), VCC("3.3-5 V."), SCL(), SDA()] } },

"st7789-130": {
  name: "1.3\" TFT (ST7789, SPI)", short: "TFT", kind: "module", w: 180, h: 190, style: "black", pinOrderVaries: true,
  decor: [{ type: "panel" }],
  info: "1.3\" 240x240 IPS TFT on SPI (ST7789), 3.3 V. The common 7-pin module has no CS pin (tied low inside). Gotcha: without CS it cannot share the SPI bus with another device and needs SPI mode 3.",
  datasheet: "https://www.waveshare.com/wiki/1.3inch_LCD_Module",
  pins: { left: [GND(), VCC("3.3 V."), P("SCL", "in", "SPI clock (SCK), not I2C."), P("SDA", "in", "SPI MOSI."), P("RES", "in", "Reset, active low."), P("DC", "in", "Data/command select."), P("BLK", "in", "Backlight on/off or PWM.")] } },

"lcd1602-i2c": {
  name: "16x2 LCD + I2C backpack", short: "LCD", kind: "module", w: 260, h: 110, style: "green", pinOrderVaries: true,
  decor: [{ type: "panel", w: 200, h: 60 }],
  info: "16x2 character LCD with a PCF8574 I2C backpack at 0x27 (or 0x3F). Needs 5 V for full contrast; the I2C lines are fine from a 3.3 V board. Gotcha: if it shows a row of blank boxes, turn the contrast trimmer on the backpack.",
  datasheet: "https://www.handsontec.com/dataspecs/module/I2C_1602_LCD.pdf",
  pins: { left: [GND(), VCC("5 V."), SDA(), SCL()] } },

/* ===================== actuators / misc ===================== */
"sg90-servo": {
  name: "SG90 micro servo", short: "Servo", kind: "module", w: 120, h: 80, style: "#2f5f8a",
  info: "Micro servo, 0-180 degrees, driven by a 50 Hz pulse of 1-2 ms. Power 4.8-6 V from 5 V/VIN, not from the board's 3.3 V regulator; a 3.3 V signal pin works. Gotcha: it draws 500+ mA when stalled, so share GND and use a solid 5 V source.",
  datasheet: "http://www.ee.ic.ac.uk/pcheung/teaching/DE1_EE/stores/sg90_datasheet.pdf",
  pins: { left: [GND("Ground (brown wire).", "GND"), P("VCC", "power", "4.8-6 V (red wire).", "red"), P("SIG", "in", "50 Hz PWM, 1-2 ms pulse (orange wire).", "orange")] } },

"relay-1ch": {
  name: "1-channel relay module", short: "Relay", kind: "module", w: 150, h: 110, style: "blue", pinOrderVaries: true,
  info: "Single relay with an optocoupler/transistor driver; the switched side is on screw terminals. Coil needs 5 V (3.3 V versions exist). Gotcha: most are active LOW (IN low = relay on) and a 3.3 V pin may not switch a 5 V module reliably; look for a JD-VCC jumper or drive it through a transistor.",
  datasheet: "https://www.handsontec.com/dataspecs/module/1Ch-relay.pdf",
  pins: { left: [VCC("5 V (coil supply)."), GND(), P("IN", "in", "Control input; usually active low.")],
    right: [P("NO", "io", "Normally open contact (closed while the relay is on)."), P("COM", "io", "Common contact."), P("NC", "io", "Normally closed contact (open while the relay is on).")] } },

"buzzer-active": {
  name: "Active buzzer", short: "Buzzer", kind: "component", w: 50, h: 50, style: "#1c1c21",
  info: "Active buzzer: apply 3.3-5 V and it beeps at its own fixed tone (no PWM needed). Polarity matters: the longer leg or the + mark is positive. Gotcha: a passive buzzer looks identical but is silent on DC; it needs a tone() signal.",
  pins: { bottom: [P("+", "power", "Positive (longer leg / + mark); drive from a GPIO or through a transistor."), P("-", "gnd", "Negative.")] } },

"led": {
  name: "LED", short: "LED", kind: "component", w: 44, h: 54, style: "#8a1c14",
  info: "Standard 5 mm LED. Current flows from A (anode, long leg) to K (cathode, short leg, flat edge). Gotcha: always add a series resistor, 220-330 Ohm on 3.3 V or 5 V.",
  pins: { bottom: [P("A", "in", "Anode (+), the long leg; connect through the series resistor.", "long"), P("K", "gnd", "Cathode (-), the short leg / flat edge; to GND.", "short")] } },

"resistor": {
  name: "Resistor", short: "R", kind: "component", w: 70, h: 26, style: "#5b4a2f",
  info: "Fixed resistor, no polarity. Put the value in the part's name (e.g. 220 Ohm). Gotcha: colour bands: 220 Ohm = red-red-brown, 4.7 kOhm = yellow-violet-red, 10 kOhm = brown-black-orange.",
  pins: { left: [P("1", "io", "Either end (no polarity).")], right: [P("2", "io", "Either end (no polarity).")] } },

"button-tactile": {
  name: "Tactile push button", short: "Button", kind: "component", w: 56, h: 56, style: "#2b3a4e",
  info: "4-leg tactile push button. The two legs on the same side of the body are one contact; pressing joins the two sides. Gotcha: if it reads pressed all the time you used two legs of the same side; rotate it 90 degrees (straddle the breadboard gap and wire across it).",
  pins: { left: [P("1", "io", "Contact A (same as 2)."), P("2", "io", "Contact A (same as 1).")], right: [P("3", "io", "Contact B (same as 4)."), P("4", "io", "Contact B (same as 3).")] } },

"potentiometer": {
  name: "Potentiometer", short: "Pot", kind: "component", w: 70, h: 60, style: "#2f5f8a",
  info: "Variable resistor: ends 1 and 3 across 3V3 and GND, the wiper (2) gives 0-3.3 V to an ADC pin. Gotcha: never put 5 V across it when reading with a 3.3 V board's ADC.",
  pins: { bottom: [P("1", "io", "One end of the track."), P("2", "out", "Wiper: 0-100 % of the voltage across 1 and 3.", "wiper"), P("3", "io", "Other end of the track.")] } },

"ws2812-strip": {
  name: "WS2812 LED strip (NeoPixel)", short: "Strip", kind: "module", w: 200, h: 70, style: "black",
  info: "Addressable RGB LEDs: 5 V power and one data line into DIN at the arrow end. Gotcha: 60 mA per LED at full white, so power from a proper 5 V supply with a common GND; 3.3 V data usually works for short runs, otherwise level-shift; put 330 Ohm in the data line and 1000 uF across the supply.",
  datasheet: "https://cdn-shop.adafruit.com/datasheets/WS2812B.pdf",
  pins: { left: [P("5V", "power", "5 V supply, not from the board's 3.3 V."), P("DIN", "in", "Data in (800 kHz single wire), at the arrow end of the strip."), GND("Ground, shared with the board.")] } },

"tp4056": {
  name: "TP4056 Li-ion charger", short: "Charger", kind: "module", w: 120, h: 120, style: "blue",
  decor: [{ type: "usb" }],
  info: "Li-ion charger with protection (TP4056 + DW01). Charge from USB or IN+/IN-, battery on B+/B-, load on OUT+/OUT-. Gotcha: OUT is the battery voltage (3.0-4.2 V), not 5 V, and the default 1 A charge current is too high for small cells (change R3; 5 kOhm = about 250 mA).",
  datasheet: "https://dlnmh9ip6v2uc.cloudfront.net/datasheets/Prototyping/TP4056.pdf",
  pins: { left: [P("IN+", "power", "5 V in (alternative to the USB jack)."), P("IN-", "gnd", "Input ground.")],
    right: [P("B+", "power", "Battery +."), P("B-", "gnd", "Battery -."), P("OUT+", "power", "Protected output, battery voltage."), P("OUT-", "gnd", "Output ground.")] } },

"buck-mp1584": {
  name: "Buck converter (MP1584 / LM2596)", short: "Buck", kind: "module", w: 130, h: 80, style: "blue",
  info: "Step-down regulator module; the trimmer sets the output voltage. Gotcha: set and measure the output with a multimeter BEFORE connecting the load (new boards sit at a random voltage); the LM2596 needs about 1.5 V more in than out and cannot step up.",
  datasheet: "https://www.monolithicpower.com/en/mp1584.html",
  pins: { left: [P("IN+", "power", "4.5-28 V in."), P("IN-", "gnd", "Input ground.")], right: [P("OUT+", "power", "Regulated output (set with the trimmer)."), P("OUT-", "gnd", "Output ground (same net as IN-).")] } },

"hc-05": {
  name: "HC-05 Bluetooth serial", short: "HC-05", kind: "module", w: 130, h: 170, style: "blue", pinOrderVaries: true,
  decor: [{ type: "chip", label: "HC-05" }],
  info: "Classic Bluetooth SPP serial bridge (pairs with phones and PCs, not with iOS BLE). VCC 3.6-6 V, 9600 baud by default. Gotcha: RXD is a 3.3 V input (use a divider from a 5 V board), TXD into the board's RX is fine; hold EN high at power-up for AT mode at 38400 baud.",
  datasheet: "https://components101.com/wireless/hc-05-bluetooth-module",
  pins: { left: [P("EN", "in", "AT-command mode when high at power-up (also called KEY); leave open normally."), VCC("3.6-6 V (5 V typical)."), GND(),
    P("TXD", "out", "Serial out, 3.3 V: to the board's RX."), P("RXD", "in", "Serial in, 3.3 V tolerant only: from the board's TX (divider from 5 V)."), P("STATE", "out", "High while connected.")] } },

"nrf24l01": {
  name: "nRF24L01 2.4 GHz radio", short: "nRF24", kind: "module", w: 220, h: 110, style: "black",
  decor: [{ type: "chip", label: "nRF24L01" }],
  info: "2.4 GHz transceiver on SPI. 3.3 V ONLY on VCC (5 V kills it); the SPI inputs tolerate 5 V logic. Gotcha: it needs a 10-100 uF capacitor across VCC/GND right at the module, and its 2x4 header is drawn here as one row in pin order (pin 1 = GND, the square pad).",
  datasheet: "https://www.sparkfun.com/datasheets/Components/SMD/nRF24L01Pluss_Preliminary_Product_Specification_v1_0.pdf",
  pins: { bottom: [GND("Pin 1 (square pad). Ground."), VCC("Pin 2. 3.3 V only."), P("CE", "in", "Pin 3. Chip enable (TX/RX mode)."), P("CSN", "in", "Pin 4. SPI chip select, active low."),
    P("SCK", "in", "Pin 5. SPI clock."), P("MOSI", "in", "Pin 6. SPI data in."), P("MISO", "out", "Pin 7. SPI data out."), P("IRQ", "out", "Pin 8. Interrupt, active low; optional.")] } },
};
})();
