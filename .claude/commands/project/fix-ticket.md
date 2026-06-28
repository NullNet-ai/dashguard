# Fix Ticket (TDD)

Fetches a Jira ticket, sets up a branch, and implements the fix using a strict **Red → Green → Refactor** TDD cycle. Hand off to `/project:ship` when done.

## Arguments

`$ARGUMENTS` format (space-separated):
- Ticket key (positional, e.g. `WP-759`) **or** `--ticket <key>` — required
- `--skip-branch` — do not create/switch branch (use current branch as-is)
- `--skip-transition` — do not update Jira status

If no ticket key is found in `$ARGUMENTS` and the current branch name has no ticket pattern, **stop and ask the user** for the key before proceeding.

> **Prerequisites for video upload** (Step 7):
> Set these in your shell or `.env.local`:
> ```
> ATLASSIAN_EMAIL=your-email@dnamicro.com
> ATLASSIAN_API_TOKEN=<Jira API token from id.atlassian.net/manage-profile/security>
> ```
> If absent, the upload is skipped and the local video path is included in the Jira comment instead.

---

## Step 1 — Parse arguments & fetch ticket

1. Extract ticket key from `$ARGUMENTS` (positional first arg or `--ticket`). If absent, fall back to the current branch name pattern `[A-Z]+-[0-9]+`. If still not found, **ask the user**.
2. Call `mcp__plugin_atlassian_atlassian__getJiraIssue` with `issueIdOrKey: <key>`.
   - Jira cloud: `nullnet.atlassian.net`
3. Print a compact ticket summary:
   - Key, type (Bug / Story / Task), current status
   - Summary (one line)
   - Description / acceptance criteria (trimmed to essentials)
4. Pause and confirm with the user that this is the right ticket before proceeding.

---

## Step 2 — Branch setup

> **Skip this entire step if `--skip-branch` is present.**

1. Run `git branch --show-current` to get the current branch name.
2. If the branch name already contains the ticket key, continue on the current branch.
3. Otherwise, create and switch: `git checkout -b <TICKET-KEY>`
4. Report the branch name being used.

---

## Step 3 — Codebase exploration (Agent-First + Parallel)

Delegate to agents in parallel — do not explore solo.

Spawn **up to 3 `ecc:code-explorer` agents simultaneously** (one message, multiple tool calls):
- **Agent 1**: Trace the affected UI path (`src/app/portal/`, `src/components/platform/`) based on the ticket description.
- **Agent 2**: Trace the server-side path (`src/server/api/routers/`, `src/server/dnaOrm.ts`) if data or API is involved.
- **Agent 3** (if needed): Search existing Cypress specs in `cypress/e2e/` for related test coverage.

Synthesize their findings into a short map: which files are likely involved and why. If scope is still unclear, **ask the user** before continuing.

---

## Step 3b — Plan (Plan Before Execute)

Before writing any test or code, use `ecc:planner` to design the implementation approach based on the exploration findings.

The plan must cover:
- Which files change and why
- The Cypress spec structure (file path, what it tests)
- The minimal implementation path (what to add/modify)
- Any edge cases or risks

**Do not proceed to Step 4 until the plan is confirmed.**

---

## Step 4 — RED: write the failing test first (Test-Driven)

> **Do not touch any implementation code until this step is complete.**
> Use `ecc:tdd-guide` to drive this step.

Choose the test approach based on ticket type:

| Ticket type | Test |
|-------------|------|
| **Bug** | Playwright E2E spec at `tests/e2e/tickets/<TICKET-KEY>.spec.ts` that reproduces the broken behaviour. Add a comment at the top explaining *why* it fails before the fix. |
| **Feature / Story** | Playwright E2E spec at `tests/e2e/tickets/<TICKET-KEY>.spec.ts` covering each acceptance criterion. |
| **Type error or build failure** | A TypeScript usage or annotation in the affected file that triggers the exact compiler error. |

> **Ticket specs live in `tests/e2e/tickets/`** — never inside an entity's own spec file. This keeps official regression suites clean and ticket tests discoverable by key.

After writing the test:
- Run `pnpm build` to confirm the issue is visible at compile time, **or** run the specific spec file directly to confirm it fails and record a video:
  ```bash
  touch /tmp/pw_video_marker
  npx playwright test tests/e2e/tickets/<TICKET-KEY>.spec.ts --video=on
  VIDEO_FILE=$(find test-results -name "*.webm" -newer /tmp/pw_video_marker 2>/dev/null | head -1)
  echo "Video recorded at: $VIDEO_FILE"
  ```
  The `--video=on` flag overrides the `retain-on-failure` default so a recording is always produced. Note the `$VIDEO_FILE` path — it is uploaded to Jira in Step 7.

  Never use `pnpm test-local` here — it opens the full interactive suite and may run outdated specs unrelated to this ticket.
