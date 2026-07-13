---
pattern: 1
title: Repo as Single Source of Truth
slug: repo-as-single-source-of-truth
layer: 1
related: [3, 4, 5, 12, 13]
---

### Pattern 1: Repo as Single Source of Truth

**Context:** You use multiple AI assistants across many sessions. Each session starts with amnesia.

**Problem:** Knowledge scattered across chat histories, Notion pages, and your head is invisible to the assistant. Anything the assistant can't read might as well not exist — it will guess instead, and guess differently each session.

**Therefore:** Everything that governs the project lives in the repo as plain text (markdown), versioned by git. Specs, plans, decisions, QA checklists, runbooks. External tools (issue trackers, design files) may exist, but the repo copy is canonical; when they disagree, the repo wins. Git history is the project's memory — write commit messages as if they are the changelog, because (Pattern 12) they will be.

```
docs/
  specs/       # what to build (Pattern 3)
  plans/       # how to build it (Pattern 5)
  decisions/   # why it's built this way (Pattern 4)
  qa/          # what humans verify (Pattern 13)
```
