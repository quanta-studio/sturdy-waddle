---
pattern: 11
title: CI Mirrors Local
slug: ci-mirrors-local
layer: 4
related: [8]
---

### Pattern 11: CI Mirrors Local

**Context:** You need an arbiter that isn't the assistant grading its own homework.

**Problem:** CI pipelines that grow their own bespoke logic drift from local checks, producing "passes locally, fails in CI" mysteries that burn your day and the assistant's context.

**Therefore:** CI is deliberately boring — a clean machine that runs the same verbs you and the assistant run:

```yaml
# .github/workflows/ci.yml  (GitHub Actions; any runner works)
on: [pull_request, push: {branches: [main]}]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: just setup
      - run: just check        # the gate, verbatim (Pattern 8)
```

Per-module path filters keep it fast in a monorepo (only test `backend/` when `backend/` changed), but the *logic* stays in the justfile, not YAML. `main` must always be releasable: a red `main` is a stop-the-line event — the constitution instructs assistants to treat fixing it as the top-priority task in any session that finds it red.
