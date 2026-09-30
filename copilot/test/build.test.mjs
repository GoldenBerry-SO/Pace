// ABOUTME: Tests for the Copilot kit build: every engineering skill lands in .github/ in Copilot's shape.
// ABOUTME: Builds into a temp dir so the committed copilot/.github/ is never touched by a test run.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readdirSync, readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, EXCLUDED } from '../build.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE = join(ROOT, 'plugins', 'engineering', 'skills');
let out;

before(() => {
  out = mkdtempSync(join(tmpdir(), 'pace-copilot-'));
  build({ root: ROOT, out });
});
after(() => rmSync(out, { recursive: true, force: true }));

const walk = (dir, list = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    e.isDirectory() ? walk(p, list) : list.push(p);
  }
  return list;
};
const sourceSkills = () => readdirSync(SOURCE).filter((d) => statSync(join(SOURCE, d)).isDirectory() && !EXCLUDED.has(d));

test('every engineering skill except the excluded ones is emitted', () => {
  const emitted = readdirSync(join(out, 'skills')).filter((d) => statSync(join(out, 'skills', d)).isDirectory()).sort();
  assert.deepEqual(emitted, sourceSkills().sort());
  assert.ok(emitted.length >= 30, `${emitted.length} skills`);
  assert.ok(!emitted.includes('git-guardrails-claude-code'), 'Claude Code hooks have no Copilot equivalent');
});

test('every emitted SKILL.md has exactly name and description in its frontmatter', () => {
  for (const name of sourceSkills()) {
    const text = readFileSync(join(out, 'skills', name, 'SKILL.md'), 'utf8');
    const front = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1];
    assert.ok(front, `${name} has frontmatter`);
    const keys = front.split('\n').filter((l) => /^[a-z-]+:/.test(l)).map((l) => l.split(':')[0]);
    assert.deepEqual(keys, ['name', 'description'], name);
    assert.match(front, new RegExp(`^name: ${name}$`, 'm'));
  }
});

test('reference files and scripts come along with their skill', () => {
  assert.ok(existsSync(join(out, 'skills', 'tdd', 'deep-modules.md')));
  assert.ok(existsSync(join(out, 'skills', 'improve-codebase-architecture', 'LANGUAGE.md')));
  assert.ok(existsSync(join(out, 'skills', 'diagnose', 'scripts')));
  assert.ok(existsSync(join(out, 'skills', 'CONNECTORS.md')));
});

test('a prompt file per skill, each pointing at its skill', () => {
  for (const name of sourceSkills()) {
    const p = join(out, 'prompts', `${name}.prompt.md`);
    assert.ok(existsSync(p), `${name}.prompt.md`);
    const text = readFileSync(p, 'utf8');
    assert.match(text, /^---\ndescription: .+\nmode: agent\n---\n/);
    assert.ok(text.includes(`.github/skills/${name}/SKILL.md`), name);
  }
});

test('nothing Claude Code specific survives in the output', () => {
  const forbidden = ['subagent_type', 'AskUserQuestion', 'claude --model', '/engineering:', '`haiku`', '`sonnet`', '`opus`', '`fable`', '**haiku**', '**sonnet**', '**opus**', '**fable**', 'Agent tool'];
  for (const file of walk(out).filter((f) => f.endsWith('.md'))) {
    const text = readFileSync(file, 'utf8');
    for (const token of forbidden) assert.ok(!text.includes(token), `${file.slice(out.length + 1)} still contains ${token}`);
  }
});

test('the instructions file is short and carries the pace markers', () => {
  const text = readFileSync(join(out, 'copilot-instructions.md'), 'utf8');
  assert.ok(text.split('\n').length < 50, 'under 50 lines');
  assert.ok(text.includes('<!-- pace:start -->') && text.includes('<!-- pace:end -->'));
  assert.match(text, /\.github\/skills/);
});

test('the reviewer agent is emitted', () => {
  const text = readFileSync(join(out, 'agents', 'reviewer.agent.md'), 'utf8');
  assert.match(text, /^---\nname: reviewer\ndescription: .+\n/);
  assert.match(text, /copilot-instructions\.md/);
});

test('a rebuild removes what is no longer a skill', () => {
  const stray = join(out, 'skills', 'stray');
  mkdirSync(stray, { recursive: true });
  writeFileSync(join(stray, 'SKILL.md'), '---\nname: stray\ndescription: x\n---\n');
  build({ root: ROOT, out });
  assert.ok(!existsSync(stray));
});
