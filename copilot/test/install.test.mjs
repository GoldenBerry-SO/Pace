// ABOUTME: End-to-end tests for copilot/install.sh: a tarball in GitHub's layout, merged into a scratch repo.
// ABOUTME: Covers a fresh install, a re-run that keeps the user's own instructions, --force and --dry-run.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../build.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const INSTALL = join(ROOT, 'copilot', 'install.sh');
let work, tarball;

before(() => {
  work = mkdtempSync(join(tmpdir(), 'pace-install-'));
  // A tarball shaped like codeload's: <repo>-<ref>/copilot/.github/...
  const stage = join(work, 'Pace-main', 'copilot', '.github');
  mkdirSync(stage, { recursive: true });
  build({ root: ROOT, out: stage });
  tarball = join(work, 'pace.tar.gz');
  const tar = spawnSync('tar', ['-czf', tarball, '-C', work, 'Pace-main'], { encoding: 'utf8' });
  assert.equal(tar.status, 0, tar.stderr);
});
after(() => rmSync(work, { recursive: true, force: true }));

function repo() {
  const dir = mkdtempSync(join(work, 'repo-'));
  mkdirSync(join(dir, '.git'));
  return dir;
}
function run(dir, ...args) {
  return spawnSync('sh', [INSTALL, ...args], { cwd: dir, encoding: 'utf8', env: { ...process.env, PACE_TARBALL: tarball } });
}

test('a fresh install lands the skills, prompts, agent and instructions', () => {
  const dir = repo();
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(existsSync(join(dir, '.github', 'skills', 'grill-me', 'SKILL.md')));
  assert.ok(existsSync(join(dir, '.github', 'prompts', 'grill-me.prompt.md')));
  assert.ok(existsSync(join(dir, '.github', 'agents', 'reviewer.agent.md')));
  assert.ok(existsSync(join(dir, '.github', 'copilot-instructions.md')));
  assert.match(r.stdout, /grill-me/);
});

test('a re-run keeps the user\'s own instructions and refreshes the pace block', () => {
  const dir = repo();
  run(dir);
  const file = join(dir, '.github', 'copilot-instructions.md');
  const mine = '# Our rules\n\nUse pnpm, never npm.\n\n';
  writeFileSync(file, mine + readFileSync(file, 'utf8').replace('<!-- pace:start -->', '<!-- pace:start -->\nSTALE'));
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const after = readFileSync(file, 'utf8');
  assert.ok(after.startsWith(mine), 'own text preserved');
  assert.ok(!after.includes('STALE'), 'pace block refreshed');
  assert.equal((after.match(/pace:start/g) ?? []).length, 1, 'one block');
});

test('an existing skill is kept unless --force', () => {
  const dir = repo();
  run(dir);
  const file = join(dir, '.github', 'skills', 'tdd', 'SKILL.md');
  writeFileSync(file, 'mine');
  run(dir);
  assert.equal(readFileSync(file, 'utf8'), 'mine');
  run(dir, '--force');
  assert.notEqual(readFileSync(file, 'utf8'), 'mine');
});

test('--dry-run writes nothing', () => {
  const dir = repo();
  const r = run(dir, '--dry-run');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(!existsSync(join(dir, '.github')));
  assert.match(r.stdout, /would add/i);
});

test('it refuses to run outside a git repository unless told to', () => {
  const dir = mkdtempSync(join(work, 'plain-'));
  assert.notEqual(run(dir).status, 0);
  assert.equal(run(dir, '--anywhere').status, 0);
  assert.ok(existsSync(join(dir, '.github', 'copilot-instructions.md')));
});

test('npx pace-tools copilot does the same merge', () => {
  const dir = repo();
  const r = spawnSync(process.execPath, [join(ROOT, 'cli', 'bin', 'cli.js'), 'copilot'], { cwd: dir, encoding: 'utf8', env: { ...process.env, PACE_TARBALL: tarball } });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(existsSync(join(dir, '.github', 'skills', 'grill-me', 'SKILL.md')));
  assert.ok(existsSync(join(dir, '.github', 'prompts', 'to-issues.prompt.md')));
  const again = spawnSync(process.execPath, [join(ROOT, 'cli', 'bin', 'cli.js'), 'copilot', '--dry-run'], { cwd: dir, encoding: 'utf8', env: { ...process.env, PACE_TARBALL: tarball } });
  assert.match(again.stdout, /kept/);
});
