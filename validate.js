#!/usr/bin/env node
/* Validate a CircutiViz project without a browser:  node validate.js path/to/wiring.js
   Loads components.js + the project file + circutiviz.js in a vm sandbox (no DOM) and runs the same
   CircutiViz.validate(circuit, parts) the page uses for its error banner. Exit code 1 on problems.
   Written with dynamic import() so it runs whether node treats .js as CommonJS or ESM. */
(async () => {
  const [fs, path, vm] = await Promise.all([import("node:fs"), import("node:path"), import("node:vm")]);
  const file = process.argv[2];
  if (!file) { console.error("usage: node validate.js path/to/wiring.js"); process.exit(2); }
  const here = path.dirname(path.resolve(process.argv[1]));
  const ctx = vm.createContext({ console });
  ctx.window = ctx;
  for (const f of [path.join(here, "components.js"), path.resolve(file), path.join(here, "circutiviz.js")]) {
    try { vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f }); }
    catch (e) { console.error(`${f}: ${e.message}`); process.exit(1); }
  }
  if (!ctx.CIRCUIT) { console.error(`${file}: does not set window.CIRCUIT`); process.exit(1); }
  const r = ctx.CircutiViz.validate(ctx.CIRCUIT, ctx.CIRCUTIVIZ_PARTS), s = r.summary;
  console.log(`${ctx.CIRCUIT.id || file}: ${s.parts} parts, ${s.rails} rails, ${s.stages} stages, ${s.steps} steps, ${s.wires} wires, ${s.unresolved} unresolved`);
  for (const p of r.problems) console.log("  problem: " + p);
  console.log(r.ok ? "OK" : `${r.problems.length} problem(s)`);
  process.exit(r.ok ? 0 : 1);
})();
