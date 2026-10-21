/* CircutiViz — a data-driven breadboard wiring guide. One file, vanilla JS, no build step.
   Load order: gsap (optional) → components.js (catalog) → your wiring.js (sets window.CIRCUIT) → circutiviz.js.
   Exposes window.CircutiViz = { validate(circuit, catalog), render(circuit, catalog, root) }.
   Data format: README.md / CLAUDE.md. */
(function () {
"use strict";

const NS = "http://www.w3.org/2000/svg";
const EDGE_DIR = { left: [-1, 0], right: [1, 0], top: [0, -1], bottom: [0, 1] };
const LEAD = 16;   // lead length for kind:"component" (LED, resistor, button): pins sit at the end of short leads
const GRID = 10;   // drag snap
const RULER = 16;  // ruler strip along the board's top and left edges, in canvas units
const CM = 38;     // one "centimetre" of the board grid, in canvas units

/* ---------- colours (every wire also gets a dark underlay, so these are chosen to read over PCB green) ---------- */
const BASE_COLORS = {
  wire: "#c3cad3", "3v3": "#ff3b3b", "5v": "#c9182a", gnd: "#111318", sck: "#3b8cff", mosi: "#00e5ff", miso: "#d0d5dc",
  cs: "#f2a900", dc: "#b06bff", rst: "#ff5fa2", blk: "#ffe600", scl: "#c6ff00", sda: "#ff7a1a",
};
function colorTable(C) {
  const t = Object.assign({}, BASE_COLORS);
  for (const [k, v] of Object.entries(C.colors || {})) t[k] = typeof v === "string" ? v : (v.dark || v.light);
  return t;
}

/* ---------- model (DOM-free, shared by validate() and render()) ---------- */
const endLabel = (e) => e.rail ? e.rail.label || e.rail.id : `${e.pin.part.short} ${e.pin.id}${e.pin.sub ? ` (${e.pin.sub})` : ""}`;
const snap = (v) => Math.round(v / GRID) * GRID;

function placePins(p) {
  const lead = p.kind === "component" ? LEAD : 0;
  for (const pin of p.pinList) {
    const [dx, dy] = pin.dir, e = pin.edge;
    pin.lx = e === "left" ? p.x : e === "right" ? p.x + p.w : p.x + pin.along; // label anchor on the body edge
    pin.ly = e === "top" ? p.y : e === "bottom" ? p.y + p.h : p.y + pin.along;
    pin.x = pin.lx + dx * lead; pin.y = pin.ly + dy * lead;
  }
}
/* rail junctions: one free x per rail wire near its part, nested so hooks do not cross */
function layoutJunctions(wires) {
  const used = [];
  const freeX = (x, sign) => { while (used.some(u => Math.abs(u - x) < 12)) x += 14 * sign; used.push(x); return x; };
  const groups = {};
  for (const w of wires) if (w.rail) { const k = w.pa.part.id + "/" + w.pa.edge; (groups[k] = groups[k] || []).push(w); }
  for (const g of Object.values(groups)) {
    const edge = g[0].pa.edge, p = g[0].pa.part;
    if (edge === "top" || edge === "bottom") {
      for (const w of g) {
        w.uturn = edge === "bottom" ? w.rail.y < w.pa.y : w.rail.y > w.pa.y; // rail is behind the pin: U-turn around the body
        if (!w.uturn) w.jx = freeX(w.pa.x, 1);
        else { const s = w.pa.x < p.x + p.w / 2 ? -1 : 1; w.jx = freeX(s < 0 ? p.x - 22 : p.x + p.w + 22, s); }
      }
      continue;
    }
    const sign = edge === "left" ? -1 : 1;
    g.sort((u, v) => (u.rail.y < u.pa.y ? u.pa.y : -u.pa.y) - (v.rail.y < v.pa.y ? v.pa.y : -v.pa.y)); // innermost first
    g.forEach((w, i) => { w.uturn = false; w.jx = freeX(w.pa.x + sign * (22 + 16 * i), sign); });
  }
}
function wirePath(w) {
  const a = w.pa, [dx, dy] = a.dir;
  if (w.rail) {
    const ex = w.jx, ey = w.rail.y;
    if (w.uturn) return `M${a.x},${a.y} C${a.x},${a.y + dy * 30} ${ex},${a.y + dy * 30} ${ex},${a.y} L${ex},${ey}`;
    const s = ey < a.y ? 1 : -1, k = Math.min(60, Math.max(20, Math.hypot(ex - a.x, ey - a.y) * 0.5));
    return `M${a.x},${a.y} C${a.x + dx * k},${a.y + dy * k} ${ex},${ey + s * k} ${ex},${ey}`;
  }
  const b = w.pb, [bx, by] = b.dir, k = Math.min(140, Math.max(24, Math.hypot(b.x - a.x, b.y - a.y) * 0.5));
  return `M${a.x},${a.y} C${a.x + dx * k},${a.y + dy * k} ${b.x + bx * k},${b.y + by * k} ${b.x},${b.y}`;
}

function buildModel(C, catalog, layout) {
  const problems = [], parts = [], rails = Array.isArray(C.rails) ? C.rails : [], partById = {}, railById = {};
  catalog = catalog || {}; layout = layout || {};
  const COLORS = colorTable(C);
  if (!C.id) problems.push("CIRCUIT.id is missing (progress is stored under it)");
  for (const r of rails) { if (!r.id || typeof r.y !== "number") problems.push(`rail ${JSON.stringify(r)} needs id and y`); railById[r.id] = r; }

  for (const raw of Array.isArray(C.parts) ? C.parts : []) {
    const base = raw.part ? catalog[raw.part] : null;
    if (raw.part && !base) problems.push(`part "${raw.id}": unknown catalog part "${raw.part}" (is components.js loaded before circutiviz.js?)`);
    const p = Object.assign({ kind: "module", w: 120, h: 100, name: raw.id }, base, raw);
    if (!p.id) problems.push(`a part has no id: ${JSON.stringify(raw)}`);
    if (partById[p.id]) problems.push(`duplicate part id "${p.id}"`);
    if (typeof p.x !== "number" || typeof p.y !== "number") { problems.push(`part "${p.id}" needs numeric x and y`); p.x = p.x || 0; p.y = p.y || 0; }
    p.x0 = p.x; p.y0 = p.y; // the data file's position (drag layout is an overlay)
    if (layout[p.id] && typeof layout[p.id].x === "number") { p.x = layout[p.id].x; p.y = layout[p.id].y; }
    partById[p.id] = p; parts.push(p);
    p.short = p.short || p.name; p.pinList = []; p.pins = p.pins || {};
    const edges = Object.keys(p.pins).filter(e => (p.pins[e] || []).length);
    if (raw.edge && !raw.pins && edges.length === 1 && raw.edge !== edges[0]) p.pins = { [raw.edge]: p.pins[edges[0]] }; // flip a single header
    const pitch = p.pitch || 22;
    for (const edge of Object.keys(EDGE_DIR)) {
      const list = p.pins[edge] || [], len = edge === "left" || edge === "right" ? p.h : p.w;
      const start = p.pinStart != null ? p.pinStart : (len - (list.length - 1) * pitch) / 2;
      list.forEach((item, i) => {
        const pin = typeof item === "string" ? { id: item } : Object.assign({}, item);
        pin.id = pin.id != null ? String(pin.id) : pin.label != null ? String(pin.label) : "";
        if (!pin.id) problems.push(`part "${p.id}": a ${edge} pin has no id`);
        pin.edge = edge; pin.part = p; pin.dir = EDGE_DIR[edge]; pin.along = start + i * pitch; pin.ref = `${p.id}.${edge}.${pin.id}`;
        p.pinList.push(pin);
      });
    }
    if (!p.pinList.length) problems.push(`part "${p.id}" has no pins`);
    placePins(p);
  }

  /* "part.PIN", "part.edge.PIN" or "rail:id" -> {pin} | {rail} | null */
  function resolve(ref, where) {
    if (typeof ref !== "string") { problems.push(`${where}: missing from/to`); return null; }
    if (ref.startsWith("rail:")) {
      const r = railById[ref.slice(5)];
      if (!r) problems.push(`${where}: unknown rail "${ref}" (rails: ${rails.map(r => r.id).join(", ") || "none"})`);
      return r ? { rail: r } : null;
    }
    const seg = ref.split("."), part = partById[seg[0]];
    if (!part) { problems.push(`${where}: unknown part "${seg[0]}" in "${ref}" (parts: ${parts.map(p => p.id).join(", ") || "none"})`); return null; }
    const edge = seg.length > 2 && EDGE_DIR[seg[1]] ? seg[1] : null, id = seg.slice(edge ? 2 : 1).join("."); // pin ids may contain dots ("3.3V")
    const hits = part.pinList.filter(p => (!edge || p.edge === edge) && p.id === id);
    if (!hits.length) { problems.push(`${where}: part "${part.id}" has no pin "${id}"${edge ? ` on edge ${edge}` : ""} (pins: ${part.pinList.map(p => p.id).join(" ")})`); return null; }
    if (hits.length > 1) problems.push(`${where}: "${ref}" matches ${hits.length} pins; write ${part.id}.${hits[0].edge}.${id} (using that one)`);
    return { pin: hits[0] };
  }

  const stages = Array.isArray(C.stages) ? C.stages : [], steps = [];
  if (!stages.length) problems.push("CIRCUIT.stages is empty");
  stages.forEach((stage, si) => {
    if (!stage.title) problems.push(`stage ${si + 1} has no title`);
    if (!stage.check && !stage.run) problems.push(`stage ${si + 1} "${stage.title}" has no check (every stage should end with what to run/see)`);
    (stage.steps || []).forEach((s, j) => {
      const st = Object.assign({ i: steps.length, stage, si }, s), where = `stage ${si + 1} "${stage.title}" step ${j + 1}`;
      st.key = s.from ? `${s.from}>${s.to}` : (s.text || "step" + st.i);
      if (s.from != null || s.to != null) {
        st.wire = true;
        let a = resolve(s.from, where), b = resolve(s.to, where);
        if (a && b) {
          if (a.rail && !b.rail) [a, b] = [b, a];
          if (a.rail) problems.push(`${where}: both ends are rails`);
          else { st.pa = a.pin; st.pb = b.pin || null; st.rail = b.rail || null; st.label = `${endLabel(a)} → ${endLabel(b)}`; }
        }
        if (!st.label) st.label = `${s.from} → ${s.to}`;
        if (!s.color) problems.push(`${where}: wire has no colour key`);
        else if (!COLORS[s.color]) problems.push(`${where}: unknown colour "${s.color}" (add it to CIRCUIT.colors or use ${Object.keys(COLORS).join(" ")})`);
        st.color = COLORS[s.color] ? s.color : "wire";
      } else if (!s.text) problems.push(`${where}: a step needs from/to or text`);
      steps.push(st);
    });
  });
  const wires = steps.filter(s => s.pa);
  layoutJunctions(wires);
  const W = (C.canvas && C.canvas.w) || 1000, H = (C.canvas && C.canvas.h) || 640;
  for (const p of parts) if (p.x0 < RULER || p.y0 < RULER || p.x0 + p.w > W || p.y0 + p.h > H) problems.push(`part "${p.id}" is outside the ${W}×${H} canvas (keep x,y ≥ ${RULER} for the ruler strip)`);
  return { C, COLORS, parts, rails, stages, steps, wires, problems, W, H };
}

function validate(C, catalog) {
  if (!C || typeof C !== "object") return { ok: false, problems: ["CIRCUIT is not an object"], summary: {} };
  const m = buildModel(C, catalog || (typeof window !== "undefined" && window.CIRCUTIVIZ_PARTS) || {});
  const summary = { parts: m.parts.length, rails: m.rails.length, stages: m.stages.length, steps: m.steps.length, wires: m.wires.length,
    unresolved: m.steps.filter(s => s.wire && !s.pa).length };
  return { ok: m.problems.length === 0, problems: m.problems, summary };
}

/* ---------- styles: a retro circuit-puzzle console (single dark theme) ---------- */
const CSS = (wireVars) => `
:root{color-scheme:dark;--f-px:"Press Start 2P","Courier New",monospace;--f-mono:"Share Tech Mono",ui-monospace,Menlo,Consolas,monospace;--f-sans:"IBM Plex Sans",system-ui,"Segoe UI",sans-serif;
--screen:#07222b;--steel:#1c4b66;--steel-hi:#3b7ea6;--steel-lo:#0f2d3f;--inner:#143a50;--inner-lo:#0f3447;--code-bg:#0b2633;--line:#2b5f7d;
--rivet:#a9c4d6;--rivet-ring:#0b1e2a;--pcb:#1f4d2d;--pcb-lo:#163a21;--copper:#c99a4b;--glow-green:#3dff9a;--glow-red:#ff3b3b;--glow-blue:#3b8cff;
--ink:#e8f1f5;--muted:#a9c4d6;--px-yellow:#ffd23f;--px-green:#4cf2a1;--accent:#e8b44a;--accent-ink:#1a1200;--accent-soft:rgba(232,180,74,.18);--accent-glow:rgba(232,180,74,.55);
--danger:#ff6b61;--danger-soft:#3a1d1a;--ok:#4cf2a1;--sticker:rgba(0,0,0,.62);--sticker-ink:#fff;--tip-bg:#0b1e2a;--tip-ink:#e8f1f5;
--part-edge:rgba(0,0,0,.55);--part-ink:#eef0f3;--part-sub:#c9d1dc;--part-ink-dark:#1a1d23;--part-sub-dark:#3b4350;--pad-gold:#d9a93c;--pad-silver:#cfd5dc;
--pcb-black:#1c1c21;--pcb-blue:#1f4e9c;--pcb-green:#2f7a45;--pcb-purple:#4a2a7a;--glass:#0a0c11;--chip:#2a2b31;${wireVars}}
[hidden]{display:none!important}
html{background:var(--screen)}
body{margin:0;background:var(--screen);color:var(--ink);font:15px/1.5 var(--f-sans);-webkit-text-size-adjust:100%}
.cv{position:relative;max-width:1600px;margin:0 auto;padding-block:16px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.cv *{box-sizing:border-box;min-width:0}
.cv :focus-visible,.cv-svg .pin:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.cv h1,.cv h2,.cv h3{margin:0;line-height:1.3}
.cv h1{font:12px/1.5 var(--f-px);color:var(--px-green);letter-spacing:.02em;text-shadow:0 0 8px rgba(76,242,161,.5)}
.cv h2{font:600 16px/1.3 var(--f-sans)}
.cv h3{font:12px/1.4 var(--f-sans);font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.cv code{font-family:var(--f-mono);font-size:.95em;background:var(--code-bg);padding:0 4px;border-radius:3px}
.cv a{color:var(--accent)}
/* steel panels with bevel + rivets */
.panel{position:relative;background:var(--steel);border:2px solid var(--steel-lo);border-radius:6px;padding:12px 14px 12px;box-shadow:inset 0 2px 0 var(--steel-hi),inset 0 -2px 0 var(--steel-lo),inset 2px 0 0 rgba(59,126,166,.5),0 6px 14px rgba(0,0,0,.5)}
.rv{position:absolute;width:6px;height:6px;border-radius:50%;background:var(--rivet);box-shadow:0 0 0 2px var(--rivet-ring),inset 0 -1px 0 rgba(0,0,0,.4);pointer-events:none}
.rv.tl{top:5px;left:5px}.rv.tr{top:5px;right:5px}.rv.bl{bottom:5px;left:5px}.rv.br{bottom:5px;right:5px}
.ph{font:11px/1.6 var(--f-px);color:var(--px-green);margin:0 0 8px;letter-spacing:.02em;text-shadow:0 0 6px rgba(76,242,161,.45)}
.ph.y{color:var(--px-yellow);text-shadow:0 0 6px rgba(255,210,63,.45)}
.px{font:11px/1.6 var(--f-px)}
.px.y{color:var(--px-yellow)}.px.g{color:var(--px-green)}
/* header strip */
.cv-top{display:flex;flex-wrap:wrap;align-items:center;gap:8px 18px}
.cv-top .sp{flex:1}
.cv-sub{margin:4px 0 0;color:var(--muted);font-size:14px;flex-basis:100%}
.cv-notes{flex-basis:100%}
.cv-notes p{margin:2px 0 0;color:var(--muted);font-size:13.5px;max-width:80ch}
.switch{display:inline-flex;align-items:center;gap:8px;background:none;border:0;padding:4px 0;color:var(--px-yellow);font:11px/1 var(--f-px);cursor:pointer}
.switch .trk{width:34px;height:18px;border-radius:9px;background:var(--steel-lo);border:2px solid var(--steel-hi);position:relative;box-shadow:inset 0 1px 3px rgba(0,0,0,.6)}
.switch .knob{position:absolute;top:1px;left:1px;width:12px;height:12px;border-radius:50%;background:var(--rivet);transition:left .15s,background .15s}
.switch[aria-pressed="true"] .knob{left:17px;background:var(--glow-green);box-shadow:0 0 6px var(--glow-green)}
.cv-problems{background:var(--danger-soft);color:var(--danger);border:2px solid var(--danger);border-radius:6px;padding:10px 12px;margin:0 0 16px;font:13px/1.5 var(--f-mono);white-space:pre-wrap}
.cv-problems.ok{background:var(--inner);color:var(--ok);border-color:var(--ok)}
/* three columns */
.cv-grid{position:relative;display:grid;grid-template-columns:220px minmax(0,1fr) 360px;gap:16px;align-items:start}
.cv-left{display:grid;gap:14px;order:1}
.cv-board{order:2;position:sticky;top:12px}
.cv-right{order:3}
.cable{position:absolute;pointer-events:none;border-radius:3px;opacity:.9;z-index:0}
.cable.v{top:0;bottom:0;width:16px;background:linear-gradient(90deg,var(--glow-red) 0 3px,transparent 3px 4.5px,var(--glow-green) 4.5px 7.5px,transparent 7.5px 9px,var(--glow-blue) 9px 12px,transparent 12px 13.5px,var(--px-yellow) 13.5px 16px)}
.cable.v.a{left:220px}.cable.v.b{right:360px}
.cable.h{left:0;right:0;top:-16px;height:16px;background:linear-gradient(180deg,var(--glow-red) 0 3px,transparent 3px 4.5px,var(--glow-green) 4.5px 7.5px,transparent 7.5px 9px,var(--glow-blue) 9px 12px,transparent 12px 13.5px,var(--px-yellow) 13.5px 16px)}
.cv-grid>:not(.cable){position:relative;z-index:1}
/* widgets */
.stage-title{font:600 15px/1.3 var(--f-sans);margin:2px 0 8px;color:var(--ink)}
.scope{display:block;width:100%;height:64px;background:#04161c;border:2px solid var(--steel-lo);border-radius:4px;box-shadow:inset 0 0 12px rgba(0,0,0,.7)}
.comps{display:grid;gap:6px;margin:0;padding:0;list-style:none}
.comps li{display:flex;align-items:center;gap:8px}
.tag{font:12px/1.4 var(--f-mono);background:#0b1e2a;color:var(--ink);border:1px solid var(--line);border-radius:3px;padding:1px 7px;letter-spacing:.04em;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
.tag::before{content:"";display:inline-block;width:4px;height:4px;border-radius:50%;background:var(--px-green);margin-right:6px;vertical-align:1px}
.comps .cnt{margin-left:auto;font:11px/1.4 var(--f-px);color:var(--px-yellow)}
.comps li.full .cnt{color:var(--px-green)}
.cv-inspector .body{font:14px/1.45 var(--f-mono)}
.cv-inspector p{margin:2px 0}
.cv-inspector pre{margin:4px 0 0;font:12px/1.5 var(--f-mono);white-space:pre-wrap;user-select:all}
.io{font:11px/1.4 var(--f-mono);padding:0 5px;border-radius:3px;background:var(--code-bg);color:var(--muted);margin:0 4px;border:1px solid var(--line)}
.deco{display:flex;align-items:center;justify-content:space-around;gap:10px;padding:6px 4px 2px}
.fan{width:46px;height:46px;border-radius:50%;background:conic-gradient(var(--steel-hi) 0 40deg,var(--steel-lo) 40deg 90deg,var(--steel-hi) 90deg 130deg,var(--steel-lo) 130deg 180deg,var(--steel-hi) 180deg 220deg,var(--steel-lo) 220deg 270deg,var(--steel-hi) 270deg 310deg,var(--steel-lo) 310deg 360deg);border:3px solid var(--steel-lo);box-shadow:0 0 0 2px var(--steel-hi),inset 0 0 0 10px var(--steel),inset 0 0 0 13px var(--steel-lo);animation:cv-spin 6s linear infinite}
@keyframes cv-spin{to{transform:rotate(360deg)}}
.chip{width:40px;height:26px;background:#1c1c21;border:2px solid #000;border-radius:2px;box-shadow:0 -6px 0 -2px #cfd5dc,0 6px 0 -2px #cfd5dc;position:relative}
.chip::after{content:"";position:absolute;left:4px;top:4px;width:5px;height:5px;border-radius:50%;background:#55575f}
.res{width:46px;height:14px;background:#d8c7a1;border-radius:7px;position:relative;box-shadow:-10px 0 0 -5px #cfd5dc,10px 0 0 -5px #cfd5dc}
.res::before{content:"";position:absolute;inset:0;border-radius:7px;background:linear-gradient(90deg,transparent 8px,#c00 8px 12px,transparent 12px 16px,#c00 16px 20px,transparent 20px 24px,#8b5a2b 24px 28px,transparent 28px 34px,#d9a93c 34px 38px,transparent 38px)}
.vent{width:40px;height:34px;border:2px solid var(--steel-lo);border-radius:3px;background:repeating-linear-gradient(180deg,var(--steel-lo) 0 3px,var(--steel-hi) 3px 4px,var(--steel) 4px 7px)}
/* board */
.cv-scroll{overflow-x:auto;border:2px solid var(--steel-lo);border-radius:4px;background:var(--pcb-lo);box-shadow:inset 0 0 18px rgba(0,0,0,.7)}
.cv-svg{display:block;width:100%;min-width:720px;height:auto;font-family:var(--f-mono)}
.cv-under{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;margin-top:10px}
.cv-legend{display:flex;flex-wrap:wrap;gap:6px 8px;margin:0;padding:0;list-style:none;font:12px/1.5 var(--f-mono);flex:1}
.cv-legend li{display:flex;align-items:center;gap:6px;background:var(--code-bg);color:var(--ink);border:1px solid var(--line);border-radius:3px;padding:1px 8px}
.sw{flex:none;width:12px;height:12px;border-radius:2px;border:1px solid rgba(255,255,255,.4)}
/* buttons */
.btn{font:500 13px/1 var(--f-sans);padding:8px 12px;border-radius:4px;border:2px solid var(--steel-lo);background:linear-gradient(var(--steel-hi),var(--steel));color:var(--ink);cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 2px 0 var(--steel-lo)}
.btn:hover{filter:brightness(1.12)}
.btn:active{transform:translateY(1px);box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 1px 0 var(--steel-lo)}
.btn:disabled{opacity:.45;cursor:default;transform:none}
.btn.primary{background:linear-gradient(#f3c85e,var(--accent));color:var(--accent-ink);border-color:#6b4a06;box-shadow:inset 0 1px 0 rgba(255,255,255,.4),0 2px 0 #6b4a06,0 0 12px -4px var(--accent-glow)}
.btn.sm{padding:5px 8px;font-size:12px}
.btn.quiet{color:var(--muted)}
.btn.danger[data-armed]{border-color:var(--danger);color:var(--danger);background:var(--danger-soft)}
/* steps panel */
.steps-wrap{display:grid;grid-template-columns:30px minmax(0,1fr);gap:10px;align-items:stretch}
.vbar{display:flex;flex-direction:column;align-items:center;gap:6px}
.vbar .trk{flex:1;width:16px;min-height:160px;border:2px solid var(--steel-lo);border-radius:3px;background:var(--code-bg);position:relative;overflow:hidden;box-shadow:inset 0 0 6px rgba(0,0,0,.7)}
.vbar .trk i{position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(var(--px-green),var(--glow-green));box-shadow:0 0 10px var(--glow-green);transition:height .3s}
.vbar .pct{font:11px/1 var(--f-px);color:var(--px-green);writing-mode:vertical-rl;transform:rotate(180deg)}
.steps-scroll{max-height:calc(100vh - 150px);overflow-y:auto;padding:8px 10px;background:var(--inner);border:2px solid var(--steel-lo);border-radius:4px;box-shadow:inset 0 0 10px rgba(0,0,0,.5)}
.cv-tools{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}
.cv-tools .sp{flex:1}
.stages,.steps{list-style:none;margin:0;padding:0}
.stage{margin-bottom:20px}
.stage h2{display:flex;align-items:center;gap:8px}
.stage h2 .n{font:11px/1.6 var(--f-px);color:var(--px-green)}
.stage h2::after{content:"";flex:1;height:1px;background:var(--line);margin-left:6px}
.intent{margin:2px 0 8px;color:var(--muted);font-size:14px}
.step{display:grid;grid-template-columns:auto 1fr;gap:0 10px;align-items:start;padding:6px 8px;margin:0 0 2px -8px;border:1px solid transparent;border-left:3px solid transparent;border-radius:3px}
.step.sel{border-color:rgba(232,180,74,.4);border-left-color:var(--accent);background:var(--accent-soft);box-shadow:0 0 14px -6px var(--accent-glow)}
.step input{width:18px;height:18px;margin:4px 0 0;accent-color:var(--accent);cursor:pointer}
.pick{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;text-align:left;background:none;border:0;padding:2px 0;font:inherit;color:inherit;cursor:pointer;width:100%}
.step.done .pick{color:var(--muted)}
.pn{font-family:var(--f-mono);font-size:1.05em}
.arr{color:var(--muted);padding:0 2px}
.note{grid-column:2;margin:0;font-size:13.5px;color:var(--muted)}
.check{margin:10px 0 0;padding:10px 12px;border:1px solid var(--line);border-radius:4px;background:var(--inner-lo)}
.check h3{margin-bottom:6px;color:var(--px-yellow);font:11px/1.6 var(--f-px);text-transform:none;letter-spacing:0}
.check p{margin:8px 0 0}
.run{position:relative;margin:6px 0 0}
.run pre{margin:0;padding:8px 72px 8px 10px;background:var(--code-bg);border:1px solid var(--line);border-radius:4px;overflow-x:auto;font:13px/1.55 var(--f-mono)}
.run pre code{background:none;padding:0;font-size:inherit}
.run .btn{position:absolute;top:6px;right:6px}
/* pin map */
.cv-pinmap{margin-top:16px}
.cv-pinmap h3{margin:14px 0 6px;font:600 14px/1.3 var(--f-sans);text-transform:none;letter-spacing:0;color:var(--ink)}
.cv-pinmap h3 small{font-weight:400;color:var(--muted);font-size:12px;margin-left:8px}
.cv-pinmap table{border-collapse:collapse;font-size:14px;font-variant-numeric:tabular-nums}
.cv-pinmap td,.cv-pinmap th{text-align:left;padding:4px 14px 4px 0;border-bottom:1px solid var(--line);vertical-align:top}
.cv-pinmap th{font-weight:500;color:var(--muted);font-size:12px}
.cv-pinmap td:last-child{font-family:var(--f-mono);font-size:13px}
.cv-pinmap td:last-child .sw{display:inline-block;vertical-align:-2px;margin-right:6px}
.cv-tip{position:fixed;z-index:10;max-width:320px;padding:6px 9px;border-radius:4px;background:var(--tip-bg);color:var(--tip-ink);border:1px solid var(--steel-hi);font:13px/1.4 var(--f-mono);pointer-events:none;box-shadow:0 4px 14px rgba(0,0,0,.6)}
.cv-tip b{color:var(--px-yellow)}
@media(max-width:1199px){.cv-grid{grid-template-columns:minmax(0,1fr) 340px}.cv-left{grid-column:1/-1;order:3;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}.cable.v{display:none}}
@media(max-width:860px){.cv-grid{grid-template-columns:minmax(0,1fr)}.cv-board{position:static;order:1}.cv-right{order:2}.cv-left{order:3;grid-template-columns:1fr}.cable,.deco{display:none}.steps-scroll{max-height:none}.cv{padding-block:12px}.panel{padding:10px}}
/* diagram: the game board */
.board-bg{fill:var(--pcb)}
.ruler{fill:var(--steel-lo)}
.ruler-t{font-size:8px;fill:var(--muted)}
.ruler-l{stroke:var(--rivet);stroke-width:1}
.rail{stroke:#fff;stroke-width:1}
.sticker .stk{fill:var(--sticker)}
.sticker .stk-t{fill:var(--sticker-ink)}
.rail-lbl{font-size:11px}
.part .lift{transform-box:fill-box;transform-origin:center;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5));transition:transform .18s,filter .18s}
.part .lift:hover{transform:translateY(-1px) scale(1.01);filter:drop-shadow(0 5px 7px rgba(0,0,0,.5))}
.part .lift.drag{transform:scale(1.03);filter:drop-shadow(0 12px 14px rgba(0,0,0,.6))}
.part rect.body{stroke:var(--part-edge);stroke-width:1;cursor:grab;touch-action:none}
.part .lift.drag rect.body{cursor:grabbing}
.part text{pointer-events:none}
.part .lead{stroke:var(--pad-silver);stroke-width:2}
.part-name{font-family:var(--f-mono);font-size:12px}
.pin-lbl{font-size:11px;fill:var(--part-ink)}
.pin-lbl .sub{font-size:8.5px;fill:var(--part-sub)}
.ink-dark .pin-lbl{fill:var(--part-ink-dark)}
.ink-dark .pin-lbl .sub{fill:var(--part-sub-dark)}
.ink-dark .decor-lbl{fill:var(--part-ink-dark)}
.decor-lbl{font-size:8.5px;fill:var(--part-ink)}
/* wires as traces: dim copper when not done, powered glow when done, bright pulse when selected */
.wire{cursor:pointer}
.wire .under{fill:none;stroke:rgba(0,0,0,.55);stroke-width:4.2;stroke-linecap:round}
.wire .line{fill:none;stroke-width:2.2;stroke-linecap:round;filter:drop-shadow(0 0 3px currentColor)}
.wire .halo{fill:none;stroke-width:12;stroke-linecap:round;opacity:0;pointer-events:stroke}
.wire.todo .line{stroke:var(--copper);stroke-width:1.5;stroke-dasharray:5 4;opacity:.65;filter:none}
.wire.todo .under{stroke-width:3.5;stroke-dasharray:5 4;opacity:.5}
.wire.todo .dot{fill:var(--copper)}
.wire.sel .line{stroke-width:4;stroke-dasharray:none;opacity:1;filter:drop-shadow(0 0 6px currentColor)}
.wire.sel .under{stroke-width:6;stroke-dasharray:none;opacity:1}
.wire.sel .halo{opacity:.35}
.wire .dot{stroke:#fff;stroke-width:1}
.has-sel .wire:not(.sel){opacity:.6}
.has-sel .part{opacity:.9}
.pin{cursor:help;outline:none}
.pin .pad{stroke:rgba(0,0,0,.5);stroke-width:.8}
.pin .ring{fill:none;stroke:var(--accent);stroke-width:2.5;opacity:0;pointer-events:all;filter:drop-shadow(0 0 3px var(--accent))}
.pin.sel .ring,.pin:focus-visible .ring{opacity:1}
.wire .line,.wire .under,.wire .halo,.wire,.pin .ring,.part{transition:opacity .15s,stroke-width .15s}
@media(prefers-reduced-motion:reduce){.cv *,.cv-svg *,.part .lift{transition:none!important;scroll-behavior:auto!important;animation:none!important}.part .lift:hover{transform:none}}
`;

/* ---------- tiny DOM helpers ---------- */
function el(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === "class") e.className = v; else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else if (v != null) e.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null) e.append(kid);
  return e;
}
function svg(tag, attrs, ...kids) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) if (v != null) e.setAttribute(k, v);
  for (const kid of kids.flat()) if (kid != null) e.append(kid);
  return e;
}
/* "text with `code` spans" -> fragment */
function rich(s) {
  const f = document.createDocumentFragment();
  String(s).split("`").forEach((t, i) => f.append(i % 2 ? el("code", null, t) : t));
  return f;
}
/* light fill (e.g. a white DHT22 body) gets dark ink */
function isLight(css) {
  const m = /^#([0-9a-f]{6})$/i.exec(css || ""); if (!m) return false;
  const n = parseInt(m[1], 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.6;
}
/* a riveted steel panel: panel("STAGE", "y" | "", extraClass, ...kids) */
function panel(title, cls, extra, ...kids) {
  return el("section", { class: "panel" + (extra ? " " + extra : "") }, ["tl", "tr", "bl", "br"].map(p => el("i", { class: "rv " + p })),
    title ? el("h2", { class: "ph " + (cls || "") }, title) : null, ...kids);
}

/* ---------- UI sounds: Web Audio, synthesised, lazy ---------- */
const SOUND_KEY = "circutiviz:sound";
let actx = null, muted = false, lastTick = 0;
try { muted = localStorage.getItem(SOUND_KEY) === "off"; } catch (e) { /* ignore */ }
function beep(freq, dur, type, gain, freq2, at) {
  if (muted || !actx) return;
  try {
    if (actx.state === "suspended") actx.resume();
    const t = actx.currentTime + (at || 0), o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (freq2) o.frequency.exponentialRampToValueAtTime(freq2, t + dur);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + 0.02);
  } catch (e) { /* audio unavailable */ }
}
const SFX = {
  hover: () => { const n = performance.now(); if (n - lastTick > 70) { lastTick = n; beep(1900, 0.025, "sine", 0.035); } },
  select: () => beep(620, 0.07, "square", 0.05, 980),
  done: () => { beep(784, 0.06, "triangle", 0.08); beep(1175, 0.09, "triangle", 0.08, null, 0.06); },
  undone: () => beep(440, 0.1, "triangle", 0.07, 300),
  pickup: () => beep(420, 0.06, "sine", 0.07, 760),
  drop: () => beep(760, 0.07, "sine", 0.07, 380),
  error: () => beep(130, 0.12, "sawtooth", 0.06, 110),
  powerup: () => { beep(523, 0.08, "square", 0.06); beep(659, 0.08, "square", 0.06, null, 0.09); beep(784, 0.1, "square", 0.07, null, 0.18); beep(1047, 0.12, "square", 0.07, null, 0.28); },
};
function armAudio(onReady) { // browsers block audio until a user gesture; build the context on the first one
  const start = () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* no audio */ } onReady && onReady(); };
  for (const ev of ["pointerdown", "keydown"]) document.addEventListener(ev, start, { once: true, capture: true });
}

