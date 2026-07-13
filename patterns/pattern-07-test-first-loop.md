---
pattern: 7
title: Test-First Loop
slug: test-first-loop
layer: 3
related: []
---

### Pattern 7: Test-First Loop

**Context:** The assistant writes code far faster than you can review it.

**Problem:** You cannot personally verify every line. Without an independent check, "looks plausible" is your only quality signal — and plausible-but-wrong is exactly the failure mode of generated code.

**Therefore:** Tests are not optional documentation; they are **the feedback channel that lets the assistant supervise itself**. Work is test-first:

1. Turn the next acceptance criterion into a failing test.
2. Run `just test-fast` — watch it fail (proves the test tests something).
3. Write the minimal code to pass.
4. Run again — green. Refactor. Next criterion.

Keep the pyramid honest: many fast unit tests (the inner loop), some integration tests at module boundaries, few end-to-end tests for critical journeys only. Every acceptance criterion in the spec maps to at least one automated test — that mapping is what "done" means, and it's checkable.

Flaky tests are harness corruption: an assistant that learns "sometimes red is fine" is untrustworthy. Fix or delete them the day they flake; never retry-until-green.
