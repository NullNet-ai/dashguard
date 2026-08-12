# Update Ticket Fields

Updates a Jira ticket from a commit (commit link comment, Investigation & Solution for Bugs only), then transitions the ticket to QA Ready.

## Arguments

`$ARGUMENTS` format (all optional, space-separated):
- `--ticket <key>` — Jira ticket key (e.g. `WP-754`); required if branch name has no ticket pattern
- `--commit <id|range>` — Single commit SHA (e.g. `4f64a176`) OR a range endpoint (e.g. `4f64a176` means `4f64a176..HEAD`). Explicit range syntax also accepted: `4f64a176..HEAD`. **required**
- `--time <duration>` — Jira worklog to log (optional; if omitted, skip time logging)
- `--reply-to <url>` — Jira comment URL; Bug tickets only; skips field update; posts investigation+solution as new comment reply instead

If the Jira ticket key cannot be derived from the branch name and `--ticket` was not provided, **stop and ask the user** for the ticket key before proceeding.

If `--commit` is not provided, **stop and ask the user** for the commit ID.

---

## Step 1 — Read commits and get Jira issue details

**Resolve commit range:**
1. If `--commit` value contains `..` → treat as explicit range (e.g., `abc123..HEAD`)
2. Else → run `git log --oneline <commit-id>..HEAD`:
   - Non-empty output → range mode: use `<commit-id>..HEAD`
   - Empty output → single-commit mode: use `<commit-id>`

**Collect commits:**
- Range mode: `git log --reverse <range>` → extract list of commit SHAs
- Single mode: list = `[<commit-id>]`
- For each SHA: `git show <sha>` → retrieve full diff, commit message, and metadata

**Parallel work:**
- `getJiraIssue` — retrieve `issuetype` and `status` fields

---

## Step 2 — Post commit link comment (all issue types)

Run `git config --get remote.origin.url` to get the repo remote URL.

**Single-commit mode:**
- Construct the commit link (e.g. `https://gitlab.com/org/repo/-/commit/<hash>`)
- Call `addCommentToJiraIssue` with `contentFormat: "adf"` and a `commentBody` ADF doc containing:
  - A paragraph: `Commit:` followed by an ADF inline link node to the commit URL (link text = short SHA)

**Range mode:**
- Construct commit links for each SHA in the range
- Call `addCommentToJiraIssue` with `contentFormat: "adf"` and a `commentBody` ADF doc containing:
  - A paragraph: `Commits:`
  - A bulletList with one item per commit, each item an ADF inline link node to the commit URL (link text = short SHA)

---

## Step 3 — Fill Investigation & Solution (Bug tickets only)

**If the issue type is NOT Bug: skip this step entirely.**

**If the issue type IS Bug and `--reply-to` is NOT present:**

**Single-commit mode:** Use `editJiraIssue` with ADF format (plain paragraph nodes — no markdown):
- `customfield_10042` (Issue Investigation): describe **what was wrong and why** — root cause, missing fields, incorrect behavior, or state issue. Infer from the commit message and diff.
- `customfield_10109` (Solution): describe **what was changed and how** — files modified, logic added or removed, and resulting behavior. Infer from the diff.

**Range mode:** Use `editJiraIssue` with ADF format (plain paragraph nodes — no markdown):
- `customfield_10042` (Issue Investigation): synthesize **what was wrong and why** across all commits in the range — root cause, missing fields, incorrect behavior, or state issue. Do not list per-commit; produce one cohesive narrative. Infer from all commit messages and diffs.
- `customfield_10109` (Solution): synthesize **what was changed and how** across all commits — files modified, logic added or removed, and resulting behavior. Optionally reference commit SHAs if helpful for tracing the changes.

Both fields use ADF `doc` structure:
```json
{
  "version": 1,
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "..." }]
    }
  ]
}
```

**If the issue type IS Bug and `--reply-to` IS present:**
1. Parse the `--reply-to` URL:
   - Extract issue key: match regex `[A-Z]+-\d+` in the URL path (use this instead of branch-derived key)
   - Extract comment ID: parse the `focusedCommentId` query parameter value
2. Generate investigation + solution content from the commit diff(s) (what was wrong, why, what changed, how)
3. Call `addCommentToJiraIssue` on the extracted issue key with:
   - `contentFormat: "adf"`
   - `commentBody` as ADF with these sections:
     - Opening paragraph: `Re: <full comment URL>`
     - Small paragraph: `Commit(s):` + ADF link(s) to commit URL(s) (single or bulleted per range)
     - Heading: `Issue Investigation`
     - Paragraph(s): investigation content
     - Heading: `Solution`
     - Paragraph(s): solution content
   - Use plain ADF paragraph/heading nodes; do not embed markdown

---

## Step 4 — Advance to "In Development" if needed

The workflow order for this project is: **To Do → Dev Ready → Dev Planning → In Development → Done Local → QA Ready**

Use the `status` already fetched in Step 1 (no second `getJiraIssue` needed).

Execute **only** the transitions needed to reach "In Development" from the current status:
- **At "To Do"**: three transitions: To Do → Dev Ready → Dev Planning → In Development
- **At "Dev Ready"**: two transitions: Dev Ready → Dev Planning → In Development
- **At "Dev Planning"**: one transition: Dev Planning → In Development
- **At "In Development"**: skip this block; proceed to step 5
- **At "Done Local" or beyond**: skip steps 4 and 5; proceed to step 6

For each transition, call `getTransitionsForJiraIssue` with `sortByOpsBarAndStatus: true` to find it, then `transitionJiraIssue` to execute it. The `sortByOpsBarAndStatus` flag is required — without it, non-global transitions like "Start Work" (→ In Development) are omitted from the response.

**If the expected transition is not found, do NOT fall back to any other transition** (e.g. never use the global "Done" or "R&D" transitions as substitutes). Stop, report which transition was missing and list all available transitions, and ask the user how to proceed.

---

## Step 5 — Transition → Done Local

If the ticket is now at "In Development" (after step 4), use `getTransitionsForJiraIssue` with `sortByOpsBarAndStatus: true` to find the "Done Local" transition, then `transitionJiraIssue`.

If the ticket was already at "Done Local" or beyond before step 4, skip this step.

---

## Step 6 — Log time (optional)

If `--time` was provided, use `addWorklogToJiraIssue` with `timeSpent` = value of `--time`. If `--time` was not provided, skip this step.

---

## Step 7 — Transition → QA Ready

Use `getTransitionsForJiraIssue` with `sortByOpsBarAndStatus: true` to find the "QA Ready" or "Skip Code Review" transition, then `transitionJiraIssue`.

---

## Notes

- Step 2 (commit link comment) always runs regardless of issue type.
- Step 3 (Investigation & Solution fields) runs **only for Bug** issue types — skip for Story, Task, etc.
- Always use ADF objects (not plain strings) for Jira textarea custom fields.
- If the branch name does not match a Jira ticket pattern (e.g., `WP-NNN`) and `--ticket` is not provided, **ask the user** for the ticket key before proceeding.
- When using `--reply-to` (Bug only), the investigation & solution content goes to a **new comment** on the issue, not to custom fields. All other Jira steps (transitions, worklog, QA transition) execute normally.
- Report each step's result as it completes.
