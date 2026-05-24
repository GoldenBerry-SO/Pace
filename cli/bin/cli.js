#!/usr/bin/env node

// ABOUTME: Pace CLI entry point. Routes `npx pace-tools <command>` to the right
// ABOUTME: handler. Marketplace-aware: wraps `claude plugin` commands.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const command = args[0];

function showHelp() {
  console.log(`Pace CLI — Claude Code plugin marketplace for every team.

Usage: pace <command> [options]

Commands:
  list                       List every plugin in the Pace marketplace
  install <plugin> [...]     Install one or more plugins (e.g. pace install sales)
  install --all              Install every plugin (rarely needed)
  uninstall <plugin>         Remove an installed plugin
  status                     Show what's installed
  marketplace add            Register the Pace marketplace with Claude Code
  marketplace remove         Unregister the Pace marketplace
  teams                      Show the per-role plugin starter sets
  open                       Open https://pace.tools in your browser

Options:
  --help                     Show this help message
  --version                  Show version number

Examples:
  npx pace-tools marketplace add           # one-time setup (clones the GitHub repo)
  npx pace-tools install sales             # install the sales plugin
  npx pace-tools install engineering data  # install multiple
  npx pace-tools list                      # browse the catalog

For frontend code design, Pace defers to impeccable
(https://impeccable.style). Install separately if you do frontend work.
`);
}

if (!command || command === '--help' || command === '-h' || command === 'help') {
  showHelp();
  process.exit(0);
}

if (command === '--version' || command === '-v') {
  const pkg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8'));
  console.log(pkg.version);
  process.exit(0);
}

const known = new Set(['list', 'install', 'uninstall', 'status', 'marketplace', 'teams', 'open']);
if (known.has(command)) {
  const mod = await import('./commands/marketplace.mjs');
  await mod.run(command, args.slice(1));
  process.exit(0);
}

// Legacy shim: old `pace skills <verb>` calls keep working with a deprecation
// notice, so existing docs and bookmarks don't break.
if (command === 'skills') {
  const verb = args[1] ?? 'help';
  const mod = await import('./commands/marketplace.mjs');
  switch (verb) {
    case 'install':
      console.warn('Note: `pace skills install` is deprecated.');
      console.warn('Use `pace marketplace add` + `pace install <plugin>` instead.\n');
      await mod.run('marketplace', ['add']);
      await mod.run('list', []);
      break;
    case 'help':
    case 'list':
      await mod.run('list', []);
      break;
    case 'update':
    case 'check':
      await mod.run('status', []);
      break;
    default:
      showHelp();
  }
  process.exit(0);
}

console.error(`Unknown command: ${command}\n`);
showHelp();
process.exit(1);
