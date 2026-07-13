# The Harness Engineering Stack

**A pattern language for running a full software development lifecycle with AI assistants — as a solo developer.**

You are one person. Your "engineering team" is you plus one or more AI assistants (Claude, Codex, Cursor, Gemini — the model doesn't matter). The thing that makes this work is not the model. It is the **harness**: the repo conventions, commands, gates, and documents that let any assistant pick up work, verify its own output, and ship — without you re-explaining the project every session.

This README is that harness, written as a pattern language. Each pattern is small, named, and composable. Adopt them in order; each one makes the next one stronger. Any AI assistant pointed at this file can bootstrap a project that follows the same stack.

> **Reference implementation:** [backend-harness-template](https://github.com/quanta-studio/backend-harness-template) — the patterns below, pre-wired for Node/TypeScript backends. Clone it instead of re-deriving them.

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
| Device repro *(add-on)* | What happens when a bug only exists on a physical device? | 22 |
| Code strengthening *(add-on)* | How do unfinished features ship safely, and how do old clients keep working? | 23, 24 |
| Image analysis *(add-on)* | How does an assistant see details instead of the gist? | 25 |
| Onboarding *(add-on)* | How do juniors become seniors when AI does junior-shaped work? | 26 |

---

{{PATTERNS}}

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
- Device-only bugs: paired repro (P22) — you instrument, build, tail,
  and grep; I drive the device. Give me exact tap-by-tap scripts.
  Never ask me to "test the fix" without an armed, instrumented build.
- Unfinished features merge behind environment-matrix flags; breaking
  API changes get a new version, never an in-place change. Follow
  skills/implementing-feature-gates/SKILL.md exactly (P23, P24).
- When image details matter (mockups, screenshots, assets): slice,
  probe pixels, compose — follow skills/analyzing-images-in-detail/
  SKILL.md; never state a color or small text you didn't probe (P25).
- If I declare a session an apprentice session: tutor mode — explain,
  question, review; never write the implementation. AI-assisted
  onboarding, not AI-replaced apprenticeship (P26).
```

---

## Why This Works (the short version)

A solo developer's constraint is not typing speed — assistants removed that. The constraint is **verified attention**: how much shipped change you can actually stand behind. Every pattern here converts something you'd have to remember, repeat, or manually check into something the repo *enforces*: specs externalize intent, plans externalize approach, the verb interface externalizes operation, gates externalize "done", conventional commits externalize history, charters externalize judgment. What's left over — approving specs, reviewing plans, merging PRs, promoting releases, exploratory QA — is the irreducible human core, and it's small enough for one person.

The model in the loop will change. The harness is what compounds.
