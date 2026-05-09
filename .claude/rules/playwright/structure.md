# Playwright Structure

## Goals

- Keep tests isolated, readable, and deterministic
- Make failures easy to debug
- Reduce flaky tests
- Ensure test structure scales as the app grows

## File Structure

- One feature, page, or workflow per `*.spec.ts`
- Group related scenarios using `describe`
- Keep tests short and focused
- Avoid giant spec files

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
```

## Use Spec Files For A Single Domain

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

## Create Another Spec File When

- The behavior belongs to a different feature or domain
- The setup lifecycle differs
- The authentication model differs
- The file exceeds about 300 to 500 lines
- The suite requires too many nested `describe` blocks
- CI parallelization would benefit from smaller files

## Describe Blocks

Use `describe` to group the same page, workflow, role, feature state, or API condition.

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

Keep nesting to 2 to 3 levels when possible.
