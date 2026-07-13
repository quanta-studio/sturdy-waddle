---
pattern: 13
title: Human QA Charter
slug: human-qa-charter
layer: 6
related: []
---

### Pattern 13: Human QA Charter

**Context:** `just check` is green, staging is deployed. Automation has verified everything automation can verify.

**Problem:** Two failure classes are invisible to your test suite: (a) the software correctly does something that turns out to be wrong or ugly for a real person, and (b) breakage in the gaps between tested paths. Solo founders skip manual QA because it's unstructured — "click around a bit" — and unstructured checking finds nothing.

**Therefore:** For each release, the assistant generates a **QA charter** at `docs/qa/v1.4.0-charter.md` from the shipped specs — and it deliberately *excludes* what automation already covers:

```markdown
# QA Charter — v1.4.0 (staging)
Ships: S-012 password reset, S-014 dashboard filters      ~15 minutes

## Scripted checks (from spec "Human QA notes")
- [ ] Reset email renders correctly in Gmail dark mode
- [ ] Reset flow on a real phone: keyboard, autofill, tap targets
- [ ] Error message when token expires reads as helpful, not alarming

## Exploratory charters (timeboxed ~5 min each)
- [ ] Try to confuse the reset flow: double-submit, back button mid-flow,
      two tabs, paste garbage tokens. Log anything surprising.
- [ ] First-impression pass on dashboard filters: is the empty state clear?

## Findings
| # | What happened | Spec violated? | → action |
|---|---------------|----------------|----------|
| 1 | ...           | S-012 / none   | fix now / new spec / ignore |
```

Human QA tests *judgment*: tone, feel, confusion, trust — the things with no assertion syntax. Findings close the loop: each one becomes a fix (before promoting), a new spec (backlog), or an explicit "accepted" note. The charter is committed with the release, so you can always answer "was this checked by a human?"
