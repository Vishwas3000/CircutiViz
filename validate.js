#!/usr/bin/env node
/* Validate a CircutiViz project without a browser:  node validate.js path/to/wiring.js
   Check the parts catalog:                           node validate.js --catalog
   Loads components.js (+ the project file) + circutiviz.js in a vm sandbox (no DOM) and runs the same
   CircutiViz.validate(circuit, parts) the page uses for its error banner. Exit code 1 on problems.
   Written with dynamic import() so it runs whether node treats .js as CommonJS or ESM. */
(async () => {
  const [fs, path, vm] = await Promise.all([import("node:fs"), import("node:path"), import("node:vm")]);
  const arg = process.argv[2];
  if (!arg) { console.error("usage: node validate.js path/to/wiring.js | --catalog"); process.exit(2); }
  const here = path.dirname(path.resolve(process.argv[1]));
  const ctx = vm.createContext({ console });
  ctx.window = ctx;
  const run = (f) => { try { vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f }); } catch (e) { console.error(`${f}: ${e.message}`); process.exit(1); } };
  run(path.join(here, "components.js"));

  if (arg === "--catalog") {
    const CATS = ["boards", "sensors", "displays", "actuators", "radio", "power", "passives", "interface"], IOS = ["power", "gnd", "in", "out", "io", "nc"];
    const parts = ctx.CIRCUTIVIZ_PARTS || {}, problems = [], perCat = {};
    for (const [id, p] of Object.entries(parts)) {
      const bad = (m) => problems.push(`${id}: ${m}`);
      for (const f of ["name", "short", "kind", "category", "use", "info"]) if (typeof p[f] !== "string" || !p[f].trim()) bad(`missing ${f}`);
      if (!["board", "module", "component"].includes(p.kind)) bad(`kind "${p.kind}" is not board|module|component`);
      if (!CATS.includes(p.category)) bad(`category "${p.category}" is not one of ${CATS.join("|")}`);
      if (!(p.w > 0) || !(p.h > 0)) bad("w and h must be positive numbers");
      const edges = Object.entries(p.pins || {}).filter(([, l]) => Array.isArray(l) && l.length);
      if (!edges.length) bad("no pins");
      for (const [edge, list] of edges) {
        if (!["left", "right", "top", "bottom"].includes(edge)) bad(`unknown edge "${edge}"`);
        const room = edge === "left" || edge === "right" ? p.h : p.w, need = (list.length - 1) * (p.pitch || 22) + 20;
        if (need > room) bad(`${list.length} pins on ${edge} need ${need} but the body is ${room}`);
        list.forEach((pin, i) => {
          if (!pin || typeof pin !== "object") return bad(`${edge}[${i}] is not an object`);
          if (typeof pin.id !== "string" || !pin.id) bad(`${edge}[${i}] has no id`);
          if (!IOS.includes(pin.io)) bad(`${edge}[${i}] "${pin.id}": io "${pin.io}" is not ${IOS.join("|")}`);
          if (typeof pin.desc !== "string" || !pin.desc.trim()) bad(`${edge}[${i}] "${pin.id}" has no desc`);
        });
      }
      perCat[p.category] = (perCat[p.category] || 0) + 1;
    }
    console.log(`${Object.keys(parts).length} catalog entries: ` + CATS.map(c => `${c} ${perCat[c] || 0}`).join(", "));
    for (const p of problems) console.log("  problem: " + p);
    console.log(problems.length ? `${problems.length} problem(s)` : "OK");
    process.exit(problems.length ? 1 : 0);
  }

  run(path.resolve(arg)); run(path.join(here, "circutiviz.js"));
  if (!ctx.CIRCUIT) { console.error(`${arg}: does not set window.CIRCUIT`); process.exit(1); }
  const r = ctx.CircutiViz.validate(ctx.CIRCUIT, ctx.CIRCUTIVIZ_PARTS), s = r.summary;
  console.log(`${ctx.CIRCUIT.id || arg}: ${s.parts} parts, ${s.rails} rails, ${s.stages} stages, ${s.steps} steps, ${s.wires} wires, ${s.unresolved} unresolved`);
  for (const p of r.problems) console.log("  problem: " + p);
  console.log(r.ok ? "OK" : `${r.problems.length} problem(s)`);
  process.exit(r.ok ? 0 : 1);
})();
