# pace

A marketplace of AI coding skills for every department. One router (`/pace`) for company-specific work, plus the full [Anthropic knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) catalog: sales, marketing, finance, legal, engineering, data, customer support, product, HR, ops, design, and more.

For frontend code-level design, pace defers to [impeccable](https://impeccable.style); the installer offers to bring it along.

## Install

Register the marketplace once:

```bash
claude plugin marketplace add GoldenBerry-SO/pace.tools
```

Then install whichever plugins you need:

```bash
claude plugin install pace@pace.tools         # company router
claude plugin install sales@pace.tools        # sales commands
claude plugin install engineering@pace.tools  # engineering commands
claude plugin install data@pace.tools         # SQL + analytics
# … any of 49 available plugins
```

Or use pace's CLI for a guided picker:

```bash
npx pace skills install
```

The picker asks which plugins you want and offers to install impeccable alongside for design.

## Use

```
/pace <command>             # company router (GoldenBerry-specific commands)
/sales:call-prep            # imported Anthropic plugin
/data:write-query
/engineering:code-review
/marketing:campaign-plan
```

Each plugin's commands are namespaced under its name. Pace's router commands live directly under `/pace`.

## What's in here

- `skill/`: the `/pace` router, GoldenBerry's company-wide commands
- `plugins/`: Anthropic's knowledge-work plugins (17 first-party + 5 partner-built), copied verbatim
- `.claude-plugin/marketplace.json`: registers everything (49 plugins as of import)
- `site/`: pace.tools landing site (Astro)
- `cli/`: `npx pace` CLI

## Why pace

A company doesn't need 49 separate marketplaces to install. It needs one curated entry point that bundles what we actually use, with the company's specific commands layered on top.

Pace is that entry point for GoldenBerry. Fork it for your company; the install machinery and the marketplace shape carry over for free.

## Author + attribution

- Pace router + marketplace: Chris Jimenez ([@PiXeL16](https://github.com/PiXeL16)) at GoldenBerry.
- Install scaffold: based on [impeccable](https://impeccable.style) by Paul Bakaus.
- Imported plugins: [Anthropic](https://github.com/anthropics/knowledge-work-plugins) and the listed partner authors.

See [NOTICE.md](./NOTICE.md) for full attribution. Apache 2.0 throughout.
