import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { assembleReadme, assembleIndexTable, assertContiguousPatterns } from "./lib/assemble.mjs";
import { loadPatterns, paths } from "./lib/load.mjs";

export function buildOutputs() {
  const patterns = loadPatterns();
  assertContiguousPatterns(patterns);
  const layers = JSON.parse(readFileSync(join(paths.metaDir, "layers.json"), "utf8"));
  const templateText = readFileSync(join(paths.metaDir, "README.template.md"), "utf8");
  const indexTemplate = readFileSync(join(paths.metaDir, "patterns-index.template.md"), "utf8");
  const readme = assembleReadme({ templateText, layers, patterns });
  const index = indexTemplate.replace("{{TABLE}}", () => assembleIndexTable(patterns));
  return { readme, index };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { readme, index } = buildOutputs();
  writeFileSync(join(paths.root, "README.md"), readme);
  writeFileSync(join(paths.patternsDir, "README.md"), index);
  console.log("Wrote README.md and patterns/README.md");
}
