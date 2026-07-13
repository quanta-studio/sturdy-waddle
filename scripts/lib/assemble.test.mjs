import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseFrontmatter,
  formatLayerHeader,
  assemblePatternsRegion,
  assembleReadme,
  assembleIndexTable,
  assertContiguousPatterns,
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

test("assembleReadme inserts $ sequences literally (no replacement-pattern interpretation)", () => {
  const templateText = "A\n\n---\n\n{{PATTERNS}}\n\n---\n\nB\n";
  const out = assembleReadme({
    templateText,
    layers: [{ n: 1, name: "One" }],
    patterns: [{ pattern: 1, layer: 1, body: "### Pattern 1: T\n\nuse $& and $$ and $`literal" }],
  });
  assert.ok(out.includes("use $& and $$ and $`literal"));
});

test("parseFrontmatter throws when frontmatter missing", () => {
  assert.throws(() => parseFrontmatter("no frontmatter here"));
});

test("assemblePatternsRegion throws on unknown layer", () => {
  assert.throws(() =>
    assemblePatternsRegion([{ pattern: 1, layer: 9, body: "### Pattern 1: A\n\na" }], [{ n: 1, name: "One" }])
  );
});

test("assertContiguousPatterns accepts 1..N and rejects gaps/dupes", () => {
  assertContiguousPatterns([{ pattern: 2 }, { pattern: 1 }, { pattern: 3 }]);
  assert.throws(() => assertContiguousPatterns([{ pattern: 1 }, { pattern: 3 }]));
  assert.throws(() => assertContiguousPatterns([{ pattern: 1 }, { pattern: 1 }, { pattern: 2 }]));
});
