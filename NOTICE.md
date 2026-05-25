# Notices

Pace is a marketplace. Several distinct sets of code with distinct authors live in this repo. Each is used under its own copyright + license.

## Pace router (this repo's original work)

The `/pace` router and the marketplace infrastructure are authored by Chris Jimenez. Apache License 2.0.

## Origin: impeccable

The pace skill scaffold, build system, multi-harness transformer pipeline, Astro site shell, and CLI installer flow were forked from [impeccable](https://github.com/pbakaus/impeccable) (https://impeccable.style) by Paul Bakaus, used under Apache License 2.0.

Pace does NOT include impeccable's anti-pattern detector, Chrome extension, or live-mode browser tooling. For frontend design work, pace defers to impeccable; the `npx pace skills install` flow offers to install impeccable alongside.

## Imported plugins: Anthropic knowledge-work-plugins

The plugins under `plugins/` (excluding `plugins/partner-built/`) are imported verbatim from [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins), authored by Anthropic. Used under Apache License 2.0.

Plugins included:

- `cowork-plugin-management`, `customer-support`, `data`, `design`, `engineering`, `enterprise-search`, `finance`, `human-resources`, `legal`, `marketing`, `operations`, `pdf-viewer`, `product-management`, `productivity`, `sales`, `small-business`

Each plugin retains Anthropic's authorship in its `.claude-plugin/plugin.json`. Pace's `.claude-plugin/marketplace.json` references them with their original `displayName` and descriptions.

## Engineering plugin additions

The `engineering` plugin was extended with skills imported from [PiXeL16/skills](https://github.com/PiXeL16/skills), a personal Claude Code skill collection authored by Chris Jimenez and contributors:

- **Workflow skills**: `spec`, `implement`, `review`, `topr`, `next`, `diagnose`, `tdd`, `prototype`, `improve-codebase-architecture`, `grill-me`, `grill-with-docs`, `triage`, `to-issues`, `to-prd`, `zoom-out`, `setup-engineering-skills` (renamed from `setup-matt-pocock-skills` in the upstream repo)
- **Tooling skills**: `codex-review`, `setup-pre-commit`, `git-guardrails-claude-code`
- **Authored for Pace**: `careful-review`, `find-missing-tests`, `security-review`, `e2e-test`, `ship-pr` (derived from personal slash-command prompts and rewritten as auto-trigger skills)

Some of the upstream workflow skills (`diagnose`, `tdd`, `triage`, `to-issues`, `to-prd`, `improve-codebase-architecture`, `zoom-out`, `grill-me`, `grill-with-docs`, `handoff`, `setup-engineering-skills`) descend from [mattpocock/skills](https://github.com/mattpocock/skills); attribution stays with the original author. The stacked-PR workflow (`spec`, `implement`, `review`, `topr`, `next`) is original to PiXeL16/skills.

PiXeL16/skills upstream license: MIT. Used under MIT; compatible with Pace's Apache-2.0 distribution.

## Imported partner-built plugins

The plugins under `plugins/partner-built/` are third-party plugins distributed through Anthropic's knowledge-work-plugins marketplace, each authored by the named company:

- `apollo` — Apollo.io
- `brand-voice` — Tribe AI
- `common-room` — Common Room
- `slack` — Salesforce
- `zoom-plugin` — Zoom

Each retains its original author attribution and license terms in the plugin directory.

## External plugins referenced from the marketplace

Pace's `marketplace.json` also lists external plugins (Vanta, Miro, PlanetScale, Figma, Adobe, Box, S&P Global, and others) by git URL. Those plugins are not copied into this repo; they are fetched from their upstream repositories at install time. Each is governed by its own license; see the upstream repos.

## Brand mark

The running-rabbit silhouette used as the Pace logo (favicon, header chip, OG image) is derived from Adobe Stock asset #343861859, licensed by GoldenBerry Software. The vector trace shipped at `site/public/logo-svgs/pace-rabbit.svg` is the result of running `potrace` over the licensed raster preview. Use is covered by Adobe Stock's standard license; the underlying asset remains the property of its contributor.

## License

Pace's original code is distributed under the Apache License, Version 2.0. See `LICENSE` for the full text. Imported plugins retain their original licenses; see each plugin's directory.

## Copyright

Pace
Copyright 2025-2026 Chris Jimenez
