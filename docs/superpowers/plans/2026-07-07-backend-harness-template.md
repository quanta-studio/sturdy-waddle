# Backend Harness Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `quanta-studio/backend-harness-template` — a GitHub template repo that implements the Harness Engineering Stack pattern language for Node/TypeScript backends, harness-only (no app framework), plus an agent-adoption layer (BOOTSTRAP.md + conformance checker).

**Architecture:** A fresh git repo at a sibling directory. Every file implements a numbered pattern from the pattern language (`quanta-studio/sturdy-waddle`). The trivial `src/` module is itself the worked example: it ships as spec S-000, so the template's own git history demonstrates the spec → plan → commit → gate traceability chain. `package.json` scripts are the verb interface (Pattern 6); `pnpm verify` is the gate (Pattern 8); CI runs the identical verbs (Pattern 11).

**Tech Stack:** Node ≥ 22, pnpm, TypeScript (strict), Vitest, Biome, GitHub Actions.

## Global Constraints

- New repo directory: `/Users/laplace/Documents/workspaces/repositories/quanta-studio/ai-learning/backend-harness-template` (referred to as `$TPL` below — expand it manually; it is not a defined shell variable). All task commands run with `$TPL` as cwd unless stated otherwise.
- Pattern-language repo (this repo, for the final cross-link task): `/Users/laplace/Documents/workspaces/repositories/quanta-studio/ai-learning/virtual-engineering-team-in-practice`, GitHub `quanta-studio/sturdy-waddle`, Pages site `https://quanta-studio.github.io/sturdy-waddle/`.
- Node pinned via `.nvmrc` = `22` and `"engines": { "node": ">=22" }`.
- The gate is exactly: `pnpm verify` = `typecheck` → `lint` → `test`. No raw toolchain commands in AGENTS.md, CI, or docs — verbs only (Pattern 6).
- Conventional commits in the template repo's own history (its history is part of the deliverable).
- Out of scope (do NOT add): HTTP framework, database, auth, deploy config, husky/commitlint, `create-*` CLI, Vitest config file (defaults suffice).
- v1 of the template targets Vitest 3.x, Biome 2.x, TypeScript 5.x — install latest via `pnpm add -D`; do not pin exact versions in this plan.

---

### Task 1: Repo init + toolchain

**Files:**
- Create: `$TPL/.gitignore`, `$TPL/.nvmrc`, `$TPL/package.json`, `$TPL/tsconfig.json`, `$TPL/biome.json`

**Interfaces:**
- Produces: `pnpm verify` verb (fails until Task 4 adds source files — expected), `pnpm typecheck` / `pnpm lint` / `pnpm test` verbs. All later tasks rely on these exact script names.

- [ ] **Step 1: Create the repo**

```bash
mkdir -p /Users/laplace/Documents/workspaces/repositories/quanta-studio/ai-learning/backend-harness-template
cd /Users/laplace/Documents/workspaces/repositories/quanta-studio/ai-learning/backend-harness-template
git init -b main
```

- [ ] **Step 2: Write `.gitignore` and `.nvmrc`**

`.gitignore`:
```
node_modules/
dist/
coverage/
*.log
.worktrees/
```

`.nvmrc`:
```
22
```

- [ ] **Step 3: Write `package.json`**

```json
{
  "name": "backend-harness-template",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "biome check .",
    "test": "vitest run",
    "verify": "pnpm typecheck && pnpm lint && pnpm test"
  }
}
```

- [ ] **Step 4: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 5: Install dev dependencies**

Run: `pnpm add -D typescript vitest @biomejs/biome`
Expected: lockfile created, three packages in `devDependencies`.

- [ ] **Step 6: Generate and adjust `biome.json`**

Run: `pnpm exec biome init` (generates a schema-correct `biome.json` for the installed version), then edit it so it contains at minimum:

```json
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space"
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

(Keep any extra keys `biome init` generated; only ensure the above are set.)

- [ ] **Step 7: Verify the verbs exist and toolchain runs**

Run: `pnpm lint`
Expected: PASS (or auto-fixable notes; run `pnpm exec biome check --write .` if it flags the JSON files, then re-run to green).

Run: `pnpm typecheck`
Expected: FAIL with "No inputs were found" — correct: no source exists yet. Task 4 turns this green. Do not "fix" this now.

- [ ] **Step 8: Commit**

```bash
git add .gitignore .nvmrc package.json tsconfig.json biome.json pnpm-lock.yaml
git commit -m "chore: init Node/TS toolchain (pnpm, tsc strict, vitest, biome)"
```

---

### Task 2: Agent constitution (Pattern 2)

**Files:**
- Create: `$TPL/AGENTS.md`
- Create: `$TPL/CLAUDE.md`, `$TPL/GEMINI.md` (symlinks to `AGENTS.md`)

**Interfaces:**
- Produces: `AGENTS.md` at repo root; `CLAUDE.md`/`GEMINI.md` as symlinks with link target exactly `AGENTS.md` (Task 8's checker asserts this via `readlinkSync`).

- [ ] **Step 1: Write `AGENTS.md`**

```markdown
# AGENTS.md — Project Constitution

## Purpose

REPLACE THIS LINE when stamping a project from the template: one sentence —
what does this service do, and for whom? (See BOOTSTRAP.md.)

## Module map

- `src/` — application code
- `tests/` — Vitest tests, mirroring `src/`
- `docs/specs/` — what to build (`S-NNN-*.md`); no feature work without one
- `docs/plans/` — how to build it (`S-NNN-plan.md`) for anything > 1 hour
- `docs/decisions/` — ADRs: why it's built this way; read before proposing architecture changes
- `docs/qa/` — human QA charters, one per release

## Commands (verbs only — never raw toolchain commands)

- `pnpm verify` — typecheck + lint + test. **The only definition of done.**
- `pnpm typecheck` / `pnpm lint` / `pnpm test` — individual gates for the inner loop
- `pnpm harness:check` — structural conformance check for this harness

## Definition of Done

1. A spec exists in `docs/specs/` and the change traces to it.
2. Tests were written first (TDD) and `pnpm verify` is green — report the
   actual output, not a summary of confidence.
3. Work happened on a branch and lands via PR; CI runs the same `pnpm verify`.
4. Commits are conventional, with the spec trailer: `feat(scope): subject [S-NNN]`.

## Workflow rules

- Spec before code. Plan (`docs/plans/`) before build for multi-file work.
- Never commit directly to `main`. A red `main` is the top-priority task.
- Significant, hard-to-reverse choices get an ADR; supersede — never silently
  contradict — existing ADRs.
```

- [ ] **Step 2: Create the symlinks**

```bash
ln -s AGENTS.md CLAUDE.md
ln -s AGENTS.md GEMINI.md
```

- [ ] **Step 3: Verify symlinks are recorded as symlinks by git**

Run: `git add AGENTS.md CLAUDE.md GEMINI.md && git ls-files -s CLAUDE.md GEMINI.md`
Expected: both lines start with mode `120000` (symlink), e.g. `120000 <hash> 0	CLAUDE.md`.

- [ ] **Step 4: Commit**

```bash
git commit -m "docs: add agent constitution with vendor symlinks"
```

---

### Task 3: docs/ structure with worked examples (Patterns 3, 4, 5, 13)

**Files:**
- Create: `$TPL/docs/specs/S-000-harness-smoke.md`
- Create: `$TPL/docs/plans/S-000-plan.md`
- Create: `$TPL/docs/decisions/ADR-000-toolchain.md`
- Create: `$TPL/docs/qa/README.md`

**Interfaces:**
- Produces: spec S-000 whose acceptance criteria Task 4 implements verbatim; directory set `docs/specs`, `docs/plans`, `docs/decisions`, `docs/qa` that Task 8's checker requires.

- [ ] **Step 1: Write `docs/specs/S-000-harness-smoke.md`**

```markdown
# S-000: Harness smoke module

Status: approved

## Why