/* ---------- SIGNAL widget: a tiny oscilloscope, flat at idle, a blip per event ---------- */
function makeScope(reducedMotion) {
  const c = el("canvas", { class: "scope", width: 220, height: 64, "aria-hidden": "true" }), ctx = c.getContext("2d");
  const N = 110, buf = new Float32Array(N); let raf = 0, t0 = 0, active = false, col = "#3dff9a", amp = 0.8;
  function draw(now) {
    raf = 0;
    if (active) {
      const p = (now - t0) / 700; buf.copyWithin(0, 2);
      for (let k = N - 2; k < N; k++) buf[k] = p < 1 ? Math.sin(p * Math.PI * 7) * (1 - p) * amp : 0;
      if (now - t0 > 1500) { active = false; buf.fill(0); }
    }
    const w = c.width, h = c.height; ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(61,255,154,.12)"; ctx.lineWidth = 1; ctx.beginPath();
    for (let x = 0.5; x < w; x += 16) { ctx.moveTo(x, 0); ctx.lineTo(x, h); } for (let y = 0.5; y < h; y += 16) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.shadowColor = col; ctx.shadowBlur = 6; ctx.beginPath();
    for (let i = 0; i < N; i++) { const x = i / (N - 1) * w, y = h / 2 - buf[i] * (h / 2 - 6); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.shadowBlur = 0;
    if (active) raf = requestAnimationFrame(draw);
  }
  c.blip = (color, a) => { if (reducedMotion) return; col = color || "#3dff9a"; amp = a || 0.8; t0 = performance.now(); active = true; if (!raf) raf = requestAnimationFrame(draw); };
  draw(0);
  return c;
}

/* ---------- render ---------- */
function render(C, catalog, root) {
  root = root || document.getElementById("circutiviz") || document.body;
  if (!C) { root.append("CircutiViz: window.CIRCUIT is not defined. Load the project data file before circutiviz.js."); return; }
  const KEY = "circutiviz:" + (C.id || "circuit");
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };
  const M = buildModel(C, catalog || window.CIRCUTIVIZ_PARTS || {}, load(KEY + ":layout", {}));
  const { COLORS, parts, rails, stages, steps, wires, problems, W, H } = M;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches, canHover = matchMedia("(hover: hover)").matches;
  const G = !reducedMotion && window.gsap ? window.gsap : null; // GSAP is optional: without it only CSS transitions remain
  const scope = makeScope(reducedMotion);

  /* diagram: PCB board with copper grid + rulers inside the bezel */
  const diagram = svg("svg", { class: "cv-svg", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Wiring diagram" });
  const pat = svg("pattern", { id: "cv-grid", width: CM * 5, height: CM * 5, x: RULER, y: RULER, patternUnits: "userSpaceOnUse" });
  for (let i = 1; i < 5; i++) pat.append(svg("line", { x1: i * CM, y1: 0, x2: i * CM, y2: CM * 5, stroke: "var(--copper)", "stroke-opacity": 0.3 }), svg("line", { x1: 0, y1: i * CM, x2: CM * 5, y2: i * CM, stroke: "var(--copper)", "stroke-opacity": 0.3 }));
  pat.append(svg("line", { x1: 0.75, y1: 0, x2: 0.75, y2: CM * 5, stroke: "var(--copper)", "stroke-opacity": 0.55, "stroke-width": 1.5 }), svg("line", { x1: 0, y1: 0.75, x2: CM * 5, y2: 0.75, stroke: "var(--copper)", "stroke-opacity": 0.55, "stroke-width": 1.5 }));
  diagram.append(svg("defs", null, pat), svg("rect", { class: "board-bg", x: 0, y: 0, width: W, height: H }), svg("rect", { x: RULER, y: RULER, width: W - RULER, height: H - RULER, fill: "url(#cv-grid)" }));
  const rul = svg("g", { class: "rulers" }, svg("rect", { class: "ruler", x: 0, y: 0, width: W, height: RULER }), svg("rect", { class: "ruler", x: 0, y: 0, width: RULER, height: H }));
  for (let i = 1, x = RULER + CM; x < W - 10; i++, x += CM) rul.append(svg("line", { class: "ruler-l", x1: x, y1: RULER - 5, x2: x, y2: RULER }), svg("line", { class: "ruler-l", x1: x - CM / 2, y1: RULER - 3, x2: x - CM / 2, y2: RULER }), svg("text", { class: "ruler-t", x, y: 9, "text-anchor": "middle" }, String(i)));
  for (let i = 1, y = RULER + CM; y < H - 10; i++, y += CM) rul.append(svg("line", { class: "ruler-l", x1: RULER - 5, y1: y, x2: RULER, y2: y }), svg("line", { class: "ruler-l", x1: RULER - 3, y1: y - CM / 2, x2: RULER, y2: y - CM / 2 }), svg("text", { class: "ruler-t", x: 8, y: y + 3, "text-anchor": "middle" }, String(i)));
  diagram.append(rul);
  const PCB = { black: "var(--pcb-black)", blue: "var(--pcb-blue)", green: "var(--pcb-green)", purple: "var(--pcb-purple)" };
  const fillOf = (p) => PCB[p.style] || p.style || PCB.green;
  const padOf = (p) => p.style === "black" || !p.style ? "var(--pad-gold)" : "var(--pad-silver)";
  const stickers = [];
  function sticker(text, x, y, anchor, cls) { // small dark tag so text never sits directly on the board
    const t = svg("text", { class: "stk-t " + (cls || ""), x, y, "text-anchor": anchor }, text), r = svg("rect", { class: "stk", rx: 3 });
    stickers.push([r, t]); return svg("g", { class: "sticker" }, r, t);
  }
  const fitStickers = () => { for (const [r, t] of stickers) { const b = t.getBBox(); r.setAttribute("x", b.x - 6); r.setAttribute("y", b.y - 2.5); r.setAttribute("width", b.width + 12); r.setAttribute("height", b.height + 5); } };
  for (const r of rails) {
    const x1 = r.x1 != null ? r.x1 : 40, x2 = r.x2 != null ? r.x2 : W - 40, col = `var(--w-${COLORS[r.color || r.id] ? r.color || r.id : "wire"})`;
    diagram.append(svg("rect", { class: "rail", x: x1, y: r.y - 3, width: x2 - x1, height: 6, rx: 2, fill: col }), sticker(r.label || r.id, x1, r.y - 8, "start", "rail-lbl"));
  }
  function pinText(pin, x, y, anchor, transform) {
    const room = pin.edge === "left" || pin.edge === "right" ? pin.part.w : pin.part.h;
    const main = svg("tspan", null, pin.id), sub = pin.sub && room >= 70 ? svg("tspan", { class: "sub", dx: 4 }, pin.sub) : null; // tiny bodies: id only
    const t = svg("text", { class: "pin-lbl", x, y, "text-anchor": anchor, transform });
    if (anchor === "end") { if (sub) { sub.removeAttribute("dx"); main.setAttribute("dx", 4); t.append(sub); } t.append(main); }
    else { t.append(main); if (sub) t.append(sub); }
    return t;
  }
  const pinName = (pin) => `${pin.part.short} ${pin.id}${pin.sub ? ` (${pin.sub})` : ""}`;
  const partEls = {}, pinEls = {};
  for (const p of parts) {
    const lift = svg("g", { class: "lift" }), g = svg("g", { class: "part" + (isLight(p.style) ? " ink-dark" : "") }, lift);
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2, m = Math.min(p.w, p.h);
    const body = svg("rect", { class: "body", x: p.x, y: p.y, width: p.w, height: p.h, rx: p.kind === "component" ? 5 : 8, fill: fillOf(p) });
    lift.append(body); partEls[p.id] = body; p.g = g; p.rx = p.x; p.ry = p.y;
    for (const d of p.decor || []) {
      const ox = d.x != null ? p.x + d.x : null, oy = d.y != null ? p.y + d.y : null;
      if (d.type === "chip") {
        const s = Math.min(m * 0.34, p.w - 96), x = (ox != null ? ox : cx) - s / 2, y = (oy != null ? oy : cy) - s / 2; // leave ~48 per side for pin labels
        if (s >= 18) lift.append(svg("rect", { x, y, width: s, height: s, rx: 3, fill: "var(--chip)", stroke: "#55575f" }),
          svg("text", { class: "decor-lbl", x: x + s / 2, y: y + s / 2 + 3, "text-anchor": "middle", fill: "var(--part-ink)" }, d.label || ""));
      } else if (d.type === "usb") {
        lift.append(svg("rect", { x: (ox != null ? ox : cx) - 14, y: (oy != null ? oy : p.y) - 7, width: 28, height: 14, rx: 3, fill: "var(--pad-silver)", stroke: "#7d8591" }));
      } else if (d.type === "screen") {
        const r = m * 0.4, x = ox != null ? ox : cx, y = oy != null ? oy : cy;
        lift.append(svg("circle", { cx: x, cy: y, r: r + 4, fill: "#2a2f38" }), svg("circle", { cx: x, cy: y, r, fill: "var(--glass)" }),
          svg("circle", { cx: x - r * 0.35, cy: y - r * 0.35, r: r * 0.18, fill: "#fff", opacity: 0.08 }));
      } else if (d.type === "panel") {
        const w = d.w || p.w * 0.7, h = d.h || p.h * 0.55, x = (ox != null ? ox : cx) - w / 2, y = (oy != null ? oy : cy) - h / 2;
        lift.append(svg("rect", { x, y, width: w, height: h, rx: 3, fill: "var(--glass)", stroke: "#2a2f38", "stroke-width": 3 }));
      } else if (d.type === "button") {
        const at = d.at || "tl", x = ox != null ? ox : p.x + p.w * (at[1] === "l" ? 0.28 : 0.72), y = oy != null ? oy : (at[0] === "t" ? p.y + 10 : p.y + p.h - 10);
        lift.append(svg("rect", { x: x - 6, y: y - 6, width: 12, height: 12, rx: 2, fill: "#d9dde3", stroke: "#7d8591" }),
          svg("text", { class: "decor-lbl", x, y: y + 3, "text-anchor": "middle", fill: "#1a1d23" }, d.label || ""));
      } else if (d.type === "led") {
        const x = ox != null ? ox : cx, y = oy != null ? oy : p.y + p.h * 0.68;
        lift.append(svg("circle", { cx: x - 16, cy: y, r: 3, fill: "#ff5b4a" }), svg("text", { class: "decor-lbl", x: x - 9, y: y + 3 }, d.label || ""));
      }
    }
    const hasTop = p.pinList.some(q => q.edge === "top"), hasBottom = p.pinList.some(q => q.edge === "bottom"), lead = p.kind === "component" ? LEAD : 0;
    const nameY = !hasBottom ? p.y + p.h + 19 : !hasTop ? p.y - 9 : p.y + p.h + lead + 31;
    lift.append(sticker(p.name, cx, nameY, "middle", "part-name"));
    for (const pin of p.pinList) {
      if (lead) lift.append(svg("line", { class: "lead", x1: pin.lx, y1: pin.ly, x2: pin.x, y2: pin.y }));
      if (pin.edge === "left") lift.append(pinText(pin, pin.lx + 9, pin.ly + 3.5, "start"));
      else if (pin.edge === "right") lift.append(pinText(pin, pin.lx - 9, pin.ly + 3.5, "end"));
      else if (pin.edge === "top") lift.append(pinText(pin, pin.lx + 9, pin.ly + 3.5, "start", `rotate(90 ${pin.lx} ${pin.ly})`));
      else lift.append(pinText(pin, pin.lx - 9, pin.ly + 3.5, "end", `rotate(90 ${pin.lx} ${pin.ly})`));
    }
    diagram.append(g);
  }
  const wiresG = svg("g", { class: "wires" }), pinsG = svg("g", { class: "pins" });
  const drawOrder = [...wires.filter(w => w.rail), ...wires.filter(w => !w.rail)];
  for (const w of drawOrder) {
    const d = wirePath(w), col = `var(--w-${w.color})`;
    w.paths = [svg("path", { class: "halo", d, stroke: col }), svg("path", { class: "under", d }), svg("path", { class: "line", d, stroke: col })];
    w.dot = w.rail ? svg("circle", { class: "dot", cx: w.jx, cy: w.rail.y, r: 3.5, fill: col }) : null;
    w.el = svg("g", { class: "wire todo", "data-i": w.i, style: `color:${COLORS[w.color]}` }, w.paths, w.dot); // currentColor drives the glow
    w.el.addEventListener("click", () => select(w.i));
    w.el.addEventListener("mouseenter", SFX.hover);
    wiresG.append(w.el);
  }
  for (const p of parts) for (const pin of p.pinList) {
    pinEls[pin.ref] = svg("g", { class: "pin", tabindex: 0, "aria-label": `${pinName(pin)}: ${pin.io || "pin"}. ${pin.desc || ""}` },
      svg("circle", { class: "ring", cx: pin.x, cy: pin.y, r: 8.5 }), svg("circle", { class: "pad", cx: pin.x, cy: pin.y, r: 4.5, fill: padOf(p) }));
    pinsG.append(pinEls[pin.ref]);
  }
  diagram.append(wiresG, pinsG);
  function updateWire(w) {
    const d = wirePath(w); w.paths.forEach(pp => pp.setAttribute("d", d));
    if (w.dot) w.dot.setAttribute("cx", w.jx);
  }

  /* tooltip + inspector */
  const tip = el("div", { class: "cv-tip", role: "tooltip", id: "cv-tip", hidden: "" });
  const inspectorBody = el("div", { class: "body" });
  const inspector = panel("INSPECTOR", "", "cv-inspector", inspectorBody); inspector.id = "cv-inspector"; inspector.setAttribute("aria-live", "polite");
  const ioTag = (io) => el("span", { class: "io" }, io || "pin");
  const pinInfo = (pin) => el("p", null, el("b", { class: "pn" }, pinName(pin)), ioTag(pin.io), pin.desc || "");
  const partInfo = (p) => [el("p", null, el("b", null, p.name), p.kind ? ioTag(p.kind) : null, p.info || ""),
    p.pinOrderVaries ? el("p", null, "Wire by label; your board's pin order may differ.") : null,
    p.datasheet ? el("p", null, el("a", { href: p.datasheet, target: "_blank", rel: "noopener" }, "Datasheet / pinout")) : null];
  const tipPin = (pin) => [el("b", null, pin.id + (pin.sub ? ` (${pin.sub})` : "")), ` · ${pin.io || "pin"} · ${pin.desc || pin.part.name}`];
  const tipPart = (p) => [el("b", null, p.name), " · ", p.info || "", p.datasheet ? ` · ${p.datasheet.replace(/^https?:\/\//, "").split("/")[0]}` : ""];
  function setInspector(...kids) {
    inspectorBody.replaceChildren(...kids.flat().filter(Boolean));
    if (G) G.fromTo(inspectorBody, { opacity: 0, y: 3 }, { opacity: 1, y: 0, duration: 0.2, overwrite: true, clearProps: "all" });
  }
  function showTip(kids, x, y) {
    tip.replaceChildren(...kids); tip.hidden = false;
    const r = tip.getBoundingClientRect();
    tip.style.left = Math.max(4, Math.min(x + 14, innerWidth - r.width - 8)) + "px";
    tip.style.top = (y + 18 + r.height > innerHeight ? y - r.height - 10 : y + 18) + "px";
  }
  let dragEndAt = -1e9; // the click that follows a drag must not open the inspector
  function hoverable(node, kids, insp) {
    node.addEventListener("mouseenter", SFX.hover);
    node.addEventListener("mousemove", (e) => { if (canHover) showTip(kids(), e.clientX, e.clientY); });
    node.addEventListener("mouseleave", () => { tip.hidden = true; });
    node.addEventListener("click", () => { if (performance.now() - dragEndAt > 300) setInspector(insp()); });
    node.addEventListener("focus", () => { const r = node.getBoundingClientRect(); showTip(kids(), r.left, r.top); setInspector(insp()); });
    node.addEventListener("blur", () => { tip.hidden = true; });
  }
  for (const p of parts) {
    hoverable(partEls[p.id], () => tipPart(p), () => partInfo(p));
    for (const pin of p.pinList) hoverable(pinEls[pin.ref], () => tipPin(pin), () => [pinInfo(pin), partInfo(pin.part)[1]]);
  }

  /* drag parts (pointer events: mouse + touch), snap to grid, persist as an overlay on the data file */
  function movePart(p, x, y) {
    p.x = Math.max(RULER + 4, Math.min(W - p.w, x)); p.y = Math.max(RULER + 4, Math.min(H - p.h, y));
    placePins(p); layoutJunctions(wires);
    p.g.setAttribute("transform", `translate(${p.x - p.rx} ${p.y - p.ry})`);
    for (const pin of p.pinList) for (const c of pinEls[pin.ref].children) { c.setAttribute("cx", pin.x); c.setAttribute("cy", pin.y); }
    wires.forEach(updateWire);
  }
  const saveLayout = () => store(KEY + ":layout", Object.fromEntries(parts.map(p => [p.id, { x: p.x, y: p.y }])));
  for (const p of parts) {
    const body = partEls[p.id], lift = p.g.firstChild; let drag = null;
    body.addEventListener("pointerdown", (e) => { if (e.button) return; drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, px: p.x, py: p.y, moved: false }; body.setPointerCapture(e.pointerId); });
    body.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const k = W / diagram.clientWidth, dx = (e.clientX - drag.sx) * k, dy = (e.clientY - drag.sy) * k;
      if (!drag.moved) { if (Math.hypot(dx, dy) < 4) return; drag.moved = true; lift.classList.add("drag"); tip.hidden = true; SFX.pickup(); scope.blip("#3b8cff", 0.5); }
      movePart(p, snap(drag.px + dx), snap(drag.py + dy));
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.moved) { lift.classList.remove("drag"); SFX.drop(); scope.blip("#3b8cff", 0.5); saveLayout(); dragEndAt = performance.now(); }
      drag = null;
    };
    body.addEventListener("pointerup", end); body.addEventListener("pointercancel", end);
  }
  const layoutJSON = () => "{\n" + parts.map(p => `  "${p.id}": { "x": ${p.x}, "y": ${p.y} }`).join(",\n") + "\n}";
  const resetLayout = el("button", { type: "button", class: "btn sm quiet", id: "cv-layout-reset", onclick: () => { parts.forEach(p => movePart(p, p.x0, p.y0)); try { localStorage.removeItem(KEY + ":layout"); } catch (e) { /* ignore */ } SFX.drop(); } }, "Reset layout");
  const copyLayout = el("button", { type: "button", class: "btn sm quiet", id: "cv-layout-copy" }, "Copy layout");
  copyLayout.addEventListener("click", () => {
    const json = layoutJSON(), ok = () => { copyLayout.textContent = "Copied"; setTimeout(() => copyLayout.textContent = "Copy layout", 1500); SFX.select(); };
    const fallback = () => setInspector(el("p", null, "Clipboard blocked; select and copy this, then paste the x/y values into your wiring.js parts:"), el("pre", null, json));
    try { navigator.clipboard.writeText(json).then(ok, fallback); } catch (e) { fallback(); }
  });

  /* widgets: STAGE / WIRES, COMPONENTS, vertical progress */
  const swatch = (key) => el("span", { class: "sw", style: `background:var(--w-${key})` });
  const stageHead = el("h2", { class: "ph" }, "STAGE 1"), stageTitle = el("p", { class: "stage-title" }), wiresCount = el("span", { id: "cv-progress" });
  const stagePanel = panel(null, "", "", stageHead, stageTitle, el("p", { class: "px y", style: "margin:0" }, "WIRES ", wiresCount));
  const compRows = parts.map(p => ({ p, ws: wires.filter(w => w.pa.part === p || (w.pb && w.pb.part === p)), li: null, cnt: null })).filter(r => r.ws.length);
  for (const r of compRows) r.li = el("li", null, el("span", { class: "tag" }, r.p.short), r.cnt = el("span", { class: "cnt" }));
  const vfill = el("i"), vpct = el("span", { class: "pct" });
  const vbar = el("div", { class: "vbar" }, el("div", { class: "trk", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, id: "cv-vbar" }, vfill), vpct);
  const soundBtn = el("button", { type: "button", class: "switch", id: "cv-sound", "aria-pressed": String(!muted) }, el("span", { class: "trk" }, el("span", { class: "knob" })), muted ? "SND OFF" : "SND ON");
  soundBtn.addEventListener("click", () => { muted = !muted; try { localStorage.setItem(SOUND_KEY, muted ? "off" : "on"); } catch (e) { /* ignore */ } soundBtn.lastChild.textContent = muted ? "SND OFF" : "SND ON"; soundBtn.setAttribute("aria-pressed", String(!muted)); SFX.select(); });
  const problemsBox = el("div", { class: "cv-problems", id: "cv-problems", role: "alert", hidden: problems.length ? null : "" },
    problems.length ? "CircutiViz: problems in CIRCUIT data\n" + problems.map(p => "• " + p).join("\n") : "");
  const scroller = el("div", { class: "cv-scroll" }, diagram);
  const legend = el("ul", { class: "cv-legend" }, [...new Set(wires.map(w => w.color))].map(k => el("li", null, swatch(k), k)));

  /* steps */
  const stepEls = [], checkEls = [];
  const partLabel = (st) => {
    const end = (e) => e.rail ? [e.rail.label || e.rail.id] : [e.pin.part.short + " ", el("b", { class: "pn" }, e.pin.id), e.pin.sub ? ` (${e.pin.sub})` : ""];
    return [...end({ pin: st.pa }), el("span", { class: "arr" }, "→"), ...end(st.pb ? { pin: st.pb } : { rail: st.rail })];
  };
  const stageList = el("ol", { class: "stages" }, stages.map((stage, si) => {
    const items = steps.filter(s => s.stage === stage).map(st => {
      const cb = el("input", { type: "checkbox", id: "cv-done-" + st.i, "aria-label": "Done: " + (st.label || st.text) });
      cb.addEventListener("change", () => setDone(st.i, cb.checked, true));
      checkEls[st.i] = cb;
      const pick = el("button", { type: "button", class: "pick", id: "cv-pick-" + st.i, onclick: () => select(st.i), onmouseenter: SFX.hover },
        st.wire ? [swatch(st.color), el("span", null, ...(st.pa ? partLabel(st) : [st.label + " (unresolved)"]))] : el("span", null, rich(st.text)));
      return stepEls[st.i] = el("li", { class: "step", id: "cv-step-" + st.i }, cb, pick, st.note ? el("p", { class: "note" }, rich(st.note)) : null);
    });
    const run = stage.run ? [].concat(stage.run).join("\n") : null;
    let check = null;
    if (stage.check || run) {
      const code = el("code", { id: "cv-run-" + si }, run), copy = el("button", { type: "button", class: "btn sm", id: "cv-copy-" + si }, "Copy");
      copy.addEventListener("click", () => {
        const ok = () => { copy.textContent = "Copied"; setTimeout(() => copy.textContent = "Copy", 1500); SFX.select(); };
        const fallback = () => { const r = document.createRange(); r.selectNodeContents(code); const s = getSelection(); s.removeAllRanges(); s.addRange(r); copy.textContent = "Press Ctrl/⌘+C"; setTimeout(() => copy.textContent = "Copy", 2500); };
        try { navigator.clipboard.writeText(run).then(ok, fallback); } catch (e) { fallback(); }
      });
      check = el("div", { class: "check" }, el("h3", null, "CHECK"), run ? el("div", { class: "run" }, el("pre", null, code), copy) : null, stage.check ? el("p", null, rich(stage.check)) : null);
    }
    return el("li", { class: "stage" }, el("h2", null, el("span", { class: "n" }, String(si + 1)), stage.title || ""),
      stage.intent ? el("p", { class: "intent" }, rich(stage.intent)) : null, el("ol", { class: "steps" }, items), check);
  }));
  const prevBtn = el("button", { type: "button", class: "btn", id: "cv-prev", onclick: () => select(sel - 1) }, "Previous");
  const nextBtn = el("button", { type: "button", class: "btn primary", id: "cv-next", onclick: () => select(sel + 1) }, "Next");
  const resetBtn = el("button", { type: "button", class: "btn danger quiet", id: "cv-reset" }, "Reset progress");
  let armTimer;
  const disarm = () => { delete resetBtn.dataset.armed; resetBtn.textContent = "Reset progress"; };
  resetBtn.addEventListener("click", () => {
    if (resetBtn.dataset.armed) { clearTimeout(armTimer); disarm(); steps.forEach(s => setDone(s.i, false)); refreshCounts(); select(0); SFX.undone(); return; }
    resetBtn.dataset.armed = "1"; resetBtn.textContent = "Click again to clear all checkboxes"; armTimer = setTimeout(disarm, 4000); SFX.select();
  });
  const byPart = parts.map(p => ({ p, rows: wires.filter(w => w.pa.part === p) })).filter(x => x.rows.length);
  const pinmap = panel("PIN MAP", "y", "cv-pinmap", el("p", { class: "intent" }, "Generated from the wires above; check firmware pin numbers against this table."),
    byPart.map(({ p, rows }) => [el("h3", null, p.name, p.pinOrderVaries ? el("small", null, "wire by label; your board's pin order may differ") : null), el("table", null,
      el("thead", null, el("tr", null, el("th", null, "Pin"), el("th", null, "Connects to"), el("th", null, "Wire"))),
      el("tbody", null, rows.map(w => el("tr", null, el("td", null, el("b", { class: "pn" }, w.pa.id), w.pa.sub ? ` (${w.pa.sub})` : ""),
        el("td", null, endLabel(w.pb ? { pin: w.pb } : { rail: w.rail })), el("td", null, swatch(w.color), w.color)))))]));
  const page = el("div", { class: "cv" },
    panel(null, "", "", el("div", { class: "cv-top" }, el("h1", null, C.title || C.id || "Wiring"), el("span", { class: "sp" }), soundBtn, resetLayout, copyLayout,
      C.subtitle ? el("p", { class: "cv-sub" }, C.subtitle) : null, (C.notes || []).length ? el("div", { class: "cv-notes" }, (C.notes || []).map(n => el("p", null, rich(n)))) : null)),
    el("div", { style: "height:16px" }), problemsBox,
    el("div", { class: "cv-grid" }, el("i", { class: "cable v a" }), el("i", { class: "cable v b" }), el("i", { class: "cable h" }),
      el("aside", { class: "cv-left" }, stagePanel, panel("SIGNAL", "", "", scope), panel("COMPONENTS", "", "", el("ul", { class: "comps" }, compRows.map(r => r.li))), inspector,
        el("div", { class: "deco", "aria-hidden": "true" }, el("i", { class: "fan" }), el("i", { class: "chip" }), el("i", { class: "res" }), el("i", { class: "vent" }))),
      panel(null, "", "cv-board", scroller, el("div", { class: "cv-under" }, legend)),
      panel("STEPS", "y", "cv-right", el("div", { class: "steps-wrap" }, vbar, el("div", { class: "steps-scroll" }, el("div", { class: "cv-tools" }, prevBtn, nextBtn, el("span", { class: "sp" }), resetBtn), stageList)))),
    pinmap, tip);

  /* progress + selection state */
  let state = Object.assign({ done: {}, sel: null }, load(KEY, {})), sel = -1;
  const save = () => store(KEY, state);
  const isDone = (w) => !!state.done[w.key];
  function refreshCounts() {
    const n = wires.filter(isDone).length, pct = wires.length ? Math.round(100 * n / wires.length) : 0;
    wiresCount.textContent = `${n}/${wires.length}`; vfill.style.height = pct + "%"; vpct.textContent = pct + "%"; vbar.firstChild.setAttribute("aria-valuenow", pct);
    for (const r of compRows) { const d = r.ws.filter(isDone).length; r.cnt.textContent = `${d}/${r.ws.length}`; r.li.classList.toggle("full", d === r.ws.length); }
  }
  function setDone(i, done, user) {
    const st = steps[i];
    if (done) state.done[st.key] = true; else delete state.done[st.key];
    checkEls[i].checked = done; stepEls[i].classList.toggle("done", done);
    if (st.el) st.el.classList.toggle("todo", !done);
    save();
    if (!user) return;
    refreshCounts();
    const stageWires = wires.filter(w => w.stage === st.stage);
    if (done && stageWires.length && stageWires.every(isDone)) { SFX.powerup(); scope.blip("#3dff9a", 1); }
    else { (done ? SFX.done : SFX.undone)(); scope.blip(done ? "#3dff9a" : "#ffd23f", 0.9); }
    if (G) {
      if (st.el) G.fromTo(st.paths[2], { strokeWidth: 7, opacity: 1 }, { strokeWidth: done ? 2.2 : 1.5, duration: 0.35, ease: "power2.out", clearProps: "all" });
      G.fromTo(vbar.firstChild, { scaleX: 1.6, transformOrigin: "50% 50%" }, { scaleX: 1, duration: 0.3, ease: "power2.out", clearProps: "all" });
    }
  }
  let pulse = null;
  function select(i, quiet) {
    if (!steps.length) return;
    i = Math.max(0, Math.min(steps.length - 1, i));
    if (sel >= 0) {
      stepEls[sel].classList.remove("sel"); stepEls[sel].removeAttribute("aria-current");
      const w = steps[sel]; if (w.el) { w.el.classList.remove("sel"); pinEls[w.pa.ref].classList.remove("sel"); if (w.pb) pinEls[w.pb.ref].classList.remove("sel"); if (pulse) { pulse.kill(); pulse = null; w.paths[0].style.opacity = ""; } }
    }
    sel = i; state.sel = steps[i].key; save();
    const st = steps[i];
    stepEls[i].classList.add("sel"); stepEls[i].setAttribute("aria-current", "step");
    stageHead.textContent = "STAGE " + (st.si + 1); stageTitle.textContent = st.stage.title || "";
    diagram.classList.toggle("has-sel", !!st.el);
    prevBtn.disabled = i === 0; nextBtn.disabled = i === steps.length - 1;
    if (!quiet) { SFX.select(); scope.blip("#3dff9a", 0.5); }
    if (G && !quiet) G.fromTo(stepEls[i], { x: 8 }, { x: 0, duration: 0.25, ease: "power2.out", clearProps: "transform" });
    if (st.el) {
      st.el.classList.add("sel"); pinEls[st.pa.ref].classList.add("sel"); if (st.pb) pinEls[st.pb.ref].classList.add("sel");
      for (const w of drawOrder) wiresG.append(w.el); wiresG.append(st.el); // selected wire on top, others in stage order
      setInspector(pinInfo(st.pa), st.pb ? pinInfo(st.pb) : el("p", null, el("b", { class: "pn" }, st.rail.label || st.rail.id), ioTag("rail"), "Breadboard power rail; every pin on it is the same net."));
      if (G) {
        const line = st.paths[2], len = line.getTotalLength();
        if (!quiet) G.fromTo(line, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.4, ease: "power2.out", overwrite: true, clearProps: "strokeDasharray,strokeDashoffset" });
        if (!quiet) for (const ref of [st.pa.ref, st.pb && st.pb.ref]) if (ref) G.fromTo(pinEls[ref].firstChild, { attr: { r: 8.5 }, opacity: 1 }, { attr: { r: 15 }, opacity: 0.15, duration: 0.3, repeat: 1, yoyo: true, overwrite: true, clearProps: "opacity" });
        pulse = G.fromTo(st.paths[0], { opacity: 0.2 }, { opacity: 0.55, duration: 0.7, repeat: -1, yoyo: true, ease: "sine.inOut" }); // powered trace pulse
      }
      // pan the diagram so the wire is on screen when the SVG is wider than its box (phones)
      const bb = st.el.getBBox(), k = diagram.clientWidth / W, x0 = bb.x * k, x1 = (bb.x + bb.width) * k;
      if (x0 < scroller.scrollLeft || x1 > scroller.scrollLeft + scroller.clientWidth)
        scroller.scrollTo({ left: (x0 + x1) / 2 - scroller.clientWidth / 2, behavior: reducedMotion ? "auto" : "smooth" });
    } else setInspector(el("p", null, st.wire ? "This wire could not be resolved; see the error banner." : rich(st.text)));
    stepEls[i].scrollIntoView({ block: "nearest", behavior: reducedMotion ? "auto" : "smooth" });
  }

  /* mount */
  if (!document.getElementById("cv-style")) document.head.append(
    el("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }),
    el("link", { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Share+Tech+Mono&family=IBM+Plex+Sans:wght@400;500;600&display=swap" }),
    el("style", { id: "cv-style" }, CSS(Object.entries(COLORS).map(([k, v]) => `--w-${k}:${v}`).join(";"))));
  if (!document.title && C.title) document.title = C.title;
  root.append(page);
  fitStickers(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitStickers);
  armAudio(() => { if (problems.length) { SFX.error(); scope.blip("#ff3b3b", 1); } });
  steps.forEach(s => setDone(s.i, !!state.done[s.key]));
  refreshCounts();
  if (!wires.length && !problems.length) { problemsBox.hidden = false; problemsBox.textContent = "CircutiViz: no wires found in CIRCUIT.stages."; }
  select(Math.max(0, steps.findIndex(s => s.key === state.sel)), true);
  document.addEventListener("keydown", (e) => {
    const t = e.target, tag = t.tagName;
    if (e.altKey || e.ctrlKey || e.metaKey || tag === "TEXTAREA" || (tag === "INPUT" && t.type !== "checkbox")) return;
    if (e.key === "ArrowDown" || e.key === "j") { e.preventDefault(); select(sel + 1); focusSel(); }
    else if (e.key === "ArrowUp" || e.key === "k") { e.preventDefault(); select(sel - 1); focusSel(); }
    else if (e.key === " " && !(tag === "INPUT" || tag === "A" || (tag === "BUTTON" && !t.classList.contains("pick")))) { e.preventDefault(); if (sel >= 0) setDone(sel, !checkEls[sel].checked, true); }
    else if (e.key === "Escape") tip.hidden = true;
  });
  const focusSel = () => { if (sel >= 0) document.getElementById("cv-pick-" + sel).focus({ preventScroll: true }); };

  /* self-check: open the page with #selftest */
  if (location.hash === "#selftest") {
    const v = validate(C, catalog), s = v.summary;
    const line = `CircutiViz selftest: ${s.parts} parts, ${s.rails} rails, ${s.steps} steps, ${s.wires} wires drawn, ${s.unresolved} unresolved, ${v.problems.length} problem(s), gsap ${window.gsap ? "on" : "off"} — ${v.ok ? "OK" : "FAILED"}`;
    console.log(line); v.problems.forEach(p => console.error("CircutiViz:", p));
    console.assert(wires.every(w => w.el && w.el.isConnected && pinEls[w.pa.ref] && (w.rail || pinEls[w.pb.ref])), "wire not rendered");
    if (v.ok) { problemsBox.hidden = false; problemsBox.classList.add("ok"); problemsBox.textContent = line; }
  }
  return M;
}

if (typeof window !== "undefined") window.CircutiViz = { validate, render };
if (typeof document !== "undefined") render(window.CIRCUIT, window.CIRCUTIVIZ_PARTS);
})();
