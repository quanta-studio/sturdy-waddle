---
pattern: 23
title: Environment-Matrix Feature Flags *(web & mobile)*
slug: environment-matrix-feature-flags-web-mobile
layer: 11
related: [9, 10]
---

Trunk-based development (Pattern 9) means unfinished work merges continuously. This layer is how that stays safe on every platform — and its full implementation recipe ships in this template as a portable skill: **`skills/implementing-feature-gates/SKILL.md`**, written so any AI assistant can apply it to a real codebase.

### Pattern 23: Environment-Matrix Feature Flags *(web & mobile)*

**Context:** Features land in `main` half-finished (Pattern 9 forbids long branches), yet every merge must be shippable (Pattern 10's green-main rule). `web/` and `mobile-app/` builds go to staging and production carrying work that is not ready to be seen.

**Problem:** The naive options all fail. Long-lived feature branches delay integration — the thing trunk-based development exists to prevent. Deleting unfinished UI before release means a git revert to bring it back. And scattering ad-hoc `if (import.meta.env.DEV)` checks across components makes the release state of the product unauditable — nobody can answer "what exactly is hidden in production right now?"

**Therefore:** One typed **flag matrix** per client app is the single source of truth — every flag, every environment, one file, reviewable in one glance:

```ts
// web/src/config/featureFlags/flags.ts   (identical shape in mobile-app/)
export const FEATURE_FLAGS = {
  crossSellingCatalogue: { development: true, staging: true, production: false },
  merchantPpoints:       { development: true, staging: true, production: false },
} as const satisfies Record<string, FlagMatrix>;   // keys stay literal, shape enforced
```

The rules that make it strengthen rather than decorate:

- **Fail-safe resolution.** An unrecognized or missing environment resolves to `production` — the strictest column — so a misconfigured build *hides* unpromoted features instead of leaking them. The safe state requires zero configuration.
- **Pure, injectable resolvers.** `resolveEnvironment()` and `isFeatureEnabled(key, env)` take their inputs as parameters with real defaults — so the resolution logic itself is unit-tested, including the fail-safe.
- **A thin consumption seam:** a `useFeatureFlag(key)` hook and a declarative `<FeatureFlag flag=... fallback=...>` gate. Callers never touch the matrix directly — which keeps one seam where runtime/remote overrides can be added later without touching call sites.
- **The same shape in `web/` and `mobile-app/`** — cross-repo familiarity means any agent or human who learned the pattern once can work in either module.
- **Lifecycle, enforced in review:** a flag is born `production: false` → **promoted by flipping one line** (a config change, never a git revert) → **deleted, with its call-site tags, once the feature is permanent.** A flag that survives two releases after full promotion is flag debt — the sitemap-style freshness rule applies.
- **Be honest about depth:** a flag that hides a menu item does not block the route. Say which one each flag does in its comment; UI-only gating is fine when stated, dangerous when assumed.
