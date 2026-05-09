# Push to QA — Commit → MR → Merge → Jira

Automates the full ship workflow for the current branch: commit staged changes, create and merge a GitLab MR, then update the counterpart Jira ticket.

## Arguments

`$ARGUMENTS` format (all optional, space-separated):
- `--target <branch>` — MR target branch (default: `portal-template-qa`)
- `--labels <labels>` — comma-separated GitLab labels (**required** — ask if not provided)
- `--time <duration>` — Jira worklog to log (default: `1h`)
- `--skip-commit` — skip the commit step entirely; go straight to `git push` then the MR and Jira steps

If `--labels` is not provided in `$ARGUMENTS`, **stop and ask the user** before proceeding. Present the available project labels with descriptions:

| Label | Description |
|---|---|
| `breaking-change` | Introduces a breaking API or behavior change |
| `bugfix` | Fixes a bug |
| `careful-review` | Needs careful attention during review |
| `chore` | Maintenance task with no feature or bug change |
| `feat` | New feature or enhancement |
| `heavy-review` | Requires thorough, in-depth review |
| `high` | High priority |
| `hotfix` | Urgent fix for a production issue |
| `normal-review` | Standard review process |
| `quick-review` | Minor change, fast review expected |
| `ready` | Reviewed and ready to merge |
| `release` | Release-related changes |
| `split-recommended` | PR is large and should be split |
| `wip` | Work in progress, not ready for review |

Example: `/push-to-qa --labels feat,normal-review`
Example: `/push-to-qa --target portal-template-qa --labels feat,normal-review --time 2h`

---

## Step 1 — Commit

> **Skip this step entirely if `--skip-commit` is present.** Derive the Jira ticket key from the branch name, push the branch (`git push origin <branch>`), then proceed to Step 2.

1. Run `git status` and `git diff` to understand all staged and unstaged changes.
2. Run `git log -3` to follow commit message style.
3. Derive the Jira ticket key from the current branch name (e.g., `WP-706` from branch `WP-706`).
4. Commit only the **currently staged files** — do NOT auto-stage anything extra.
5. Commit message format: `feat(<TICKET>): <concise description of the fix/feature>`
6. Push the branch to `origin`.

---

## Step 2 — GitLab MR

GitLab host: `gitlab.nullnet.ai`, project: `nullnet/dashguard`
Token: extract from `git remote get-url origin` (the `glpat-...` token in the URL).

1. `GET /api/v4/user` — get current user ID.
2. `POST /api/v4/projects/nullnet%2Fdashguard/merge_requests` with:
   - `source_branch`: current branch
   - `target_branch`: value of `--target` (default `portal-template-qa`)
   - `title`: same as the commit message
   - `assignee_ids`: [current user id]
   - `labels`: value of `--labels` (user-provided, required)
   - `squash`: false, `remove_source_branch`: false
3. `PUT /api/v4/projects/nullnet%2Fdashguard/merge_requests/{iid}/merge` — merge immediately.
4. `POST /api/v4/projects/nullnet%2Fdashguard/merge_requests/{iid}/notes` — add a comment to the MR with the Jira ticket link:
   ```
   Jira: https://nullnet.atlassian.net/browse/<TICKET>
   ```

---

## Step 3 — Jira Update

Jira cloud: `nullnet.atlassian.net`
Ticket key: derived from branch name in Step 1.

Execute in this exact order:

### 3a. Read committed changes
Read the staged files from the commit to understand what was changed. Use this to generate the field values below.

### 3b. Fill Issue Investigation & Solution
Use `editJiraIssue` with ADF format (plain paragraph nodes — no markdown):
- `customfield_10042` (Issue Investigation): describe **what was wrong and why** — missing fields, incorrect behavior, root cause.
- `customfield_10109` (Solution): describe **what was changed and how** — files modified, logic added, result.

Generate both values based on the actual committed changes.

### 3c. Pre-transition: Advance from "To Do" if needed
Check the current issue status. If the status is **"To Do"**, transition through the following states in order before proceeding, using `getTransitionsForJiraIssue` + `transitionJiraIssue` for each step:
1. **To Do → Dev Ready**
2. **Dev Ready → Dev Planning**
3. **Dev Planning → In Development**

After each transition, call `getTransitionsForJiraIssue` again to find the next transition. Skip this pre-transition block if the ticket is already past "To Do".

### 3d. Transition → Done Local
Use `getTransitionsForJiraIssue` to find the "Done Local" transition, then `transitionJiraIssue`.

### 3e. Log time
Use `addWorklogToJiraIssue` with `timeSpent` = value of `--time` (default `1h`).

### 3f. Add MR link comment
Use `addCommentToJiraIssue` with the MR URL from Step 2 (ADF format):
```
MR: https://gitlab.nullnet.ai/nullnet/dashguard/-/merge_requests/{iid}
```

### 3g. Transition → QA Ready
Use `getTransitionsForJiraIssue` (after Done Local) to find the "QA Ready" or "Skip Code Review" transition, then `transitionJiraIssue`.

---

## Notes

- Always use ADF objects (not plain strings) for Jira textarea custom fields.
- Extract the GitLab token from the remote URL — never hardcode it.
- If the branch name does not match a Jira ticket pattern (e.g., `WP-NNN`), skip the Jira steps and inform the user.
- Report each step's result as it completes.
