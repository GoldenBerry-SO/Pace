// ABOUTME: Command category + relationship metadata consumed by the
// ABOUTME: transformer pipeline. Pace starts with no commands; refill the
// ABOUTME: maps below as commands ship.

/**
 * Skills that should be excluded from any generated index/detail pages.
 * Used by docs generators (currently absent in pace).
 */
export const EXCLUDED_SKILLS = new Set([]);

/**
 * Category for each user-invocable command. The transformer reads this to
 * group commands inside the `{{available_commands}}` placeholder. Add a
 * row when adding a command (`scripts/lib/utils.js` PACE_SUB_COMMANDS also
 * needs the entry).
 */
export const SKILL_CATEGORIES = {};

/**
 * Order categories should appear when rendering the grouped command list.
 * Categories without any commands are silently skipped by the transformer.
 */
export const CATEGORY_ORDER = ['create', 'evaluate', 'refine', 'simplify', 'harden', 'system'];

/**
 * Human-readable labels for each category. Surfaced in docs UIs (none yet).
 */
export const CATEGORY_LABELS = {
  create: 'Create',
  evaluate: 'Evaluate',
  refine: 'Refine',
  simplify: 'Simplify',
  harden: 'Harden',
  system: 'System',
};

/**
 * Short descriptions of each category. Surfaced in docs UIs (none yet).
 */
export const CATEGORY_DESCRIPTIONS = {
  create: 'Author new artifacts or shape new work.',
  evaluate: 'Review, audit, or critique existing work.',
  refine: 'Polish or improve existing work.',
  simplify: 'Reduce noise and clarify intent.',
  harden: 'Make work production-ready.',
  system: 'System-level operations on the pace install itself.',
};

/**
 * Cross-links between commands ("after `craft`, try `polish`").
 * Empty until pace has commands authored.
 */
export const COMMAND_RELATIONSHIPS = {};
