# Push Branch + Update Jira

Pushes the current branch directly to `origin` (no MR) then runs the full Jira update cycle.

## Arguments

`$ARGUMENTS` format (all optional, space-separated):
- `--time <duration>` — Jira worklog to log (default: `1h`)
- `--ticket <key>` — Jira ticket key (e.g. `WP-706`); required if branch name has no ticket pattern
- `--skip-commit` — skip the commit step; go straight to `git push` then the Jira steps

If the Jira ticket key cannot be derived from the branch name and `--ticket` was not provided, **stop and ask the user** for the ticket key before proceeding.

---

## Step 1 — Commit

> **Skip this step entirely if `--skip-commit` is present.** Derive the Jira ticket key from the branch name (or use `--ticket`), push the branch (`git push origin <branch>`), then proceed to Step 2.

1. Run `git status` and `git diff` to understand all staged and unstaged changes.
2. Run `git log -3` to follow commit message style.
3. Derive the Jira ticket key from the current branch name (e.g., `WP-706` from branch `WP-706`). If the branch name has no ticket pattern, use `--ticket` value; if neither is present, **ask the user** for the ticket key.
4. Commit only the **currently staged files** — do NOT auto-stage anything extra.
5. Commit message format: `feat(<TICKET>): <concise description of the fix/feature>`
6. Push the branch to `origin`: `git push origin <current-branch>`

---

## Step 2 — Jira Update

Jira cloud: `nullnet.atlassian.net`
Ticket key: derived from branch name or `--ticket` in Step 1.

Execute in this exact order:

### 2a. Read committed changes
Read the staged files from the commit to understand what was changed. Use this to generate the field values below.

### 2b. Fill Issue Investigation & Solution
Use `editJiraIssue` with ADF format (plain paragraph nodes — no markdown):
- `customfield_10042` (Issue Investigation): describe **what was wrong and why** — missing fields, incorrect behavior, root cause.
- `customfield_10109` (Solution): describe **what was changed and how** — files modified, logic added, result.

Generate both values based on the actual committed changes.

### 2c. Pre-transition: Advance to "In Development" if needed
1. Read current status via `getJiraIssue`.
2. Execute **only** the steps that apply to the current status:
   - **At "To Do"**: run all three steps: To Do → Dev Planning → Dev Ready → In Development
   - **At "Dev Planning"**: run steps 2–3: Dev Planning → Dev Ready → In Development
   - **At "Dev Ready"**: run step 3 only: Dev Ready → In Development
   - **At "In Development"**: skip this block; proceed to 2d
   - **At "Done Local" or beyond**: skip 2c and 2d; proceed to 2g
3. For each transition, call `getTransitionsForJiraIssue` to find it, then `transitionJiraIssue` to execute it.

### 2d. Transition → Done Local
If the ticket is now at "In Development" (after 2c), use `getTransitionsForJiraIssue` to find the "Done Local" transition, then `transitionJiraIssue`.
If the ticket is already at "Done Local" or beyond, skip this step.

### 2e. Log time
Use `addWorklogToJiraIssue` with `timeSpent` = value of `--time` (default `1h`).

### 2f. Add branch push comment
Use `addCommentToJiraIssue` with the current branch name (ADF format):
```
Branch pushed: <current-branch>
```

### 2g. Transition → QA Ready
Use `getTransitionsForJiraIssue` to find the "QA Ready" or "Skip Code Review" transition, then `transitionJiraIssue`.

---

## Notes

- Always use ADF objects (not plain strings) for Jira textarea custom fields.
- If the branch name does not match a Jira ticket pattern (e.g., `WP-NNN`) and `--ticket` is not provided, **ask the user** for the ticket key before proceeding.
- Report each step's result as it completes.
