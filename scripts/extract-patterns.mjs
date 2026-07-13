// One-time migration: split README.md into patterns/ + _meta/.
// Kept for provenance; do NOT re-run after hand-editing pattern files.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const patternsDir = join(root, "patterns");
const metaDir = join(patternsDir, "_meta");
mkdirSync(metaDir, { recursive: true });

const md = readFileSync(join(root, "README.md"), "utf8");
const blocks = md.split("\n\n---\n\n");

const isPatternBlock = (b) => /^(## Layer \d+ —|### Pattern \d+:)/.test(b);
const firstIdx = blocks.findIndex(isPatternBlock);
let lastIdx = firstIdx;
while (lastIdx + 1 < blocks.length && isPatternBlock(blocks[lastIdx + 1])) lastIdx++;

const intro = blocks.slice(0, firstIdx).join("\n\n---\n\n");
const outro = blocks.slice(lastIdx + 1).join("\n\n---\n\n"); // carries the file's trailing \n
writeFileSync(join(metaDir, "README.template.md"), intro + "\n\n---\n\n{{PATTERNS}}\n\n---\n\n" + outro);

const kebab = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const layers = [];
let currentLayer = null;
let count = 0;
for (let i = firstIdx; i <= lastIdx; i++) {
  let body = blocks[i];
  const lm = /^## Layer (\d+) — (.+)\n\n([\s\S]+)$/.exec(body);
  if (lm) {
    const rest = lm[2];
    const tm = /^(.+?)(?:\s+(\*\(.+\)\*))?$/.exec(rest);
    const entry = { n: Number(lm[1]), name: tm[1] };
    if (tm[2]) entry.tag = tm[2];
    layers.push(entry);
    currentLayer = entry.n;
    body = lm[3];
  }
  // `m` flag: add-on layers (8–13) carry an intro paragraph before the first
  // pattern heading, so the heading is not necessarily at the start of body.
  const pm = /^### Pattern (\d+): (.+)/m.exec(body);
  if (!pm) throw new Error(`block ${i} is not a pattern: ${body.slice(0, 80)}`);
  const number = Number(pm[1]);
  const title = pm[2];
  const slug = kebab(title);
  const refs = [...body.matchAll(/Pattern (\d+)/g)].map((m) => Number(m[1]));
  const related = [...new Set(refs)].filter((x) => x !== number).sort((a, b) => a - b);
  const file = [
    "---",
    `pattern: ${number}`,
    `title: ${title}`,
    `slug: ${slug}`,
    `layer: ${currentLayer}`,
    `related: [${related.join(", ")}]`,
    "---",
    "",
    body,
    "",
  ].join("\n");
  writeFileSync(join(patternsDir, `pattern-${String(number).padStart(2, "0")}-${slug}.md`), file);
  count++;
}
writeFileSync(join(metaDir, "layers.json"), JSON.stringify(layers, null, 2) + "\n");
console.log(`Wrote ${count} pattern files, README.template.md, and ${layers.length} layers.`);
