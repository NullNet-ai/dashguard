---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript/JavaScript Naming Conventions

> Applies to new code only. Existing code is migrated incrementally.

## Files

| Type | Convention | Examples |
|------|-----------|---------|
| Utility / lib | `kebab-case.ts` | `email-helper.ts`, `header-value.ts` |
| Hook files | `kebab-case.ts(x)` | `use-debounce.ts`, `use-form-fields.ts` |
| React component files | `kebab-case.tsx` or `index.tsx` in a kebab-case folder | `user-card.tsx`, `record-summary/index.tsx` |
| Server action files | `kebab-case.ts` | `register-account.ts`, `log-in-organization.ts` |
| tRPC router files | `kebab-case.ts` | `contact.ts`, `configuration-rule.ts` |
| Zod schema files | `kebab-case.schema.ts` | `contact-details.schema.ts`, `user.schema.ts` |

Rationale: kebab-case is the shadcn/ui convention and the dominant Next.js App Router community standard.

## Folders

| Type | Convention | Examples |
|------|-----------|---------|
| App routes | `kebab-case` | `login-organization/`, `organization-bus/` |
| Next.js private folders | `_kebab-case` prefix | `_components/`, `_actions/` |
| Component / feature folders | `kebab-case` | `form-builder/`, `user-card/` |
| Route groups | `(kebab-case)` | `(record)/`, `(settings)/` |
| Parallel route slots | `@camelCase` | `@organizations`, `@dashboard` |

## React Components

- Function name: `PascalCase` — `UserCard`, `RecordSummary`, `ThemeProvider`
- File: `kebab-case.tsx` — `user-card.tsx`

```tsx
// WRONG
export function usercard() { ... }         // lowercase
export const UserCard: React.FC = ...      // React.FC not needed

// CORRECT
export function UserCard({ user, onSelect }: IUserCardProps) { ... }
```

## Custom Hooks

- Function name: `use` prefix + `camelCase` — `useDebounce`, `useFormFields`
- File: `kebab-case` — `use-debounce.ts`

```ts
// File: use-debounce.ts
export function useDebounce<T>(value: T, delay: number): T { ... }
```

## Functions

- Always `camelCase` verbs describing the action:

```ts
// WRONG — vague, tells nothing about what is returned
function getData(id: string) { ... }
function process(input: string) { ... }

// CORRECT — name reveals intent
function getContactById(id: string) { ... }
function formatDateToDisplay(date: Date) { ... }
```

## Variables

### Naming for Intent

Names must reveal what the value *is* without requiring a comment.

**Booleans** — `is`, `has`, `can`, `should` prefix:
```ts
// WRONG
const loading = true
const error = false
const edit = hasPermission

// CORRECT
const isLoading = true
const hasError = false
const canEdit = hasPermission
```

**Arrays** — plural nouns:
```ts
// WRONG
const contact = []
const list = fetchedUsers

// CORRECT
const contacts = []
const users = fetchedUsers
```

**Single items** — singular noun:
```ts
const user = users[0]
const selectedOrganization = organizations.find(...)
```

**Event handlers** — `handle` prefix internally, `on` prefix for component props:
```ts
// Internal handler
function handleStatusChange(status: TStatus) { ... }

// Component prop (callback passed in)
interface IButtonProps {
  onSubmit: () => void
  onChange: (value: string) => void
}
```

**Avoid generic names** — use domain nouns instead:
```ts
// WRONG — adds no information beyond the type
const data = await fetchContact(id)
const result = validateToken(token)
const info = organization
const temp = contact.firstName

// CORRECT
const contact = await fetchContact(id)
const tokenValidation = validateToken(token)
const organization = ...
const firstName = contact.firstName
```

**Avoid unnecessary abbreviations**:
```ts
// WRONG
const btn = document.querySelector('button')
const cnt = users.length
const idx = items.findIndex(...)

// CORRECT
const button = document.querySelector('button')
const count = users.length
const index = items.findIndex(...)

// Standard abbreviations are fine: id, url, api, html, css, db
```

### Casing

- Local variables: always `camelCase`
- Map DB/API `snake_case` fields to `camelCase` at the data boundary:

```ts
// WRONG — snake_case leaking into local scope
const { first_name, last_name } = await orm.contact.findById(id)
doSomething(first_name)

// CORRECT — map at boundary
const { first_name, last_name } = await orm.contact.findById(id)
const firstName = first_name
const lastName = last_name
doSomething(firstName)
```

## Interfaces & Types _(project convention)_

- Interfaces: `I` prefix + `PascalCase` — `IProps`, `IUserCardProps`, `IFormFields`
- Type aliases: `T` prefix + `PascalCase` — `TStatus`, `TUserRole`
  - Exception: standalone union types used as value enums may omit the prefix — `ToastType = 'success' | 'error'`
- Names describe the **domain concept**, not the page or usage location:

```ts
// WRONG — tied to location, not concept
interface IContactPageData { ... }
type TFormComponentStatus = ...

// CORRECT
interface IContactDetails { ... }
type TContactStatus = ...
```

## Zod Schemas

- Schema variable: `camelCase` + `Schema` suffix — `contactDetailsSchema`, `userSchema`
- Inferred type: domain name without suffix — `type ContactDetails = z.infer<typeof contactDetailsSchema>`

```ts
// WRONG
const ContactDetailsSchema = z.object({ ... })  // PascalCase
const schema = z.object({ ... })                // too generic

// CORRECT
const contactDetailsSchema = z.object({
  firstName: z.string(),
  email: z.string().email(),
})

type ContactDetails = z.infer<typeof contactDetailsSchema>
```

## Constants

- Module-level primitive constants: `UPPER_SNAKE_CASE`
- Object / config constants: `camelCase`

```ts
// Primitive constants
const ENTITY = 'contact'
const MAX_RETRY_COUNT = 3
const INVITATION_LINK_EXPIRED = 'Invitation link has expired'

// Object constants
const defaultGridOptions = { pageSize: 20, sortOrder: 'asc' }
const itemsSetting = { ... }
```

## tRPC Routers & Procedures

- Router variable: `camelCase` + `Router` suffix — `contactRouter`, `accountRouter`
- Procedure names: `camelCase` verbs describing the operation — `getById`, `updateContactDetails`, `createDraftRecord`

```ts
// WRONG
const contact = createTRPCRouter({ ... })   // missing Router suffix
const contactRouter = createTRPCRouter({
  fetch: ...,       // vague verb
  contactData: ..., // noun instead of verb
})

// CORRECT
const contactRouter = createTRPCRouter({
  getById: ...,
  updateContactDetails: ...,
  createDraftRecord: ...,
})
```
