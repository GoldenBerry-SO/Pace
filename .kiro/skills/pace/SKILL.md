---
name: pace
description: Use when the user invokes a /pace sub-command, or wants a company-standard way to do work across engineering, product, ops, marketing, or other functions. Provides shared vocabulary and repeatable processes between humans and AI coding agents. Not for one-off code tasks that don't match a sub-command.
version: 0.2.0
license: Apache 2.0. Scaffold based on impeccable (https://impeccable.style). See NOTICE.md.
---

Pace is the GoldenBerry company-wide skill router. One entry point (`/pace`), many sub-commands, each one a repeatable way of working that humans and AI agents can share.

For frontend design specifically, pace defers to **impeccable**: install it alongside pace and call `/impeccable <command>` for design work. Pace covers everything else: engineering review, product specs, ops runbooks, marketing copy, and more as commands land.

## Setup

Before doing any work in a sub-command:

1. Load context (PRODUCT.md if present) via the loader script.
2. **Load the sub-command's reference file** from `reference/<command>.md`. Skipping this produces generic output that ignores the company's way of working.

```bash
node .kiro/skills/pace/scripts/load-context.mjs
```

Consume the full JSON output. The output's `contextDir` field tells you where the file was resolved from. If PRODUCT.md is missing, proceed but flag that pace works better with a project brief.

## Commands

Sub-commands live in `reference/<command>.md`. The router below is the source of truth; `bun run build` reads it to wire up the harness output dirs.

| Command | When to use |
| --- | --- |
| _(none yet)_ | Pace is in scaffold. Commands ship as they're authored. |

When the user types `/pace <command>` and the command isn't in the table above, respond: *"Pace doesn't have a `<command>` command yet. Want to author one? Drop a reference file at `skill/reference/<command>.md` and add a row here."*

## Pin / Unpin

Users can promote any pace command to a standalone top-level slash command with `node .kiro/skills/pace/scripts/pin.mjs <command>`. This creates a thin redirect so `/audit` (for example) delegates to `/pace audit`. `pin.mjs --unpin <command>` removes the shim.

The pin allowlist lives in `pin.mjs` (`VALID_COMMANDS`). Keep it in sync with the table above.