---
alwaysApply: false
globs:
  - "**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}"
  - "src/**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}"
  - "tests/**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}"
---

> Synced from `.claude/rules/typescript/hooks.md` by `pnpm sync:trae`.
> Edit the source under `.claude/` and rerun the sync script instead of editing this file by hand.

---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript/JavaScript Hooks

> This file extends [common/hooks.md](../common/hooks.md) with TypeScript/JavaScript specific content.

## PostToolUse Hooks

Configure in `~/.claude/settings.json`:

- **Prettier**: Auto-format JS/TS files after edit
- **TypeScript check**: Run `tsc` after editing `.ts`/`.tsx` files
- **console.log warning**: Warn about `console.log` in edited files

## Stop Hooks

- **console.log audit**: Check all modified files for `console.log` before session ends
