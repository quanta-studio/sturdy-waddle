---
pattern: 10
title: One Worktree per Agent
slug: one-worktree-per-agent
layer: 4
related: [5, 9, 15]
---

### Pattern 10: One Worktree per Agent

**Context:** Your "team" is several assistant sessions running at once — one building S-012 in the backend, another fixing a bug in `web/`, a third upgrading `mobile-app/` dependencies. They all target the same repo.

**Problem:** A git checkout has exactly one working directory and one checked-out branch. Two agents in the same directory stomp each other's uncommitted files, switch branches under each other mid-task, and run `just check` against a mixture of both changes — so a green gate proves nothing.

**Therefore:** Every agent works in its own **git worktree** — a separate directory with its own checked-out branch, sharing the same underlying repository. One worktree = one branch = one plan task:

```bash
# dispatch two agents in parallel, fully isolated:
git worktree add .worktrees/s012-reset-endpoints -b s012/reset-endpoints
git worktree add .worktrees/s014-filters        -b s014/dashboard-filters

# after each PR merges:
git worktree remove .worktrees/s012-reset-endpoints
git worktree list    # audit what's still in flight — on THIS machine only;
                     # cross-device awareness is the Session Ledger (Pattern 15)
```

Rules that keep it safe:

- `.worktrees/` is gitignored; each worktree runs `just setup` on creation (dependencies are per-worktree, not shared).
- The **root checkout stays on `main` and stays clean** — it is your review station, never an agent's workspace.
- The gate is per-worktree: an agent runs `just check` inside its own worktree, so green means *this branch* passes in isolation.
- Coordination happens at plan level, not merge level: assign agents plan tasks (Pattern 5) that touch disjoint files/modules. Small PRs (Pattern 9) keep the rare collision cheap to resolve; the second branch to merge rebases onto `main` and re-runs the gate.
- Many harnesses do this natively (Claude Code's worktree isolation, Codex environments) — when yours does, use it; the pattern is the same, the bookkeeping is automated.