A freshly stamped project must prove the verify gate end-to-end (typecheck,
lint, test) before any real feature exists. A trivial but real module gives
`pnpm verify` something to check from minute one — and gives this template a
worked example of the spec → plan → commit → gate chain.

## What

- `healthcheck()` in `src/index.ts` returns `{ status: "ok" }`
- One test proves it
- Out of scope: HTTP endpoints, process monitoring — this module is replaced
  by the project's first real feature

## Acceptance criteria

1. `healthcheck()` returns exactly `{ status: "ok" }`
2. `pnpm verify` passes on a fresh clone after `pnpm install`

## Human QA notes

- None — nothing here needs human judgment. Delete this module when the first
  real spec ships.
```

- [ ] **Step 2: Write `docs/plans/S-000-plan.md`**

```markdown
# Plan: S-000 harness smoke module

- [x] 1. Failing test for `healthcheck()` — tests/index.test.ts — test: acceptance criterion 1
- [x] 2. Minimal implementation — src/index.ts — test: `pnpm verify` green (criterion 2)
```

(Checked boxes are correct: by the time the template is published, this plan is complete. It exists to show the format.)

- [ ] **Step 3: Write `docs/decisions/ADR-000-toolchain.md`**

```markdown
# ADR-000: Node/TS toolchain — pnpm, Vitest, Biome, package.json verbs

Status: accepted

## Context

This template is the Node/TypeScript instantiation of the Harness Engineering
Stack. Pattern 6 requires a single verb interface at the repo root; for a
single-language repo a separate task runner (just/make) adds a dependency
without adding value.

## Decision

- Package manager: pnpm. Test runner: Vitest. Lint + format: Biome (one tool
  instead of ESLint + Prettier).
- `package.json` scripts are the verb set. The gate verb is `pnpm verify` =
  typecheck → lint → test. CI and AGENTS.md reference verbs only.

## Consequences

- One config surface (`package.json`) instead of a justfile; if the project
  ever becomes multi-language, introduce `just` and keep the same verb names.
- Biome's rule set differs from ESLint's; teams with ESLint muscle memory may
  swap it — the harness only requires that `pnpm lint` stays the verb.

## Alternatives rejected

- justfile now: YAGNI for single-language.
- ESLint + Prettier: two tools, slower, more config drift.
- Husky/commitlint for commit format: convention is enforced by AGENTS.md and
  PR review; tooling adds friction solo.
```

- [ ] **Step 4: Write `docs/qa/README.md`**

```markdown
# Human QA charters

One file per release: `vX.Y.Z-charter.md`, generated from the shipped specs'
"Human QA notes" sections. Charters exclude what automation already covers —
they test judgment: tone, feel, confusion, trust.

Format:

    # QA Charter — vX.Y.Z (staging)
    Ships: S-012 password reset            ~15 minutes

    ## Scripted checks (from spec "Human QA notes")
    - [ ] Reset email renders correctly in Gmail dark mode

    ## Exploratory charters (timeboxed ~5 min each)
    - [ ] Try to confuse the reset flow: double-submit, back button,
          two tabs, garbage tokens. Log anything surprising.

    ## Findings
    | # | What happened | Spec violated? | → action |
    |---|---------------|----------------|----------|
    | 1 | ...           | S-012 / none   | fix now / new spec / ignore |

Each finding becomes a fix (before promoting), a new spec (backlog), or an
explicit "accepted" note. Commit the charter with the release.
```

- [ ] **Step 5: Commit**

```bash
git add docs
git commit -m "docs: add spec/plan/ADR/QA structure with S-000 worked example"
```

---

### Task 4: Gate proof — implement S-000 via TDD (Patterns 7, 8)

**Files:**
- Create: `$TPL/tests/index.test.ts`
- Create: `$TPL/src/index.ts`

**Interfaces:**
- Consumes: acceptance criteria from `docs/specs/S-000-harness-smoke.md` (Task 3).
- Produces: `healthcheck(): { status: "ok" }` exported from `src/index.ts`; a green `pnpm verify` that every later task must keep green.

- [ ] **Step 1: Write the failing test**

`tests/index.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { healthcheck } from "../src/index.js";

