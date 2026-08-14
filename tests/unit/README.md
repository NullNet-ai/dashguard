# `tests/unit/`

Vitest unit tests. The autonomous triage loop (runbook `DC000626`) writes one directory per ticket:
`tests/unit/WP-<N>/*.test.ts`. Run with `pnpm test:unit`.

Playwright owns E2E (`tests/e2e/`); this layer is for pure logic — tRPC routers, utils, serializers,
hooks.

## Import test functions explicitly

`globals` is **off**. Cypress ships ambient Chai globals, and a project-wide `expect` collision makes
vitest matchers fail `tsc` (`Property 'toBe' does not exist on type 'Assertion'`) even though the
tests pass at runtime. So:

```ts
import { describe, expect, it } from 'vitest';
```

Do not add `globals: true` back — `tsconfig.json` includes `**/*.ts`, so `next build` typechecks
these files alongside the Cypress specs and the collision returns.

## Pinned versions — do not bump blindly

| Package | Pin | Why |
|---|---|---|
| `vitest` | `^3` | v4 pulls Vite 8 + rolldown; pnpm 8.15.4 does not install `@rolldown/binding-*`, so the runner cannot start. |
| `jsdom` | `^26` | v30 pulls ESM-only `html-encoding-sniffer@6`, which Node 20.14 cannot `require` (`ERR_REQUIRE_ESM`). |

## `passWithNoTests` is on

A ticket may be covered only by Playwright. Zero unit tests must not fail the loop's local gate,
which is the only pre-production check that exists.

## Harness check

`harness.test.ts` proves the substrate itself works — `~/` alias resolution, the jsdom environment,
and jest-dom matchers from `setup.ts`. If it fails, the local gate is unreliable and no ticket should
ship until it is fixed.
