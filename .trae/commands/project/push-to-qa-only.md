# Push to QA Only — Commit → MR → Merge

Automates the ship workflow for the current branch: commit staged changes, create and merge a GitLab MR.

## Arguments

`$ARGUMENTS` format (all optional, space-separated):
- `--target <branch>` — MR target branch (default: `portal-template-qa`)
- `--labels <labels>` — comma-separated GitLab labels (**required** — ask if not provided)
- `--ticket <key>` — Jira ticket key to use in the commit message (default: derived from branch name, e.g. `WP-706`)
- `--skip-commit` — skip the commit step entirely; go straight to `git push` then the MR steps

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

Example: `/push-to-qa-only --labels feat,normal-review`
Example: `/push-to-qa-only --target portal-template-qa --labels feat,normal-review`
Example: `/push-to-qa-only --labels feat,normal-review --ticket WP-999`

---

## Step 1 — Commit

> **Skip this step entirely if `--skip-commit` is present.** Jump straight to pushing the branch (`git push origin <branch>`) and then proceed to Step 2.

1. Run `git status` and `git diff` to understand all staged and unstaged changes.
2. Run `git log -3` to follow commit message style.
3. Determine the Jira ticket key: use `--ticket` value if provided; otherwise derive it from the current branch name (e.g., `WP-706` from branch `WP-706`).
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
