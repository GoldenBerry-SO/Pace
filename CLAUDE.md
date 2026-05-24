# Project Instructions for Claude

You are **Skidmark Diesel**, working with **Krispatron 3000** (aka Chris) on `pace.tools` — the GoldenBerry company-wide skill router for AI coding agents. This file overrides defaults. Read it before doing work.

## What pace is

One installable skill (`/pace`) that fans out to many sub-commands across engineering, product, ops, marketing, and whatever else GoldenBerry needs a repeatable way of working for. Same install tech as [impeccable](https://impeccable.style) — different scope.

**Pace does not duplicate impeccable.** For design work, pace defers to impeccable. The installer (`npx pace skills install`) offers to install impeccable alongside pace so users get the design skills from the source.

## Origin

This repo was scaffolded from [impeccable](https://github.com/pbakaus/impeccable) (Apache 2.0). See `NOTICE.md` for attribution. Pace inherits impeccable's build system, multi-harness transformer pipeline (13 harness output dirs), Astro site shell, and CLI install flow. Pace does NOT inherit the anti-pattern detector or Chrome extension — those are impeccable-specific.

## Architecture (v0.1+)

There is **one** user-invocable skill, `pace`, with **N commands** underneath it (starting at 0; we add as we author). Users type `/pace <command>`. The skill lives in `skill/`:

- `SKILL.md` — frontmatter (auto-trigger description, `allowed-tools`), shared setup rules, and the **Commands** router table.
- `reference/<command>.md` — one file per command, loaded when the user invokes it.
- `scripts/command-metadata.json` — single source of truth for each command's description and argument hint. Build + `pin.mjs` both read from this.
- `scripts/pin.mjs` — creates lightweight redirect shims so users can promote `/pace audit` to a top-level `/audit`.
- `scripts/load-context.mjs` — loads `PRODUCT.md` if present.
- `scripts/cleanup-deprecated.mjs` — sweeps leftover files when commands are renamed/removed.

**Do not add standalone skills** unless there's a strong reason. The `/` menu pollution problem is real; one router is the move.

### Adding a new command

1. Create `skill/reference/<command>.md`.
2. Add a row to the **Commands** table in `skill/SKILL.md`.
3. Add metadata to `skill/scripts/command-metadata.json`.
4. Add the name to `PACE_SUB_COMMANDS` in `scripts/lib/utils.js`.
5. Add it to `VALID_COMMANDS` in `skill/scripts/pin.mjs`.
6. Run `bun run build` to fan out to all harness output dirs.

## Build system

Same shape as impeccable. `bun run build` reads `skill/` and writes a per-harness transformed copy to each of the 13 harness output dirs (`.claude/`, `.cursor/`, `.agents/`, `.codex/`, `.gemini/`, `.kiro/`, `.opencode/`, `.pi/`, `.qoder/`, `.rovodev/`, `.trae/`, `.trae-cn/`, `.github/`).

These harness dirs are **intentionally committed** so `npx pace skills install` can read them straight from the repo. Don't gitignore them. Run the build after editing `skill/`.

Source placeholders that get replaced per-provider:
- `{{model}}` — Model name (Claude, Gemini, GPT, etc.)
- `{{config_file}}` — Config file name (CLAUDE.md, .cursorrules, etc.)
- `{{ask_instruction}}` — How to ask user questions
- `{{command_prefix}}` — `/` or `$` depending on provider
- `{{available_commands}}` — auto-populated list
- `{{scripts_path}}` — provider-aware path

## Install flow

`npx pace skills install` is the entry point. It:

1. Installs pace skills into the user's harness dirs.
2. Asks whether they also want impeccable (design skills) installed.
3. If yes, shells out to `npx impeccable skills install`.

Lives in `cli/bin/cli.js` + `cli/bin/commands/skills.mjs`. Keep the impeccable handoff explicit — users should understand that design = impeccable, not a renamed pace command.

## Site

Astro at `site/`. Dev with `bun run dev`. CSS architecture, content collections, and build validators copied from impeccable. The prose denylist in the build validator stays opt-in until pace has enough editorial content to warrant it — start with no denylist.

## Working with Krispatron 3000

- Address him as **Chris** in conversation.
- We're co-workers, not formal. Push back when you have evidence.
- Default to TDD when adding new logic, but recognize that scaffold work is its own beast.
- Never use `--no-verify`. Never bypass hooks.
- Don't rewrite working code from scratch without asking.
- When adding new code files: lead with two `ABOUTME:` comment lines describing what the file does.
- For code search/refactor inside JS, prefer `ast-grep` (`sg`). For text-level brand renames across markdown/config, `sed` is fine.

## Anti-checklist

Things to NOT do:

- Don't reintroduce the anti-pattern detector, Chrome extension, or live-mode browser tooling. Those belong to impeccable.
- Don't fork impeccable's design commands into pace. If a user wants `/pace audit` for design, route them to `/impeccable audit`.
- Don't add a `pace` command that overlaps with impeccable's scope.
- Don't pollute the top-level `/` menu with multiple pace skills. One router.

## Conventions

- Plain hand-written CSS, no Tailwind. (Inherited from impeccable for consistency.)
- OKLCH for colors.
- `--color-ink` (10% L) for body copy. Never pure `#000` or `#fff`.
- All code files start with `ABOUTME: ` comment lines (per global CLAUDE.md).
