---
name: implementing-feature-gates
description: Use when a feature must ship unfinished, be hidden per environment, or change an API that installed clients depend on. Implements environment-matrix feature flags in web/mobile clients and versioned contracts in the backend (Patterns 23–24 of the Harness Engineering Stack). Trigger phrases — "hide this in production", "ship it dark", "gate this feature", "this API change will break old apps".
---

# Implementing Feature Gates

Two mechanisms, chosen by what you control:

| You control the deploy? | Mechanism | Where |
|---|---|---|
| Yes (web, mobile *builds*) | Environment-matrix feature flags | `web/`, `mobile-app/` |
| No (installed clients calling you) | Versioned contracts, append-only | `backend/` |

**Never** put response *shapes* behind flags — contracts must be deterministic per version.

## Part 1 — Client flags (web & mobile, identical shape)

Create `src/config/featureFlags/` with exactly four files:

### `flags.ts` — the single source of truth

```ts
export type FeatureEnvironment = "development" | "staging" | "production";
type FlagMatrix = Record<FeatureEnvironment, boolean>;

/**
 * Single source of truth for feature toggles. Promote a finished feature by
 * flipping its `production` to `true` and shipping. Once permanent, DELETE
 * the flag and its call sites.
 */
export const FEATURE_FLAGS = {
  // exampleFeature: { development: true, staging: true, production: false },
} as const satisfies Record<string, FlagMatrix>;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

/** Unrecognized value → "production": the safe default hides unpromoted work. */
export function normalizeEnvironment(value: string): FeatureEnvironment {
  return value === "development" || value === "staging" || value === "production"
    ? value : "production";
}

/** Inputs are injectable so resolution is unit-testable.
 *  Web (Vite): appEnv = import.meta.env.VITE_APP_ENV, isDev = import.meta.env.DEV
 *  Mobile (Expo/RN): appEnv = env.appEnv, isDev = __DEV__            */
export function resolveEnvironment(appEnv: string | undefined, isDev: boolean): FeatureEnvironment {
  if (appEnv) return normalizeEnvironment(appEnv);
  if (isDev) return "development";
  return "production"; // no env var set → hide flagged features
}

export const currentEnvironment: FeatureEnvironment =
  resolveEnvironment(/* platform inputs here */ undefined, false);

export function isFeatureEnabled(
  key: FeatureFlagKey,
  environment: FeatureEnvironment = currentEnvironment
): boolean {
  return FEATURE_FLAGS[key][environment];
}
```

### `useFeatureFlag.ts` — hook (stable seam for future runtime overrides)

```ts
export function useFeatureFlag(key: FeatureFlagKey): boolean {
  return isFeatureEnabled(key);
}
```

### `FeatureFlag.tsx` — declarative gate

```tsx
export const FeatureFlag = ({ flag, children, fallback = null }: {
  flag: FeatureFlagKey; children: ReactNode; fallback?: ReactNode;
}) => (useFeatureFlag(flag) ? <>{children}</> : <>{fallback}</>);
```

### `index.ts` — barrel export of all of the above

### Rules

1. **`as const satisfies`** — keeps keys literal (exact `FeatureFlagKey`) while enforcing the matrix shape. Do not weaken to a plain `Record`.
2. **Fail-safe is non-negotiable:** missing/unknown env resolves to `production`. A misconfigured build must hide, never leak.
3. **Callers use the hook/component only** — never read `FEATURE_FLAGS` directly outside this module.
4. **State the gating depth in each flag's comment:** "hides menu item (route still resolves)" vs "blocks route". UI-only gating is fine when stated.
5. **Lifecycle:** born `production: false` → promoted by one-line flip (never a revert) → deleted (flag + call sites) once permanent. A fully-promoted flag surviving two releases is flag debt — remove it.
6. **Tests required before done** (Pattern 7): `resolveEnvironment` all branches incl. fail-safe; `normalizeEnvironment` garbage input; one render test proving the gate hides in `production` and shows in `staging`.

## Part 2 — Backend versioned contracts

1. **Additive first.** Optional response fields and new endpoints need no version. Only genuinely breaking changes (removing/renaming fields, changing semantics/status codes) get a new version.
2. **Both versions live.** New version ships alongside the old; the old keeps working byte-for-byte until formal retirement. Pick URL (`/v2/...`) or header versioning once, record in an ADR, never mix.
3. **Contract tests per live version, in the gate.** Freeze each version's contract test suite when the next version ships — v1's tests never change again; they exist to prove v1 didn't.
4. **Maintain `docs/policy/api-versions.md`:** per version — status (`current/deprecated/sunset`), minimum client app version served, planned retirement date. Retiring a version is a human sign-off decision (Tier 3), backed by telemetry showing the version idle.
5. **Dark launch pairing:** ship additive v-next endpoints deployed dark, put the client UI behind a flag (Part 1), promote by flipping the flag. Rollback = flip back — no deploy.

## Done checklist

- [ ] Flag module exists in each client app, identical shape
- [ ] Fail-safe unit tests pass (`just check` includes them)
- [ ] Every flag comment states gating depth + owning spec (S-NNN)
- [ ] No raw env checks (`__DEV__`, `import.meta.env.DEV`) gating features outside the flags module
- [ ] Breaking API change? New version + frozen contract tests for the old + support matrix updated
- [ ] ADR recorded for the versioning scheme (first time only)
