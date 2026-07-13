---
pattern: 6
title: One-Command Interface
slug: one-command-interface
layer: 3
related: [8, 12]
---

### Pattern 6: One-Command Interface

**Context:** Three modules, three languages, three toolchains. Assistants, CI, and you all need to run the same checks.

**Problem:** If testing the backend requires remembering `cd backend && poetry run pytest -x --cov`, every runner (human, assistant, CI) encodes its own variant, and they drift. The assistant burns context rediscovering commands; CI silently checks something different from what the assistant checked.

**Therefore:** A single task runner file at the repo root defines the entire verb set. Default: [`just`](https://github.com/casey/just) (a `Makefile` works too). Every verb works from a fresh clone.

```just
setup      # install all deps, all modules
dev        # run everything locally
test       # all tests, all modules
test-fast  # unit tests only — the TDD inner loop, must finish in seconds
lint       # format check + lint + typecheck, all modules
check      # THE GATE: lint + test + build (Pattern 8)
build      # production artifacts
release    # cut a release (Pattern 12)
```

The rule that makes this a pattern and not a convenience: **no workflow instruction anywhere — AGENTS.md, CI config, this README — may contain a raw toolchain command. Only verbs.** CI calls `just check`. The constitution says "run `just check`". When the toolchain changes, one file changes.
