---
pattern: 3
title: Spec Before Code
slug: spec-before-code
layer: 1
related: [13]
---

### Pattern 3: Spec Before Code

**Context:** You have an idea. The assistant is eager to write code immediately.

**Problem:** Code written from a vague prompt encodes the assistant's assumptions, not your intent. You discover the mismatch after the code exists, when it's expensive.

**Therefore:** No feature work starts without a spec file: `docs/specs/S-NNN-short-name.md`. A spec is short — half a page is fine — but always contains:

```markdown
# S-012: Password reset via email

## Why
Users locked out of accounts churn. Support email is 40% reset requests.

## What
- User requests reset with email address; always respond "email sent" (no account enumeration)
- Token valid 30 minutes, single use
- Out of scope: SMS reset, admin-initiated reset

## Acceptance criteria          <- testable, numbered
1. Valid token + new password → login works with new password
2. Expired token → clear error, no password change
3. Token reused → rejected

## Human QA notes               <- feeds Pattern 13
- Reset email renders correctly in Gmail dark mode
```

Write specs *with* the assistant — it drafts, asks clarifying questions, you decide. The conversation is the design review; the file is what survives it. Statuses: `draft → approved → shipped`. Only you move a spec to `approved`.
