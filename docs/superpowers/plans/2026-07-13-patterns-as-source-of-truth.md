# Patterns as Source of Truth — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `README.md`'s 26 patterns into individually shareable files under `patterns/`, and generate `README.md` from them — byte-identically to today's file.

**Architecture:** `patterns/pattern-NN-slug.md` files (frontmatter + verbatim pattern body) plus `patterns/_meta/` (a prose template with a `{{PATTERNS}}` token, and `layers.json`) are the source of truth. A pure assembly library joins them; `build-readme.mjs` writes `README.md` + `patterns/README.md`; `check-readme.mjs` fails CI if either is stale. The migration is proven safe by a byte-identical round-trip (`git diff README.md` empty).

**Tech Stack:** Node.js 22 ESM (`.mjs`), Node stdlib only (`node:fs`, `node:test`, `node:assert`) — zero dependencies, no `package.json`. `just` as the one-command runner. GitHub Actions for the drift guard.

## Global Constraints

- **Zero runtime dependencies.** Node stdlib only. No `package.json`, no `node_modules`. Scripts are `.mjs`, run with `node scripts/<name>.mjs`.
- **README must stay byte-identical.** After migration, `node scripts/build-readme.mjs` must reproduce the pre-migration `README.md` exactly — `git diff README.md` shows nothing. This preserves every `#pattern-N-*` anchor that `index.html` links to.
- **Pattern bodies are verbatim.** Keep each `### Pattern N: Title` heading exactly as it appears today. Never demote/rename headings — anchors depend on the exact text.
- **Do not touch `index.html`.** It links to README anchors that remain identical. It is out of scope.
- **Block separator is `\n\n---\n\n`.** The README is 32 top-level blocks joined by this exact separator. The file ends with a single `\n`.
- **Repo:** `quanta-studio/sturdy-waddle`, branch `main`. Raw link base: `https://raw.githubusercontent.com/quanta-studio/sturdy-waddle/main/`.

