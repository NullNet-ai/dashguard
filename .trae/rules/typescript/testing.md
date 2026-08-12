---
alwaysApply: false
globs:
  - "**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}"
  - "src/**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}"
  - "tests/**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}"
---

> Synced from `.claude/rules/typescript/testing.md` by `pnpm sync:trae`.
> Edit the source under `.claude/` and rerun the sync script instead of editing this file by hand.

---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript/JavaScript Testing

> This file extends [common/testing.md](../common/testing.md) with TypeScript/JavaScript specific content.

## E2E Testing

Use **Playwright** as the E2E testing framework for critical user flows.

## Agent Support

- **e2e-runner** - Playwright E2E testing specialist
