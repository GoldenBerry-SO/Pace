#!/usr/bin/env node
// ABOUTME: Generates copilot/.github/ from the engineering plugin: skills, a prompt file per skill, the
// ABOUTME: instructions file and the reviewer agent. `node copilot/build.mjs [outDir]`; the output is committed.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, statSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSkill, transformBody, promptFor } from './transform.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

// Skills that only make sense in Claude Code. git-guardrails installs Claude Code hooks.
export const EXCLUDED = new Set(['git-guardrails-claude-code']);

function walk(dir, list = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    e.isDirectory() ? walk(p, list) : list.push(p);
  }
  return list;
}

function description(skillMd) {
  return readFileSync(skillMd, 'utf8').match(/^description:\s*(.+)$/m)?.[1].trim();
}

export function build({ root = join(HERE, '..'), out = join(HERE, '.github') } = {}) {
  const source = join(root, 'plugins', 'engineering', 'skills');
  const src = join(HERE, 'src');
  rmSync(out, { recursive: true, force: true });
  mkdirSync(join(out, 'skills'), { recursive: true });
  mkdirSync(join(out, 'prompts'), { recursive: true });
  mkdirSync(join(out, 'agents'), { recursive: true });

  const names = readdirSync(source).filter((d) => statSync(join(source, d)).isDirectory() && !EXCLUDED.has(d)).sort();
  for (const name of names) {
    const from = join(source, name);
    for (const file of walk(from)) {
      const rel = relative(from, file);
      const to = join(out, 'skills', name, rel);
      mkdirSync(dirname(to), { recursive: true });
      if (rel === 'SKILL.md') writeFileSync(to, transformSkill(readFileSync(file, 'utf8'), name));
      else if (file.endsWith('.md')) writeFileSync(to, transformBody(readFileSync(file, 'utf8')));
      else copyFileSync(file, to);
    }
    writeFileSync(join(out, 'prompts', `${name}.prompt.md`), promptFor(name, description(join(from, 'SKILL.md'))));
  }

  copyFileSync(join(root, 'plugins', 'engineering', 'CONNECTORS.md'), join(out, 'skills', 'CONNECTORS.md'));
  copyFileSync(join(src, 'copilot-instructions.md'), join(out, 'copilot-instructions.md'));
  copyFileSync(join(src, 'agents', 'reviewer.agent.md'), join(out, 'agents', 'reviewer.agent.md'));
  return names;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const out = process.argv[2] ? join(process.cwd(), process.argv[2]) : undefined;
  const names = build({ out });
  console.log(`copilot: ${names.length} skills, ${names.length} prompts, 1 agent, 1 instructions file${out ? ` in ${out}` : ''}`);
}
