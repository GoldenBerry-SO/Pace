# Project Instructions for Claude

Project-level instructions for any AI coding agent working in `pace.tools` — a curated marketplace of AI coding skills. This file overrides defaults. Read it before doing work.

## What pace is

Pace is **two things in one repo**:

1. **A company router** — one installable skill (`/pace`) that fans out to company-specific sub-commands. Lives in `skill/`. Starts empty; we add commands as we author them.
2. **A Claude Code marketplace** — a curated catalog of plugins under `plugins/`, primarily a verbatim import of [Anthropic's knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins). Sales, marketing, finance, legal, engineering, data, customer-support, product, HR, ops, design, and more.

**Current state:** the router ships one command, `cleanup`. Everything else a user sees comes from the plugins.

The marketplace is registered via `.claude-plugin/marketplace.json`, which is the source of truth for the catalog. Four kinds of entry live there: the pace router (`source: "./plugin"`), the first-party Anthropic plugins, the partner-built ones, and external vendor plugins referenced by git URL and pinned to a commit. Count anything you need to quote from that file rather than from a doc.

## Changelog: do not edit without permission

The "What's New" / changelog section of `site/pages/index.astro` (the `<section class="section changelog" id="changelog">` block) is a tracked artifact tied to releases. **Do not modify it as part of broader copy work, redesigns, clarify passes, or any task that didn't explicitly request a changelog edit.** Touch it only when:

- The maintainer explicitly asks for a changelog entry by name, or
- A release is being tagged (via `bun run release:*` or similar).

If a sweep otherwise wants to touch the changelog (e.g. a global plugin-count update), surface the intended edit to the maintainer and wait for the call before applying it inside that block.

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

plugin/                     ← GENERATED plugin subtree for the router (build output)

plugins/                    ← THE MARKETPLACE (verbatim Anthropic imports)
├── sales/
│   ├── .claude-plugin/plugin.json   ← Anthropic's manifest, untouched
│   ├── skills/<skill>/SKILL.md      ← Anthropic's skills
│   ├── .mcp.json                    ← Anthropic's connector config
│   ├── CONNECTORS.md                ← which MCP servers the skills expect
│   └── README.md
├── marketing/
├── … the rest of the first-party roles
└── partner-built/
    ├── apollo/                       ← Apollo.io
    ├── brand-voice/                  ← Tribe AI
    └── … the rest of the vendors

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

## Build system

Same shape as impeccable. `bun run build:skills` reads `skill/` and writes a per-harness transformed copy for each of the 13 providers in `scripts/lib/transformers/providers.js` (`.claude/`, `.cursor/`, `.agents/`, `.codex/`, `.gemini/`, `.kiro/`, `.opencode/`, `.pi/`, `.qoder/`, `.rovodev/`, `.trae/`, `.trae-cn/`, `.github/`). It also rebuilds the Claude Code plugin subtree at `plugin/`, which is what `marketplace.json` points at for the router.

Twelve of those directories are synced back to the repo root and **committed**, so an installer can read the skills straight from the repo. Don't gitignore them. `.codex/` is the exception: the build keeps that layout under `dist/` only, and `.gitignore` covers the root copy.

`bun run build` runs four steps in order: `build:skills`, `build:marketplace` (copies `marketplace.json` into `site/public/`), `build:agent-discovery` (writes the `/.well-known/agent-skills` index), then `build:site`.

Source placeholders that get replaced per-provider:
- `{{model}}` — Model name (Claude, Gemini, GPT, etc.)
- `{{config_file}}` — Config file name (CLAUDE.md, .cursorrules, etc.)
- `{{ask_instruction}}` — How to ask user questions
- `{{command_prefix}}` — `/` or `$` depending on provider
- `{{available_commands}}` — auto-populated list
- `{{scripts_path}}` — provider-aware path

## Install flow

Plugins install through Claude Code. `claude plugin marketplace add GoldenBerry-SO/Pace` registers the catalog as `pace`, then `claude plugin install <name>@pace` installs one. Cowork does the same through its Plugins pane.

`npx pace-tools` wraps those calls: `list`, `install`, `uninstall`, `status`, `marketplace add|remove`, `teams`, `open`. It refuses to run without the `claude` binary on PATH. The dispatcher is `cli/bin/cli.js`; every sub-command lives in `cli/bin/commands/marketplace.mjs`.

`pace skills <verb>` is a deprecated shim kept so old docs and bookmarks still land somewhere: `install` now prints a notice and falls through to `marketplace add` + `list`. The older installer at `cli/bin/commands/skills.mjs` is no longer wired into the CLI.

Keep the impeccable handoff explicit wherever it appears: design = impeccable, not a renamed pace command.

## Site

Astro at `site/`, with `srcDir: ./site` and `outDir: ./build`. `bun run dev` for the dev server, `bun run preview` to build and serve the output. CSS architecture and build validators copied from impeccable.

The prose validators are on. `validateProse` scans the site plus `README.md` and `README.npm.md`; `validateSkillProse` scans `skill/` with a tighter list. Both reject em dashes, the ` -- ` substitute, and a denylist of AI-tell phrases. Add a rule to `scripts/build.js` if a new one earns its place.

CI (`.github/workflows/ci.yml`) runs `bun install`, `bun run build:skills` and `bun run build:site` on every push and pull request to `main`. There is no local git hook in this repo; the build is the gate.

## Working agreements

- Push back when you have evidence; don't just take instructions on face value.
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
