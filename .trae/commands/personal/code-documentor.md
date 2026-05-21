# Code Documentor — Add JSDoc/TSDoc Inline Documentation

Adds clear, accurate inline documentation to Next.js/React source files without changing any logic.

## Arguments

`$ARGUMENTS`: space-separated file paths (relative to project root or absolute).

- If no arguments are provided, document the file currently open in the IDE.
- Multiple files are processed in order, one at a time.

Examples:
```
/code-documentor src/hooks/useDebounce.ts
/code-documentor src/components/ui/Button.tsx src/lib/formatDate.ts
/code-documentor
```

---

## Step 1 — Resolve Files

Parse `$ARGUMENTS` as a space-separated list of file paths. If the list is empty, use the file
currently open/selected in the IDE. Resolve each path relative to the project root if not absolute.

---

## Step 2 — Document Each File

For each resolved file, read its full contents and add inline documentation according to the rules
below. Then write the result back to the same file path in-place.

**Never alter runtime behaviour — add comments only.**

### Language Rules

- `.js` files → JSDoc (`/** */`)
- `.ts` / `.tsx` files → TSDoc (`/** */`)

### What to Document

**Every exported function, component, hook, and type.** Use present-tense imperative mood:
"Returns …", "Renders …", "Fetches …", "Manages …"

#### React Components

```tsx
/**
 * Renders a dismissible notification banner.
 *
 * @param props.message  - Text to display inside the banner.
 * @param props.variant  - Visual style: "info" | "success" | "error".
 * @param props.onClose  - Called when the user dismisses the banner.
 * @returns              JSX element or null when hidden.
 *
 * @example
 * <Banner message="Saved!" variant="success" onClose={() => setOpen(false)} />
 */
```

Rules:
- Document every prop individually with `@param props.{name}`.
- Include `@returns` describing the JSX or null case.
- Add `@example` for any component used in more than one place.
- For compound components, note the relationship.

#### Custom Hooks

```ts
/**
 * Manages debounced state — delays updating the stored value
 * until the user stops changing it for `delay` milliseconds.
 *
 * @param value  - The input value to debounce.
 * @param delay  - Debounce duration in ms. Defaults to 300.
 * @returns      The debounced value.
 *
 * @example
 * const query = useDebounce(inputValue, 500);
 */
```

Rules:
- Describe the purpose of the hook, not just what it wraps.
- Document return tuple/object fields individually when there is more than one value.
- Note any side-effects (subscriptions, timers, DOM mutations).
- Flag hooks that must be used inside a specific Provider with a `@throws` or inline note.

#### Next.js Specifics

Server component:
```tsx
/**
 * Server component — fetches and renders the user's order history.
 * Runs exclusively on the server; receives no client-side props.
 *
 * @param params.userId  - Dynamic route segment from [userId]/page.tsx.
 * @returns              Rendered order list or redirect to /login.
 */
```

Server action:
```ts
/**
 * Server action — creates a new post and revalidates the feed cache.
 *
 * @param formData  - FormData submitted by the creation form.
 * @returns         The created post id on success, or an error message.
 *
 * @throws {Error}  When the user session is missing or expired.
 */
```

API route handler:
```ts
/**
 * GET /api/products
 *
 * Returns a paginated list of published products.
 *
 * @param request  - Incoming Next.js request with optional ?page= and ?limit= search params.
 * @returns        JSON: { products: Product[]; total: number }
 *                 400 when params are invalid.
 *                 500 on database error.
 */
```

Rules:
- Mark every component file as **Server component**, **Client component**, or **Shared** based on
  the presence or absence of `"use client"` / `"use server"`.
- Document `generateMetadata()` with the page it belongs to.
- For middleware, describe the matcher pattern and what it guards.

#### TypeScript Types & Interfaces

```ts
/**
 * Represents a paginated API response envelope.
 *
 * @template T  - The type of items in the `data` array.
 */
interface PaginatedResponse<T> {
  /** Fetched items for the current page. */
  data: T[];
  /** Total number of items across all pages. */
  total: number;
}
```

Rules:
- Document every property with a single-line `/** */` comment.
- Document generic type parameters with `@template`.
- Do not re-describe types that are self-evident from the TypeScript type itself.

#### Utility Functions

```ts
/**
 * Converts a UTC timestamp to a locale-aware relative string
 * (e.g. "3 minutes ago", "yesterday").
 *
 * @param timestamp  - ISO 8601 date string or Unix epoch in ms.
 * @param locale     - BCP 47 locale tag. Defaults to the browser locale.
 * @returns          Human-readable relative time string.
 *
 * @example
 * formatRelativeTime("2024-01-15T12:00:00Z") // → "2 days ago"
 */
```

### What to Skip

- Inline variable assignments that are self-explanatory
- Re-exported types from third-party libraries
- Unexported test helper functions
- Single-line arrow functions inside JSX that are obvious from context
- Closing tags, import statements, and config objects

### Formatting Rules

- Preserve original indentation, line endings, and formatting exactly.
- Keep descriptions concise: one sentence for simple items; two maximum.
- Do not state the obvious (e.g. never write `@param id - the id`).
- Do not wrap the output in markdown code fences — write raw source only.

---

## Step 3 — Summary

After all files are processed, print a brief summary:

```
Documented X file(s):
  ✓ src/hooks/useDebounce.ts — 1 hook, 2 types
  ✓ src/components/ui/Button.tsx — 1 component
```

List what was added (component count, hook count, type count, function count) per file.
