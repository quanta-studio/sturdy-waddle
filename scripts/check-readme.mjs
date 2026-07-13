import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildOutputs } from "./build-readme.mjs";
import { paths } from "./lib/load.mjs";

function firstDiff(current, generated) {
  const a = current.split("\n");
  const b = generated.split("\n");
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) {
      return `line ${i + 1}:\n  committed:  ${JSON.stringify(a[i])}\n  generated:  ${JSON.stringify(b[i])}`;
    }
  }
  return "files differ in trailing content";
}

const { readme, index } = buildOutputs();
let stale = false;
for (const [path, generated] of [
  [join(paths.root, "README.md"), readme],
  [join(paths.patternsDir, "README.md"), index],
]) {
  if (readFileSync(path, "utf8") !== generated) {
    stale = true;
    console.error(`STALE: ${path} is out of sync with patterns/. Run: just build`);
    console.error(firstDiff(readFileSync(path, "utf8"), generated));
  }
}
if (stale) process.exit(1);
console.log("README.md and patterns/README.md are in sync with patterns/.");
