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

Pace is a curated plugin marketplace you install into [Claude Code](https://claude.com/product/claude-code)
(the CLI) or [Cowork](https://claude.com/product/cowork) (the Claude desktop app), plus a `/pace`
router for the commands that are specific to your own company. One plugin per role, each one fluent
in that role's vocabulary and wired to the SaaS tools the team already uses through MCP connectors.
Authorize a connector once and the skills work on your real data after that. Everything here is
Apache 2.0: fork it, rename the router, swap the catalog, and the install machinery comes along.

For frontend code-level design, Pace defers to [impeccable](https://impeccable.style), a separate
skill kit with its own router.

## The catalog at a glance

`.claude-plugin/marketplace.json` is the source of truth for what the marketplace offers. It holds
four kinds of entry:

| Area | What lives there |
| --- | --- |
| `plugin/` | The `/pace` router, built from `skill/`. Your company's own commands. |
| `plugins/<role>/` | Role plugins imported from [Anthropic's knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins): sales, marketing, engineering, data, product management, design, finance, legal, operations, human resources, customer support, productivity, enterprise search, small business, PDF viewing, and plugin management. |
| `plugins/partner-built/<vendor>/` | Partner plugins distributed through the same upstream marketplace: Apollo, Tribe AI's brand voice, Common Room, Slack, Zoom. |
| External entries in `marketplace.json` | Vendor plugins that stay in their own repositories (Vanta, Miro, PlanetScale, Figma, Adobe, Box, S&P Global, OpenAI's Codex plugin, and more). Each is pinned to a commit and fetched at install time. |

Every plugin's page on [pace.tools/plugins](https://pace.tools/plugins) lists its skills, its
connectors, and who wrote it.

The `engineering` plugin carries the Anthropic skills plus a workflow layer authored here: TDD,
diagnosis, review, security review, deploy checklists, and a stacked-PR sequence of `spec`,
`implement`, `review`, `topr`, `next`. The
[engineering cookbook](https://pace.tools/cookbook/engineering) walks through it.

## Install

### Cowork (desktop, no terminal)

Open Cowork, go to **Plugins**, choose **Add marketplace**, and paste:

```
GoldenBerry-SO/Pace
```

Then install whichever plugins match your role: `sales`, `marketing`, `engineering`, `data`,
`finance`, and so on. Restart Cowork after the last install so the MCP servers register.

### Claude Code (terminal)

```bash
claude plugin marketplace add GoldenBerry-SO/Pace
claude plugin install sales@pace
```

The marketplace registers under the name `pace`, so every plugin is installed as `<name>@pace`.

### The pace-tools CLI

`cli/` ships a small Node wrapper around `claude plugin`. It registers the marketplace for you and
installs several plugins in one call, which helps when scripting an onboarding flow. It requires the
`claude` binary on `PATH`.

```bash
npx pace-tools marketplace add        # register the marketplace (one time per machine)
npx pace-tools install sales          # install one plugin
npx pace-tools install engineering data
npx pace-tools list                   # browse the catalog
npx pace-tools teams                  # per-role starter sets
npx pace-tools teams sales
npx pace-tools status                 # what is installed
npx pace-tools uninstall sales
npx pace-tools open                   # open pace.tools
```

`npx pace-tools install` needs at least one plugin name. Use `list` or `teams` to pick.

## Use

Describe what you need in your own words. Skills carry a `description` that the agent matches
against, so they trigger without a command:

```text
Prep me for the Acme call tomorrow.
> sales / call-prep fires, pulls HubSpot history + recent news, drafts the brief.

Write a SQL query for monthly active users by plan tier, last 6 months.
> data / write-query takes over, drafts the query, runs it against Snowflake if connected.

Review this PR. Look for real bugs first.
> engineering / code-review takes the PR, reads the diff, posts comments.
```

The explicit form is the namespaced slash command: `/sales:call-prep`, `/data:write-query`,
`/engineering:code-review`. Type `/` in your harness to see everything you have installed.

## How the router works

The `/pace` router is one skill with sub-commands, which is a different shape from the role plugins
(each of those is a set of independent skills namespaced by the plugin name).

- `skill/SKILL.md` holds the router itself. Its **Commands** table is the source of truth; the build
  reads it and the site's command count comes from it.
- `skill/reference/<command>.md` holds the instructions for one sub-command. The router loads the
  reference file before doing any work, so a command with no reference file has no behaviour.
- `skill/scripts/load-context.mjs` reads `PRODUCT.md` and `DESIGN.md` from the project root (or from
  `.agents/context/` or `docs/`, or from `PACE_CONTEXT_DIR`) and prints them as JSON. That file is
  how the router learns your company's users, voice and principles. This repo's own `PRODUCT.md` is
  an example of the format.
- `skill/scripts/pin.mjs pin <command>` promotes a sub-command to a top-level slash command by
  writing a small redirect skill; `pin.mjs unpin <command>` removes it. The allowlist lives in
  `VALID_COMMANDS` inside that script.

**Current state:** the router ships one command, `cleanup` (engineering housekeeping: stale dev docs
and artifacts, merged branches, closeable issues). Everything else in the catalog comes from the
plugins. Author your own commands as your team's playbook settles.

## Adding or changing a skill

### A command on the /pace router

Order matters here, and the last step is what makes the command real in every harness:

1. Write `skill/reference/<command>.md`.
2. Add a row for it to the **Commands** table in `skill/SKILL.md`.
3. Add its `description` and `argumentHint` to `skill/scripts/command-metadata.json`.
4. Add its name to `PACE_SUB_COMMANDS` in `scripts/lib/utils.js`.
5. Add its name to `VALID_COMMANDS` in `skill/scripts/pin.mjs` so it can be pinned.
6. Run `bun run build` and commit the regenerated harness directories.

### A plugin in the marketplace

Create `plugins/<name>/` with a `.claude-plugin/plugin.json` manifest (`name`, `version`,
`description`, `author`), one `skills/<skill>/SKILL.md` per skill, an optional `.mcp.json` declaring
its connectors, and a `CONNECTORS.md` if it uses any. Then add an entry to
`.claude-plugin/marketplace.json` with `source: "./plugins/<name>"` and your own `author`.

Plugins imported from upstream are meant to stay as they arrived, so a local sync keeps working. To
customize one, copy it to a new name and edit the copy.

### Conventions

- A skill is a directory whose name matches the `name` in its frontmatter, in kebab case, holding a
  `SKILL.md`.
- Frontmatter carries `name` and `description` at minimum. The description is what the agent matches
  on, so write it as trigger phrases rather than a summary, and keep it inside 1024 characters (the
  build enforces that ceiling on the router). `argument-hint`, `user-invocable`, `allowed-tools` and
  `license` are optional and are passed through to the harnesses that understand them.
- Long instructions belong in sibling files (`reference/`, `scripts/`) that the skill loads when it
  needs them.
- Source text in `skill/` may use placeholders that the build replaces per harness: `{{model}}`,
  `{{config_file}}`, `{{ask_instruction}}`, `{{command_prefix}}`, `{{available_commands}}`,
  `{{scripts_path}}`.

### The checks that run

`bun run build:skills` is the gate. It validates skill frontmatter, regenerates the command count and
fails on any stale count in `README.md`, `NOTICE.md`, `site/pages/index.astro` and
`.claude-plugin/plugin.json`, and runs two prose validators: a full one over the site and the
READMEs, and a narrower one over `skill/`. Both reject em dashes, the double-hyphen substitute for
one, and a denylist of phrases that read as AI tells. The rules live in `scripts/build.js`.

CI (`.github/workflows/ci.yml`) runs `bun install`, `bun run build:skills` and `bun run build:site`
on every push and pull request to `main`, and uploads `build/` as an artifact.

## Build and preview

```bash
bun install
bun run dev        # Astro dev server
bun run build      # skills, marketplace copy, agent discovery, then the site
bun run preview    # build, then serve build/ locally
```

`bun run build` runs four steps in order: `build:skills` transforms `skill/` for every supported
harness and writes the results into the harness directories at the repo root; `build:marketplace`
copies `marketplace.json` into `site/public/`; `build:agent-discovery` writes the
`/.well-known/agent-skills` index; `build:site` renders the Astro site from `site/` into `build/`.

The site is Astro with `srcDir: ./site` and `outDir: ./build`, plain hand-written CSS, tokens in
OKLCH. Deployment is Cloudflare Pages (`wrangler.toml`, `bun run deploy`).

## Harness output directories

The build writes one transformed copy of the router per harness. Twelve of them are committed at the
repo root, which is what lets an installer read the skills straight from this repository:

`.claude/` `.cursor/` `.agents/` `.gemini/` `.github/` `.kiro/` `.opencode/` `.pi/` `.qoder/`
`.rovodev/` `.trae/` `.trae-cn/`

A Codex bundle is also generated under `dist/codex/`; `.codex/` at the repo root is ignored by git.
Treat all of these as build output: edit `skill/`, run `bun run build`, commit what changes.

For agents other than Claude Code, the release notes point users at
`npx skills add GoldenBerry-SO/Pace`, a third-party installer that reads those directories. Copying
the directory for your agent into your own project root does the same job by hand.

## Development workflow

Branch off `main`, edit the source (`skill/`, `plugins/`, `site/`, `cli/`), run `bun run build`, and
commit the regenerated harness directories along with your change. Open a pull request; the template
in `.github/PULL_REQUEST_TEMPLATE.md` carries the checklist, and `.github/CODEOWNERS` requests review
automatically. Releases are cut with `bun run release:skill` or `bun run release:cli`, which read the
matching changelog entry from the homepage and refuse to run on a dirty tree or an unpushed HEAD. The
skill release also reruns the build and refuses if a harness directory drifted from source.

The changelog on the homepage is tied to releases. Leave it alone unless you are cutting one or the
maintainer asked for an entry by name.

## What's in this repo

```
pace.tools/
├── skill/                  ← source of the /pace router (SKILL.md, reference/, scripts/)
├── plugin/                 ← generated Claude Code plugin subtree for the router
├── plugins/                ← the plugin catalog, including partner-built/
├── .claude-plugin/
│   ├── marketplace.json    ← registers the router and every plugin
│   └── plugin.json         ← the router's manifest
├── site/                   ← pace.tools (Astro: pages, layouts, components, styles)
├── cli/                    ← the npx pace-tools CLI
├── scripts/                ← build, agent discovery, release
├── .claude/ .cursor/ …     ← generated harness copies of the router
├── CLAUDE.md               ← instructions for agents working in this repo
├── PRODUCT.md              ← the product brief the router loads as context
└── NOTICE.md               ← full attribution
```

## Docs about this repo

- [CLAUDE.md](./CLAUDE.md), the working agreement for humans and agents editing this repo.
- [PRODUCT.md](./PRODUCT.md), who Pace is for and how it should sound.
- [NOTICE.md](./NOTICE.md), attribution for every lineage in the tree.
- [LICENSE](./LICENSE), Apache 2.0.
- [Install guide](https://pace.tools/docs/install), [docs](https://pace.tools/docs),
  [team guides](https://pace.tools/docs/teams) and [cookbook](https://pace.tools/cookbook) on the site.

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
