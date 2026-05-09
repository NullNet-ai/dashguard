---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# Folder Structure

> Applies to all components and features in the project. Based on Next.js App Router colocation conventions and React community standards.

## Component Folder

Every component that has more than a single file lives in its own `kebab-case` folder with a mandatory `index.tsx` entry point.

```
component-name/
  index.tsx        # Component — default export, no types defined here
  types.ts         # All interfaces, types, and local type aliases for this component
```

**Rules:**
- `index.tsx` imports types from `./types` — never defines them inline
- `types.ts` is always created when the component has props, local state types, or utility types
- No other files are created unless actually needed (do not create empty placeholders)

```typescript
// types.ts
export interface IUserCardProps {
  userId: string
  onSelect: (id: string) => void
}

export type TUserCardTab = 'details' | 'history'

// index.tsx
import type { IUserCardProps } from './types'

function UserCard({ userId, onSelect }: IUserCardProps) { ... }
```

## Optional Sibling Files

Add these only when the component actually needs them:

| File | Contents |
|------|---------|
| `hooks.ts` | Custom hooks used exclusively by this component |
| `utils.ts` | Pure helper functions scoped to this component |
| `constants.ts` | Module-level constants (`UPPER_SNAKE_CASE` primitives, `camelCase` objects) |

## Private Sub-folders

Use `_kebab-case` (underscore prefix) for folders that are private to the component and must not be routable:

```
component-name/
  index.tsx
  types.ts
  _components/        # Sub-components used only within this component
    sub-component/
      index.tsx
      types.ts
  _config/            # Static config objects (columns, sorting, filters, etc.)
    columns.ts
    sorting.ts
```

**Rule:** A sub-component in `_components/` follows the same structure recursively.

## Feature / Page Folder (App Router)

Route segments use the same colocation approach. Private, non-routable files go in `_`-prefixed folders:

```
app/portal/device/
  record/
    [code]/
      page.tsx                        # Route entry point
      _record_summary/                # Private feature area
        index.tsx
        types.ts
        _components/
          some-widget/
            index.tsx
            types.ts
```

**Key Next.js rules:**
- Only `page.tsx` / `route.ts` make a segment publicly routable — all other colocated files are safe
- Private folders (`_folder`) are explicitly opted out of routing
- Route groups (`(group)`) organise routes without affecting URLs

## Anti-patterns

```
// WRONG — types defined inline in index.tsx
const MyComponent = ({ id }: { id: string }) => { ... }
interface IMyComponentProps { id: string }  // defined in index.tsx
const MyComponent = ({ id }: IMyComponentProps) => { ... }

// CORRECT — types in types.ts, imported
import type { IMyComponentProps } from './types'
const MyComponent = ({ id }: IMyComponentProps) => { ... }
```

```
// WRONG — flat files for a multi-file component
user-card.tsx
user-card.types.ts
user-card.hooks.ts

// CORRECT — folder with index
user-card/
  index.tsx
  types.ts
  hooks.ts
```
