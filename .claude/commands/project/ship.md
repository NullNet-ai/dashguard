# Ship — Commit → (MR → Merge) → Jira

One command for the full ship workflow. Commits and pushes the current branch, optionally creates and merges a GitLab MR, then runs the Jira update cycle. Unifies `push-jira`, `push-to-qa`, and `push-to-qa-only`.

This command **coordinates** the flow. It does **not** duplicate the Jira transition logic — Step 3 delegates to `update-ticket-fields.md` (Steps 2–7) for all field edits, transitions, worklog, and the QA-ready move.

## Arguments

`$ARGUMENTS` format (all optional, space-separated):
- `--mr` / `--no-mr` — toggle the GitLab MR create+merge step. **MR mode is the default** (`--mr`); pass `--no-mr` to push the branch directly with no MR.
- `--skip-jira` — skip the Jira cycle entirely (Step 3).
- `--target <branch>` — MR target branch (default: `portal-template-qa`). Only meaningful in MR mode.
- `--labels <labels>` — comma-separated GitLab labels. **Required in MR mode** — if absent, stop and ask (see label table below). Ignored in `--no-mr` mode.
- `--ticket <key>` — explicit Jira ticket key (e.g. `WP-706`); required if the branch name has no ticket pattern.
- `--time <duration>` — Jira worklog to log (default: `1h`).
- `--skip-commit` — skip the commit step; go straight to `git push` then the remaining steps.
- `--commit <id|range>` — read changes from an existing commit or range (e.g. `abc1234` or `abc1234..HEAD`); skips commit/push and reads from history instead.
- `--reply-to <url>` — Jira comment URL; Bug tickets only; skips the Investigation/Solution field edit and posts them as a new comment reply instead.

**Pre-flight checks (stop and ask before doing anything):**
- If the Jira ticket key cannot be derived from the branch name and `--ticket` was not provided (and Jira is not skipped), **stop and ask the user** for the ticket key.
- If MR mode is active (default) and `--labels` is not provided, **stop and ask the user** with the label table below.
- `--commit` and `--skip-commit` are mutually exclusive; if both are provided, `--commit` takes precedence.

### Available GitLab labels (for `--labels` in MR mode)

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

Examples:
- `/ship --labels feat,normal-review` — commit, MR to `portal-template-qa`, merge, Jira cycle.
- `/ship --no-mr` — commit, push branch directly (no MR), Jira cycle.
- `/ship --no-mr --skip-jira` — commit and push only.
- `/ship --labels bugfix,quick-review --time 2h --reply-to <url>` — Bug fix shipped via MR, Inv/Sol posted as a comment reply.
- `/ship --commit abc1234 --labels feat,normal-review` — ship an existing commit via MR.

---

## Step 1 — Commit / Push

> Reuses `push-jira.md` Step 1 verbatim. Handles the normal flow, `--skip-commit`, and `--commit`, and derives the Jira ticket key. **Outcome of this step is the "target ref"** consumed by Steps 2 and 3 — the commit SHA, range, or pushed branch HEAD that the MR and Jira steps act on.

**If `--commit` is present:**
1. Resolve commit range (same logic as `update-ticket-fields`):
   - If value contains `..` → treat as explicit range.
   - Else → run `git log --oneline <commit>..HEAD`:
     - Non-empty output → range mode: `<commit>..HEAD`
     - Empty output → single-commit mode: `<commit>`
2. Extract the ticket key from the first commit in the range: run `git log -1 --format=%B <commit>` (single) or `git log --reverse <range>` then read first commit message (range).
3. Derive the Jira ticket key from that commit message (e.g., `WP-706` from `feat(WP-706): ...`). If not found and `--ticket` not provided, **ask the user** for the ticket key.
4. Skip commit/push. The target ref is the resolved commit/range.

**If `--skip-commit` is present (and `--commit` is NOT):**
Skip commit/push. Derive the Jira ticket key from the branch name (or use `--ticket`). Push the branch (`git push origin <current-branch>`). The target ref is the pushed branch HEAD.