describe("healthcheck (S-000)", () => {
  it("returns status ok", () => {
    expect(healthcheck()).toEqual({ status: "ok" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test`
Expected: FAIL — cannot resolve `../src/index.js` (module does not exist).

- [ ] **Step 3: Write minimal implementation**

`src/index.ts`:
```typescript
export function healthcheck(): { status: "ok" } {
  return { status: "ok" };
}
```

- [ ] **Step 4: Run the full gate**

Run: `pnpm verify`
Expected: PASS — typecheck green (inputs now exist), lint green, 1 test passed.

- [ ] **Step 5: Commit**

```bash
git add src tests
git commit -m "feat: add harness smoke module [S-000]"
```

---

### Task 5: CI + PR template (Patterns 9, 11)

**Files:**
- Create: `$TPL/.github/workflows/ci.yml`
- Create: `$TPL/.github/pull_request_template.md`

**Interfaces:**
- Produces: CI job named `verify` that runs the gate verb verbatim. Task 8 appends a `pnpm harness:check` step to this same file.

- [ ] **Step 1: Write `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm verify
```

- [ ] **Step 2: Write `.github/pull_request_template.md`**

```markdown
## Spec

<!-- Link the spec this PR implements: docs/specs/S-NNN-*.md -->

## What changed

## Verification

- [ ] `pnpm verify` green locally (paste tail of output below)
- [ ] Tests written before implementation (TDD)
- [ ] ADR added/updated if a hard-to-reverse choice was made

```

- [ ] **Step 3: Verify YAML parses and the gate still passes**

Run: `node -e "const fs=require('fs');const y=fs.readFileSync('.github/workflows/ci.yml','utf8');if(!y.includes('pnpm verify'))process.exit(1);console.log('ci.yml references the gate verb')"`
Expected: `ci.yml references the gate verb`

Run: `pnpm verify`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add .github
git commit -m "ci: run the verify gate verbatim on push and PR"
```

---

### Task 6: README with file→pattern map

**Files:**
- Create: `$TPL/README.md`

**Interfaces:**
- Consumes: everything created so far (the map must only reference files that exist, plus `BOOTSTRAP.md` and `scripts/harness-check.mjs` which Tasks 7–8 add — acceptable forward references since they land before publication).

- [ ] **Step 1: Write `README.md`**

```markdown
# Backend Harness Template (Node/TypeScript)

The executable counterpart to the
[Harness Engineering Stack](https://quanta-studio.github.io/sturdy-waddle/) —
a pattern language for running a full SDLC with AI assistants as a solo
developer. This repo implements those patterns for Node/TypeScript backends:
clone it and the harness conventions exist from minute one, with zero
re-explaining.

**Harness-only by design.** No HTTP framework, no database, no auth — those
are per-project choices. What you get is the discipline layer: constitution,
spec/plan/ADR/QA structure, one-command gate, CI parity.

## Quick start

1. Click **Use this template** (or `pnpm dlx degit quanta-studio/backend-harness-template my-service`)
2. `pnpm install && pnpm verify` — must be green before you touch anything
3. Replace the Purpose line in `AGENTS.md`
4. Point your AI assistant at `AGENTS.md` and write your first spec in
   `docs/specs/S-001-*.md`

Stamping with an AI assistant instead? Point it at [`BOOTSTRAP.md`](BOOTSTRAP.md).

## File → pattern map

Every file here implements a numbered pattern from the
[pattern language](https://github.com/quanta-studio/sturdy-waddle#readme):

| File | Pattern |
|---|---|
| `AGENTS.md` (+ `CLAUDE.md`/`GEMINI.md` symlinks) | 2 — Agent Constitution |
| `docs/specs/` (worked example: S-000) | 3 — Spec Before Code |
| `docs/decisions/ADR-000-toolchain.md` | 4 — Decision Records |
| `docs/plans/S-000-plan.md` | 5 — Plan as Reviewable Artifact |
| `package.json` scripts | 6 — One-Command Interface (single-language repo: scripts are the verb set) |
| `tests/` + TDD rule in AGENTS.md | 7 — Test-First Loop |
| `pnpm verify` | 8 — Verification Gate |
| `.github/pull_request_template.md` | 9 — Small PRs on Trunk |
| `.gitignore` (`.worktrees/`) | 10 — One Worktree per Agent |
| `.github/workflows/ci.yml` | 11 — CI Mirrors Local |
| `docs/qa/` | 13 — Human QA Charter |
| `BOOTSTRAP.md`, `scripts/harness-check.mjs` | agent-adoption layer |

The traceability chain is live in this repo's own history: spec
`S-000` → plan → commit `feat: add harness smoke module [S-000]` → green gate.

## The gate

    pnpm verify   # typecheck → lint → test. The only definition of done.

CI runs the identical command. If it's green locally, it's green in CI.

## Conformance

    pnpm harness:check

Verifies the harness structure is intact (required files, symlinks, gate verb
defined). Run it after stamping, after big refactors, or to grade an
assistant-bootstrapped adaptation.
```

- [ ] **Step 2: Verify lint still passes (Biome checks markdown-adjacent files it knows)**

Run: `pnpm verify`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add README with quick start and file-to-pattern map"
```

---

### Task 7: BOOTSTRAP.md — the agent-adoption layer

**Files:**
- Create: `$TPL/BOOTSTRAP.md`

**Interfaces:**
- Produces: `BOOTSTRAP.md` at root (required by Task 8's checker). References `pnpm harness:check`, which Task 8 implements.

- [ ] **Step 1: Write `BOOTSTRAP.md`**

```markdown
# BOOTSTRAP.md — instructions for AI assistants

You are an AI assistant asked to start a project from this template. There
are two modes. In both, the finish line is the same: `pnpm verify` and
`pnpm harness:check` both green, and no placeholder text remaining.

## Mode 1: Stamp a Node/TypeScript project (use the template as-is)

1. Copy this repo (GitHub "Use this template", or
   `pnpm dlx degit quanta-studio/backend-harness-template <name>`), then
   `git init -b main` if the copy has no `.git`.
2. In `package.json`, set `name` to the project name.
3. In `AGENTS.md`, replace the Purpose section's placeholder line with one
   sentence: what this service does, for whom. Do not skip this — an empty
   purpose makes every future session guess.
4. Run `pnpm install`, then `pnpm verify`. Both must succeed before any
   feature work.
5. Run `pnpm harness:check`. Must print PASS.
6. Ask the human for the first feature, write `docs/specs/S-001-<name>.md`
   in the format of `docs/specs/S-000-harness-smoke.md`, and get it approved
   before writing code. Follow AGENTS.md from here on.
7. When the first real spec ships, delete the S-000 smoke module
   (`src/index.ts` placeholder content, its test, spec, and plan) — it has
   done its job.

## Mode 2: Adapt to a different stack (preserve the invariants)

The toolchain is swappable; the harness is not. Recreate these invariants
with the target stack's native tools:

| Invariant | This repo's implementation | Preserve by |
|---|---|---|
| Constitution + vendor symlinks | `AGENTS.md`, `CLAUDE.md`→`AGENTS.md`, `GEMINI.md`→`AGENTS.md` | same filenames, any stack |
| Docs structure | `docs/{specs,plans,decisions,qa}/` with S-000/ADR-000 formats | copy the example files, adjust content |
| One-command gate | `pnpm verify` = typecheck → lint → test | one verb that runs every mechanical check; document it in the constitution |
| CI mirrors local | `.github/workflows/ci.yml` runs `pnpm verify` verbatim | CI must run the same gate verb, never its own variant |
| Smoke proof | S-000: trivial module + test | a trivial spec'd module proving the gate end-to-end |
| Spec-before-code workflow | AGENTS.md "Workflow rules" | keep the rules; only translate command names |

Grade your adaptation with `scripts/harness-check.mjs` where applicable
(structure and symlink checks are stack-agnostic; pass the target repo's
path as the first argument), or replicate its checks in the target repo.

## What NOT to do

- Do not add frameworks, databases, or deploy config while bootstrapping —
  the template is harness-only on purpose; those arrive with real specs.
- Do not rewrite AGENTS.md in your own style. Fill the placeholder; keep the
  rules.
- Do not report success without pasting the actual `pnpm verify` and
  `pnpm harness:check` output.
```

- [ ] **Step 2: Commit**

```bash
git add BOOTSTRAP.md
git commit -m "docs: add assistant bootstrap guide (stamp + adapt modes)"
```

---

### Task 8: Conformance checker (TDD)

**Files:**
- Create: `$TPL/scripts/harness-check.mjs`
- Create: `$TPL/tests/harness-check.test.ts`
- Modify: `$TPL/package.json` (add `harness:check` script)
- Modify: `$TPL/.github/workflows/ci.yml` (append conformance step)

**Interfaces:**
- Consumes: the full file layout from Tasks 1–7.
- Produces: `pnpm harness:check` verb; script contract: `node scripts/harness-check.mjs [rootDir]` → exit 0 + `harness-check: PASS` on stdout, or exit 1 + `harness-check: FAIL` and `missing: <path>` lines on stderr. Checks are structural only (files exist, symlinks resolve to `AGENTS.md`, `verify` script defined) — it does NOT run `pnpm verify` itself, to avoid recursion (`verify` → `test` → this checker's test). CI satisfies "gate passing" by running `pnpm verify` as its own step.

- [ ] **Step 1: Write the failing test**

`tests/harness-check.test.ts`:
```typescript
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const script = join(process.cwd(), "scripts", "harness-check.mjs");

function runCheck(dir: string) {
  return spawnSync("node", [script, dir], { encoding: "utf8" });
}

describe("harness-check", () => {
  it("passes on this repository", () => {
    const result = runCheck(process.cwd());
    expect(result.stdout).toContain("harness-check: PASS");
    expect(result.status).toBe(0);
  });

  it("fails on an empty directory, listing what is missing", () => {
    const dir = mkdtempSync(join(tmpdir(), "harness-check-"));
    const result = runCheck(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("harness-check: FAIL");
    expect(result.stderr).toContain("missing: AGENTS.md");
    expect(result.stderr).toContain("missing: docs/specs");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test`
Expected: FAIL — the two new tests fail (script file does not exist, spawn produces non-zero/empty output). The S-000 test still passes.

- [ ] **Step 3: Write `scripts/harness-check.mjs`**

```javascript
#!/usr/bin/env node
// Structural conformance check for the backend harness.
// Usage: node scripts/harness-check.mjs [rootDir]   (default: cwd)
// Exit 0 = conforms; exit 1 = violations listed on stderr.
import { existsSync, lstatSync, readFileSync, readlinkSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.argv[2] ?? process.cwd());
const errors = [];

const requiredPaths = [
  "AGENTS.md",
  "README.md",
  "BOOTSTRAP.md",
  "package.json",
  "tsconfig.json",
  "docs/specs",
  "docs/plans",
  "docs/decisions",
  "docs/qa",
  ".github/workflows/ci.yml",
  ".github/pull_request_template.md",
];
for (const rel of requiredPaths) {
  if (!existsSync(resolve(root, rel))) errors.push(`missing: ${rel}`);
}

for (const link of ["CLAUDE.md", "GEMINI.md"]) {
  const p = resolve(root, link);
  if (!existsSync(p)) {
    errors.push(`missing: ${link} (symlink to AGENTS.md)`);
    continue;
  }
  if (!lstatSync(p).isSymbolicLink() || readlinkSync(p) !== "AGENTS.md") {
    errors.push(`${link} must be a symlink pointing to AGENTS.md`);
  }
}

const pkgPath = resolve(root, "package.json");
if (existsSync(pkgPath)) {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  if (!pkg.scripts?.verify) {
    errors.push("package.json: missing scripts.verify (the gate verb)");
  }
}

if (errors.length > 0) {
  console.error("harness-check: FAIL");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("harness-check: PASS");
```

- [ ] **Step 4: Add the verb to `package.json`**

In `package.json` `"scripts"`, add:
```json
"harness:check": "node scripts/harness-check.mjs"
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test`
Expected: PASS — 3 tests green.

Run: `pnpm harness:check`
Expected: `harness-check: PASS`, exit 0.

- [ ] **Step 6: Append the conformance step to CI**

In `.github/workflows/ci.yml`, after the `- run: pnpm verify` line, add:
```yaml
      - run: pnpm harness:check
```

- [ ] **Step 7: Full gate**

Run: `pnpm verify`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add scripts tests package.json .github/workflows/ci.yml
git commit -m "feat: add structural conformance checker with harness:check verb"
```

---

### Task 9: Publish and cross-link

**Files:**
- Modify (in the pattern-language repo `sturdy-waddle`): `README.md`, `index.html`, `llms.txt` — add the reference-implementation link. README and index.html are dual artifacts and must stay in sync.

**Interfaces:**
- Consumes: the completed template repo, all local commits on `main`.

- [ ] **Step 1: Confirm publication with the user**

Creating the GitHub repo is outward-facing. Confirm: repo name `quanta-studio/backend-harness-template`, visibility **public** (required for the Pages site to link usefully; ask if private is preferred). Do not proceed without confirmation.

- [ ] **Step 2: Create the GitHub repo and push**

From `$TPL`:
```bash
gh repo create quanta-studio/backend-harness-template --public --source . --push
```
Expected: repo created, `main` pushed, remote `origin` configured.

- [ ] **Step 3: Mark it as a template repo and verify CI**

```bash
gh repo edit quanta-studio/backend-harness-template --template
gh run watch --repo quanta-studio/backend-harness-template --exit-status
```
Expected: template flag set (fallback if the flag is unsupported by the installed `gh`: Settings → check "Template repository" in the browser); CI run for the pushed `main` completes green. If CI fails, fix before continuing — a red template is worse than no template.

- [ ] **Step 4: Cross-link from the pattern language**

In `/Users/laplace/Documents/workspaces/repositories/quanta-studio/ai-learning/virtual-engineering-team-in-practice`:

1. `README.md` — after the intro paragraph ending "…bootstrap a project that follows the same stack." (line ~7), add:

```markdown
> **Reference implementation:** [backend-harness-template](https://github.com/quanta-studio/backend-harness-template) — the patterns below, pre-wired for Node/TypeScript backends. Clone it instead of re-deriving them.
```

2. `index.html` — add the equivalent link in the intro/hero section (match the existing button/link style used for "Use this template"; keep copy identical in meaning to the README line).

3. `llms.txt` — in the links list (around line 41), add:

```markdown
- [Reference implementation (Node/TS)](https://github.com/quanta-studio/backend-harness-template): the patterns pre-wired as a GitHub template repo
```

- [ ] **Step 5: Commit and push the pattern-language repo**

```bash
git add README.md index.html llms.txt
git commit -m "feat(docs): link Node/TS reference implementation template"
git push
```
Expected: push succeeds; Pages site rebuilds with the new link.

- [ ] **Step 6: Acceptance check (spec's v1 criterion)**

Smoke-test the stamp path end-to-end:
```bash
cd /private/tmp/claude-501/-Users-laplace-Documents-workspaces-repositories-quanta-studio-ai-learning-virtual-engineering-team-in-practice/e3809e00-301b-4688-b776-2f23f55d747a/scratchpad
pnpm dlx degit quanta-studio/backend-harness-template stamp-test
cd stamp-test && pnpm install && pnpm verify && node scripts/harness-check.mjs
```
Expected: `pnpm verify` green and `harness-check: PASS` on the freshly stamped copy. (Symlinks: degit preserves them; if `harness-check` flags the symlinks on the stamped copy, re-create them with `ln -s AGENTS.md CLAUDE.md && ln -s AGENTS.md GEMINI.md` and note it as a known degit caveat in BOOTSTRAP.md.)

Report the actual output of both commands to the user. The full "ship one feature with an assistant, zero re-explaining" acceptance test happens in real use — note it as the follow-up.
