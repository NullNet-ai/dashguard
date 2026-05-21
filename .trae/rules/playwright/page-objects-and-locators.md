---
alwaysApply: false
globs:
  - "playwright.config.{ts,js,mts,mjs}"
  - "tests/e2e/**/*.{ts,tsx,js,jsx}"
  - "**/*.{spec,test}.{ts,tsx,js,jsx}"
---

> Synced from `.claude/rules/playwright/page-objects-and-locators.md` by `pnpm sync:trae`.
> Edit the source under `.claude/` and rerun the sync script instead of editing this file by hand.

# Playwright Page Objects And Locators

## Page Objects

```txt
pages/
├── LoginPage.ts
├── DashboardPage.ts
└── CheckoutPage.ts
```

Page objects should:

- Encapsulate selectors
- Encapsulate reusable UI actions
- Avoid assertions unless the assertion itself is reusable

Good:

```ts
await loginPage.login(email, password)
```

Avoid repeated raw selectors in tests:

```ts
await page.locator('[data-testid="submit-button"]').click()
```

Repeated selectors should move into page objects.

## Locator Priority

1. `getByRole`
2. `getByLabel`
3. `getByTestId`
4. Stable CSS selectors

Good:

```ts
page.getByRole('button', { name: 'Save' })
```

Avoid brittle selectors:

```ts
page.locator('div > div:nth-child(2) > button')
```