**Otherwise (normal flow):**
1. Run `git status` and `git diff` to understand all staged and unstaged changes.
2. Run `git log -3` to follow commit message style.
3. Derive the Jira ticket key from the current branch name. If the branch name has no ticket pattern, use `--ticket`; if neither is present, **ask the user** for the ticket key.
4. Commit only the **currently staged files** — do NOT auto-stage anything extra.
5. Commit message format: `feat(<TICKET>): <concise description of the fix/feature>`
6. Push the branch to `origin`: `git push origin <current-branch>`. The target ref is the new commit / pushed branch HEAD.

---

## Step 2 — GitLab MR

> **Skip this step entirely if `--no-mr` is present.** Otherwise copy `push-to-qa.md` Step 2 verbatim. **Capture the MR `iid` and URL** for use in Step 3's link comment.

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

Record the MR `iid` and the MR URL `https://gitlab.nullnet.ai/nullnet/dashguard/-/merge_requests/{iid}` — Step 3 uses it.

---

## Step 3 — Jira

> **Skip this step entirely if `--skip-jira` is present.**

Delegate to `update-ticket-fields.md`: **execute the Jira cycle defined in `update-ticket-fields.md` Steps 2–7 against the target ref from Step 1.** ship.md does not re-implement any transition logic — `update-ticket-fields.md` is the single source of truth for it.

Pass through to that cycle:
- **Ticket key**: as derived in Step 1 (or `--ticket`).
- **Commit/range**: the target ref from Step 1 (used by update-ticket-fields Step 1 to read diffs for Investigation/Solution generation).
- **`--time`**: the worklog value (default `1h`).
- **`--reply-to`**: passed through unchanged (Bug-only Inv/Sol comment-reply behavior).

Apply exactly **two deltas** to that cycle:

### Delta 1 — Link comment (replaces update-ticket-fields Step 2)

update-ticket-fields Step 2 posts a **commit-link** comment. In ship.md, replace it with a **branch-push** or **MR** link comment depending on mode. Reuse the ADF shapes from `push-jira.md` 2f (branch push) and `push-to-qa.md` 3f (MR):

**MR mode (default — `--mr`):** post the MR link comment via `addCommentToJiraIssue` (ADF):
```
MR: https://gitlab.nullnet.ai/nullnet/dashguard/-/merge_requests/{iid}
```
(use the `iid` / URL captured in Step 2.)

**`--no-mr` mode:** post the branch-push link comment via `addCommentToJiraIssue` (ADF), reusing push-jira 2f:
1. Get commit hash: `git rev-parse HEAD`.
2. Resolve commit URL: `git config --get remote.origin.url` → construct the commit link (e.g. `https://gitlab.com/org/repo/-/commit/<hash>`).
3. Post as ADF with:
   - Paragraph: `Branch pushed: <current-branch>`
   - Paragraph: `Commit:` + ADF link to the commit URL.

> Exception: when `--reply-to` is present (Bug only), the commit/MR link is already embedded in the Inv/Sol reply comment per update-ticket-fields Step 3 — do not post a separate link comment.

### Delta 2 — everything else inherited unchanged

All remaining behavior comes from `update-ticket-fields.md` verbatim, with no modification:
- **Investigation & Solution (Bug-only)** — Step 3. Skipped for non-Bug issue types. `--reply-to` posts them as a comment reply instead of editing fields.
- **Transitions** — Steps 4–5 and 7. Use `getTransitionsForJiraIssue` with `sortByOpsBarAndStatus: true` for every lookup.
- **No-fallback guard** — if an expected transition is missing, do NOT substitute a global transition; stop, report the missing transition and the available list, and ask the user.
- **Worklog** — Step 6 (`--time`).
- **QA Ready** — Step 7 ("QA Ready" or "Skip Code Review").

---

## Notes

- ship.md coordinates; **all Jira transition code lives in `update-ticket-fields.md`** and is never duplicated here.
- Always use ADF objects (not plain strings) for Jira textarea custom fields and comments.
- Extract the GitLab token from the remote URL — never hardcode it.
- If the branch name has no Jira ticket pattern and `--ticket` is not provided, **ask the user** before proceeding (unless `--skip-jira`).
- In MR mode, `--labels` is required — ask before proceeding if absent.
- `--commit` and `--skip-commit` are mutually exclusive; `--commit` wins if both are given.
- Report each step's result as it completes.