- Do not proceed to implementation until the failing state is documented and confirmed.

---

## Step 5 — GREEN: minimal implementation (Agent-First)

Delegate implementation to `ecc:feature-dev`. Brief it with:
- The plan from Step 3b
- The failing test path
- Affected files identified in Step 3

Follow existing patterns:
- Data access via `dnaClient` in `src/server/dnaOrm.ts`
- tRPC routers in `src/server/api/routers/`
- Record/Grid UI in `src/components/platform/`
- Use `~/` path alias for `src/`

Keep changes strictly scoped to the ticket — no refactoring of surrounding code. Do not proceed to Step 6 until `pnpm build` exits clean.

---

## Step 6 — REFACTOR: clean up (Parallel + Security-First)

Spawn these two agents **in parallel** (single message, two tool calls):
- `ecc:code-simplifier` — remove debug code, dead branches, align naming with surrounding conventions
- `ecc:security-reviewer` — check changed files for OWASP Top 10, injection, unsafe input handling, secrets

Apply all findings. Then:
1. Run a final `pnpm build` — must pass cleanly.
2. Run `pnpm lint:normal` and fix any warnings in changed files.
3. Print a summary of all files changed and what was done in each.

---

## Step 7 — Jira transition

> **Skip this entire step if `--skip-transition` is present.**

Jira cloud: `nullnet.atlassian.net`

1. Call `mcp__plugin_atlassian_atlassian__getJiraIssue` to read the current ticket status.
2. Walk forward to **"In Development"** using only the transitions that apply:
   - **At "To Do"**: To Do → Dev Ready → Dev Planning → In Development
   - **At "Dev Ready"**: Dev Ready → Dev Planning → In Development
   - **At "Dev Planning"**: Dev Planning → In Development
   - **At "In Development" or beyond**: skip
3. For each transition: call `getTransitionsForJiraIssue` with `sortByOpsBarAndStatus: true`, find the target transition, then call `transitionJiraIssue`.
4. **Post a comment** via `addCommentToJiraIssue` summarising the implementation and token usage:
   - Run this command to fetch token stats from the cost tracker (reflects the most recently completed session — current session data lands after the Stop hook fires on exit):
     ```bash
     sqlite3 ~/.claude-cost-tracker/sessions.db \
       "SELECT input_tokens, output_tokens, printf('%.4f', total_cost_usd) as cost_usd \
        FROM sessions ORDER BY created_at DESC LIMIT 1" 2>/dev/null || echo "N/A"
     ```
   - Include in the comment:
     - Branch name and files changed
     - Test file path (`tests/e2e/tickets/<TICKET-KEY>.spec.ts`)
     - Token usage: input tokens, output tokens, estimated cost USD from the query above
     - Note: *"Token data from most recent completed session via Claude Code cost tracker."*
5. **Upload the E2E video recording** as a Jira attachment:
   ```bash
   VIDEO_FILE=$(find test-results -name "*.webm" | sort | tail -1)
   if [ -n "$VIDEO_FILE" ] && [ -n "$ATLASSIAN_EMAIL" ] && [ -n "$ATLASSIAN_API_TOKEN" ]; then
     curl -s -X POST \
       -u "$ATLASSIAN_EMAIL:$ATLASSIAN_API_TOKEN" \
       -H "X-Atlassian-Token: no-check" \
       -F "file=@$VIDEO_FILE" \
       "https://nullnet.atlassian.net/rest/api/3/issue/$TICKET_KEY/attachments" \
       && echo "Video attached" || echo "Upload failed — check credentials or file path"
   else
     echo "Skipping upload — ATLASSIAN_EMAIL/ATLASSIAN_API_TOKEN not set. Video at: $VIDEO_FILE"
   fi
   ```
   - If upload succeeds, edit the comment from step 4 (or add a follow-up) noting: *"E2E video attached: `<filename>.webm`"*
   - If env vars are absent, include `"E2E video recorded locally at: $VIDEO_FILE"` in the comment so QA knows the recording exists.
6. Print the final ticket status.

---

## Step 8 — Handoff summary

Print a concise handoff:
- Branch name
- Files changed (list)
- Test file written and its path
- Jira status (or "not updated" if `--skip-transition`)
- Next step: stage your changes, then run `/project:ship`

---

## Notes

- **TDD is enforced**: Step 5 (implementation) must not begin before Step 4 (failing test) is complete and confirmed.
- Always use `getTransitionsForJiraIssue` with `sortByOpsBarAndStatus: true` to surface non-global transitions.
- `pnpm build` is the authoritative test signal for this project (TypeScript strict + `noUncheckedIndexedAccess`).
- Always run Playwright via `npx playwright test tests/e2e/tickets/<TICKET-KEY>.spec.ts` to target only the ticket spec. Never use `pnpm test-local` (launches the full interactive suite). Requires a running dev server (`pnpm local`).
- Report each step's result as it completes.
