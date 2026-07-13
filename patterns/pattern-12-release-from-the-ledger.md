---
pattern: 12
title: Release from the Ledger
slug: release-from-the-ledger
layer: 5
related: [9, 13]
---

### Pattern 12: Release from the Ledger

**Context:** Shipping involves versioning, changelogs, tagging, deploying — pure toil, error-prone by hand.

**Problem:** Manual releases get postponed (scary) or sloppy (untagged, unchangelogged). Either way you lose the ability to answer "what exactly is running in prod?"

**Therefore:** The release pipeline is a pure function of git history. Because commits are conventional (Pattern 9), a tool derives everything:

- `feat:` → minor bump, `fix:` → patch, `BREAKING CHANGE:` → major
- Changelog generated from commit subjects (with `[S-NNN]` links back to specs)
- Tag + GitHub Release created automatically

Defaults: [`semantic-release`](https://semantic-release.gitbook.io/) or [`changesets`](https://github.com/changesets/changesets) (better for multi-package monorepos). Flow:

```
merge to main ──▶ CI green ──▶ auto-deploy to STAGING
                                    │
                        human QA charter runs here (Pattern 13)
                                    │
              you: `just release` (or approve a pipeline gate)
                                    │
                    tag + changelog + deploy to PROD
```

Two environments minimum. Staging is where the machine's confidence ends and yours begins: promotion to prod is the one step that stays human. Every release must be rollback-able by redeploying the previous tag — and you rehearse that once, before you need it.
