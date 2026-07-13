---
pattern: 4
title: Decision Records
slug: decision-records
layer: 1
related: []
---

### Pattern 4: Decision Records

**Context:** You chose Postgres over Mongo, sessions over JWTs, a monorepo over three repos.

**Problem:** Six months later, an assistant (or you) "helpfully" reverses a settled decision because the reasoning lived only in a chat that's gone.

**Therefore:** Every significant, hard-to-reverse choice gets a one-page ADR in `docs/decisions/ADR-NNN-title.md`: context, decision, consequences, alternatives rejected. Assistants must read relevant ADRs before proposing architecture changes, and must propose a *new* ADR (for your approval) to supersede an old one — never silently contradict it.
