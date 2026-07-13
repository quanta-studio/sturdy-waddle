---
pattern: 9
title: Small PRs on Trunk
slug: small-prs-on-trunk
layer: 4
related: [11]
---

### Pattern 9: Small PRs on Trunk

**Context:** Solo repo. It's tempting to let the assistant commit straight to `main` — who's going to object?

**Problem:** Direct-to-main removes the only checkpoint where you see the whole change before it's history. And giant branches make review humanly impossible, so review silently stops happening.

**Therefore:** Trunk-based development with short-lived branches — even solo:

- One plan task (or a few related ones) per branch: `s012/reset-endpoints`
- **Conventional commits**, always, because the release pipeline reads them: `feat(auth): add reset token model [S-012]`, `fix(web): ...`, `fix(mobile): ...`. The `[S-NNN]` trailer is the traceability thread.
- PR into `main`; the PR description links the spec and plan
- Merge requires: CI green (Pattern 11) + your approval. You are the reviewer; an assistant may *also* review (fresh session, no shared context with the author session — an effective and cheap second opinion), but a human merge decision is the last line of defense.
- Branches live hours-to-days, never weeks. If a plan task produces a >500-line diff, the plan step was too big — split it.
