---
pattern: 15
title: Session Ledger
slug: session-ledger
layer: 7
related: [5, 9, 10]
---

### Pattern 15: Session Ledger

**Context:** Several agent sessions run in parallel — and not just on one machine: a cloud agent, your desktop, your laptop, all sharing the repo through git.

**Problem:** Worktrees (Pattern 10) isolate *file state*, but they don't broadcast *intent*, and they're invisible across devices. Two agents on different machines can independently pick up the same task, and git only reveals the collision at push time — after both have done the work.

**Therefore:** A committed **session ledger** at `docs/sessions/LEDGER.md` records who is working on what, right now:

```markdown
# Session Ledger — active work

| Started (UTC)    | Agent / device        | Task            | Branch                | Last update      |
|------------------|-----------------------|-----------------|-----------------------|------------------|
| 2026-07-05 09:10 | claude @ macbook      | S-012 tasks 1–3 | s012/reset-endpoints  | 2026-07-05 10:40 |
| 2026-07-05 09:45 | codex @ cloud         | S-014 task 1    | s014/dashboard-filters| 2026-07-05 09:45 |
```

The protocol:

1. **Before claiming work:** `git pull`, read the ledger. If the task (or files it touches) is claimed and fresh, pick something disjoint.
2. **Claim by writing:** add your row and push immediately. Ledger edits are the one sanctioned exception to "never commit to main" (Pattern 9) — they are docs-only, single-row, and their entire value is being visible *before* your PR exists.
3. **Update as you go:** bump `Last update` at natural checkpoints; leave a one-line handoff note in the plan doc (Pattern 5) if you stop mid-task.
4. **Release on merge:** delete your row in the same push that follows your PR merging.
5. **Stale claims expire:** a row untouched past a threshold (say 24–48h) may be taken over — note the takeover in the ledger so the trail survives.

Division of labor between the three tracking artifacts: the **plan** (Pattern 5) records what is *done*, the **ledger** records what is *in flight and by whom*, and **worktrees** (Pattern 10) keep in-flight work *physically separated*. Together they let any number of agents on any number of devices coordinate through nothing but git — no extra service, no message bus, fully inspectable.
