# /pace cleanup

Sweep the leftovers of finished development (stale dev documents and artifacts, merged branches, closeable tickets) and clear them out **safely**. This is the engineering suite's housekeeping pass: run it after an epic ships, before a release, or whenever the working tree and trackers have accreted dead weight.

`cleanup` is conservative by default. It **inventories first, proposes second, and only removes what you confirm**, using reversible operations so nothing is unrecoverable. It never deletes on its own.

## When to use

- An epic or feature just landed and left planning docs, scratch notes, and a thicket of merged branches behind.
- Before tagging a release, to make sure the repo and trackers reflect only live work.
- A periodic tidy of issues and tickets that are done but never closed.

Not for: deleting working code, removing real product docs, or force-pruning unmerged work. Those are out of scope. Surface them, don't touch them.

## What it sweeps

1. **Local dev files:** stale planning and scratch artifacts such as `todo.md`, `plan.md`, `prompt_plan.md`, spec drafts, `session_*.md` summaries, dated notes, orphaned test fixtures, and dead build output (`dist/`, `build/`, generated bundles) that lingers in the tree.
2. **Git branches:** local and remote-tracking branches whose work already merged into the main branch, plus branches tied to a merged or closed PR.
3. **GitHub issues and PRs:** issues whose linked PR has merged, stale draft PRs, and tickets the team finished but never closed. Lean on the `gh` CLI.
4. **Linear tickets:** tickets in a Done or Canceled state that still carry open-work clutter, or whose shipping work has clearly landed. Lean on the `linear` skill.

"Composites" here means development documents and artifacts, the residue of building, not the product itself.

## Never touch

These are off-limits regardless of how stale they look. If one seems like a candidate, report it as a question; don't act.

- The **changelog / "What's New"** block in `site/pages/index.astro` (a tracked release artifact; see project CLAUDE.md).
- `PRODUCT.md`, `DESIGN.md`, `README*.md`, `NOTICE.md`, `LICENSE`, `CLAUDE.md`.
- Committed harness build outputs (`.claude/`, `.cursor/`, `.codex/`, and the rest). These are intentional, not cruft.
- Anything under `plugins/` that is an imported upstream plugin (editing forks us from Anthropic).
- **Unmerged** branches, **open** issues with active work, and any file still imported or referenced by live code.

## Workflow

### 1. Inventory (read-only)

Touch nothing. Build a candidate list across all four sources using read-only commands:

```bash
# Branches already merged into the main branch
git branch --merged main | grep -v -E '^\*|main$'
git branch -r --merged main

# Last commit that touched a doc (review before judging; old is not dead)
git log -1 --format='%ci' <path>

# Closeable GitHub work
gh issue list --state open --json number,title,labels
gh pr list --state open --draft --json number,title,updatedAt
```

For Linear, invoke the `linear` skill to list Done and Canceled tickets. For local files, prefer `ast-grep` and reference checks to confirm a file is genuinely orphaned (no live import or link) before flagging it.

### 2. Classify and propose

Present a categorized manifest. For every candidate give: the item, the **reason** it looks removable, the **proposed action**, and a **confidence** (high, or needs-a-look). Group by the four sources. Nothing is removed in this step.

Flag anything from the **Never touch** list separately as "surfaced, not actioned" so the user decides.

### 3. Confirm

Ask STOP and call the `question` tool to clarify. which categories or individual items to proceed with. Default to per-category confirmation; drop to per-item when confidence is mixed. No blanket "delete everything"; if the user wants that, they say so explicitly.

### 4. Execute (confirmed items only, reversibly)

Prefer the recoverable operation every time:

- **Branches:** `git branch -d` (safe delete, refuses unmerged). Never `-D` without explicit per-branch approval.
- **Remote branches:** `git push origin --delete <branch>` only after confirming the PR merged.
- **Files:** `git rm` so they stay in history, or move to a scratch dir. Never an unrecoverable `rm` of untracked work without confirmation.
- **GitHub issues and PRs:** `gh issue close` and `gh pr close` (close, never delete). Add a closing comment noting why.
- **Linear:** archive or close via the `linear` skill. Never hard-delete.

Never use `--no-verify` or bypass hooks. If a commit is needed for `git rm`, follow the normal pre-commit flow.

### 5. Report

Summarize: what was removed (and how to recover it), what was kept and why, and what was surfaced for the user to decide. Leave the tree and trackers in a state where every remaining item maps to live work.

## Guardrails

- **Dry-run is the default.** No destructive action before step 3's confirmation.
- **Reversible over permanent.** Close, archive, `git rm`, `branch -d`; never the irreversible variant by default.
- **When unsure, surface instead of sweeping.** A doc that might still matter is reported as a question, not deleted.
- **Old is not dead.** Last-modified age is a signal, not a verdict; confirm a file is unreferenced before flagging it.
