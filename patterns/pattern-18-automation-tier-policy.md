---
pattern: 18
title: Automation Tier Policy
slug: automation-tier-policy
layer: 8
related: [8, 19]
---

### Pattern 18: Automation Tier Policy

**Context:** Tickets vary enormously in blast radius: a typo fix, a P2 bug with a clean repro, a schema migration touching payment data. Corporates additionally need auditability — someone must be able to answer *who decided the machine was allowed to do this?*

**Problem:** If the agent decides for itself how much autonomy each ticket deserves, the riskiest tickets meet the most confident automation. If every ticket requires full human ceremony, the pipeline is slower than having no automation at all.

**Therefore:** A **human-authored, committed policy file** — `docs/policy/automation-tiers.md` — routes every triaged ticket into one of three tiers. Agents *apply* the policy; only humans *edit* it (enforceable via CODEOWNERS):

```markdown
# Automation Tier Policy                    owner: eng-lead · reviewed quarterly

| Tier | Autonomy | Category (human-defined)                                  |
|------|----------|-----------------------------------------------------------|
| 1    | Full     | P3/P4 · dep patches, typos, log noise, flaky-test fixes, docs |
| 2    | Partial  | P2 · bugs with repro, small features inside one module     |
| 3    | Sign-off | P0/P1 · security, auth, payments, data migration, public API, anything cross-module |

Unmatched or ambiguous → Tier 3. Always.
```

What each tier means in the operating loop:

- **Tier 1 — fully automated: plan → fix.** The agent plans, fixes test-first, and the PR merges on a green gate (Pattern 8) without waiting for a human. The audit trail (spec, plan, PR, CI run) still exists; humans review the *stream* asynchronously, not each item.
- **Tier 2 — partially automated: plan → judge → evidence → fix.** The agent plans; an **independent AI judge session** (fresh context, not the author) reviews the plan and the fix against an **evidence pack** (Pattern 19) attached to the PR and the ticket. A human merges — but reviews evidence, not raw diffs, which is minutes instead of hours.
- **Tier 3 — human sign-off before code.** The agent produces the plan and supporting evidence (Pattern 19), then **stops**. A named human approves the plan — recorded on the plan doc (`Signed-off-by:`) and mirrored to the ticket — before any implementation begins. Execution then proceeds as Tier 2, including the human merge.

Two properties make this pattern safe rather than decorative: **the default is the strictest tier** — an unclassifiable ticket is a Tier 3 ticket, so policy gaps fail closed; and **tier assignment is logged on the ticket at triage time** ("Triaged Tier 1 per policy §deps"), so every autonomous action traces back to a human-approved rule, not an agent's judgment call.
