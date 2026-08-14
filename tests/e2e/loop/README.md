# `tests/e2e/loop/`

Playwright specs authored by the **autonomous triage loop** (runbook `DC000626`), one per ticket:
`WP-<N>.spec.ts`.

Kept deliberately separate from `tests/e2e/tickets/` (hand-authored, owned by the
`/project:fix-ticket` command) so the loop never writes into that directory and the two can be told
apart at a glance.

## These specs run against two different targets

| Phase | Target | Notes |
|---|---|---|
| Planner (red) / Executor (green) | local `pnpm local` @ `localhost:3000` | Pre-merge. The default when `BASE_URL` is unset. |
| Post-deploy QA | `BASE_URL=https://portal.appguard.ai` | **Production.** |

`playwright.config.ts` already reads `process.env.BASE_URL ?? 'http://localhost:3000'`, so the same
spec serves both with no config change.

## Rules for specs in this directory

Because the post-deploy phase runs against **production** with real data:

1. **Clean up everything you create**, in `afterEach` — the QA agent re-queries afterwards to confirm
   every created record is gone, and a single orphan parks the ticket.
2. **Authenticate with `QA_E2E_EMAIL` / `QA_E2E_PASSWORD`** from the untracked `.env.local`. Never
   import `ADMIN_CREDENTIALS` from `tests/e2e/utils/auth.ts` — that is a shared global-org admin
   account whose password is committed in plaintext.
3. Make created records identifiable (name prefix) so a leftover can be traced to the ticket that
   made it.
