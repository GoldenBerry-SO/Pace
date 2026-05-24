---
name: codex-review
description: Run an OpenAI Codex code review on the current branch's changes against a base, extract findings, fix confirmed P0/P1 issues, and commit. Useful after a batch of work for a structured second opinion before shipping.
args:
  - name: base
    description: Base ref to diff against (default tries main, falls back to a reasonable recent commit if HEAD is on main).
    required: false
  - name: severity
    description: Lowest severity to fix automatically — "p0", "p1" (default), or "p2".
    required: false
user-invokable: true
---

Run a Codex code review on the current branch's recent changes, evaluate findings critically, and fix any that are confirmed bugs at or above the requested severity threshold.

## Verify codex is available

```sh
which codex || npx @openai/codex --version
```

If neither resolves, stop and tell the user the OpenAI Codex CLI isn't installed. Install instructions: `npm i -g @openai/codex`.

## Pick the right base

`codex review --base <ref>` needs a base that actually differs from HEAD. Check the current branch first:

```sh
git branch --show-current
git status --short
```

- **On a feature branch with main as upstream:** use `--base main` directly.
- **On main with no uncommitted changes:** there is nothing to review with `--base main` — pick the last natural review boundary instead. Reasonable picks:
  - `git merge-base main origin/main` if multiple commits are ahead of origin
  - The commit before the latest sprint / batch (use `git log --oneline -20` and pick a sensible boundary)
- **With uncommitted changes:** pass `--uncommitted` instead of `--base`.

Confirm the scope with the user before kicking off if the diff is >50 files / >5,000 LOC — large reviews take longer and waste credit on noise.

## Run the review

```sh
npx @openai/codex review --base <ref> 2>&1 | tail -250
```

Codex emits progress logs and then a final review block that starts with `codex` and lists `[Pn] Title — file:line` findings. Read the whole tail; the actual findings are usually at the very end.

## Evaluate each finding

For every P0 / P1 finding (or whatever the requested threshold is):

1. **Read the cited file and lines.** Don't trust the description alone — Codex can misread context.
2. **Decide: real bug, false positive, or intentional design choice.** Write your reasoning before changing anything.
3. **If real:** fix the smallest scope that addresses the root cause. Don't expand to unrelated cleanup.
4. **If false positive or intentional:** keep a note for the report; don't silently dismiss.

Common false positives:
- "Missing error handling" on internal calls where the framework already handles errors
- "N+1 query" warnings on already-aggregated tRPC sub-selects
- Suggestions to add features the project intentionally doesn't have

## Verify after fixing

After any code change:

```sh
pnpm --filter <package> typecheck   # or repo's equivalent
pnpm --filter <package> test
pnpm exec biome check --write <files>  # or repo's formatter/linter
```

Don't `git add` until typecheck + tests pass. If a fix fails CI locally, debug it before committing — never commit broken code to land a review.

## Commit

If anything was fixed:

```sh
git add <files>
git commit -m "fix: address P1 issues from Codex review"
```

Keep the commit narrow — only the review fixes. If you discovered unrelated issues, file them as TODOs or follow-up tasks rather than bundling them in.

## Report back

Always report:

- **Findings table:** severity, file:line, one-line summary
- **Verdict per finding:** Fixed / False positive (why) / Out of scope (P2 below threshold, etc.)
- **Verification:** which tests / typecheck / lint passed
- **Commit SHA** if anything was committed

If no findings or all P2 below threshold, say so explicitly so the user knows the review completed cleanly — silence is ambiguous.

## When to skip

Don't run this on tiny changes (typo fixes, single-line tweaks) — the review overhead isn't worth it. Use it after substantial work: a sprint, a refactor, a multi-file feature, anything you'd want a second pair of eyes on before shipping.