**Verified structure (from the current README):** splitting on `\n\n---\n\n` yields 32 blocks. Blocks 0–2 are intro prose (`# The Harness Engineering Stack`, `## The Operating Loop`, `## Layer Map`). Blocks 3–28 are the 26 pattern blocks (13 of them begin with a `## Layer N — …` header glued to that layer's first pattern; the other 13 begin with `### Pattern N:`). Blocks 29–31 are outro prose (`## Default Toolchain`, `## Kickstart Prompt`, `## Why This Works`). Layer→pattern grouping: L1=1–4, L2=5, L3=6–8, L4=9–11, L5=12, L6=13, L7=14–16, L8=17–19, L9=20–21, L10=22, L11=23–24, L12=25, L13=26.

---

### Task 1: Pure assembly library

**Files:**
- Create: `scripts/lib/assemble.mjs`
- Test: `scripts/lib/assemble.test.mjs`

**Interfaces:**
- Produces (all pure, no I/O):
  - `parseFrontmatter(text: string) → { meta: Record<string,string>, body: string }` — parses a leading `---\n…\n---\n` block; `meta` values are raw strings; `body` is the content after the frontmatter with leading/trailing blank lines stripped.
  - `formatLayerHeader({ n:number, name:string, tag?:string }) → string` — e.g. `## Layer 8 — Corporate Integration *(optional add-on)*`.
  - `assemblePatternsRegion(patterns, layers) → string` — `patterns: {pattern:number, layer:number, body:string}[]`, `layers: {n:number, name:string, tag?:string}[]`. Sorts by `pattern`, joins bodies with `\n\n---\n\n`, prepends the layer header (`\n\n` gap) before the first pattern of each layer.
  - `assembleReadme({ templateText, layers, patterns }) → string` — replaces the single `{{PATTERNS}}` token in `templateText`.
  - `assembleIndexTable(patterns) → string` — `patterns: {pattern:number, title:string, file:string, layer:number}[]`; returns a markdown table sorted by `pattern`.

- [ ] **Step 1: Write the failing tests**

Create `scripts/lib/assemble.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseFrontmatter,
  formatLayerHeader,
  assemblePatternsRegion,
  assembleReadme,
  assembleIndexTable,
} from "./assemble.mjs";

test("parseFrontmatter splits meta and body", () => {
  const text = "---\npattern: 3\ntitle: Spec Before Code\nlayer: 2\n---\n\n### Pattern 3: Spec Before Code\n\nbody line\n";
  const { meta, body } = parseFrontmatter(text);
  assert.equal(meta.pattern, "3");
  assert.equal(meta.title, "Spec Before Code");
  assert.equal(meta.layer, "2");
  assert.equal(body, "### Pattern 3: Spec Before Code\n\nbody line");
});

test("formatLayerHeader with and without tag", () => {
  assert.equal(formatLayerHeader({ n: 1, name: "Source of Truth" }), "## Layer 1 — Source of Truth");
  assert.equal(
    formatLayerHeader({ n: 8, name: "Corporate Integration", tag: "*(optional add-on)*" }),
    "## Layer 8 — Corporate Integration *(optional add-on)*"
  );
});

test("assemblePatternsRegion injects layer headers at first-of-layer", () => {
  const layers = [{ n: 1, name: "One" }, { n: 2, name: "Two", tag: "*(add-on)*" }];
  const patterns = [
    { pattern: 2, layer: 1, body: "### Pattern 2: B\n\nb" },
    { pattern: 1, layer: 1, body: "### Pattern 1: A\n\na" },
    { pattern: 3, layer: 2, body: "### Pattern 3: C\n\nc" },
  ];
  const out = assemblePatternsRegion(patterns, layers);
  assert.equal(
    out,
    "## Layer 1 — One\n\n### Pattern 1: A\n\na" +
      "\n\n---\n\n### Pattern 2: B\n\nb" +
      "\n\n---\n\n## Layer 2 — Two *(add-on)*\n\n### Pattern 3: C\n\nc"
  );
});

test("assembleReadme replaces the token", () => {
  const templateText = "INTRO\n\n---\n\n{{PATTERNS}}\n\n---\n\nOUTRO\n";
  const out = assembleReadme({
    templateText,
    layers: [{ n: 1, name: "One" }],
    patterns: [{ pattern: 1, layer: 1, body: "### Pattern 1: A\n\na" }],
  });
  assert.equal(out, "INTRO\n\n---\n\n## Layer 1 — One\n\n### Pattern 1: A\n\na\n\n---\n\nOUTRO\n");
});

test("assembleReadme throws when token missing", () => {
  assert.throws(() => assembleReadme({ templateText: "no token", layers: [], patterns: [] }));
});

test("assembleIndexTable renders a sorted table", () => {
  const rows = assembleIndexTable([
    { pattern: 2, title: "B", file: "pattern-02-b.md", layer: 1 },
    { pattern: 1, title: "A", file: "pattern-01-a.md", layer: 1 },
  ]);
  assert.equal(
    rows,
    "| # | Pattern | Layer |\n|---|---|---|\n| 1 | [A](pattern-01-a.md) | 1 |\n| 2 | [B](pattern-02-b.md) | 1 |"
  );
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test 'scripts/lib/**/*.test.mjs'`
Expected: FAIL — `Cannot find module '.../assemble.mjs'`.

- [ ] **Step 3: Implement the library**

Create `scripts/lib/assemble.mjs`:

```js
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
  return templateText.replace(TOKEN, assemblePatternsRegion(patterns, layers));
}

export function assembleIndexTable(patterns) {
  const sorted = [...patterns].sort((a, b) => a.pattern - b.pattern);
  const rows = sorted.map((p) => `| ${p.pattern} | [${p.title}](${p.file}) | ${p.layer} |`);
  return ["| # | Pattern | Layer |", "|---|---|---|", ...rows].join("\n");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test 'scripts/lib/**/*.test.mjs'`
Expected: PASS — all 6 tests, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/assemble.mjs scripts/lib/assemble.test.mjs
git commit -m "feat(scripts): add pure README assembly library"
```

---

### Task 2: Migration — extract patterns, generate README + index, prove round-trip

**Files:**
- Create: `scripts/extract-patterns.mjs` (one-time migration; not run by `just`)
- Create: `scripts/build-readme.mjs`
- Create: `scripts/check-readme.mjs`
- Create: `scripts/lib/load.mjs`
- Create: `_meta/patterns-index.template.md` → final path `patterns/_meta/patterns-index.template.md` (created by hand here; the extractor creates the other two `_meta` files)
- Generated by the extractor: `patterns/pattern-01-*.md` … `patterns/pattern-26-*.md`, `patterns/_meta/README.template.md`, `patterns/_meta/layers.json`
- Generated by the build: `README.md` (regenerated, unchanged content), `patterns/README.md`

**Interfaces:**
- Consumes: everything exported from `scripts/lib/assemble.mjs` (Task 1).
- Produces:
  - `scripts/lib/load.mjs`: `loadPatterns() → {pattern, layer, title, slug, file, body}[]`, `paths` (`{root, patternsDir, metaDir}`).
  - `scripts/build-readme.mjs`: `buildOutputs() → { readme:string, index:string }`; writes both files only when run directly.
  - `scripts/check-readme.mjs`: exits non-zero (with first-diff line) if either committed file differs from `buildOutputs()`.

- [ ] **Step 1: Write the folder-index template (static prose)**

Create `patterns/_meta/patterns-index.template.md`:

```markdown
# The Harness Engineering Stack — Patterns

Each pattern of [The Harness Engineering Stack](../README.md) lives here as its own
file, so you can hand an AI assistant a single pattern instead of the whole README.

**`../README.md` and this index are generated from these files** (`just build`). Edit
the pattern files here — never the README.

## Hand one pattern to an assistant

Copy a pattern's raw link and prompt your assistant, e.g.:

> Apply this pattern to my repository, following it exactly:
> `https://raw.githubusercontent.com/quanta-studio/sturdy-waddle/main/patterns/pattern-03-spec-before-code.md`

## All patterns

{{TABLE}}
```

- [ ] **Step 2: Write the shared loader**

Create `scripts/lib/load.mjs`:

```js
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseFrontmatter } from "./assemble.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const paths = {
  root,
  patternsDir: join(root, "patterns"),
  metaDir: join(root, "patterns", "_meta"),
};

