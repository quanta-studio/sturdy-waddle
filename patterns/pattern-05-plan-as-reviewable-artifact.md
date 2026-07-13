---
pattern: 5
title: Plan as Reviewable Artifact
slug: plan-as-reviewable-artifact
layer: 2
related: []
---

### Pattern 5: Plan as Reviewable Artifact

**Context:** A spec is approved. The work spans multiple files, maybe multiple sessions.

**Problem:** If the plan lives only in the assistant's context window, it dies with the session, and you can't review the approach before the diff exists.

**Therefore:** For any spec bigger than an hour's work, the assistant writes `docs/plans/S-NNN-plan.md` before touching code: ordered tasks, each small enough to complete and verify in one sitting, each naming the files it touches and the test that proves it.

```markdown
# Plan: S-012 password reset

- [ ] 1. Token model + expiry logic — backend/auth/tokens.py — test: token_test.py
- [ ] 2. Request-reset endpoint (always 200) — backend/api/reset.py — test: api/reset_test.py
- [ ] 3. Confirm-reset endpoint — backend/api/reset.py — test: acceptance criteria 1–3
- [ ] 4. Email template + send — webservices/mailer/ — test: snapshot test
- [ ] 5. Web forms — web/src/reset/ — test: e2e happy path
- [ ] 6. Mobile deep link + form — mobile-app/src/reset/ — test: e2e happy path
```

You review the plan (cheap), not just the diff (expensive). The assistant checks boxes as it goes — so a fresh session can read the plan and resume exactly where the last one stopped. Review the plan *before* code exists; that is the highest-leverage review you will do.
