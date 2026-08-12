---
name: platform-grid-add-column
description: Add a new column to a Platform Grid entity column config file. Collects label, accessorKey, entity, and column type, then inserts a correctly-shaped column entry into the target file.
---

# Platform Grid Add Column

Adds a new column to an entity's grid column configuration file at `src/app/portal/{entity}/grid/_config/columns.tsx`.

## When to Activate

- User says "add a column to the [entity] grid"
- User invokes `/platform/grid/add-column`
- User wants to display a new field in a grid table

---

## Workflow

### Step 1 — Collect required inputs

If any of these are missing from the user's message, ask for all missing ones **in a single message**:

| Input | Description | Example |
|-------|-------------|---------|
| `entity` | Entity folder name under `src/app/portal/` | `device`, `contact`, `organization` |
| `label` | Column header display text | `"Device Name"` |
| `accessorKey` | Field key from the data object | `device_name` |

### Step 2 — Ask column type

Ask the user to choose the column type with a single numbered-list message:

```
What type of column is this?

1. Plain text — simple text field, searchable
2. Related entity — text from a nested relation (e.g. updated_by.full_name)
```

### Step 3 — Ask additional details (conditional)

- **Type 5 (Related entity)**: Ask for the sub-field name (e.g. `full_name` for `updated_by.full_name`)
- **Types 1, 3**: Ask "Should this column be searchable?" — if yes, add `search_config: { operator: 'like' }`
- **Types 2, 4**: Skip — search config is not applicable

### Step 4 — Read the target file

Read `src/app/portal/{entity}/grid/_config/columns.tsx` to understand existing column count and surrounding code style (quote style, indentation).

### Step 5 — Insert the column

Append the new column object as the **last item** in the `gridColumns` array, just before the closing `] as ColumnDef<any>[];` line. Match the indentation and quote style of surrounding columns.

### Step 6 — Report

Tell the user:
- Which file was modified (as a clickable link)
- The inserted column snippet
- Reminder to run `pnpm build` to verify no type errors

---

## Column Shapes by Type

### 1. Plain text
```tsx
{
  header: 'Label',
  accessorKey: 'field_name',
  search_config: {
    operator: 'like',
  },
},
```

### 2. Related entity text
```tsx
{
  header: 'Label',
  accessorKey: 'relation_field',
  data_type: 'string',
  sortKey: 'relation_field.sub_field',
  search_config: {
    entity: 'relation_field',
    field: 'sub_field',
    operator: 'like',
  },
},
```

---

## Key Files

| File | Role |
|------|------|
| `src/app/portal/{entity}/grid/_config/columns.tsx` | Target file — insert new column here |
| `src/components/platform/Grid/types.ts` | `CustomColumnDef` type reference |