export function loadPatterns() {
  return readdirSync(paths.patternsDir)
    .filter((f) => /^pattern-\d+.*\.md$/.test(f))
    .map((file) => {
      const { meta, body } = parseFrontmatter(readFileSync(join(paths.patternsDir, file), "utf8"));
      return {
        pattern: Number(meta.pattern),
        layer: Number(meta.layer),
        title: meta.title,
        slug: meta.slug,
        file,
        body,
      };
    })
    .sort((a, b) => a.pattern - b.pattern);
}
```

- [ ] **Step 3: Write the build script**

Create `scripts/build-readme.mjs`:

```js
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { assembleReadme, assembleIndexTable } from "./lib/assemble.mjs";
import { loadPatterns, paths } from "./lib/load.mjs";

export function buildOutputs() {
  const patterns = loadPatterns();
  const layers = JSON.parse(readFileSync(join(paths.metaDir, "layers.json"), "utf8"));
  const templateText = readFileSync(join(paths.metaDir, "README.template.md"), "utf8");
  const indexTemplate = readFileSync(join(paths.metaDir, "patterns-index.template.md"), "utf8");
  const readme = assembleReadme({ templateText, layers, patterns });
  const index = indexTemplate.replace("{{TABLE}}", assembleIndexTable(patterns));
  return { readme, index };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { readme, index } = buildOutputs();
  writeFileSync(join(paths.root, "README.md"), readme);
  writeFileSync(join(paths.patternsDir, "README.md"), index);
  console.log("Wrote README.md and patterns/README.md");
}
```

- [ ] **Step 4: Write the drift-check script**

Create `scripts/check-readme.mjs`:

```js
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
```

- [ ] **Step 5: Write the one-time extractor**

Create `scripts/extract-patterns.mjs`:

```js
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
  // `m` flag: add-on layers (8–13) have an intro paragraph between the
  // `## Layer N` header and their first `### Pattern` heading, so the heading
  // is not always at position 0 of `body`. The intro prose stays in the body
  // and round-trips faithfully.
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
```

- [ ] **Step 6: Run the extractor**

Run: `node scripts/extract-patterns.mjs`
Expected: `Wrote 26 pattern files, README.template.md, and 13 layers.`
Then verify: `ls patterns/pattern-*.md | wc -l` → `26`; `cat patterns/_meta/layers.json` shows 13 entries with layers 8–13 carrying `tag`.

- [ ] **Step 7: Regenerate the README and PROVE the round-trip**

Run: `node scripts/build-readme.mjs`
Then run: `git diff --stat README.md`
Expected: **no output** (README.md unchanged — byte-identical round-trip). Also confirm `git status` shows new `patterns/README.md`.

If `git diff README.md` shows changes, DO NOT commit. Inspect the diff, fix `extract-patterns.mjs` or `assemble.mjs`, delete the generated `patterns/` dir, and re-run Steps 6–7 until the diff is empty. This is the safety gate for the whole migration.

- [ ] **Step 8: Run the drift check**

Run: `node scripts/check-readme.mjs`
Expected: PASS — `README.md and patterns/README.md are in sync with patterns/.` (exit 0).

- [ ] **Step 9: Sanity-check a shareable pattern file**

Run: `head -12 patterns/pattern-03-spec-before-code.md`
Expected: frontmatter with `pattern: 3`, `title: Spec Before Code`, `slug: spec-before-code`, `layer: 1` (Pattern 3 is in Layer 1 — Source of Truth), a `related:` list, then the verbatim `### Pattern 3: Spec Before Code` heading.

