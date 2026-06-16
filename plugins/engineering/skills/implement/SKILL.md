---
name: implement
description: Implement an existing epic as a chain of stacked PRs, one per sub-issue, in order. Use when user wants to implement an epic, build out a planned feature, or execute on a `/spec`-produced plan. Pairs with `/spec` (planning) and `/review` (PR comment handling).
argument-hint: "<epic issue number>"
---

# /implement — Implement an Epic as Stacked PRs

Takes an existing epic (created by `/spec`) and implements each sub-issue in a stacked branch, opening one stacked PR per sub-issue. Does NOT create or modify tracker issues — that is `/spec`'s job.

## Instructions

When the user runs `/implement <epic-issue-number>`, follow this workflow:

### Phase 1: Read the Epic

1. Fetch the parent issue and all linked sub-issues from this repo's issue tracker (see `docs/agents/issue-tracker.md` for the per-repo command). Examples:
   ```bash
   gh issue view <epic-number>      # GitHub
   glab issue view <epic-number>    # GitLab
   bd show <epic-id>                # Beads
   ```
2. List the sub-issues in order and confirm the implementation sequence with the user before writing any code.

### Phase 2: Implement in Stacked Branches

For each sub-issue, in order:

1. **Check the sub-issue for a "Recommended model" section.** If present, the implementation MUST run on that model:
   - If you are already running as that model, proceed directly.
   - Otherwise, delegate the implementation of this sub-issue to a subagent launched with that model override (the Agent tool's `model` parameter: `haiku`, `sonnet`, `opus`, or `fable`), passing it the full sub-issue context and the steps below.
   - If the section is absent, proceed on the current model.

2. **Create the branch** — stacked on the previous (first branch is from `main`):
   ```bash
   git checkout -b <branch-name>
   ```
   Branch naming: mirror the sub-issue title slug, e.g. `refactor/proto-rename-action-type-think`, `feat/llm-inference-interface`.

3. **Implement the code changes** for this sub-issue only. Do not include changes belonging to later sub-issues.

4. **Build and test** before committing:
   ```bash
   go build ./... && make test
   ```

5. **Commit** with Conventional Commits + issue reference:
   ```
   type(scope): description

   <summary of what changed and why>

   Closes #<sub-issue>
   ```

6. **Push** the branch:
   ```bash
   git push origin <branch-name>
   ```

### Phase 3: Create Stacked PRs

For each branch, create a PR targeting the **previous branch** (not `main`), except the first which targets `main`:

```bash
gh pr create \
  --base <previous-branch-or-main> \
  --head <this-branch> \
  --title "type(scope): description" \
  --body "..."
```

Every PR body must contain:
- `Closes #<sub-issue>` — wires the sub-issue to auto-close on merge (GitHub/GitLab). For Beads, write `Closes <bead-id>` and run `bd close <bead-id>` after merge (or configure `bd hooks` to do it from a post-merge hook).
- `Part of #<parent-epic>` — links back to the epic (use the bead ID for Beads)
- `Stacked on #<previous-PR>` — for PRs 2 and beyond

### Phase 4: Update the Parent Issue

Edit the parent issue body to mark each step as done with its sub-issue and PR numbers, using whichever invocation matches this repo's issue tracker:

```bash
gh issue edit <epic-number> --body "..."             # GitHub
glab issue update <epic-number> --description "..."  # GitLab
bd update <epic-id> --body-file -                    # Beads (pipe new body on stdin)
```

Checklist format:
```markdown
- [x] #<sub-issue-1> — type(scope): description → PR #<pr-1>
- [x] #<sub-issue-2> — type(scope): description → PR #<pr-2>
```

### Rules

- Do NOT create or edit sub-issues — those already exist from `/spec`
- One branch = one commit = one PR = one sub-issue; never combine steps
- Always build and test before committing each branch
- Stacked PRs must NOT target `main` except the first — targeting `main` breaks the stack
- Confirm the implementation plan with the user before writing any code
