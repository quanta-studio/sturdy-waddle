---
pattern: 24
title: Versioned Backend Contracts
slug: versioned-backend-contracts
layer: 11
related: [20]
---

### Pattern 24: Versioned Backend Contracts

**Context:** Flags work because you control the deploy: flip the matrix, ship, done. Nobody controls what's installed on a user's phone. A `mobile-app/` build from six months ago is still calling your backend today.

**Problem:** A backend that changes its API in place breaks clients it cannot force-update. And putting response *shapes* behind feature flags is worse — the contract becomes nondeterministic, and every client must handle every possible shape forever.

**Therefore:** The backend strengthens by **version control of its contracts**, not by toggles:

- **Additive first.** New optional fields and new endpoints need no version bump — old clients ignore what they don't read. Most changes should be this kind; reach for a version only when a change is genuinely breaking.
- **Breaking change → new version, both live.** `/v2/reset` ships alongside `/v1/reset` (URL or header versioning — pick one, record it in an ADR). The old version keeps working, byte-for-byte, until it is formally retired.
- **Contract tests per live version in the gate.** `just check` runs the contract suite for *every* supported version — v1's tests don't change when v2 lands, which is exactly the point: they prove v1 didn't either. (This is Pattern 20's ratchet logic applied to compatibility.)
- **A committed support matrix** — `docs/policy/api-versions.md`: each version's status (`current / deprecated / sunset`), the minimum mobile app version it serves, and the planned retirement date. Retirement is a human decision (Tier 3), taken when telemetry shows the version idle or the forced-update floor has passed it.

The division of labor, in one line: **flags gate what users *see* (client, reversible per environment); versions gate what clients *rely on* (backend, append-only until retirement).** A feature typically uses both — additive v-next endpoints deployed dark, client UI behind a flag, promotion = flip the flag.
