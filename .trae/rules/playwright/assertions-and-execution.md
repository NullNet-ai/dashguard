---
alwaysApply: false
globs:
  - "playwright.config.{ts,js,mts,mjs}"
  - "tests/e2e/**/*.{ts,tsx,js,jsx}"
  - "**/*.{spec,test}.{ts,tsx,js,jsx}"
---

> Synced from `.claude/rules/playwright/assertions-and-execution.md` by `pnpm sync:trae`.
> Edit the source under `.claude/` and rerun the sync script instead of editing this file by hand.

# Playwright Assertions And Execution

## Assertions

Prefer web-first assertions.

```ts
await expect(button).toBeVisible()
```

Avoid:

```ts
expect(await button.isVisible()).toBe(true)
```

## Waiting

Never use fixed sleeps.

Avoid:

```ts
await page.waitForTimeout(5000)
```

Prefer:

```ts
await expect(loader).toBeHidden()
await page.waitForURL('**/dashboard')
```

## Network Mocking

Mock external systems such as payment gateways, analytics, unstable APIs, and other third-party systems.

## Test Data

Use deterministic test data.

```ts
const user = createTestUser()
```

## Authentication

Prefer storage state reuse.

```ts
projects: [
  {
    name: 'authenticated',
    use: {
      storageState: 'playwright/.auth/user.json'
    }
  }
]
```
