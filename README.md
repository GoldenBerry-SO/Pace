<div align="center">

<img src="./site/public/logo-svgs/pace-rabbit.svg" width="140" alt="Pace" />

# Pace

**AI specialists for every role at your company.**

Sales preps calls. Engineers ship PRs. Finance closes the month.
Marketing ships campaigns. Each role gets Claude tuned to their work and
connected to their real tools (HubSpot, Slack, Snowflake, Notion, Linear).

[pace.tools](https://pace.tools) &middot; [Cookbook](https://pace.tools/cookbook) &middot; [Docs](https://pace.tools/docs) &middot; [Catalog](https://pace.tools/plugins)

</div>

---

## What this is

Pace is a curated bundle of AI agents you install into [Cowork](https://claude.com/product/cowork)
(the Claude desktop app) or [Claude Code](https://claude.com/product/claude-code)
(the CLI). One agent per role, each one fluent in that role's vocabulary
and connected to the SaaS tools the team already uses.

- **49 plugins** spanning sales, marketing, engineering, data, product,
  finance, legal, ops, HR, customer support, design, and productivity.
- **MCP connectors** wire each plugin to your real tools. Authorize once,
  the agent works on your real data after that.
- **A `/pace` router** for the commands that are specific to your
  company. `/pace teach` captures how your team actually works once;
  everything else builds on it.
- **Open source**, Apache 2.0. Fork it, rename the router, replace the
  catalog. The install machinery comes along for free.

For front-end code-level design, Pace defers to
[impeccable](https://impeccable.style); the installer offers to bring it.

## Install

### Cowork (desktop, no terminal)

Open Cowork &rarr; **Plugins** &rarr; **Add marketplace** &rarr; paste:

```
GoldenBerry-SO/Pace
```

Then install whichever plugin matches your role: `sales`, `marketing`,
`engineering`, `data`, `finance`, ...

### Claude Code (terminal)

```bash
claude plugin marketplace add GoldenBerry-SO/Pace
claude plugin install sales@pace
```

Or use the guided picker:

```bash
npx pace-tools install
```

## Use

Just describe what you need. The skills auto-trigger from natural
language; you don't need to remember commands.

```text
Prep me for the Acme call tomorrow.
> sales / call-prep fires, pulls HubSpot history + recent news, drafts the brief.

Write a SQL query for monthly active users by plan tier, last 6 months.
> data / write-query takes over, drafts the query, runs it against Snowflake if connected.

Review this PR. Look for real bugs first.
> engineering / code-review takes the PR, reads the diff, posts comments.
```

For your team's own commands, use the `/pace` router:

```text
/pace teach          # one-time: capture how your company works
/pace standup        # then: anything you've authored as a /pace:* command
```

## The engineering opinionated workflow

The engineering plugin includes 34 engineering skills. Beyond the obvious
review/test/diagnose ones, there's a disciplined **stacked-PR
workflow**: `spec` &rarr; `implement` &rarr; `review` &rarr; `topr` &rarr; `next`. See
[the engineering cookbook](https://pace.tools/cookbook/engineering)
for the deep-dive.

## What's in this repo

```
pace.tools/
├── skill/                          ← the /pace router (your team's commands)
├── plugins/                        ← the 49-plugin catalog
│   ├── sales/                      ← Anthropic-authored, imported verbatim
│   ├── engineering/                ← Anthropic + PiXeL16/skills + authored
│   ├── ...
│   └── partner-built/              ← Apollo, Common Room, Slack, etc.
├── .claude-plugin/
│   └── marketplace.json            ← registers all 49 plugins
├── site/                           ← pace.tools (Astro)
├── cli/                            ← npx pace-tools CLI
└── NOTICE.md                       ← full attribution
```

## Bring Pace to your company

Pace is open source, fork it, rename the router, write commands
specific to your operation. We also help companies adopt Pace
end-to-end: install + connector setup, command authoring tuned to
your team's workflows, training, and ongoing enablement.

[Talk to GoldenBerry](mailto:hello@goldenberry.so) &middot;
[About GoldenBerry](https://goldenberry.so)

## Author + attribution

- **Pace router + marketplace**: Chris Jimenez ([@PiXeL16](https://github.com/PiXeL16)) at [GoldenBerry Software](https://goldenberry.so).
- **Install scaffold + multi-harness build**: based on [impeccable](https://impeccable.style) by Paul Bakaus.
- **Imported plugins**: [Anthropic](https://github.com/anthropics/knowledge-work-plugins) and the listed partner authors.
- **Engineering skills**: include selections from [PiXeL16/skills](https://github.com/PiXeL16/skills) (some descend from [mattpocock/skills](https://github.com/mattpocock/skills)).
- **Brand mark**: traced from a licensed Adobe Stock asset (see [NOTICE.md](./NOTICE.md)).

See [NOTICE.md](./NOTICE.md) for full attribution. Apache 2.0 throughout.
