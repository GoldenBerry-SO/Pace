# Project Instructions for Claude

You are **Skidmark Diesel**, working with **Krispatron 3000** (aka Chris) on `pace.tools` — a curated marketplace of AI coding skills. This file overrides defaults. Read it before doing work.

## What pace is

Pace is **two things in one repo**:

1. **A company router** — one installable skill (`/pace`) that fans out to company-specific sub-commands. Lives in `skill/`. Starts empty; we add commands as we author them.
2. **A Claude Code marketplace** — a curated catalog of plugins under `plugins/`, primarily a verbatim import of [Anthropic's knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins). Sales, marketing, finance, legal, engineering, data, customer-support, product, HR, ops, design, and more (~150 skills).

The marketplace is registered via `.claude-plugin/marketplace.json` (49 plugin entries: pace + 17 first-party Anthropic + 5 partner-built + 27 external by git URL).

**Pace does not duplicate impeccable.** For code-level frontend design, pace defers to impeccable. The `npx pace skills install` CLI offers impeccable alongside.

## Origin

This repo combines three lineages:

- **Pace's router + scaffold:** original work by Chris Jimenez. Apache 2.0.
- **Build system + install tech:** forked from [impeccable](https://github.com/pbakaus/impeccable) by Paul Bakaus. Apache 2.0.
- **Imported plugins:** copied from [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) and the partner-built additions. Apache 2.0, attributed in `NOTICE.md`.

Pace does NOT include impeccable's anti-pattern detector, Chrome extension, or live-mode browser tooling.

## Architecture

### Two halves, separate trees

```
skill/                      ← THE PACE ROUTER (our work)
├── SKILL.md                ← /pace router, sub-command table
├── reference/<cmd>.md      ← one file per /pace sub-command
└── scripts/                ← load-context, pin, cleanup

plugins/                    ← THE MARKETPLACE (verbatim Anthropic imports)
├── sales/
│   ├── .claude-plugin/plugin.json   ← Anthropic's manifest, untouched
│   ├── skills/<skill>/SKILL.md      ← Anthropic's skills
│   ├── .mcp.json                    ← Anthropic's connector config
│   └── README.md
├── marketing/
├── … 15 more first-party
└── partner-built/
    ├── apollo/                       ← Apollo.io
    ├── brand-voice/                  ← Tribe AI
    └── … 3 more

.claude-plugin/marketplace.json       ← Registers BOTH pace and every plugin
```

### Why two halves

- **Different patterns.** Pace's `/pace` uses single-router-with-sub-commands. The imported plugins use Anthropic's pattern: each plugin has many auto-triggering independent skills, namespaced via slash commands (`/sales:call-prep`).
- **Different ownership.** Pace router = our code, we evolve. Imported plugins = upstream code, we sync from Anthropic. Editing imported plugins forks us from upstream — do it deliberately.
- **Different install granularity.** Users install `pace` for the router; install `sales`, `data`, etc. individually for what they need. Don't bundle.

### Adding to the pace router

1. Create `skill/reference/<command>.md`.
2. Add a row to the **Commands** table in `skill/SKILL.md`.
3. Add metadata to `skill/scripts/command-metadata.json`.
4. Add the name to `PACE_SUB_COMMANDS` in `scripts/lib/utils.js`.
5. Add it to `VALID_COMMANDS` in `skill/scripts/pin.mjs`.
6. Run `bun run build` to fan out to all harness output dirs.

### Adding/updating a plugin in the marketplace

For Anthropic upstream sync: `rsync -a /path/to/knowledge-work-plugins/<plugin>/ plugins/<plugin>/` then update version in `marketplace.json` if it shifted.

For a new company-authored plugin: create `plugins/<name>/` with `.claude-plugin/plugin.json` + `skills/<skill>/SKILL.md` + optional `.mcp.json`. Then add an entry to `.claude-plugin/marketplace.json` with `source: "./plugins/<name>"` and `author: { name: "Your Company" }`.

**Do not edit imported plugins under `plugins/` casually.** That forks us from Anthropic and breaks `git pull`-style upstream syncs. If you must customize, copy to a new name (e.g., `plugins/sales-custom/`) and edit there.

### Adding a new command

1. Create `skill/reference/<command>.md`.
2. Add a row to the **Commands** table in `skill/SKILL.md`.
3. Add metadata to `skill/scripts/command-metadata.json`.
4. Add the name to `PACE_SUB_COMMANDS` in `scripts/lib/utils.js`.
5. Add it to `VALID_COMMANDS` in `skill/scripts/pin.mjs`.
6. Run `bun run build` to fan out to all harness output dirs.

## Build system

Same shape as impeccable. `bun run build` reads `skill/` and writes a per-harness transformed copy to each of the 13 harness output dirs (`.claude/`, `.cursor/`, `.agents/`, `.codex/`, `.gemini/`, `.kiro/`, `.opencode/`, `.pi/`, `.qoder/`, `.rovodev/`, `.trae/`, `.trae-cn/`, `.github/`).

These harness dirs are **build outputs that should be committed** so `npx pace skills install` can read them straight from the repo. Don't gitignore them. They're empty in the initial scaffold; run `bun run build` after editing `skill/` to populate, then commit.

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
