---
pattern: 20
title: Security Learnings Become Tests
slug: security-learnings-become-tests
layer: 9
related: [7, 8, 13, 14, 18, 21]
---

An honest layer. It does not claim the harness makes you secure — no harness can, and an AI assistant cannot cover the unknowns. What it can do is guarantee two narrower things: **security knowledge, once gained, is never lost** (Pattern 20), and **the humans using the stack know exactly where the confidentiality line is** (Pattern 21).

### Pattern 20: Security Learnings Become Tests

**Context:** Security review is episodic — an audit, a pentest, an incident, a judge session catching an injection. Agent code generation is continuous. Between reviews, assistants keep producing code at full speed.

**Problem:** Security knowledge evaporates fastest of all knowledge. The vulnerability class an auditor found in March is reintroduced by a fresh agent session in July, because nothing in the harness remembers March. And unknown vulnerabilities are, by definition, not coverable — so pretending the assistant "handles security" is the most dangerous claim in the stack.

**Therefore:** Scope the claim honestly, then enforce it mechanically: **the harness cannot make you secure, but it can make you never insecure the same way twice.** Every piece of security knowledge that enters the project becomes a permanent, executable test in `tests/security/`, run inside `just check` (Pattern 8) — so the gate itself carries the accumulated security memory:

1. **Every finding becomes a regression test for the *class*, not the instance.** A pentest finds one endpoint missing auth → the test that lands iterates *all* routes and asserts authentication, so the next new endpoint is born covered. An XSS in one form → a table-driven escaping test over every render path. Instance-tests protect one door; class-tests protect the pattern.
2. **Specs for sensitive surfaces carry abuse criteria.** Any spec touching auth, payments, uploads, or user input gets negative acceptance criteria — *what must NOT happen* ("expired token never grants access", "response identical for existing and unknown emails") — which become tests like any other criterion (Pattern 7). The Human QA charter's "try to confuse it" probes (Pattern 13) feed the same corpus when they find something.
3. **The mechanical baseline lives in the gate:** dependency audit, secret scanning, and static analysis run in `just check` — known-knowns belong to machines, not to review comments or memory.
4. **The learning is dual-recorded:** the test enforces it; a memory leaf (Pattern 14) or ADR explains it, so future agents understand *why* the test exists and never "simplify" it away. Weakening or deleting anything under `tests/security/` is Tier 3 by definition (Pattern 18): human sign-off, always.

What this deliberately does not claim: coverage of the unknown. Periodic human or external review remains necessary — the corpus is the **ratchet** that makes each review's findings permanent, so every audit strictly grows the floor instead of producing a report that fades.
