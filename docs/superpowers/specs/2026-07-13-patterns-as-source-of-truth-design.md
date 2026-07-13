# Design: `patterns/` as source of truth, `README.md` assembled

**Status:** approved
**Date:** 2026-07-13

## Why

`README.md` is a 64 KB pattern language (26 patterns across 13 layers). To set up
a single pattern, you currently have to hand an AI assistant the entire file. We
want to share a **direct link to one pattern** instead — so an assistant reads
only what it needs to apply that pattern.

The chosen approach inverts the current model: each pattern becomes its own file
in `patterns/`, and `README.md` is **generated** by assembling those files. The
pattern files become the first-class, individually shareable artifact; the README
becomes a derived view. This keeps a single source of truth (no third hand-copied
representation to drift) while making per-pattern links possible.

## What

- A `patterns/` directory containing one markdown file per pattern (26 files),
  each independently shareable via its raw GitHub URL.
- `README.md` regenerated from `patterns/` — byte-identical to today's README on
  first build, so published anchors and `index.html` keep working unchanged.
- A build script and a drift-check script, wired to a `justfile` (dogfooding the
  README's own Pattern 6, "One-Command Interface").

Out of scope:
- Changing any pattern's prose, ordering, headings, or anchors.
- Changing `index.html` (it links to README anchors that stay identical).
- Automating `index.html` sync — that remains a manual step as today.

## Structure

```
patterns/
  pattern-01-repo-as-single-source-of-truth.md   # the 26 shareable files
  pattern-02-agent-constitution.md
  ...
  pattern-26-assisted-apprenticeship.md
  README.md                     # folder index (see below)
  _meta/
    README.template.md          # ALL non-pattern prose verbatim, with one {{PATTERNS}} token
    layers.json                 # [{ "n", "name", "tag"? }] — drives layer headers
scripts/
  build-readme.mjs              # patterns/ + _meta/ -> README.md   (Node stdlib only, zero deps)
  check-readme.mjs              # rebuild in memory, diff vs committed README.md, non-zero exit on drift
justfile                        # `just build`, `just check`
README.md                       # GENERATED — never hand-edited again
```

- Filenames are zero-padded (`pattern-01` … `pattern-26`) so the directory sorts
  in reading order. The shareable link is e.g.
  `.../patterns/pattern-03-spec-before-code.md`.
- The zero-padded **filename** number is cosmetic; the **README anchor**
  (`#pattern-3-spec-before-code`, no pad) is produced from the unchanged heading
  text, so filename padding never affects anchors.

## Pattern file format

Frontmatter (machine-read, stripped on assembly) + the pattern body **verbatim**,
retaining the `###` heading exactly as it appears in README today:

```markdown
---
pattern: 3
title: Spec Before Code
slug: spec-before-code
layer: 2
related: [4, 5, 13]
---

### Pattern 3: Spec Before Code

**Context:** ...
**Problem:** ...
**Therefore:** ...
```

- Keeping the `###` heading verbatim guarantees the GitHub anchor is unchanged
  (`#pattern-3-spec-before-code`), which is what `index.html` links to. A lone
  `###` as the top heading of a standalone file renders fine on GitHub.
- `related:` lists neighbor pattern numbers, so an assistant that followed a
  single link can discover adjacent patterns. It is the *only* concession to
  standalone-ness — no duplicated "part of the stack" prose footer (YAGNI). The
  builder ignores `related:`.

## `_meta/README.template.md`

Holds every non-pattern word of the README **verbatim**, with a single
`{{PATTERNS}}` token where the pattern region goes. Concretely, it contains:

- Front matter prose: the title/intro block, `## The Operating Loop`,
  `## Layer Map` (all three current `---`-delimited blocks, including the
  reference-implementation callout).
- The `{{PATTERNS}}` token (surrounded by the same `---` separators the README
  uses between top-level blocks).
- Back matter prose: `## Default Toolchain`, `## Kickstart Prompt`,
  `## Why This Works`.

Because all prose stays verbatim in one file, intro/outro fidelity is guaranteed
by construction — the generator only ever touches the pattern region.

## `_meta/layers.json`

Drives the `## Layer N — Name *(tag)*` headers that are interleaved between
pattern groups:

```json
[
  { "n": 1, "name": "Source of Truth" },
  { "n": 2, "name": "Plan" },
  { "n": 3, "name": "Build & Verify" },
  { "n": 4, "name": "Integrate" },
  { "n": 5, "name": "Release" },
  { "n": 6, "name": "Human QA" },
  { "n": 7, "name": "Memory & Orientation" },
  { "n": 8, "name": "Corporate Integration", "tag": "*(optional add-on)*" },
  { "n": 9, "name": "Security & Privacy", "tag": "*(add-on)*" },
  { "n": 10, "name": "Device Repro", "tag": "*(add-on)*" },
  { "n": 11, "name": "Code Strengthening", "tag": "*(add-on)*" },
  { "n": 12, "name": "Image Analysis", "tag": "*(add-on)*" },
  { "n": 13, "name": "Onboarding", "tag": "*(add-on)*" }
]
```

Exact names/tags are transcribed from the current README layer headings during
migration; the round-trip diff (below) is what proves they are correct.

## Assembly (`build-readme.mjs`, data flow)

1. Read `_meta/README.template.md` and `_meta/layers.json`.
2. Read all `patterns/pattern-*.md`, parse frontmatter, sort by `pattern` number.
3. For each pattern, strip frontmatter to get the body block. If it is the first
   pattern of its `layer`, prepend `## Layer N — Name *(tag)*\n\n` (tag omitted
   when absent).
4. Join the pattern blocks with `\n\n---\n\n` (the README's top-level block
   separator).
5. Replace `{{PATTERNS}}` in the template with the joined result.
6. Write `README.md`.

Zero runtime dependencies: frontmatter is simple `key: value` / `key: [ints]`
scalars parsed by a small hand-rolled reader; `layers.json` is `JSON.parse`.

## Drift protection (`check-readme.mjs`)

Because `README.md` is now generated, the failure mode is a stale README.
`check-readme.mjs` rebuilds in memory and exits non-zero if the result differs
from the committed `README.md`, printing the diff. This is the README's own
Pattern 8 ("Verification Gate") applied to the README itself. It runs via
`just check` locally and in CI (a minimal GitHub Actions workflow that runs
`just check` on push / PR).

`index.html` sync remains a manual step (unchanged from today). What this design
newly guarantees is that pattern **content** can never silently diverge from the
README.

## Runner (`justfile`)

```
build   # node scripts/build-readme.mjs   -> regenerate README.md
check   # node scripts/check-readme.mjs   -> fail if README.md is stale
```

`just` is the README's own recommended default, so the repo dogfoods Pattern 6.
The `.mjs` scripts are also runnable directly via `node scripts/…` when `just`
is not installed.

## `patterns/README.md` (folder index)

A short human/AI entry point that:
- States what the folder is and that `../README.md` is generated from it.
- Lists all 26 patterns as a table (number, title, link to the file).
- Gives a copy-paste snippet for handing one pattern to an AI assistant
  (e.g. "Apply this pattern to my repo: <raw link>").

This index is itself shareable and is the natural top-level link.

## Migration & proof

A one-time extraction step (throwaway script or careful scripted split):

1. Parse the current `README.md` into its `---`-delimited blocks.
2. Write intro + outro prose to `_meta/README.template.md` with the
   `{{PATTERNS}}` token in the pattern region.
3. Write `_meta/layers.json` from the layer headings.
4. Write each pattern block to `patterns/pattern-NN-slug.md` with frontmatter.
5. Run `build-readme.mjs` and assert **`git diff README.md` is empty**.

The byte-identical round-trip is the safety net: nothing about the published
README changes until the generator reproduces today's README exactly. If the diff
is not clean, the generator (or the extracted files) is fixed before anything is
committed.

## Success criteria

1. `patterns/` contains 26 pattern files, each with valid frontmatter and the
   verbatim `###` pattern body.
2. `node scripts/build-readme.mjs` regenerates `README.md` byte-identically to
   the pre-migration README (`git diff README.md` empty at migration commit).
3. `node scripts/check-readme.mjs` exits 0 when `patterns/` and `README.md` agree,
   non-zero (with a diff) when a pattern file is edited without rebuilding.
4. `index.html` is unchanged and all its `#pattern-N-*` links still resolve.
5. `patterns/README.md` links to all 26 files and explains the share-with-AI flow.
6. `just build` and `just check` run the two scripts; scripts also run under bare
   `node`.
