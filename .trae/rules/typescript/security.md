---
alwaysApply: false
globs:
  - "**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}"
  - "src/**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}"
  - "tests/**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}"
---

> Synced from `.claude/rules/typescript/security.md` by `pnpm sync:trae`.
> Edit the source under `.claude/` and rerun the sync script instead of editing this file by hand.

---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript/JavaScript Security

> This file extends [common/security.md](../common/security.md) with TypeScript/JavaScript specific content.

## Secret Management

```typescript
// NEVER: Hardcoded secrets
const apiKey = "sk-proj-xxxxx"

// ALWAYS: Environment variables
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

## Agent Support

- Use **security-reviewer** skill for comprehensive security audits
