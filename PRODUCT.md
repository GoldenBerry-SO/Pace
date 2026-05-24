# Product

## Register

product

## Users

Everyone at GoldenBerry who uses an AI coding agent (Claude Code, Cursor, Codex CLI, Gemini CLI, and others) and wants a shared, repeatable way to do work. Engineers running PR reviews. PMs writing specs. Ops folks on runbooks. Marketing on launch copy. Sales people prepping calls. Finance closing the month. Whatever department, whatever workflow.

They land on `pace.tools` from internal docs, Slack, or word of mouth. They already know what skills are; they want a curated set that matches how GoldenBerry works.

## Product Purpose

Pace is a curated marketplace of AI agent skills, with two halves:

1. **The `/pace` router** is GoldenBerry's company-specific command surface. It's where commands that wrap our internal processes live (when we author them).
2. **The plugin catalog** is Anthropic's [knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) imported verbatim. ~150 skills across sales, marketing, finance, legal, engineering, data, customer support, product, HR, ops, and design.

Together, pace is the one entry point a GoldenBerry person registers to get every department's AI playbook, with the company-specific layer on top. For frontend design specifically, pace also defers to **impeccable** (separate scope, code-level UI craft).

Success is measured two ways: (1) the company stops asking "is there a skill for X?" because pace already has one or routes to one, and (2) AI output stops drifting from how we actually work, because the company-specific commands teach it our way.

## Brand Personality

Practical, opinionated, low-ceremony. Pace speaks like a senior teammate who's curated the right toolbox for the job: confident about what's in it, light on hype, allergic to "best practices" prose. The tone is **direct** (no "consider doing"), **specific** (commands name what they do), and **shared** (we is the operative pronoun — this is how *we* work).

Three-word personality: **curated, opinionated, shared**.

## Anti-references

The site and brand should not look or read like:

- **Generic productivity SaaS.** Stock photos, gradient hero sections, "boost your team's velocity" copy, cards-on-cards layouts.
- **A plugin marketplace listing.** Pace is curated, not a directory. We don't list every plugin in the universe; we list the ones we actually use.
- **Hedging language.** "Might want to consider", "could potentially help". Pace picks a way and commits.
- **Education-heavy framing.** Users land on pace because they already know what skills are. Don't teach the category; ship the catalog.
- **Over-decoration.** Every visual element earns its place.

## Design Principles

1. **Curated, not comprehensive.** The catalog is intentional. Anything in here is meant to be useful day one.
2. **Show the catalog clearly.** The homepage's job is to make every plugin legible at a glance. Categorize, count, link.
3. **Pair, don't duplicate.** Pace defers to impeccable for code-level frontend design. The handoff is part of the product.
4. **Confidence without volume.** Direct and opinionated, but not loud. Editorial restraint over marketing energy.

## Accessibility & Inclusion

WCAG 2.1 AA on every page. Tokens verified for contrast, focus states visible, `prefers-reduced-motion` respected, semantic HTML first.
