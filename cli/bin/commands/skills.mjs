/**
 * `pace skills` subcommand
 *
 * Usage:
 *   pace skills help      Show all available skills and commands
 *   pace skills install   Install skills via npx skills add
 *   pace skills update    Update skills to latest version
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, lstatSync, symlinkSync, readlinkSync, unlinkSync, mkdirSync, writeFileSync, rmSync, renameSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_BASE = 'https://pace.tools';

// Provider folder names in project roots. Must include every harness the
// build emits into; otherwise `check`, `update`, prefixing, and install
// detection silently skip that harness.
const PROVIDER_DIRS = ['.claude', '.cursor', '.gemini', '.agents', '.github', '.kiro', '.opencode', '.pi', '.qoder', '.rovodev', '.trae', '.trae-cn'];

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(r => rl.question(question, ans => { rl.close(); r(ans.trim().toLowerCase()); }));
}

// ─── skills help ──────────────────────────────────────────────────────────────

async function showHelp() {
  const printShell = () => {
    console.log('\n  Pace Skills & Commands\n');
    console.log('  Install:  npx pace skills install');
    console.log('  Update:   npx pace skills update');
    console.log('  Docs:     https://pace.tools\n');
  };

  let commands;
  try {
    const res = await fetch(`${API_BASE}/api/commands`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    commands = await res.json();
  } catch (err) {
    // Pace.tools may not be reachable (no network, or the API is not yet
    // deployed). Print a useful shell so `skills help` is never a dead end.
    printShell();
    console.log(`  Command list unavailable: ${err.message || 'network error'}.`);
    console.log(`  Visit https://pace.tools for the current command catalog.\n`);
    return;
  }

  const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length));
  printShell();

  if (!Array.isArray(commands) || commands.length === 0) {
    console.log('  No commands published yet.\n');
    return;
  }

  console.log(`  ${pad('Command', 22)} Description`);
  console.log(`  ${'-'.repeat(22)} ${'-'.repeat(52)}`);
  for (const cmd of commands.sort((a, b) => a.id.localeCompare(b.id))) {
    const desc = cmd.description.length > 72
      ? cmd.description.substring(0, 69) + '...'
      : cmd.description;
    console.log(`  ${pad('/' + cmd.id, 22)} ${desc}`);
  }
  console.log(`\n  ${commands.length} commands available. Run /<command> in your AI harness.\n`);
}

// ─── version helpers ─────────────────────────────────────────────────────────

/**
 * Read the skills version from the pace SKILL.md frontmatter.
 */
