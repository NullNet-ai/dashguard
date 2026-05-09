---
alwaysApply: false
globs:
  - "playwright.config.{ts,js,mts,mjs}"
  - "tests/e2e/**/*.{ts,tsx,js,jsx}"
  - "**/*.{spec,test}.{ts,tsx,js,jsx}"
---

> Synced from `.claude/rules/playwright/test-authoring.md` by `pnpm sync:trae`.
> Edit the source under `.claude/` and rerun the sync script instead of editing this file by hand.

# Playwright Test Authoring

## Test Names

Test names should describe behavior.

Good:

```ts
test('should display validation error for invalid email')
test('should redirect unauthenticated user to login')
```

Bad:

```ts
test('validation test')
test('works properly')
```

## Test Independence

Every test must run independently and must not depend on previous state, execution order, or shared mutable variables.

Bad:

```ts
test('create user', async () => {
  createdUserId = '123'
})

test('delete user', async () => {
  await deleteUser(createdUserId)
})
```

Good:

```ts
test.beforeEach(async ({ page }) => {
  await createFreshUser()
})
```

## Hooks

Use hooks for shared setup, cleanup, authentication bootstrap, and reusable navigation.

Avoid hidden business logic, assertions in hooks, and large workflows in hooks.

```ts
test.beforeEach(async ({ page }) => {
  await login(page)
  await page.goto('/dashboard')
})
```

Use `beforeAll` sparingly for expensive initialization, mock server bootstrapping, or read-only seed data.
