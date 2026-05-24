#!/usr/bin/env node

// ABOUTME: Pace CLI entry point. Routes `npx pace <command>` to the right
// ABOUTME: handler. Detection lives in impeccable; pace only ships `skills`.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const command = args[0];

function showHelp() {
  console.log(`Usage: pace <command> [options]

Commands:
  skills help                      List pace's commands
  skills install                   Install pace skills into your project
  skills update                    Update pace skills to the latest version
  skills check                     Check if skill updates are available

For frontend design skills, pace defers to impeccable. The installer offers
to bring impeccable along; say yes if you do any frontend work.

Options:
  --help       Show this help message
  --version    Show version number
`);
}

if (!command || command === '--help' || command === '-h') {
  showHelp();
  process.exit(0);
}

if (command === '--version' || command === '-v') {
  const pkg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8'));
  console.log(pkg.version);
  process.exit(0);
}

if (command === 'skills') {
  const { run } = await import('./commands/skills.mjs');
  await run(args.slice(1));
} else {
  console.error(`Unknown command: ${command}\n`);
  showHelp();
  process.exit(1);
}
