---
pattern: 26
title: Assisted Apprenticeship
slug: assisted-apprenticeship
layer: 13
related: [3, 8, 18]
---

Adopt this layer the day the team includes anyone who is still becoming an engineer. It exists because of an uncomfortable arithmetic: seniors are not an eternal resource — any accident, resignation, or burnout removes one, and the only machine that has ever produced new seniors is juniors doing real work. A team that lets AI absorb all junior-shaped work has quietly unplugged that machine.

### Pattern 26: Assisted Apprenticeship

**The remark, stated first because everything else serves it:**

> **AI-assisted onboarding. Not AI-replaced apprenticeship.**

**Context:** The stack makes assistants brutally good at exactly the work juniors used to learn on — boilerplate, small fixes, chasing dumb bugs. A fresh graduate joins a team where all of that "just happens."

**Problem:** Three failures compound. *The competence illusion:* if the AI does the work and the junior watches, the junior ships senior-looking output while forming no judgment — productivity without formation. *The verification paradox:* the junior's role collapses into "check the AI's output," but verification is precisely the skill they haven't built — the population least able to distinguish confident-wrong from right, paired with the tool most confidently wrong. *The pipeline debt:* no juniors formed today means no seniors available in ten years — and every existing senior is a bus-factor risk in the meantime. This debt has a decade-long fuse and no refinancing.

**Therefore:** The AI onboards as a **tutor, never a doer** — an explicit mode, declared per session, that inverts the normal roles:

1. **The apprentice generates; the AI explains, questions, and reviews.** "Walk me through this module, then I implement and you critique" — the exact opposite of delegation. Generating is what builds the muscle; the assistant's patience and zero-judgment answers remove the fear tax on asking, which is its genuine superpower here.
2. **The harness is the curriculum.** Constitution → sitemap → ADRs → specs is a reading path that teaches the project the same way it briefs an agent. First real task: *write a spec* (Pattern 3) and defend it in review — intent before code, for humans too.
3. **Deliberate no-AI reps.** Some tickets are flown by hand — debugging especially. An engineer who has never been lost in a codebase for an afternoon has never learned to navigate one.
4. **Autonomy graduates like the tier policy, inverted** (Pattern 18): the apprentice first *does* low-risk work personally — the gate (Pattern 8) makes this safe earlier than any pre-AI team could allow — and only later earns the right to *supervise* AI output, once their calibration is demonstrated, not assumed.
5. **A human mentor is retained for what no model transfers:** taste, tradeoffs, belonging, career. The AI absorbs the "what does this error mean" load precisely so the mentor's scarce hours go where only humans work.

**The rule for agents, verbatim in the constitution:** *when a session is declared an apprentice session, do not write the implementation — explain, question, review, and let the human generate. Doing their work for them is not help; it is the removal of their formation.*
