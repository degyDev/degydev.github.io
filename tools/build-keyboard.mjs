// One-off vendoring step: bundle src/keyboard-scene.js (imports "three/webgpu"
// and three.js addon modules from the "three" npm package) into a single
// dependency-free, minified ES module. Run after editing the source; commit
// the result — GitHub Pages has no build step.
import { build } from "esbuild";
import { stat } from "node:fs/promises";

await build({
  entryPoints: ["src/keyboard-scene.js"],
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2022",
  treeShaking: true,
  outfile: "js/keyboard-scene.bundle.js",
  legalComments: "none",
});

const { size } = await stat("js/keyboard-scene.bundle.js");
console.log(`Built js/keyboard-scene.bundle.js (${(size / 1024).toFixed(1)} KiB)`);
