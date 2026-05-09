---
alwaysApply: false
globs:
  - "playwright.config.{ts,js,mts,mjs}"
  - "tests/e2e/**/*.{ts,tsx,js,jsx}"
  - "**/*.{spec,test}.{ts,tsx,js,jsx}"
---

> Synced from `.claude/rules/playwright/parallelism-and-decisions.md` by `pnpm sync:trae`.
> Edit the source under `.claude/` and rerun the sync script instead of editing this file by hand.

# Playwright Parallelism And Decisions

## Parallelism

Tests must support parallel execution.

Avoid:

- Shared accounts
- Shared mutable database state
- Static resource names

Good:

```ts
test.describe.configure({ mode: 'parallel' })
```

Only enable parallel mode when tests are fully isolated.

## Retries

Retries are not a fix for flaky tests.

If retries are needed:

- Investigate the root cause
- Improve the waiting strategy
- Improve selectors
- Improve test isolation

## Tags And Variants

Use tags consistently.

```ts
test('@smoke should login successfully', async () => {})
```

Useful tags:

- `@smoke`
- `@regression`
- `@critical`
- `@mobile`
- `@api`

Group mobile and browser variants logically and avoid duplicating identical tests unnecessarily.

## Anti-Patterns

- Avoid giant E2E tests that chain too many workflows together
- Prefer API or database setup when possible
- Never share state between tests
- Do not mock the system under test entirely

## Golden Rules

1. Tests must be deterministic
2. Tests must be isolated
3. Tests must be readable
4. Tests must be parallel-safe
5. Tests must fail clearly
6. Avoid hidden setup magic
7. Prefer stable selectors
8. Prefer behavior-focused assertions
9. Prefer small focused tests
10. Flaky tests are bugs