function getSkillsVersion(root) {
  for (const d of PROVIDER_DIRS) {
    const skillMd = join(root, d, 'skills', 'pace', 'SKILL.md');
    if (!existsSync(skillMd)) continue;
    const content = readFileSync(skillMd, 'utf-8');
    const match = content.match(/^version:\s*(.+)$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

// `downloadAndExtractBundle` (which hit /api/download/bundle/universal) was
// removed: pace.tools serves no such endpoint. `update` now reuses
// `npx skills add` instead, the same code path `install` uses, which reads
// directly from the GitHub repo's harness directories.

// ─── skills check ────────────────────────────────────────────────────────────

async function check() {
  const root = findProjectRoot();
  const installed = isAlreadyInstalled(root);

  if (!installed) {
    console.log('Pace is not installed in this project.');
    console.log('Run `npx pace skills install` to install.');
    process.exit(0);
  }

  const v = getSkillsVersion(root);
  console.log(`Installed${v ? ` (v${v})` : ''}.`);
  console.log('Run `npx pace skills update` to refresh from the GitHub source.');
}

// ─── skills install ───────────────────────────────────────────────────────────

// Check if pace skills are already present in any provider folder
function isAlreadyInstalled(root) {
  for (const d of PROVIDER_DIRS) {
    const skillsDir = join(root, d, 'skills');
    if (!existsSync(skillsDir)) continue;
    try {
      const entries = readdirSync(skillsDir);
      // Look for 'pace' skill (or prefixed variant, or legacy 'teach-pace')
      if (entries.some(e =>
        e === 'pace' || e.endsWith('-pace') ||
        e === 'teach-pace' || e.endsWith('-teach-pace')
      )) {
        return d;
      }
    } catch {}
  }
  return null;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function prefixSkillContent(content, prefix, allSkillNames) {
  // Prefix the name in frontmatter
  let result = content.replace(/^name:\s*(.+)$/m, (_, name) => `name: ${prefix}${name.trim()}`);

  // Prefix cross-references: /skillname -> /prefix-skillname
  const sorted = [...allSkillNames].sort((a, b) => b.length - a.length);
  for (const name of sorted) {
    // Command invocations: /skillname
    result = result.replace(
      new RegExp(`/(?=${escapeRegex(name)}(?:[^a-zA-Z0-9_-]|$))`, 'g'),
      `/${prefix}`
    );
    // Prose references: "the skillname skill"
    result = result.replace(
      new RegExp(`(the) ${escapeRegex(name)} skill`, 'gi'),
      (_, article) => `${article} ${prefix}${name} skill`
    );
  }
  return result;
}

function isSkillDir(skillsDir, name) {
  // Skill entries can be real directories or symlinks to directories (npx skills uses symlinks)
  const full = join(skillsDir, name);
  try {
    return statSync(full).isDirectory() && existsSync(join(full, 'SKILL.md'));
  } catch { return false; }
}

function isRealSkillDir(skillsDir, name) {
  // Only real directories, not symlinks -- renaming the real dir renames the symlink targets too
  const full = join(skillsDir, name);
  try {
    const lstat = lstatSync(full);
    return lstat.isDirectory() && !lstat.isSymbolicLink() && existsSync(join(full, 'SKILL.md'));
  } catch { return false; }
}

function renameSkillsWithPrefix(root, prefix) {
  // First pass: collect all skill names across all providers (use first provider found)
  let allSkillNames = [];
  for (const d of PROVIDER_DIRS) {
    const skillsDir = join(root, d, 'skills');
    if (!existsSync(skillsDir)) continue;
    const entries = readdirSync(skillsDir);
    allSkillNames = entries.filter(name => isSkillDir(skillsDir, name));
    if (allSkillNames.length > 0) break;
  }

  // Second pass: rename real dirs and update their content
  let count = 0;
  for (const d of PROVIDER_DIRS) {
    const skillsDir = join(root, d, 'skills');
    if (!existsSync(skillsDir)) continue;
    try {
      const entries = readdirSync(skillsDir);
      for (const name of entries) {
        if (name.startsWith(prefix)) continue;
        if (!isRealSkillDir(skillsDir, name)) continue;

        const src = join(skillsDir, name);
        const dest = join(skillsDir, prefix + name);

        renameSync(src, dest);

        // Prefix frontmatter name + all cross-references in SKILL.md
        let content = readFileSync(join(dest, 'SKILL.md'), 'utf8');
        content = prefixSkillContent(content, prefix, allSkillNames);
        writeFileSync(join(dest, 'SKILL.md'), content);
        count++;
      }
    } catch {}
  }

  // Third pass: fix symlinks that now point to renamed targets (npx skills uses these)
  for (const d of PROVIDER_DIRS) {
    const skillsDir = join(root, d, 'skills');
    if (!existsSync(skillsDir)) continue;
    try {
      const entries = readdirSync(skillsDir);
      for (const name of entries) {
        if (name.startsWith(prefix)) continue;
        const full = join(skillsDir, name);
        try {
          if (!lstatSync(full).isSymbolicLink()) continue;
          const target = readlinkSync(full);
          const newTarget = target.replace(new RegExp(`/${escapeRegex(name)}$`), `/${prefix}${name}`);
          unlinkSync(full);
          symlinkSync(newTarget, join(skillsDir, prefix + name));
        } catch {}
      }
    } catch {}
  }

  return count;
}

async function install(flags) {
  const force = flags.includes('--force');
  const yes = flags.includes('-y') || flags.includes('--yes');
  const prefixFlag = flags.find(f => f.startsWith('--prefix='));
  const root = findProjectRoot();
  const existing = isAlreadyInstalled(root);

  if (existing && !force) {
    console.log(`Pace skills are already installed (found in ${existing}/).`);
    console.log('Run with --force to reinstall.\n');
    process.exit(0);
  }

  console.log('Installing pace skills via npx skills...\n');
  try {
    // --copy forces npx skills to install each provider's variant separately
    // instead of symlinking .claude/skills/ to .agents/skills/. The two
    // directories have meaningfully different per-provider content (frontmatter,
    // command prefix, paths), and the default symlink also fails silently when
    // .claude/ doesn't exist yet or on Windows without elevated privileges (#140).
    execSync(`npx skills add GoldenBerry-SO/pace.tools --copy${yes ? ' -y' : ''}`, { stdio: 'inherit' });
  } catch (e) {
    process.exit(e.status ?? 1);
  }

  // Ask about prefixing (skip in CI mode unless --prefix= is set)
  let prefix = '';
  if (prefixFlag) {
    prefix = prefixFlag.split('=')[1] || 'i-';
  } else if (!yes) {
    console.log();
    const wantPrefix = await ask('Prefix commands to avoid conflicts? e.g. /i-audit instead of /audit (y/N) ');
    if (wantPrefix === 'y' || wantPrefix === 'yes') {
      const custom = await ask('Prefix (default: i-): ');
      prefix = custom || 'i-';
    }
  }

  if (prefix) {
    const count = renameSkillsWithPrefix(root, prefix);
    if (count > 0) {
      console.log(`\nRenamed ${count} skills with "${prefix}" prefix.`);
      console.log(`Commands are now available as /${prefix}<command> (e.g. /${prefix}audit).`);
    }
  }

  // Clean up deprecated skills from previous versions
  try {
    const { cleanup } = await import('../../../skill/scripts/cleanup-deprecated.mjs');
    const result = cleanup(root);
    const total = result.deletedPaths.length + result.removedLockEntries.length;
    if (total > 0) {
      console.log(`Cleaned up ${total} deprecated skill(s) from previous versions.`);
    }
  } catch {
    // Cleanup script not available -- skip
  }

  // Offer to also install impeccable for design skills. Pace defers to
  // impeccable for design work; bundling the install keeps the handoff
  // explicit instead of forcing the user to discover it later.
  const wantImpeccable = yes
    ? true
    : (await ask('\nAlso install impeccable (frontend design skills) alongside pace? (Y/n) ')) !== 'n';
  if (wantImpeccable) {
    console.log('\nInstalling impeccable via npx impeccable skills install...\n');
    try {
      execSync(`npx impeccable skills install${yes ? ' -y' : ''}`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`\nImpeccable install failed (${e.message}). You can retry with: npx impeccable skills install`);
    }
  } else {
    console.log('\nSkipped impeccable. Install later with: npx impeccable skills install');
  }

  console.log(`\nDone! Use /${prefix}pace <command> in your AI harness.\n`);
}

/** Detect prefix by looking for the 'pace' skill (or legacy 'teach-pace') */
function detectPrefix(root) {
  for (const d of PROVIDER_DIRS) {
    const skillsDir = join(root, d, 'skills');
    if (!existsSync(skillsDir)) continue;
    for (const name of readdirSync(skillsDir)) {
      if (name === 'pace') return '';
      if (name.endsWith('-pace') && name !== 'teach-pace') return name.slice(0, -'pace'.length);
      // Legacy fallback
      if (name === 'teach-pace') return '';
      if (name.endsWith('-teach-pace')) return name.slice(0, -'teach-pace'.length);
    }
  }
  return '';
}

/** Undo prefixing: rename folders back and strip prefix from SKILL.md content */
function undoPrefix(root, prefix) {
  if (!prefix) return;
  // Collect the unprefixed names (strip our prefix)
  let allPrefixedNames = [];
  for (const d of PROVIDER_DIRS) {
    const skillsDir = join(root, d, 'skills');
    if (!existsSync(skillsDir)) continue;
    allPrefixedNames = readdirSync(skillsDir).filter(n => n.startsWith(prefix) && isRealSkillDir(skillsDir, n));
    if (allPrefixedNames.length > 0) break;
  }
  const unprefixedNames = allPrefixedNames.map(n => n.slice(prefix.length));

  for (const d of PROVIDER_DIRS) {
    const skillsDir = join(root, d, 'skills');
    if (!existsSync(skillsDir)) continue;
    for (const name of readdirSync(skillsDir)) {
      if (!name.startsWith(prefix)) continue;
      const unprefixed = name.slice(prefix.length);
      const src = join(skillsDir, name);
      const dest = join(skillsDir, unprefixed);

      if (lstatSync(src).isSymbolicLink()) {
        const target = readlinkSync(src);
        const newTarget = target.replace(`/${name}`, `/${unprefixed}`);
        unlinkSync(src);
        symlinkSync(newTarget, dest);
      } else {
        renameSync(src, dest);
        // Strip prefix from SKILL.md content
        const skillMd = join(dest, 'SKILL.md');
        if (existsSync(skillMd)) {
          let content = readFileSync(skillMd, 'utf8');
          // Reverse the prefixing: replace prefixed names with unprefixed
          content = content.replace(new RegExp(`^name:\\s*${escapeRegex(prefix)}`, 'm'), 'name: ');
          const sorted = [...allPrefixedNames].sort((a, b) => b.length - a.length);
          for (const pName of sorted) {
            const uName = pName.slice(prefix.length);
            content = content.replace(new RegExp(`/${escapeRegex(pName)}(?=[^a-zA-Z0-9_-]|$)`, 'g'), `/${uName}`);
            content = content.replace(new RegExp(`(the) ${escapeRegex(pName)} skill`, 'gi'), `$1 ${uName} skill`);
          }
          writeFileSync(skillMd, content);
        }
      }
    }
  }
}

// ─── skills update ────────────────────────────────────────────────────────────

function findProjectRoot() {
  let dir = process.cwd();
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, '.git'))) return dir;
    dir = dirname(dir);
  }
  return process.cwd();
}

