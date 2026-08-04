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