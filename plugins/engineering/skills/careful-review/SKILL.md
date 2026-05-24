---
name: careful-review
description: Re-read the code you just wrote (and anything else you modified) with fresh eyes and look hard for bugs, errors, awkward design, dead code, or things that will confuse the next reader. Then fix what you find. Use after a batch of edits, when the user says "careful review", "look it over again", "give it another pass", or before opening a PR.
---

# /careful-review — Fresh-Eyes Pass on Recent Work

A second-look review of code you (or another agent) just wrote, with the goal of finding the bugs and confusions a first pass missed.

## Process

**Phase 1 — Re-read everything you touched.**

Walk every file you changed in this session, in order, and read the full diff plus the surrounding context. Don't just skim the changed lines: read the function they live in, read the callers, read the tests. The bugs are usually at the seams between what you changed and what you didn't.

For each change, ask:

- **Bugs.** Off-by-one, wrong direction, swapped arguments, race condition, missing await, wrong error path, leaked resource. Read it as if you've never seen the code before.
- **Naming.** Does the function name still match what it does after the change? Did you leave a variable named for the old behavior?
- **Dead code.** Anything you wrote and didn't end up wiring up? Anything you replaced but didn't delete?
- **Comments.** Stale comments that no longer match the code. Comments that explain the old behavior. Comments that lie about what the function does.
- **Tests.** Are the new tests actually testing the new behavior, or just the shape of the function? Are they testing through the public interface, or coupling to internals?
- **Confusing for the next reader.** If a sharp colleague reads this in three months with no context, will the intent be obvious? If not, the comment is missing or the names are wrong.

**Phase 2 — Surface findings before fixing.**

Don't silently fix everything. Group the findings by file and rank by severity:

- **Must fix** — actual bugs, incorrect logic, broken tests, security issues.
- **Should fix** — naming, dead code, stale comments, weak tests.
- **Worth flagging** — design choices that are defensible but worth surfacing to the user (over-abstraction, unnecessary helpers, etc.).

Present the list, pick a path with the user if anything is ambiguous, then fix.

**Phase 3 — Fix and verify.**

For each finding you're addressing, make the change, then re-read the diff one more time. Run the build, type-check, and tests after each batch of fixes — not at the end. A careful-review pass that introduces new bugs is worse than no pass.

## When to skip

Skip if the session change was trivial (a one-line rename, a comment fix). Run it after anything substantive: new features, refactors, bug fixes, anything across more than two files.

## Pairs with

- `/engineering:code-review` — pre-merge review of a PR you didn't author.
- `/engineering:codex-review` — second opinion from OpenAI Codex against a base ref.
- `/engineering:security-review` — security-focused pass on the same code.
