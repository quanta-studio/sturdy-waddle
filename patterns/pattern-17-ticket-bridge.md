---
pattern: 17
title: Ticket Bridge
slug: ticket-bridge
layer: 8
related: [1, 18]
---

Solo founders can skip this layer entirely. Adopt it when the work arrives through an organization's project-management platform — Jira, GitHub Issues, ClickUp, Monday.com, Redmine, Linear — rather than through your own specs. The rest of the stack does not change; this layer only adds an **intake pipe in** and a **reporting pipe out**.

### Pattern 17: Ticket Bridge

**Context:** The organization already runs on a tracker. Tickets, priorities, and stakeholder conversations live there. Most trackers expose an API — some now ship their own AI agents that integrate with GitHub, GitLab, or self-hosted source control.

**Problem:** Two sources of truth. If agents work directly from tickets, the repo loses its canon (Pattern 1): tickets are written for humans mid-conversation — vague, duplicated, missing acceptance criteria — and ticket edits silently change the target mid-flight. But ignoring the tracker is not an option either; it is where the org watches progress.

**Therefore:** Treat the tracker as an **inbox and a reporting surface — never the canon.** A bridge (scheduled agent session, webhook worker, or the tracker's own AI agent) moves work across the boundary in both directions, and everything between the two pipes is the unchanged Layers 1–7:

```
     tracker (Jira / GitHub Issues / ClickUp / Monday / Redmine)
        │ 1. FETCH      new + updated tickets, via API/MCP, on a schedule
        ▼
     2. NORMALIZE       ticket → draft spec docs/specs/S-NNN.md
                        carrying the external ID: "S-041 (JIRA PROJ-1234)"
        ▼
     3. TRIAGE          severity × risk → automation tier (Pattern 18)
        ▼
     4. EXECUTE         the normal loop: plan → build → verify → PR
        ▼
     5. REPORT BACK     spec link on ticket, status transitions, PR link,
                        evidence attachments, release note on close
```

The rules that keep the canon intact:

- **A ticket never drives work directly.** It is normalized into a spec first — acceptance criteria extracted or drafted, ambiguities listed as questions posted back onto the ticket. The spec is what gets built; the ticket ID rides along in the spec header, branch name, and commit trailer (`fix(api): handle expired token [S-041][PROJ-1234]`), extending the traceability thread end-to-end: *ticket → spec → plan → PR → release → ticket closed*.
- **Ticket edits re-enter through the front door:** the bridge diffs changed tickets against their specs and flags drift for re-triage — it never silently mutates an in-flight spec.
- **Report generously, in the tracker's language.** Status moves, PR links, and evidence land on the ticket automatically. Stakeholders should never need to open the repo to know where things stand — that is the courtesy that buys the repo its canonicity.
- Vendor AI agents (e.g. a tracker's built-in assistant) slot in as *bridge implementations* — they may fetch and report, but execution happens in the repo, under the repo's gates.
