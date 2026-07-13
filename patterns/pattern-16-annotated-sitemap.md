---
pattern: 16
title: Annotated Sitemap
slug: annotated-sitemap
layer: 7
related: [1, 2, 14]
---

### Pattern 16: Annotated Sitemap

**Context:** The repo has grown past what fits in one glance. An assistant starting a task must first answer "where does this live?" — and every assistant answers it from scratch, every session.

**Problem:** Undirected discovery — recursive listings, chains of greps, opening file after file — burns tokens before any productive work starts. Worse, an agent that scans *partially* builds a wrong mental model and edits the wrong layer. But the naive fix fails too: a hand-written, file-level map rots within weeks, and a stale map is worse than no map, because agents trust it and confidently look in the wrong place.

**Therefore:** Keep a `SITEMAP.md` at the repo root — **directory-level, purpose-annotated, and updated in the same PR as any structural change.** It is the index-and-leaves idea (Pattern 14) applied to code: structure lives in the map; content stays discoverable by search.

```markdown
# SITEMAP

backend/            FastAPI service — all business logic lives here, never in webservices
  auth/             sessions, tokens, password reset      → touch for: login, S-012
  api/              HTTP routes only — thin, no logic     → logic goes in domain/
  domain/           core business rules, pure functions   → most feature work lands here
  migrations/       alembic; append-only, never edit old files
web/                React SPA — browser experience
  src/components/   shared UI primitives — check here BEFORE creating a new component
  src/features/     one folder per user-facing feature, owns its own state
mobile-app/         React Native (Expo) — iOS/Android; consumes the same backend API as web/
webservices/        third-party integrations (mailer, payments) — isolated so they're mockable
docs/               specs, plans, decisions, qa, memory — see MEMORY.md and Pattern 1
```

The rules that keep it useful:

- **Directories, not files.** Files churn daily; directory purposes are stable for months. File-level detail is what `grep` and `glob` are for — the map answers *where and why*, search answers *what exactly*.
- **Every line carries intent**, not just a name: what belongs here, what must not, and "touch this when…" hints. A bare `tree` output is not a sitemap — the annotations are the entire value.
- **Freshness is gated, not hoped for:** any PR that adds, moves, or removes a directory updates `SITEMAP.md` in the same PR — put it in the constitution, and optionally in CI (compare `tree -d` against the map's entries).
- **Scale by zooming, not growing:** keep it one screen per module; if a module needs more depth, it gets its own `backend/SITEMAP.md` and the root map links to it.

Read protocol for agents, stated in the constitution: **consult the sitemap before searching; search before scanning; never scan.** The zoom sequence is constitution (5-line module map, Pattern 2) → `SITEMAP.md` (directory purposes) → targeted search (exact symbols).
