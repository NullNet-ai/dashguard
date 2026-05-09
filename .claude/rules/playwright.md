# `rule.md` — Playwright Best Practices

````md
# Playwright Testing Rules

## Goals

- Keep tests isolated, readable, and deterministic
- Make failures easy to debug
- Reduce flaky tests
- Ensure test structure scales as the app grows

---

# File Structure

## General Principles

- One feature/page/workflow per `*.spec.ts`
- Group related scenarios using `describe`
- Keep tests short and focused
- Avoid giant spec files

---

# Recommended Folder Structure

```txt
tests/
├── auth/
│   ├── login.spec.ts
│   └── signup.spec.ts
├── dashboard/
│   ├── overview.spec.ts
│   └── analytics.spec.ts
├── settings/
│   └── profile.spec.ts
├── fixtures/
├── pages/
├── utils/
└── setup/
````

---

# Spec File Rules

## Use spec files for a single feature/domain

Good:

```txt
login.spec.ts
checkout.spec.ts
profile-settings.spec.ts
```

Bad:

```txt
all.spec.ts
misc.spec.ts
random-tests.spec.ts
```

---

# Describe Block Rules

## Use `describe` to group:

* Same page
* Same workflow
* Same user role
* Same feature state
* Same API condition

---

# Recommended Hierarchy

```ts
test.describe('Checkout', () => {
  test.describe('Guest User', () => {
    test('should allow adding item to cart', async () => {})
    test('should require login before payment', async () => {})
  })

  test.describe('Authenticated User', () => {
    test('should complete payment', async () => {})
    test('should apply coupon', async () => {})
  })
})
```

---

# When To Create Another Spec File

Create another spec file if:

* Different feature/domain
* Different setup lifecycle
* Different authentication model
* File exceeds ~300–500 lines
* Too many nested describes
* CI parallelization would benefit

---

# Describe Depth

## Recommended

Maximum: 2–3 levels deep

Good:

```ts
test.describe('Dashboard', () => {
  test.describe('Admin', () => {})
})
```

Avoid:

```ts
test.describe('A', () => {
  test.describe('B', () => {
    test.describe('C', () => {
      test.describe('D', () => {})
    })
  })
})
```

Deep nesting becomes difficult to maintain.

---

# Test Naming Rules

## Test names should describe behavior

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

---

# Test Independence

## Every test must run independently

Do NOT depend on:

* Previous test state
* Execution order
* Shared mutable variables

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

---

# Hooks Best Practices

## Use hooks carefully

### Allowed

* Shared setup
* Shared cleanup
* Authentication bootstrap
* Reusable navigation

### Avoid

* Hidden business logic
* Assertions in hooks
* Large workflows in hooks

---

# Hook Guidelines

## beforeEach

Use for:

* login
* page navigation
* test isolation

Example:

```ts
test.beforeEach(async ({ page }) => {
  await login(page)
  await page.goto('/dashboard')
})
```

---

## beforeAll

Use sparingly.

Only for:

* expensive initialization
* mock server bootstrapping
* readonly seed data

Avoid shared mutable state.

---

# Page Object Model (POM)

## Recommended Structure

```txt
pages/
├── LoginPage.ts
├── DashboardPage.ts
└── CheckoutPage.ts
```

---

# POM Rules

## Page objects should:

* Encapsulate selectors
* Encapsulate reusable UI actions
* Avoid assertions unless reusable

Good:

```ts
await loginPage.login(email, password)
```

Avoid:

```ts
await page.locator(
  '[data-testid="submit-button"]'
).click()
```

Repeated selectors should move into page objects.

---

# Locator Best Practices

## Prefer:

1. `getByRole`
2. `getByLabel`
3. `getByTestId`
4. stable CSS selectors

Good:

```ts
page.getByRole('button', { name: 'Save' })
```

Avoid brittle selectors:

```ts
page.locator('div > div:nth-child(2) > button')
```

---

# Assertions

## Prefer web-first assertions

Good:

```ts
await expect(button).toBeVisible()
```

Avoid:

```ts
expect(await button.isVisible()).toBe(true)
```

---

# Waiting Rules

## Never use fixed sleeps

Avoid:

```ts
await page.waitForTimeout(5000)
```

Prefer:

```ts
await expect(loader).toBeHidden()
```

or

```ts
await page.waitForURL('**/dashboard')
```

---

# Network Mocking

## Mock external systems

Use mocks for:

* payment gateways
* analytics
* unstable APIs
* third-party systems

Avoid dependency on external services in CI.

---

# Test Data

## Use deterministic test data

Good:

```ts
const email = `test-${Date.now()}@example.com`
```

Better:

```ts
const user = createTestUser()
```

---

# Authentication

## Prefer storage state reuse

Example:

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

Avoid logging in through UI in every test unless authentication itself is being tested.

---

# Parallelism

## Tests must support parallel execution

Avoid:

* shared accounts
* shared mutable DB state
* static resource names

Good:

```ts
test.describe.configure({ mode: 'parallel' })
```

Only when tests are fully isolated.

---

# Retry Policy

## Retries are not a fix for flaky tests

If retries are needed:

* investigate root cause
* improve waiting strategy
* improve selectors
* improve test isolation

---

# Tags & Annotations

## Use tags consistently

Example:

```ts
test('@smoke should login successfully', async () => {})
```

Useful tags:

* `@smoke`
* `@regression`
* `@critical`
* `@mobile`
* `@api`

---

# Mobile & Browser Variants

Group variants logically:

```ts
test.describe('Mobile Navigation', () => {})
```

Do not duplicate identical tests unnecessarily.

---

# Anti-Patterns

## Avoid

### Giant E2E tests

Bad:

```txt
login → create item → edit item → delete item → logout
```

Prefer smaller focused tests.

---

### Overusing UI setup

Prefer API/database setup when possible.

---

### Shared state between tests

Tests should never depend on order.

---

### Excessive mocking

Do not mock the system under test entirely.

---

# Ideal Test Structure Example

```ts
test.describe('Profile Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/settings/profile')
  })

  test('should update display name', async ({ page }) => {
    await page.getByLabel('Display Name').fill('John Doe')
    await page.getByRole('button', { name: 'Save' }).click()

    await expect(
      page.getByText('Profile updated')
    ).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.getByLabel('Display Name').clear()
    await page.getByRole('button', { name: 'Save' }).click()

    await expect(
      page.getByText('Display name is required')
    ).toBeVisible()
  })
})
```

---

# Decision Guide

## When to use `spec`

Use spec files to separate:

* features
* domains
* workflows
* ownership boundaries

---

## When to use `describe`

Use describe blocks to separate:

* roles
* scenarios
* states
* environments
* subfeatures

---

# Golden Rules

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

```
```