- [ ] **Step 10: Commit the migration**

```bash
git add scripts/ patterns/ README.md
git commit -m "refactor: generate README.md from per-pattern files in patterns/

patterns/*.md are now the source of truth; README.md and patterns/README.md
are assembled by scripts/build-readme.mjs. Round-trip is byte-identical, so
all index.html anchors are unchanged."
```

---

### Task 3: One-command interface + CI drift guard

**Files:**
- Create: `justfile`
- Create: `.github/workflows/patterns.yml`

**Interfaces:**
- Consumes: `scripts/build-readme.mjs`, `scripts/check-readme.mjs` (Task 2).

- [ ] **Step 1: Write the justfile**

Create `justfile` (recipes indented with 4 spaces):

```just
# One-command interface (Pattern 6) for this docs repo.

# Regenerate README.md + patterns/README.md from patterns/
build:
    node scripts/build-readme.mjs

# Fail if README.md / patterns/README.md are out of sync with patterns/
check:
    node scripts/check-readme.mjs

# Run the assembly-library unit tests
test:
    node --test 'scripts/lib/**/*.test.mjs'
```

- [ ] **Step 2: Verify the runner (build is a no-op, check passes)**

Run: `just build && git diff --stat README.md patterns/README.md`
Expected: build prints its two "Wrote" lines and `git diff` shows **no output** (already in sync).
Run: `just check`
Expected: PASS (exit 0).
Run: `just test`
Expected: all assembly tests pass.

(If `just` is not installed, the same commands run as `node scripts/build-readme.mjs`, `node scripts/check-readme.mjs`, `node --test 'scripts/lib/**/*.test.mjs'`.)

- [ ] **Step 3: Write the CI workflow**

Create `.github/workflows/patterns.yml`:

```yaml
name: patterns
on:
  push:
    branches: [main]
  pull_request:
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Assembly library tests
        run: node --test 'scripts/lib/**/*.test.mjs'
      - name: README is in sync with patterns/
        run: node scripts/check-readme.mjs
```

- [ ] **Step 4: Prove the guard catches drift (then revert)**

Simulate an edit that forgets to rebuild:

```bash
printf '\n<!-- drift test -->\n' >> patterns/pattern-01-repo-as-single-source-of-truth.md
node scripts/check-readme.mjs; echo "exit=$?"
```

Expected: prints `STALE: .../README.md …` and `exit=1`.
Now revert the probe:

```bash
git checkout -- patterns/pattern-01-repo-as-single-source-of-truth.md
node scripts/check-readme.mjs; echo "exit=$?"
```

Expected: `… in sync …` and `exit=0`.

- [ ] **Step 5: Commit**

```bash
git add justfile .github/workflows/patterns.yml
git commit -m "ci: add just runner and patterns drift guard"
```

---

## Post-implementation notes (not tasks)

- **`index.html` sync stays manual** (unchanged from today's workflow). This plan changes nothing in `index.html`; the round-trip proof (Task 2 Step 7) is what guarantees its anchors still resolve.
- **Adding/editing a pattern from now on:** edit or add a `patterns/pattern-NN-*.md` file (and `_meta/layers.json` for a new layer), then `just build`, then commit. `just check` / CI enforces that the generated README was committed. If the pattern *count* or TOC on `index.html` changes, update `index.html` by hand as before (dual-artifact rule).
- **`scripts/extract-patterns.mjs` is one-time.** It is safe to delete after migration; it is kept only for provenance and must not be re-run once pattern files are hand-edited.

## Self-review

- **Spec coverage:** patterns/ dir with 26 files (Task 2) ✓; README generated byte-identically (Task 2 Steps 7–8) ✓; pattern file format w/ frontmatter + verbatim `###` body + `related` (Task 2 Step 5) ✓; `_meta/README.template.md` + `layers.json` (Task 2 Steps 5–6) ✓; assembly data flow (Task 1) ✓; drift protection local + CI (Task 2 Step 4, Task 3) ✓; justfile (Task 3) ✓; patterns/README.md index + AI-share snippet (Task 2 Steps 1,3) ✓; migration & byte-identical proof (Task 2 Step 7) ✓; index.html untouched (Global Constraints; post-impl note) ✓. All success criteria mapped.
- **Placeholder scan:** no TBD/TODO; every code step contains complete code.
- **Type consistency:** `buildOutputs()` (not `buildReadme`) used identically in build-readme.mjs and check-readme.mjs; `paths`/`loadPatterns` exported from `load.mjs` and imported in both; `assemble*` names match Task 1 exports and Task 2/3 imports.
