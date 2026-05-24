---
name: ship-pr
description: Commit all changes, push the current branch, and open a pull request against the default branch. Stages safely (skips .env / credentials / secrets), writes a commit message that matches the repo's style, runs through pre-commit hooks, and creates the PR with a summary and test plan. Use when user says "ship it", "open a PR", "ship the PR", or has finished a unit of work and wants it reviewed.
---

# /ship-pr — Open a Pull Request from Current Work

Take the current local state — staged, unstaged, and untracked changes — and turn it into a pull request ready for review. End-to-end: stage → commit → push → PR.

## Process

**Phase 1 — Review what's about to ship.**

```bash
git status
git diff
```

Read both completely. Confirm with the user if anything looks unexpected. **Never proceed past a hard surprise** — if there are uncommitted changes that don't belong to this PR, ask before staging.

**Phase 2 — Stage safely.**

Stage only the files that belong to this PR. **Do not stage** `.env`, `.env.local`, files containing API keys, files containing private keys, or anything in a `secrets/` directory. Prefer `git add <path>` over `git add -A` or `git add .`, which can sweep in sensitive files.

If the user has a `.gitignore` that already covers secrets, double-check the diff one more time before committing — gitignore drift is a common way for secrets to leak.

**Phase 3 — Write the commit message.**

Run `git log -n 10 --oneline` to read the repo's commit style. Match it. Common conventions:

- **Conventional Commits**: `feat(scope): ...`, `fix(scope): ...`, `chore(scope): ...`
- **Imperative voice**: "Add X" not "Added X" or "Adds X"
- **Subject line ≤ 72 chars**, body separated by a blank line
- **Body explains why, not what** — the diff shows the what

Draft the message, show it to the user before committing.

**Phase 4 — Commit.**

```bash
git commit -m "$(cat <<'EOF'
<your message>
EOF
)"
```

**If pre-commit hooks fail:** read the failure, fix the underlying issue, restage, recommit. **NEVER use `--no-verify`.** Hooks exist for a reason; bypassing them ships broken code.

**Phase 5 — Push.**

```bash
# If first push of this branch
git push -u origin <branch>

# If branch already exists on remote
git push
```

Use `-u` only if the branch hasn't been pushed before. Refuse to force-push unless the user explicitly asks for it and confirms the branch is solely owned by them.

**Phase 6 — Open the PR.**

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<1-3 bullets explaining what changed and why>

## Test plan
- [ ] <how to verify, step 1>
- [ ] <how to verify, step 2>
EOF
)"
```

Match the repo's PR template if one exists (`.github/pull_request_template.md`). Print the PR URL when done.

## Pitfalls

- **Don't ship secrets.** Triple-check the staged diff. If anything looks like a credential, stop.
- **Don't use `--no-verify`.** If hooks fail, fix the underlying problem. This is a hard rule.
- **Don't force-push without asking.** Especially not to a shared branch.
- **Don't commit unrelated work.** If `git diff` shows changes from two different tasks, split them. One PR = one logical change.
- **Don't omit the test plan.** "Tested locally" is not a test plan. Spell out the steps so the reviewer can repro.

## Pairs with

- `/engineering:careful-review` — fresh-eyes pass on what you're about to ship.
- `/engineering:code-review` — pre-merge review of someone else's PR.
- `/engineering:codex-review` — second opinion from Codex against the base ref.
- `/engineering:topr` — rebase a stacked PR onto latest main before shipping the next one in the stack.
