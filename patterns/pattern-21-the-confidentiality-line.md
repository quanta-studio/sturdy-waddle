---
pattern: 21
title: The Confidentiality Line
slug: the-confidentiality-line
layer: 9
related: [2, 13, 17, 19, 20]
---

### Pattern 21: The Confidentiality Line

**Context:** This is the only pattern in the stack that is **a warning to the human, not an automation**. There is no verb, no gate, no agent protocol that enforces it — which is exactly why it must be written down.

**Problem:** The stack normalizes handing context to AI assistants — specs, code, logs, tickets. Habit generalizes. One day the "context" is a customer database export, a client's contract, or production credentials, pasted into whatever model window is open — including free-tier tools with no data agreement, retention you can't audit, and training policies you never read.

**Therefore, the line, stated plainly:**

> **Never paste confidential data into an AI model you do not control.**
> No credentials or keys. No customer PII. No client material under NDA. No unreleased financials. If you cannot answer *where this data is stored, for how long, and who can see it* — the answer is it does not go in.

What makes the line easier to hold — supporting habits, not enforcement:

- **Know your endpoints.** Use models under terms you have actually accepted deliberately: enterprise/zero-retention endpoints, self-hosted models, or vendors with a signed data-processing agreement. "Uncontrolled" means any model where you can't state the retention policy.
- **The repo helps you by construction:** secrets never live in the repo anyway (env vars and secret managers only, enforced by the gate's secret scanning, Pattern 20) — so an assistant reading the repo cannot leak what was never there.
- **Watch the side channels.** Evidence packs (Pattern 19), QA charters (Pattern 13), and ticket comments (Pattern 17) carry logs and screenshots — scrub PII and secrets *before* they're attached, because trackers and PRs are where confidential data quietly escapes into systems with different access rules.
- **Write it into the constitution** (Pattern 2) so every agent session carries the rule: real user data never appears in specs, tests, fixtures, or evidence — synthetic data always.
