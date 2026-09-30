# Pace for GitHub Copilot

The engineering skills from Pace, in the shape GitHub Copilot reads. One command puts them into a repo's `.github/` folder; from then on `/grill-me`, `/to-prd`, `/to-issues`, `/tdd` and the rest are slash commands in Copilot chat, the coding agent follows the same rules when it takes an issue, and a `@reviewer` agent reads pull requests against the standards.

## Install

From the root of the repo you want Copilot to work in:

```bash
curl -fsSL https://raw.githubusercontent.com/GoldenBerry-SO/Pace/main/copilot/install.sh | sh
```

or, on Windows or if you prefer npm:

```bash
npx pace-tools copilot
```

Both add files and never delete yours. A skill, prompt or agent that already exists is kept unless you pass `--force`. Your `copilot-instructions.md` is kept; Pace's rules are added as a block between `<!-- pace:start -->` and `<!-- pace:end -->` markers, and a later run refreshes only that block. `--dry-run` shows what would change.

Then commit `.github/` so the whole team, and the coding agent, get the same setup.

## What lands where

| File | What Copilot does with it |
|---|---|
| `.github/copilot-instructions.md` | Read on every request. Pace adds a short block: one issue at a time, test first, run every check, read the matching skill. Keep the whole file under a screen. |
| `.github/skills/<name>/SKILL.md` | Agent skills, read when a task matches. The full instructions for each command, with their reference files. |
| `.github/prompts/<name>.prompt.md` | Slash commands in Copilot chat: `/grill-me`, `/to-prd`, `/to-issues`, ... Each one reads its skill and applies it to what you typed after it. |
| `.github/agents/reviewer.agent.md` | A custom agent: `@reviewer` reads a diff in a fresh context against the standards and says approve or send back. |

## The commands

The five-step flow from the talk, then the rest:

| Command | What it does |
|---|---|
| `/grill-me <brief>` | Interviews you, one question at a time with a recommended answer, until you and the agent agree on what to build |
| `/to-prd` | Writes the destination down from that conversation: problem, solution, user stories, decisions, out of scope, the modules to touch |
| `/to-issues` | Slices the PRD into issues that each cut through every layer, marks which can run unattended, and files them |
| `/tdd` | Red, green, refactor: one failing test, the smallest change that passes, tidy, repeat |
| `/code-review`, `/careful-review`, `/security-review` | A second reading of a change, each with its own lens |
| `/improve-codebase-architecture` | Finds clusters of small modules that belong together and proposes one deep module and one test boundary for each |
| `/setup-engineering-skills` | Run once per repo: tells the skills where issues live, which labels you use and where your docs are |
| everything else in `.github/skills/` | Debugging, incidents, documentation, deploy checklists, stacked pull requests, triage, and more |

`git-guardrails-claude-code` is the one engineering skill left out: it installs Claude Code hooks and has no Copilot equivalent.

## How it is built

`copilot/.github/` is generated from `plugins/engineering/skills/` by `node copilot/build.mjs` and committed, so the skills stay the single source of truth. The rules that turn a Claude Code skill into a Copilot one are in `copilot/transform.mjs`, and `copilot/test/` pins every one of them. Edit a skill, rebuild, commit the output; CI fails if the two drift.

Copilot's file layout moves. Check the locations above against the current docs before a workshop.
