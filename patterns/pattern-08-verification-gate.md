---
pattern: 8
title: Verification Gate
slug: verification-gate
layer: 3
related: []
---

### Pattern 8: Verification Gate

**Context:** The assistant says "done!". Assistants are optimistic.

**Problem:** "Done" claimed without evidence trains you to re-check everything, which destroys the leverage of delegating in the first place.

**Therefore:** One command — `just check` — is the project's Definition of Done, and it is the *same* set of checks locally and in CI:

```
just check  =  format check + lint + typecheck + all tests + production build
```

The constitution states the contract: **no task is complete, no commit is made, until `just check` passes — and the assistant reports the actual output, not a summary of its confidence.** Anything that can be checked mechanically (formatting, types, coverage floors, dependency audit) goes into the gate rather than into review comments. Review your own attention as the scarcest resource in the system; spend it only where machines can't.
