<!-- pace:start -->
# How we work with an agent (Pace)

Short on purpose: this file is read on every request. The longer instructions live in `.github/skills/` and are read only when a task needs them.

## Before writing code

- When a task matches a skill in `.github/skills/<name>/SKILL.md`, read that file first and follow it. The slash commands in `.github/prompts/` do the same thing.
- If what to build is unclear, ask in chat before building. One question at a time, with your recommended answer.
- Work one issue at a time. Keep each change small, and cut it as a thin slice through every layer it touches (schema, service, screen), so something runs end to end.

## While writing code

- Test first: write one failing test for the behaviour, watch it fail for the right reason, then write the smallest change that passes, then tidy.
- Never edit a test to make it pass, and never skip or delete a failing one. Say why it fails instead.
- Prefer deep modules: a small interface with a lot of behaviour behind it. Do not spread one concept over many small files.
- Keep to the patterns already in the codebase. Match its style, even where you would choose differently.

## Before saying it is done

- Run every check the repo has: tests, type check, lint, build. All of them must pass. Paste the result.
- Summarise what changed, what was tested, and anything you were unsure about.

## Never

- Force-push, rewrite shared history, or bypass hooks and checks.
- Delete files or data without being asked.
- Claim something works that you did not run.
<!-- pace:end -->