function findInstalledProviders(root) {
  const found = [];
  for (const d of PROVIDER_DIRS) {
    const skillsDir = join(root, d, 'skills');
    if (!existsSync(skillsDir)) continue;
    try {
      const entries = readdirSync(skillsDir);
      if (entries.some(name => isSkillDir(skillsDir, name))) found.push(d);
    } catch {}
  }
  return found;
}

function getModifiedSkillFiles(root, providerDirs) {
  // Use git to check if any skill files have local modifications
  const modified = [];
  try {
    const status = execSync('git status --porcelain', { cwd: root, encoding: 'utf8' });
    for (const line of status.split('\n')) {
      if (!line.trim()) continue;
      const file = line.substring(3);
      for (const d of providerDirs) {
        if (file.startsWith(`${d}/skills/`)) {
          const flag = line.substring(0, 2).trim();
          modified.push({ file, flag });
        }
      }
    }
  } catch {
    // Not a git repo or git not available
  }
  return modified;
}

async function update(flags = []) {
  const yes = flags.includes('-y') || flags.includes('--yes');
  const root = findProjectRoot();

  if (!isAlreadyInstalled(root)) {
    console.log('Pace is not installed in this project.');
    console.log('Run `npx pace skills install` to install first.');
    process.exit(1);
  }

  // Clean up deprecated skills from previous versions before pulling fresh ones.
  try {
    const { cleanup } = await import('../../../skill/scripts/cleanup-deprecated.mjs');
    const result = cleanup(root);
    const total = result.deletedPaths.length + result.removedLockEntries.length;
    if (total > 0) {
      console.log(`Cleaned up ${total} deprecated skill(s) from previous versions.\n`);
    }
  } catch {
    // Cleanup script not available (e.g. running from npm package) -- skip
  }

  // `npx skills add` reads the harness output dirs straight from the GitHub
  // repo, so we don't depend on pace.tools serving a bundle URL. Same code
  // path `install` uses; --copy forces per-provider files instead of
  // symlinks (matches the install behavior).
  console.log('Updating pace skills via npx skills...\n');
  try {
    execSync(`npx skills add GoldenBerry-SO/pace.tools --copy${yes ? ' -y' : ''}`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Update failed: ${e.message || ''}`);
    process.exit(e.status ?? 1);
  }

  // Re-apply prefix if the install used one (e.g. /i-pace).
  const prefix = detectPrefix(root);
  if (prefix) {
    const count = renameSkillsWithPrefix(root, prefix);
    if (count > 0) console.log(`Re-applied "${prefix}" prefix to ${count} skills.`);
  }

  // Final sweep to clear any deprecated stubs the fresh download brought.
  try {
    const { cleanup: postCleanup } = await import('../../../skill/scripts/cleanup-deprecated.mjs');
    postCleanup(root);
  } catch {
    // Not available -- skip
  }

  const v = getSkillsVersion(root);
  console.log(`\nDone${v ? ` (v${v})` : ''}.\n`);
}

function copyDirSync(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const s = join(src, entry.name);
    const d = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(s, d);
    } else {
      writeFileSync(d, readFileSync(s));
    }
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────

export async function run(args) {
  const sub = args[0];

  if (!sub || sub === 'help' || sub === '--help' || sub === '-h') {
    await showHelp();
  } else if (sub === 'install') {
    await install(args.slice(1));
  } else if (sub === 'update') {
    await update(args.slice(1));
  } else if (sub === 'check') {
    await check();
  } else {
    console.error(`Unknown skills command: ${sub}`);
    console.error(`Run 'pace skills --help' for available commands.`);
    process.exit(1);
  }
}
