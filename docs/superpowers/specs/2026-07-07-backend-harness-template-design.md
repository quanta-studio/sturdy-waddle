# Design: Node/TS Backend Harness Template

**Date:** 2026-07-07
**Status:** Approved (pending spec review)

## Goal

A GitHub template repository that is the executable counterpart to the Harness
Engineering Stack pattern language. Where the pattern language *describes* the
harness in prose, this template *implements* it for one concrete stack —
Node/TypeScript backends — so that starting a new project requires zero
re-explaining of the stack's conventions.

**Primary success criterion:** the author's own velocity. Stamp a fresh
project from the template, point an assistant at `AGENTS.md` with a small
spec, and ship one feature end-to-end (spec → plan → branch → green gate → PR)
with no convention re-derivation.

**Secondary goal (agent-adoption layer):** any AI assistant — not just Claude
Code — can bootstrap a conforming project from the template, or adapt its
invariants to a different stack, using only documents inside the repo.

## Non-goals (v1)

- No HTTP framework, database, auth, deploy config, or observability wiring.
  The template is a **harness-only skeleton**; app-level choices are made per
  project. Each battery is added only when a real project needs it twice.
- No `create-*` CLI, no interactive options or prompts.
- No non-technical-user interface. Serving non-technical builders is a
  separate product decision, deliberately excluded (crowded space owned by
  Lovable/Bolt/v0/Replit; the harness's differentiator — traceability and
  verification rigor — is a pain non-technical users don't feel at project
  start).
- No update-propagation mechanism to already-stamped projects. Accepted
  template weakness; revisit only if drift hurts in practice.

## Shape and home

A **new sibling repo** — working name `quanta-studio/backend-harness-template`
— marked as a GitHub template ("Use this template" / `degit`). This
pattern-language repo gains a single "reference implementation" link; nothing
else here changes.

Every file in the template exists to implement a numbered pattern from the
pattern language, and the template's README maps each file back to its
pattern.

## Repository layout

```
backend-harness-template/
├── AGENTS.md                    # Pattern 2 constitution; CLAUDE.md + GEMINI.md symlink to it
├── README.md                    # quick start + file→pattern map
├── BOOTSTRAP.md                 # agent-adoption layer (see below)
├── docs/
│   ├── specs/S-000-example.md   # worked example in Pattern 3 format
│   ├── plans/S-000-plan.md      # Pattern 5 format
│   ├── decisions/ADR-000.md     # Pattern 4 format
│   └── qa/README.md             # Pattern 13 charter format
├── src/index.ts                 # trivial real module (one exported function)
├── tests/index.test.ts          # one passing test proving the gate works end to end
├── package.json                 # scripts: verify = typecheck + lint + test
├── tsconfig.json                # strict
├── .github/workflows/ci.yml     # runs exactly `pnpm verify` (Pattern 10: CI = local gate)
├── .github/pull_request_template.md
└── scripts/harness-check.mjs    # conformance checker (dependency-free)
```

The `src/` module is deliberately trivial: it exists only so `pnpm verify`
has something real to typecheck, lint, and test from minute one. It is
replaced by the first feature.

## Tooling opinions

| Choice | Decision | Rationale |
|---|---|---|
| Package manager | pnpm | fast, strict; Node pinned via `engines` + `.nvmrc` |
| Test runner | Vitest | TS-native, fast |
| Lint + format | Biome | one fast tool instead of ESLint + Prettier; swappable |
| Gate | `pnpm verify` = typecheck → lint → test | Pattern 6: one command answers "am I done?" |
| CI | GitHub Actions running the identical `pnpm verify` | Pattern 10: no CI-only behavior |
| Commits | Conventional commits with `[S-NNN]` trace tags | Pattern 12 traceability; enforced via AGENTS.md, not tooling (no husky/commitlint — YAGNI solo) |

## Agent-adoption layer

Two artifacts:

1. **`BOOTSTRAP.md`** — written *to an assistant*. Covers:
   - Stamping a new project: clone/degit, rename placeholders, fill the
     one-line project purpose in `AGENTS.md`, run `pnpm verify` to confirm
     green.
   - Adapting to a non-Node stack: preserve the invariants (constitution
     file + symlinks, `docs/` structure, one-command gate, CI/local parity,
     spec-before-code workflow) while swapping the toolchain.
2. **`scripts/harness-check.mjs`** — dependency-free Node script answering
   "does this repo still conform?": required files present, symlinks resolve,
   `verify` script defined and passing. Doubles as the grading rubric when
   testing other assistants against `BOOTSTRAP.md`.

## Verification of the template itself

- The template's own CI must always be green: `pnpm verify` and
  `harness-check` pass on the template repo itself.
- v1 acceptance test: stamp a fresh project, hand an assistant a small spec,
  and ship one feature through the full loop with zero convention
  re-explaining.

## Decision context (why this direction)

Three directions were compared:

1. **Template for own use** (chosen core): value on day one, near-zero
   maintenance, ceiling of one user — acceptable given the goal.
2. **Non-technical adoption** (rejected for v1): requires hiding git/CI/PRs
   behind a hosted product; startup-sized commitment in a space owned by
   funded incumbents; abandons the daily-driver goal.
3. **Adoption by other AI assistants** (chosen as thin layer): cheap because
   the pattern language already half-claims it (`llms.txt`, portable skills);
   composes with the template, which doubles as the reference implementation.
