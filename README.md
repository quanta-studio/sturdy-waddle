# The Harness Engineering Stack

**A pattern language for running a full software development lifecycle with AI assistants — as a solo developer.**

You are one person. Your "engineering team" is you plus one or more AI assistants (Claude, Codex, Cursor, Gemini — the model doesn't matter). The thing that makes this work is not the model. It is the **harness**: the repo conventions, commands, gates, and documents that let any assistant pick up work, verify its own output, and ship — without you re-explaining the project every session.

This README is that harness, written as a pattern language. Each pattern is small, named, and composable. Adopt them in order; each one makes the next one stronger. Any AI assistant pointed at this file can bootstrap a project that follows the same stack.

---

## The Operating Loop

Everything below serves one loop:

```
 ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
 │  PLAN   │───▶│  BUILD  │───▶│ VERIFY  │───▶│  SHIP   │───▶│  LEARN  │
 │ spec +  │    │ TDD on  │    │ gates:  │    │ CI/CD + │    │ human QA│
 │ plan doc│    │ a branch│    │ 1 cmd   │    │ release │    │ + ADRs  │
 └─────────┘    └─────────┘    └─────────┘    └─────────┘    └────┬────┘
      ▲                                                           │
      └───────────────── findings become new specs ───────────────┘
```

And one thread runs through it — **traceability**:

```
spec (docs/specs/S-012.md)
  └─▶ plan (docs/plans/S-012-plan.md)
        └─▶ branch + commits ("feat(auth): ... [S-012]")
              └─▶ PR + CI gate (same command you run locally)
                    └─▶ release notes (generated from commits)
                          └─▶ human QA charter (generated from the spec)
```

If you can walk that chain in both directions for any shipped feature, the harness is working.

---

## Layer Map

| Layer | Question it answers | Patterns |
|---|---|---|
| Source of truth | What is true about this project? | 1, 2, 3, 4 |
| Plan | What are we building next, exactly? | 5 |
| Build & verify | How does the assistant know it's done? | 6, 7, 8 |
| Integrate | How does work land safely? | 9, 10, 11 |
| Release | How does it reach users? | 12 |
| Human QA | What can only a human judge? | 13 |
| Memory & orientation | What persists between sessions, where does everything live, and who is working on what right now? | 14, 15, 16 |
| Corporate *(optional add-on)* | How does work flow in from the org's tracker, and how much autonomy does each ticket get? | 17, 18, 19 |
| Security & privacy *(add-on)* | How does security knowledge become permanent, and what must never leave your control? | 20, 21 |

---

## Layer 1 — Source of Truth

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

---

### Pattern 2: Agent Constitution

**Context:** Every assistant needs the same briefing: what this project is, how to run it, what the rules are.

**Problem:** Re-explaining conventions each session wastes context and produces drift — each assistant invents its own style.

**Therefore:** Keep one canonical instruction file, `AGENTS.md`, at the repo root, and symlink the vendor-specific names to it so every tool reads the same constitution:

```bash
ln -s AGENTS.md CLAUDE.md      # Claude Code
ln -s AGENTS.md GEMINI.md      # Gemini CLI
# Cursor, Codex, and most tools read AGENTS.md natively
```

The constitution stays short (one screen) and contains only what the assistant can't derive from code:

- One-line project purpose and the module map (`backend/`, `web/`, `mobile-app/`, `webservices/`)
- The command interface (Pattern 6) — how to test, lint, run
- The Definition of Done (Pattern 8)
- Workflow rules: spec before code, TDD, branch + PR, commit format
- Pointers into `docs/` — not copies of its content

Sub-directories get their own `AGENTS.md` only for rules truly local to them (e.g. `web/AGENTS.md` names the component conventions; `mobile-app/AGENTS.md` names the navigation and platform rules).

---

### Pattern 3: Spec Before Code

**Context:** You have an idea. The assistant is eager to write code immediately.

**Problem:** Code written from a vague prompt encodes the assistant's assumptions, not your intent. You discover the mismatch after the code exists, when it's expensive.

**Therefore:** No feature work starts without a spec file: `docs/specs/S-NNN-short-name.md`. A spec is short — half a page is fine — but always contains:

```markdown
# S-012: Password reset via email

## Why
Users locked out of accounts churn. Support email is 40% reset requests.

## What
- User requests reset with email address; always respond "email sent" (no account enumeration)
- Token valid 30 minutes, single use
- Out of scope: SMS reset, admin-initiated reset

## Acceptance criteria          <- testable, numbered
1. Valid token + new password → login works with new password
2. Expired token → clear error, no password change
3. Token reused → rejected

## Human QA notes               <- feeds Pattern 13
- Reset email renders correctly in Gmail dark mode
```

Write specs *with* the assistant — it drafts, asks clarifying questions, you decide. The conversation is the design review; the file is what survives it. Statuses: `draft → approved → shipped`. Only you move a spec to `approved`.

---

### Pattern 4: Decision Records

**Context:** You chose Postgres over Mongo, sessions over JWTs, a monorepo over three repos.

**Problem:** Six months later, an assistant (or you) "helpfully" reverses a settled decision because the reasoning lived only in a chat that's gone.

**Therefore:** Every significant, hard-to-reverse choice gets a one-page ADR in `docs/decisions/ADR-NNN-title.md`: context, decision, consequences, alternatives rejected. Assistants must read relevant ADRs before proposing architecture changes, and must propose a *new* ADR (for your approval) to supersede an old one — never silently contradict it.

---

## Layer 2 — Plan

### Pattern 5: Plan as Reviewable Artifact

**Context:** A spec is approved. The work spans multiple files, maybe multiple sessions.

**Problem:** If the plan lives only in the assistant's context window, it dies with the session, and you can't review the approach before the diff exists.

**Therefore:** For any spec bigger than an hour's work, the assistant writes `docs/plans/S-NNN-plan.md` before touching code: ordered tasks, each small enough to complete and verify in one sitting, each naming the files it touches and the test that proves it.

```markdown
# Plan: S-012 password reset

- [ ] 1. Token model + expiry logic — backend/auth/tokens.py — test: token_test.py
- [ ] 2. Request-reset endpoint (always 200) — backend/api/reset.py — test: api/reset_test.py
- [ ] 3. Confirm-reset endpoint — backend/api/reset.py — test: acceptance criteria 1–3
- [ ] 4. Email template + send — webservices/mailer/ — test: snapshot test
- [ ] 5. Web forms — web/src/reset/ — test: e2e happy path
- [ ] 6. Mobile deep link + form — mobile-app/src/reset/ — test: e2e happy path
```

You review the plan (cheap), not just the diff (expensive). The assistant checks boxes as it goes — so a fresh session can read the plan and resume exactly where the last one stopped. Review the plan *before* code exists; that is the highest-leverage review you will do.

---

## Layer 3 — Build & Verify

### Pattern 6: One-Command Interface

**Context:** Three modules, three languages, three toolchains. Assistants, CI, and you all need to run the same checks.

**Problem:** If testing the backend requires remembering `cd backend && poetry run pytest -x --cov`, every runner (human, assistant, CI) encodes its own variant, and they drift. The assistant burns context rediscovering commands; CI silently checks something different from what the assistant checked.

**Therefore:** A single task runner file at the repo root defines the entire verb set. Default: [`just`](https://github.com/casey/just) (a `Makefile` works too). Every verb works from a fresh clone.

```just
setup      # install all deps, all modules
dev        # run everything locally
test       # all tests, all modules
test-fast  # unit tests only — the TDD inner loop, must finish in seconds
lint       # format check + lint + typecheck, all modules
check      # THE GATE: lint + test + build (Pattern 8)
build      # production artifacts
release    # cut a release (Pattern 12)
```

The rule that makes this a pattern and not a convenience: **no workflow instruction anywhere — AGENTS.md, CI config, this README — may contain a raw toolchain command. Only verbs.** CI calls `just check`. The constitution says "run `just check`". When the toolchain changes, one file changes.

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

---

### Pattern 8: Verification Gate

**Context:** The assistant says "done!". Assistants are optimistic.

**Problem:** "Done" claimed without evidence trains you to re-check everything, which destroys the leverage of delegating in the first place.

**Therefore:** One command — `just check` — is the project's Definition of Done, and it is the *same* set of checks locally and in CI:

```
just check  =  format check + lint + typecheck + all tests + production build
```

The constitution states the contract: **no task is complete, no commit is made, until `just check` passes — and the assistant reports the actual output, not a summary of its confidence.** Anything that can be checked mechanically (formatting, types, coverage floors, dependency audit) goes into the gate rather than into review comments. Review your own attention as the scarcest resource in the system; spend it only where machines can't.

---

## Layer 4 — Integrate

### Pattern 9: Small PRs on Trunk

**Context:** Solo repo. It's tempting to let the assistant commit straight to `main` — who's going to object?

**Problem:** Direct-to-main removes the only checkpoint where you see the whole change before it's history. And giant branches make review humanly impossible, so review silently stops happening.

**Therefore:** Trunk-based development with short-lived branches — even solo:

- One plan task (or a few related ones) per branch: `s012/reset-endpoints`
- **Conventional commits**, always, because the release pipeline reads them: `feat(auth): add reset token model [S-012]`, `fix(web): ...`, `fix(mobile): ...`. The `[S-NNN]` trailer is the traceability thread.
- PR into `main`; the PR description links the spec and plan
- Merge requires: CI green (Pattern 11) + your approval. You are the reviewer; an assistant may *also* review (fresh session, no shared context with the author session — an effective and cheap second opinion), but a human merge decision is the last line of defense.
- Branches live hours-to-days, never weeks. If a plan task produces a >500-line diff, the plan step was too big — split it.

---

### Pattern 10: One Worktree per Agent

**Context:** Your "team" is several assistant sessions running at once — one building S-012 in the backend, another fixing a bug in `web/`, a third upgrading `mobile-app/` dependencies. They all target the same repo.

**Problem:** A git checkout has exactly one working directory and one checked-out branch. Two agents in the same directory stomp each other's uncommitted files, switch branches under each other mid-task, and run `just check` against a mixture of both changes — so a green gate proves nothing.

**Therefore:** Every agent works in its own **git worktree** — a separate directory with its own checked-out branch, sharing the same underlying repository. One worktree = one branch = one plan task:

```bash
# dispatch two agents in parallel, fully isolated:
git worktree add .worktrees/s012-reset-endpoints -b s012/reset-endpoints
git worktree add .worktrees/s014-filters        -b s014/dashboard-filters

# after each PR merges:
git worktree remove .worktrees/s012-reset-endpoints
git worktree list    # audit what's still in flight — on THIS machine only;
                     # cross-device awareness is the Session Ledger (Pattern 15)
```

Rules that keep it safe:

- `.worktrees/` is gitignored; each worktree runs `just setup` on creation (dependencies are per-worktree, not shared).
- The **root checkout stays on `main` and stays clean** — it is your review station, never an agent's workspace.
- The gate is per-worktree: an agent runs `just check` inside its own worktree, so green means *this branch* passes in isolation.
- Coordination happens at plan level, not merge level: assign agents plan tasks (Pattern 5) that touch disjoint files/modules. Small PRs (Pattern 9) keep the rare collision cheap to resolve; the second branch to merge rebases onto `main` and re-runs the gate.
- Many harnesses do this natively (Claude Code's worktree isolation, Codex environments) — when yours does, use it; the pattern is the same, the bookkeeping is automated.

---

### Pattern 11: CI Mirrors Local

**Context:** You need an arbiter that isn't the assistant grading its own homework.

**Problem:** CI pipelines that grow their own bespoke logic drift from local checks, producing "passes locally, fails in CI" mysteries that burn your day and the assistant's context.

**Therefore:** CI is deliberately boring — a clean machine that runs the same verbs you and the assistant run:

```yaml
# .github/workflows/ci.yml  (GitHub Actions; any runner works)
on: [pull_request, push: {branches: [main]}]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: just setup
      - run: just check        # the gate, verbatim (Pattern 8)
```

Per-module path filters keep it fast in a monorepo (only test `backend/` when `backend/` changed), but the *logic* stays in the justfile, not YAML. `main` must always be releasable: a red `main` is a stop-the-line event — the constitution instructs assistants to treat fixing it as the top-priority task in any session that finds it red.

---

## Layer 5 — Release

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

---

## Layer 6 — Human QA

### Pattern 13: Human QA Charter

**Context:** `just check` is green, staging is deployed. Automation has verified everything automation can verify.

**Problem:** Two failure classes are invisible to your test suite: (a) the software correctly does something that turns out to be wrong or ugly for a real person, and (b) breakage in the gaps between tested paths. Solo founders skip manual QA because it's unstructured — "click around a bit" — and unstructured checking finds nothing.

**Therefore:** For each release, the assistant generates a **QA charter** at `docs/qa/v1.4.0-charter.md` from the shipped specs — and it deliberately *excludes* what automation already covers:

```markdown
# QA Charter — v1.4.0 (staging)
Ships: S-012 password reset, S-014 dashboard filters      ~15 minutes

## Scripted checks (from spec "Human QA notes")
- [ ] Reset email renders correctly in Gmail dark mode
- [ ] Reset flow on a real phone: keyboard, autofill, tap targets
- [ ] Error message when token expires reads as helpful, not alarming

## Exploratory charters (timeboxed ~5 min each)
- [ ] Try to confuse the reset flow: double-submit, back button mid-flow,
      two tabs, paste garbage tokens. Log anything surprising.
- [ ] First-impression pass on dashboard filters: is the empty state clear?

## Findings
| # | What happened | Spec violated? | → action |
|---|---------------|----------------|----------|
| 1 | ...           | S-012 / none   | fix now / new spec / ignore |
```

Human QA tests *judgment*: tone, feel, confusion, trust — the things with no assertion syntax. Findings close the loop: each one becomes a fix (before promoting), a new spec (backlog), or an explicit "accepted" note. The charter is committed with the release, so you can always answer "was this checked by a human?"

---

## Layer 7 — Memory & Orientation

### Pattern 14: Memory Index and Leaves

**Context:** Across sessions, assistants learn things that belong to no spec or ADR: "the payments sandbox rate-limits at 10 req/s", "e2e tests need `TZ=UTC` on macOS", "the client prefers British spelling". You work from several devices, so this knowledge must travel with the repo.

**Problem:** A single growing `MEMORY.md` fails in both directions. If every fact lands in one file, it bloats until loading it burns the context window and assistants skim past what matters. If facts stay in chat history instead, they're lost to the next session and invisible on your other machine.

**Therefore:** Structure durable memory as an **index plus leaves** (hub-and-spoke — the same shape a Zettelkasten calls a Map of Content):

- **`MEMORY.md` at the repo root is a pure index** — one line per memory: a link and a hook for deciding relevance. Never content. It stays small enough to load every session, forever.
- **Leaves are small files, one topic each**, in `docs/memory/`. A leaf states the fact, why it's true, and how to apply it.
- **Each module owns its leaves**: `backend/docs/memory/` holds backend-only facts, indexed by a `backend/MEMORY.md` that the root index points to. An agent working in `web/` never pays the token cost of backend trivia.

```
MEMORY.md                      # root index: one line per entry, links only
docs/memory/
  client-tone-preferences.md   # cross-cutting leaves
  release-day-checklist-gotchas.md
backend/MEMORY.md              # module index
backend/docs/memory/
  payments-sandbox-rate-limit.md
```

The read protocol is progressive disclosure: **always load the index; open only the leaves relevant to the task.** The write protocol keeps it honest: before adding a leaf, check whether one already covers it — update rather than duplicate; delete leaves proven wrong; convert relative dates ("last week") to absolute ones.

Boundary discipline is what prevents the burst: memory holds only *learned facts not derivable from the repo*. Rules you set live in the constitution (Pattern 2); decisions live in ADRs (Pattern 4); requirements live in specs (Pattern 3). When a memory hardens into a rule ("always run migrations before seeding"), promote it — move it into `AGENTS.md` or an ADR and delete the leaf.

---

### Pattern 15: Session Ledger

**Context:** Several agent sessions run in parallel — and not just on one machine: a cloud agent, your desktop, your laptop, all sharing the repo through git.

**Problem:** Worktrees (Pattern 10) isolate *file state*, but they don't broadcast *intent*, and they're invisible across devices. Two agents on different machines can independently pick up the same task, and git only reveals the collision at push time — after both have done the work.

**Therefore:** A committed **session ledger** at `docs/sessions/LEDGER.md` records who is working on what, right now:

```markdown
# Session Ledger — active work

| Started (UTC)    | Agent / device        | Task            | Branch                | Last update      |
|------------------|-----------------------|-----------------|-----------------------|------------------|
| 2026-07-05 09:10 | claude @ macbook      | S-012 tasks 1–3 | s012/reset-endpoints  | 2026-07-05 10:40 |
| 2026-07-05 09:45 | codex @ cloud         | S-014 task 1    | s014/dashboard-filters| 2026-07-05 09:45 |
```

The protocol:

1. **Before claiming work:** `git pull`, read the ledger. If the task (or files it touches) is claimed and fresh, pick something disjoint.
2. **Claim by writing:** add your row and push immediately. Ledger edits are the one sanctioned exception to "never commit to main" (Pattern 9) — they are docs-only, single-row, and their entire value is being visible *before* your PR exists.
3. **Update as you go:** bump `Last update` at natural checkpoints; leave a one-line handoff note in the plan doc (Pattern 5) if you stop mid-task.
4. **Release on merge:** delete your row in the same push that follows your PR merging.
5. **Stale claims expire:** a row untouched past a threshold (say 24–48h) may be taken over — note the takeover in the ledger so the trail survives.

Division of labor between the three tracking artifacts: the **plan** (Pattern 5) records what is *done*, the **ledger** records what is *in flight and by whom*, and **worktrees** (Pattern 10) keep in-flight work *physically separated*. Together they let any number of agents on any number of devices coordinate through nothing but git — no extra service, no message bus, fully inspectable.

---

### Pattern 16: Annotated Sitemap

**Context:** The repo has grown past what fits in one glance. An assistant starting a task must first answer "where does this live?" — and every assistant answers it from scratch, every session.

**Problem:** Undirected discovery — recursive listings, chains of greps, opening file after file — burns tokens before any productive work starts. Worse, an agent that scans *partially* builds a wrong mental model and edits the wrong layer. But the naive fix fails too: a hand-written, file-level map rots within weeks, and a stale map is worse than no map, because agents trust it and confidently look in the wrong place.

**Therefore:** Keep a `SITEMAP.md` at the repo root — **directory-level, purpose-annotated, and updated in the same PR as any structural change.** It is the index-and-leaves idea (Pattern 14) applied to code: structure lives in the map; content stays discoverable by search.

```markdown
# SITEMAP

backend/            FastAPI service — all business logic lives here, never in webservices
  auth/             sessions, tokens, password reset      → touch for: login, S-012
  api/              HTTP routes only — thin, no logic     → logic goes in domain/
  domain/           core business rules, pure functions   → most feature work lands here
  migrations/       alembic; append-only, never edit old files
web/                React SPA — browser experience
  src/components/   shared UI primitives — check here BEFORE creating a new component
  src/features/     one folder per user-facing feature, owns its own state
mobile-app/         React Native (Expo) — iOS/Android; consumes the same backend API as web/
webservices/        third-party integrations (mailer, payments) — isolated so they're mockable
docs/               specs, plans, decisions, qa, memory — see MEMORY.md and Pattern 1
```

The rules that keep it useful:

- **Directories, not files.** Files churn daily; directory purposes are stable for months. File-level detail is what `grep` and `glob` are for — the map answers *where and why*, search answers *what exactly*.
- **Every line carries intent**, not just a name: what belongs here, what must not, and "touch this when…" hints. A bare `tree` output is not a sitemap — the annotations are the entire value.
- **Freshness is gated, not hoped for:** any PR that adds, moves, or removes a directory updates `SITEMAP.md` in the same PR — put it in the constitution, and optionally in CI (compare `tree -d` against the map's entries).
- **Scale by zooming, not growing:** keep it one screen per module; if a module needs more depth, it gets its own `backend/SITEMAP.md` and the root map links to it.

Read protocol for agents, stated in the constitution: **consult the sitemap before searching; search before scanning; never scan.** The zoom sequence is constitution (5-line module map, Pattern 2) → `SITEMAP.md` (directory purposes) → targeted search (exact symbols).

---

## Layer 8 — Corporate Integration *(optional add-on)*

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

---

### Pattern 19: Evidence Pack

**Context:** Tiers 2 and 3 stand on evidence — and even solo, before merging anything risky, you want more than the assistant's word. (This pattern lives in the corporate layer but pays for itself anywhere.)

**Problem:** Agent-authored narratives are where hallucination lives. "I ran the tests and they pass" costs nothing to generate and reads identically whether it is true or not. A human who cannot tell verified claims from confident prose ends up re-checking everything — which is the cost the automation was supposed to remove.

**Therefore:** Evidence is **artifacts the machine produced, never claims the agent wrote.** Every sentence of narrative replaced by a captured artifact is a hallucination opportunity removed. Six rules:

1. **Fail→pass→revert is the centerpiece.** Capture the failing test output *before* the fix, the same test passing *after* — both verbatim. Then the cheap third leg: revert the fix, confirm the test fails again, restore. That closes the "test passes because it tests nothing" hole.
2. **Tooling assembles the pack; the agent only annotates.** A `just evidence S-NNN` verb mechanically collects: diff stat, before/after test output, coverage delta, gate results, UI screenshots or traces, log excerpts, and environment capture (commit SHA, versions, seeds). Generated by execution, not generation.
3. **Structure it as a claims manifest:** one row per acceptance criterion — *claim → command → artifact → verdict*. Re-derivable (anyone can re-run the command and get the same artifact) and gap-revealing (an unverified criterion is a visible empty cell, not an unknown unknown).
4. **Ground every code claim in a fresh read.** No facts about the codebase from memory: every claim carries a `file:line` citation or a command run in this session.
5. **The judge falsifies, not confirms.** The independent judge session receives the artifacts and the spec — not the author's narrative — with an adversarial rubric and a minimum quota of falsification probes (edge inputs, concurrency, the revert check). Where feasible, use a different model than the author: two instances of one model share blind spots; the judge's value is decorrelated error.
6. **Calibrate, don't reassure.** Every claim gets a verdict from a closed taxonomy — **CONFIRMED** (artifact-backed) or **PLAUSIBLE** (reasoned, not executed) — and the pack ends with a mandatory **"Not verified"** list: assumptions, paths not exercised, environments not tested. Counterintuitively, this is the confidence *builder*: sign-off becomes a decision about named residual risk, and the recurring "Not verified" items tell you what to automate into the gate next.

```markdown
# Evidence — S-041 (PROJ-1234)                 sha: ac61bbe · 2026-07-05
| Criterion             | Claim        | Command           | Artifact            | Verdict   |
|------------------------|-------------|-------------------|---------------------|-----------|
| 1. expired → rejected  | test added  | just test-fast    | red.txt → green.txt | CONFIRMED |
| 1. (revert check)      | test bites  | git stash + test  | revert-red.txt      | CONFIRMED |
| 2. no enumeration      | 200 always  | curl script       | responses.json      | CONFIRMED |
| 3. email renders       | —           | —                 | screenshot.png      | PLAUSIBLE — not tested in Gmail dark mode |

## Not verified: concurrent reset requests; Outlook rendering.
## Judge (independent session; 4 falsification probes, 0 breaks): APPROVE
```

A dense CONFIRMED column and a short, tolerable "Not verified" list *is* the sign-off interface — for a Tier 3 approver, and equally for future-you.

---

## Layer 9 — Security & Privacy *(add-on)*

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

---

## Default Toolchain (swap freely — the patterns don't change)

| Concern | Default | Swaps |
|---|---|---|
| Task runner (P6) | `just` | `make`, npm scripts, `task` |
| VCS + hosting | git + GitHub | GitLab, Codeberg |
| CI (P11) | GitHub Actions | GitLab CI, Buildkite |
| Backend tests | `pytest` / `vitest` (per language) | anything fast + deterministic |
| E2E tests | Playwright | Cypress |
| Versioning (P12) | semantic-release | changesets, release-please |
| Deploy targets | Fly.io / Vercel / Cloud Run | anything with per-tag deploys + rollback |
| Tracker bridge (P17, optional) | GitHub Issues / Jira via API or MCP | ClickUp, Monday.com, Redmine, Linear, vendor AI agents |
| Security baseline (P20) | gitleaks + `npm audit`/`pip-audit` + semgrep | trufflehog, Snyk, CodeQL, Dependabot |
| AI assistant | any | Claude Code, Codex, Cursor, Gemini — the harness is the constant |

---

## Kickstart Prompt

Paste this into any AI assistant, in a fresh repo (or this one):

```
Read README.md — it defines the Harness Engineering Stack, a pattern
language we follow exactly. Bootstrap it:

1. Create AGENTS.md (Pattern 2): project purpose, module map, the verb
   interface, Definition of Done, workflow rules. Symlink CLAUDE.md → AGENTS.md.
2. Create docs/specs/, docs/plans/, docs/decisions/, docs/qa/ with a
   template file in each (Patterns 1, 3, 4, 5, 13).
3. Create a justfile with: setup, dev, test, test-fast, lint, check,
   build, release (Pattern 6). Stub verbs for modules that don't exist yet.
4. Create .github/workflows/ci.yml that runs `just setup && just check`
   on PRs and main (Pattern 11). Add .worktrees/ to .gitignore (Pattern 10).
5. Create MEMORY.md as an empty index + docs/memory/ for leaves, and a
   per-module MEMORY.md in each module (Pattern 14). Create
   docs/sessions/LEDGER.md with the active-work table (Pattern 15).
6. Create SITEMAP.md: directory-level, one purpose annotation per line
   (Pattern 16). For empty modules, annotate intended purpose.
7. Write docs/decisions/ADR-001 recording the adoption of this stack.
8. OPTIONAL — only if we use a tracker (Jira, GitHub Issues, ClickUp,
   Monday, Redmine): create docs/policy/automation-tiers.md with the
   three-tier table for me to fill in (Pattern 18), a stub spec
   template that carries external ticket IDs (Pattern 17), and an
   evidence-pack template + `evidence` verb in the justfile (Pattern
   19). Do not configure any tracker credentials — I will do that myself.
9. Create tests/security/ wired into `just check`, with secret scanning
   and dependency audit in the gate (Pattern 20). Add the
   confidentiality line and synthetic-data rule to AGENTS.md (Pattern 21).

Then STOP and show me what you created. Do not write feature code —
feature work starts with a spec (Pattern 3), which we write together.

Standing rules for every future session:
- Spec before code; plan doc before multi-step work; TDD always (P3, 5, 7).
- Only justfile verbs, never raw toolchain commands (P6).
- Nothing is "done" until `just check` passes and you show the output (P8).
- Branch + conventional commit with [S-NNN] trailer + PR; never commit to main (P9).
- Work in your own git worktree under .worktrees/; the root checkout on
  main is the human's review station — never touch it (P10).
- Read relevant ADRs before proposing architecture changes (P4).
- Session start: load MEMORY.md and the module index for where you'll
  work; open only relevant leaves (P14). Check the session ledger and
  claim your task before starting; release your row on merge (P15).
- Session end: write new learnings as memory leaves + index lines —
  facts only, never anything already in specs, ADRs, or code (P14).
- Orientation: consult SITEMAP.md before searching, search before
  scanning, never scan. Any PR that changes directory structure
  updates SITEMAP.md in the same PR (P16).
- Security learnings become class-level tests in tests/security/;
  weakening or deleting one requires my sign-off (P20). Never put real
  user data or secrets in specs, tests, fixtures, or evidence (P21).
```

---

## Why This Works (the short version)

A solo developer's constraint is not typing speed — assistants removed that. The constraint is **verified attention**: how much shipped change you can actually stand behind. Every pattern here converts something you'd have to remember, repeat, or manually check into something the repo *enforces*: specs externalize intent, plans externalize approach, the verb interface externalizes operation, gates externalize "done", conventional commits externalize history, charters externalize judgment. What's left over — approving specs, reviewing plans, merging PRs, promoting releases, exploratory QA — is the irreducible human core, and it's small enough for one person.

The model in the loop will change. The harness is what compounds.
