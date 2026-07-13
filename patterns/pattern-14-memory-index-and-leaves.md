---
pattern: 14
title: Memory Index and Leaves
slug: memory-index-and-leaves
layer: 7
related: [2, 3, 4]
---

### Pattern 14: Memory Index and Leaves

**Context:** Across sessions, assistants learn things that belong to no spec or ADR: "the payments sandbox rate-limits at 10 req/s", "e2e tests need `TZ=UTC` on macOS", "the client prefers British spelling". You work from several devices, so this knowledge must travel with the repo.

**Problem:** A single growing `MEMORY.md` fails in both directions. If every fact lands in one file, it bloats until loading it burns the context window and assistants skim past what matters. If facts stay in chat history instead, they're lost to the next session and invisible on your other machine.

**Therefore:** Structure durable memory as an **index plus leaves** (hub-and-spoke — the same shape a Zettelkasten calls a Map of Content):

- **`MEMORY.md` at the repo root is a pure index** — one line per memory: a link and a hook for deciding relevance. Never content. It stays small enough to load every session, forever.
- **Leaves are small files, one topic each**, in `docs/memory/`. A leaf states the fact, why it's true, and how to apply it.
- **Each module owns its leaves**: `backend/docs/memory/` holds backend-only facts, indexed by a `backend/MEMORY.md` that the root index points to. An agent working in `web/` never pays the token cost of backend trivia.

```
MEMORY.md                      # root index: one line per entry, links only
docs/memory/
  client-tone-preferences.md   # cross-cutting leaves
  release-day-checklist-gotchas.md
backend/MEMORY.md              # module index
backend/docs/memory/
  payments-sandbox-rate-limit.md
```

The read protocol is progressive disclosure: **always load the index; open only the leaves relevant to the task.** The write protocol keeps it honest: before adding a leaf, check whether one already covers it — update rather than duplicate; delete leaves proven wrong; convert relative dates ("last week") to absolute ones.

Boundary discipline is what prevents the burst: memory holds only *learned facts not derivable from the repo*. Rules you set live in the constitution (Pattern 2); decisions live in ADRs (Pattern 4); requirements live in specs (Pattern 3). When a memory hardens into a rule ("always run migrations before seeding"), promote it — move it into `AGENTS.md` or an ADR and delete the leaf.

**When *not* to upgrade this pattern:** index-and-leaves already *is* a knowledge graph — leaves are nodes, cross-references are edges — so resist the urge to replace it with a formal one (typed relations, a graph database, a memory service). Those earn their keep at thousands of nodes with automated ingestion, not at the dozens of hand-written leaves a solo developer accumulates, and a memory service would be the first piece of the stack that doesn't travel with `git clone`. The ways memory actually fails — wrong leaf loaded, stale facts, duplicates of what the repo already says — are fixed by the read/write protocols above, not by richer edges. The honest test before adding structure: name a concrete question the current shape failed to answer. Until one exists, invest in denser cross-links between leaves instead — plain-markdown links are traversable with grep by humans and agents alike, and if you ever do outgrow them, well-linked markdown imports trivially into any graph tool later.
