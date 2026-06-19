# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm local          # Dev server (Turbopack + local env, NODE_ENV=local)
pnpm build          # Production build — use this to typecheck/validate changes (no unit tests)
pnpm lint           # ESLint (strict config by default)
pnpm lint:normal    # Relaxed ESLint pass
pnpm test-local     # Cypress E2E (opens UI)
pnpm clean          # Wipe .next + node_modules, reinstall (use when deps are broken)
```

Always use **pnpm**, never npm or yarn.

## Architecture Overview

**Stack:** Next.js App Router, React 19, tRPC v11, `@dna-platform/common-orm`, Redis, Socket.io, Tailwind CSS, Radix UI.

**Path alias:** `~/` resolves to `src/`.

### Entity Page Pattern

All portal entities live under `src/app/portal/[entity]/` and follow a strict structure:

```
portal/[entity]/
  grid/           — list view
  record/[code]/
    (record)/     — parallel route group for record tabs
      @slot_name/ — each tab is a named slot (parallel route)
    _record_summary/
    layout.tsx    — fetches record, injects device_category, wraps in RecordWrapper
```

Record tabs are Next.js **parallel routes** (`@tab_name` folders). The `(record)/device/layout.tsx` renders `{Object.values(rest)}` to mount all slots simultaneously. Each slot is an independent RSC with its own data fetching.

### tRPC

- `publicProcedure` — unauthenticated
- `privateProcedure` — authenticated (verifies `token` cookie via Redis cache, then `dnaClient.verifyToken` on cache miss)
- Routers: `src/server/api/routers/[entity].ts` — one per domain
- Root router: `src/server/api/root.ts`
- Client: `~/trpc/react.tsx` (React Query provider), `~/trpc/server.ts` (RSC caller)

### Auth Flow

1. Middleware (`src/middleware.ts`) redirects unauthenticated users and injects headers: `x-pathname`, `x-main-entity`, `x-grid-tab-id`, `x-record-tab-id`
2. tRPC `verificationMiddleware` reads `token` cookie → checks Redis → falls back to `dnaClient.verifyToken`
3. Session cached in Redis for 50s after first verification

Entity aliasing (e.g. `student → contact`) is defined in `src/middleware-alias-entities.ts`.

### ORM

`src/server/dnaOrm.ts` exports a singleton `dnaClient` from `@dna-platform/common-orm`. All server-side data access goes through this client. Routers receive `dnaClient` via tRPC context.

### Shared Platform Components

- `src/components/platform/Grid/` — reusable data grid (Provider, TableBody, Pagination, Sorting, Search, etc.)
- `src/components/platform/Record/` — record layout wrapper, summary panel, tab infrastructure
- `src/components/platform/Wizard/` — multi-step form wizard used for entity creation

### Form Pattern (Server/Client Split)

Record and wizard forms always use two files:
- `server.tsx` — RSC; reads `x-pathname` header, fetches initial data via `api.*`, passes as `defaultValues` to the client component
- `client.tsx` — `"use client"` form component; receives `defaultValues` as props, handles mutations via `api.*.useMutation()`

`builder.tsx` (when present) composes server + client into a single export. All form exports for an entity live in `_components/forms/index.tsx`.

### Portal Layout Providers

`src/app/portal/layout.tsx` wraps all portal pages with: `NotificationProvider`, `SmartProvider`, `SideDrawerProvider`, `SidebarProvider`, `SideBarMenu`, `SessionChecker`, `Toaster`.

### Environment Variables

Copy `.env-example` to `.env.local`. Key variables:
- `STORE_URL` — ORM backend URL
- `NEXT_PUBLIC_SOCKET_URL` — Socket.io server
- `NEXT_PUBLIC_REMOTE_ACCESS_URL` — Remote access proxy
- `REDIS_URL` — Redis connection string (server-side session cache)
- `INSTALL_TOKEN_TTL_SECONDS` — Device install token expiry (default: 7200)

### Adding a New Entity

1. Copy `src/app/portal/_template_page/` → `src/app/portal/[new_entity]/`
2. Add a router at `src/server/api/routers/[new_entity].ts` and register it in `src/server/api/root.ts`
3. Add the entity name to `src/auto-generated/entities.ts` (required — used by the ORM layer)
4. Grid columns/sorting/filter live in `grid/_config/`; wizard steps in `wizard/_config/` (stepLabels, stepsNavigation, totalSteps)

## Key Conventions

- `device_category` drives conditional rendering (Appguard Client vs Firewall/PFSense)
- Record pages use `export const dynamic = 'force-dynamic'` — no static generation
- Status checks (`Draft`, `Pending`) in record layouts redirect to `notFound()` before rendering
- `~/utils/request-header.ts` has `setMetaHeader` for ORM mutation context
- `tsconfig.json` enables `noUncheckedIndexedAccess` — array/object index access always returns `T | undefined`; use optional chaining or explicit guards throughout

<!-- ECC -->

---

## Core Philosophy

You are Claude Code. I use specialized agents and skills for complex tasks.

**Key Principles:**
1. **Agent-First**: Delegate to specialized agents for complex work
2. **Parallel Execution**: Use Task tool with multiple agents when possible
3. **Plan Before Execute**: Use Plan Mode for complex operations
4. **Test-Driven**: Write tests before implementation
5. **Security-First**: Never compromise on security

## Available Agents

| Agent | Purpose |
|-------|---------|
| `ecc:code-reviewer` | General code review (quality, security, maintainability) |
| `ecc:react-reviewer` | React/JSX hook correctness, render perf, server/client boundaries |
| `ecc:typescript-reviewer` | Type safety, async correctness, idiomatic TS/JS |
| `ecc:security-reviewer` | OWASP Top 10, secrets, injection, unsafe crypto |
| `ecc:silent-failure-hunter` | Swallowed errors, bad fallbacks, missing error propagation |
| `ecc:pr-test-analyzer` | Test coverage quality on a PR |
| `ecc:planner` | Break down complex features before coding |
| `ecc:code-architect` | Design feature architecture from existing patterns |
| `ecc:code-explorer` | Trace execution paths and map dependencies |
| `ecc:react-build-resolver` | React/Next.js build failures, JSX/TSX errors, hydration |
| `ecc:build-error-resolver` | General build and TypeScript errors |
| `ecc:performance-optimizer` | Bottlenecks, bundle size, render optimization |
| `ecc:refactor-cleaner` | Dead code removal, deduplication (runs knip/ts-prune) |
| `ecc:code-simplifier` | Simplify recently modified code for clarity |
| `ecc:tdd-guide` | Write tests first, enforce 80%+ coverage |
| `ecc:e2e-runner` | Playwright E2E test generation, maintenance, artifacts |
| `ecc:feature-dev` | Full feature implementation loop |
| `ecc:security-scan` | Automated security scan |
| `ecc:quality-gate` | Pre-merge quality check |
| `ecc:pr` | Create a pull request |
| `ecc:review-pr` | Review an existing PR |
| `ecc:doc-updater` | Update codemaps, READMEs, and guides |
| `ecc:docs-lookup` | Fetch current library/framework docs via Context7 |
| `playwright-test-planner` | Plan a full Playwright test suite for a page/flow |
| `playwright-test-generator` | Generate individual Playwright specs |
| `playwright-test-healer` | Debug and fix failing Playwright tests |

---

## Personal Preferences

### Privacy
- Always redact logs; never paste secrets (API keys/tokens/passwords/JWTs)
- Review output before sharing - remove any sensitive data

### Git
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Always test locally before committing
- Small, focused commits

### Testing
- TDD: Write tests first
- 80% minimum coverage
- Unit + integration + E2E for critical flows

### Knowledge Capture
- Personal debugging notes, preferences, and temporary context → auto memory
- Team/project knowledge (architecture decisions, API changes, implementation runbooks) → follow the project's existing docs structure
- If the current task already produces the relevant docs, comments, or examples, do not duplicate the same knowledge elsewhere
- If there is no obvious project doc location, ask before creating a new top-level doc

---

## Success Metrics

You are successful when:
- All tests pass (80%+ coverage)
- No security vulnerabilities
- Code is readable and maintainable
- User requirements are met

---

**Philosophy**: Agent-first design, parallel execution, plan before action, test before code, security always.