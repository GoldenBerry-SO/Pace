// ABOUTME: `npx pace-tools copilot`: installs Pace for GitHub Copilot into ./.github/, the same merge as copilot/install.sh.
// ABOUTME: Downloads the repo tarball (or reads PACE_TARBALL), extracts it with the system tar, and copies the kit in.

import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync, cpSync, statSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, basename, dirname } from 'node:path';

const REPO = process.env.PACE_REPO || 'GoldenBerry-SO/Pace';
const REF = process.env.PACE_REF || 'main';
const START = '<!-- pace:start -->';
const END = '<!-- pace:end -->';

function help() {
  console.log(`Installs Pace for GitHub Copilot into ./.github/

Usage: npx pace-tools copilot [--force] [--dry-run] [--anywhere]

  --force      replace skills, prompts and agents that already exist
  --dry-run    show what would change, write nothing
  --anywhere   run outside a git repository
  PACE_REF     branch or tag to install from (default: main)`);
}

function findKit(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = join(dir, e.name);
    if (e.name === '.github' && basename(dir) === 'copilot') return p;
    const found = findKit(p);
    if (found) return found;
  }
  return null;
}

async function download(tmp) {
  const tarball = process.env.PACE_TARBALL || `https://codeload.github.com/${REPO}/tar.gz/${REF}`;
  const file = join(tmp, 'pace.tar.gz');
  if (existsSync(tarball)) copyFileSync(tarball, file);
  else {
    const res = await fetch(tarball);
    if (!res.ok) throw new Error(`download failed: ${res.status} ${tarball}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  const x = join(tmp, 'x');
  mkdirSync(x);
  const tar = spawnSync('tar', ['-xzf', file, '-C', x], { encoding: 'utf8' });
  if (tar.status !== 0) throw new Error(`tar failed: ${tar.stderr}`);
  const kit = findKit(x);
  if (!kit) throw new Error(`the download has no copilot/.github folder; is PACE_REF=${REF} right?`);
  return kit;
}

export async function run(args) {
  if (args.includes('-h') || args.includes('--help')) return help();
  const force = args.includes('--force');
  const dry = args.includes('--dry-run');
  const anywhere = args.includes('--anywhere');
  const unknown = args.find((a) => !['--force', '--dry-run', '--anywhere'].includes(a));
  if (unknown) { console.error(`unknown option: ${unknown}`); process.exit(2); }

  const inRepo = existsSync('.git') || spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { encoding: 'utf8' }).status === 0;
  if (!anywhere && !inRepo) {
    console.error('This does not look like a git repository. Run it from the repo you want Copilot to work in, or pass --anywhere.');
    process.exit(1);
  }

  const tmp = mkdtempSync(join(tmpdir(), 'pace-copilot-'));
  const counts = { added: 0, replaced: 0, kept: 0 };
  const dst = '.github';
  const put = (from, to, label) => {
    if (existsSync(to)) {
      if (!force) { console.log(`kept       ${label} (already there; --force replaces it)`); counts.kept++; return; }
      if (!dry) { rmSync(to, { recursive: true, force: true }); cpSync(from, to, { recursive: true }); }
      console.log(`replaced   ${label}`); counts.replaced++;
    } else {
      if (!dry) { mkdirSync(dirname(to), { recursive: true }); cpSync(from, to, { recursive: true }); }
      console.log(`${dry ? 'would add ' : 'added     '} ${label}`); counts.added++;
    }
  };

  try {
    const kit = await download(tmp);
    for (const name of readdirSync(join(kit, 'skills')).filter((n) => statSync(join(kit, 'skills', n)).isDirectory()).sort()) {
      put(join(kit, 'skills', name), join(dst, 'skills', name), `skill    ${name}`);
    }
    put(join(kit, 'skills', 'CONNECTORS.md'), join(dst, 'skills', 'CONNECTORS.md'), 'skills/CONNECTORS.md');
    for (const f of readdirSync(join(kit, 'prompts')).sort()) put(join(kit, 'prompts', f), join(dst, 'prompts', f), `prompt   /${f.replace(/\.prompt\.md$/, '')}`);
    for (const f of readdirSync(join(kit, 'agents')).sort()) put(join(kit, 'agents', f), join(dst, 'agents', f), `agent    ${f.replace(/\.agent\.md$/, '')}`);

    // The instructions file is merged, never overwritten.
    const source = readFileSync(join(kit, 'copilot-instructions.md'), 'utf8');
    const block = source.slice(source.indexOf(START), source.indexOf(END) + END.length) + '\n';
    const ins = join(dst, 'copilot-instructions.md');
    if (!existsSync(ins)) {
      if (!dry) { mkdirSync(dst, { recursive: true }); writeFileSync(ins, source); }
      console.log(`${dry ? 'would add ' : 'added     '} copilot-instructions.md`); counts.added++;
    } else {
      const mine = readFileSync(ins, 'utf8');
      if (mine.includes(START)) {
        const out = mine.slice(0, mine.indexOf(START)) + block + mine.slice(mine.indexOf(END) + END.length).replace(/^\n/, '');
        if (!dry) writeFileSync(ins, out);
        console.log('refreshed  copilot-instructions.md (the pace block; your own text is untouched)'); counts.replaced++;
      } else {
        if (!dry) writeFileSync(ins, mine + '\n' + block);
        console.log('appended   copilot-instructions.md (the pace block, after your own text)'); counts.added++;
      }
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  console.log(`\nPace for GitHub Copilot: ${counts.added} added, ${counts.replaced} replaced, ${counts.kept} kept.`);
  console.log('In Copilot chat, in agent mode, try: /grill-me <a brief>, then /to-prd, then /to-issues.');
  console.log('Assign an issue to Copilot to have the coding agent take it. @reviewer reads a pull request against the standards.');
console.log('In the Copilot CLI the same names work (/grill-me calls the skill); run /skills reload in an open session, and restart it for the instructions.');
}
