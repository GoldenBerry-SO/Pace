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

- `bio-research`, `cowork-plugin-management`, `customer-support`, `data`, `design`, `engineering`, `enterprise-search`, `finance`, `human-resources`, `legal`, `marketing`, `operations`, `pdf-viewer`, `product-management`, `productivity`, `sales`, `small-business`

Each plugin retains Anthropic's authorship in its `.claude-plugin/plugin.json`. Pace's `.claude-plugin/marketplace.json` references them with their original `displayName` and descriptions.

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

## License

Pace's original code is distributed under the Apache License, Version 2.0. See `LICENSE` for the full text. Imported plugins retain their original licenses; see each plugin's directory.

## Copyright

Pace
Copyright 2025-2026 Chris Jimenez
