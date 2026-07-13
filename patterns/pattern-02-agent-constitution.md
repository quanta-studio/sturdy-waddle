---
pattern: 2
title: Agent Constitution
slug: agent-constitution
layer: 1
related: [6, 8]
---

### Pattern 2: Agent Constitution

**Context:** Every assistant needs the same briefing: what this project is, how to run it, what the rules are.

**Problem:** Re-explaining conventions each session wastes context and produces drift — each assistant invents its own style.

**Therefore:** Keep one canonical instruction file, `AGENTS.md`, at the repo root, and symlink the vendor-specific names to it so every tool reads the same constitution:

```bash
ln -s AGENTS.md CLAUDE.md      # Claude Code
ln -s AGENTS.md GEMINI.md      # Gemini CLI
# Cursor, Codex, and most tools read AGENTS.md natively
```

The constitution stays short (one screen) and contains only what the assistant can't derive from code:

- One-line project purpose and the module map (`backend/`, `web/`, `mobile-app/`, `webservices/`)
- The command interface (Pattern 6) — how to test, lint, run
- The Definition of Done (Pattern 8)
- Workflow rules: spec before code, TDD, branch + PR, commit format
- Pointers into `docs/` — not copies of its content

Sub-directories get their own `AGENTS.md` only for rules truly local to them (e.g. `web/AGENTS.md` names the component conventions; `mobile-app/AGENTS.md` names the navigation and platform rules).
