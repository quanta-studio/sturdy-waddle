const SEP = "\n\n---\n\n";
const TOKEN = "{{PATTERNS}}";

export function parseFrontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!m) throw new Error("missing frontmatter");
  const meta = {};
  for (const line of m[1].split("\n")) {
    const mm = /^(\w+):\s*(.*)$/.exec(line);
    if (mm) meta[mm[1]] = mm[2];
  }
  const body = text.slice(m[0].length).replace(/^\n+/, "").replace(/\n+$/, "");
  return { meta, body };
}

export function formatLayerHeader({ n, name, tag }) {
  return `## Layer ${n} — ${name}` + (tag ? ` ${tag}` : "");
}

export function assemblePatternsRegion(patterns, layers) {
  const layerByN = new Map(layers.map((l) => [l.n, l]));
  const sorted = [...patterns].sort((a, b) => a.pattern - b.pattern);
  const seen = new Set();
  const blocks = [];
  for (const p of sorted) {
    const body = p.body.replace(/^\n+/, "").replace(/\n+$/, "");
    if (seen.has(p.layer)) {
      blocks.push(body);
    } else {
      seen.add(p.layer);
      const layer = layerByN.get(p.layer);
      if (!layer) throw new Error(`no layers.json entry for layer ${p.layer}`);
      blocks.push(formatLayerHeader(layer) + "\n\n" + body);
    }
  }
  return blocks.join(SEP);
}

export function assembleReadme({ templateText, layers, patterns }) {
  if (!templateText.includes(TOKEN)) throw new Error("template missing {{PATTERNS}} token");
  return templateText.replace(TOKEN, () => assemblePatternsRegion(patterns, layers));
}

export function assembleIndexTable(patterns) {
  const sorted = [...patterns].sort((a, b) => a.pattern - b.pattern);
  const rows = sorted.map((p) => `| ${p.pattern} | [${p.title}](${p.file}) | ${p.layer} |`);
  return ["| # | Pattern | Layer |", "|---|---|---|", ...rows].join("\n");
}

export function assertContiguousPatterns(patterns) {
  const nums = patterns.map((p) => p.pattern);
  const seen = new Set();
  for (const n of nums) {
    if (seen.has(n)) throw new Error(`duplicate pattern number: ${n}`);
    seen.add(n);
  }
  const sorted = [...nums].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== i + 1) {
      throw new Error(
        `pattern numbers must be contiguous 1..N; got [${sorted.join(", ")}] (expected ${i + 1} at position ${i})`
      );
    }
  }
}
