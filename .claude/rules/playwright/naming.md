# Playwright Naming Conventions

## Goals

- Make tests easy to scan
- Make failures easy to understand
- Keep naming consistent across specs, suites, helpers, and page objects
- Prefer names that describe behavior and intent over implementation details

## Spec Files

Use `kebab-case.spec.ts` for Playwright spec files.

Name the file after the feature, page, or workflow it covers.

Good:

```txt
login.spec.ts
checkout-payment.spec.ts
remote-access-side-drawer.spec.ts
```

Bad:

```txt
tests.spec.ts
misc.spec.ts
playwright-test.spec.ts
```

## Describe Blocks

Use stable product-facing labels for the feature, role, workflow, or state under test.

Good:

```ts
test.describe('Checkout', () => {})
test.describe('Remote Access Side Drawer', () => {})
test.describe('Authenticated User', () => {})
```

Bad:

```ts
test.describe('Tests', () => {})
test.describe('Misc', () => {})
test.describe('Flow 1', () => {})
```

Avoid renaming a `describe` block every time the implementation changes. Name the behavior, not the internal steps.

## Test Titles

Use behavior statements for test titles.

Prefer `should ...` because it reads clearly in Playwright reports and matches the existing project style.

Good:

```ts
test('should redirect unauthenticated user to login', async () => {})
test('should display validation error for invalid email', async () => {})
```

Bad:

```ts
test('login test', async () => {})
test('works properly', async () => {})
test('check validation', async () => {})
```

Test titles should describe the expected outcome, not the click sequence.

## Page Objects

Use `PascalCase` for page object classes.

Use the `Page` suffix when the object models a full page, view, or major screen.

Good:

```ts
class LoginPage {}
class DashboardPage {}
class RemoteAccessGridPage {}
```

Bad:

```ts
class loginPage {}
class dashboard {}
class PageObject1 {}
```

If the object models a reusable panel or component instead of a page, use a specific domain noun such as `SideDrawer`, `Modal`, or `Form`.

## Helpers

Use verb-based `camelCase` names for helpers and utilities.

Good:

```ts
async function loginAsAdmin() {}
async function openRemoteAccessDrawer() {}
function buildSessionPayload() {}
```

Bad:

```ts
async function adminLoginHelper() {}
async function drawerThing() {}
function dataBuilder() {}
```

Helper names should reveal the action or value they produce.

## Fixtures And Test Data

Use names that reveal role, scenario, or intent.

Good:

```ts
const adminUser = createUser()
const viewerSession = createSession()
const sessionPayload = buildSessionPayload()
```

Bad:

```ts
const data = createUser()
const result = createSession()
const test1 = buildSessionPayload()
```

Prefer domain nouns such as `adminUser`, `expiredToken`, `sessionRecord`, or `pendingInvite`.

## Locator Variables

Use `camelCase` names that describe the element or user intent.

Good:

```ts
const saveButton = page.getByRole('button', { name: 'Save' })
const statusFilter = page.getByLabel('Status')
const remoteAccessRows = page.getByTestId('remote-access-row')
```

Bad:

```ts
const button1 = page.getByRole('button', { name: 'Save' })
const div2Button = page.locator('div > div:nth-child(2) > button')
const thing = page.getByLabel('Status')
```

Prefer names tied to user meaning instead of DOM position or styling.

## Data Test IDs

Use `kebab-case` for `data-testid` values.

Name test ids after stable user-facing intent, feature, or element role.

Good:

```ts
data-testid="save-button"
data-testid="status-filter"
data-testid="remote-access-row"
```

Bad:

```ts
data-testid="saveButton"
data-testid="status_filter"
data-testid="button1"
```

Avoid names based on DOM position, styling, or temporary implementation details.

## Naming Rules

- Files: `kebab-case.spec.ts`
- `describe` titles: product-facing feature, role, workflow, or state labels
- Test titles: behavior statements, preferably `should ...`
- Page objects: `PascalCase`, usually with a `Page` suffix
- Helpers: verb-based `camelCase`
- Fixture and test data variables: role- or intent-based nouns
- Locator variables: intent-revealing `camelCase`
- `data-testid` values: intent-revealing `kebab-case`

## Avoid

- Generic names such as `misc`, `tests`, `data`, `result`, or `temp`
- Numbered names such as `test1` or `button2`
- Names based on DOM structure such as `div2Button`
- Names that describe implementation details instead of behavior
