---
pattern: 22
title: Paired Device Repro
slug: paired-device-repro
layer: 10
related: [7, 14, 19]
---

Adopt this layer when the stack includes `mobile-app/` or anything else that runs on hardware the agent cannot touch.

### Pattern 22: Paired Device Repro

**Context:** A bug only manifests on a physical device — it needs real auth state, real network, native-bridge timing, or live UI interaction. Neither the assistant nor the human knows how to reproduce it yet. The assistant can read a thousand-line log in milliseconds but cannot tap a screen; the human can drive the device with their hands but cannot grep a 5 MB log dump.

**Problem:** The default failure mode is the **guess-fix loop**: the human describes symptoms in prose (lossy), the agent guesses a fix from the description, someone rebuilds, "try now?", repeat. Hours vanish, no evidence is captured, and role reversal makes it worse in both directions — asking the human to dig through logs, or the agent pretending it can drive the screen.

**Therefore:** Split the roles by comparative advantage and hold the split: **the agent owns the entire diagnostic loop (instrumentation, builds, log tailing, grepping, diagnosis); the human owns exactly one thing — hands on the device.** The loop:

```
1. INSTRUMENT   agent adds tagged log lines at EVERY checkpoint along the
                suspect data path (serialize payloads fully — one line each)
2. ARM          agent builds, installs, launches; resets the log buffer;
                tails it filtered + line-buffered into a file
3. DRIVE        agent gives the human an exact script — "open record X →
                tap edit → type 'Fs' in Block → save. Tell me when done."
                Never "can you reproduce the bug?"
4. READ BACK    agent greps the tagged checkpoints in time order; the first
                checkpoint where the value diverges is the defect site
5. FIX & PROVE  fix, rebuild, re-arm, same script — verified by the specific
                log line showing the correct value, never by "did it work?"
```

The disciplines that keep the loop tight:

- **Instrument checkpoints, not guesses.** One tagged line at every hop of the data path turns "somewhere between the form and the API" into "between checkpoint 3 and 4." Reset the buffer between attempts so runs never conflate; tail into a file so history survives to be re-grepped.
- **Only ever change one variable per iteration** — a repro hunt is the scientific method with a phone in it.
- **Precondition:** if the bug reproduces in a unit test, simulator, or with mocked data — fix it there instead; this pattern is for bugs that genuinely require the device.
- **Harvest before cleanup:** once pinned, the repro becomes a test where drivable (Pattern 7), the captured log lands in the evidence pack (Pattern 19), the lesson becomes a memory leaf (Pattern 14) — and the temporary instrumentation is removed (or promoted deliberately to permanent structured logging), so diagnostic noise never leaks into production.
- Where the harness supports reusable skills, encode this whole protocol as one (e.g. a Claude Code skill), so every future device bug starts at step 1 instead of at the guess-fix loop.

The anti-pattern, verbatim from the field: *"I think the fix is in foo.ts — can you test it?"* — no rebuild, no instrumentation, no logs. That is asking the human to do the agent's job with the least capable instrument available: human memory of what a screen looked like.
