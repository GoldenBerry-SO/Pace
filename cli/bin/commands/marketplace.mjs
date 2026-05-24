// ABOUTME: All Pace CLI sub-commands. Marketplace-aware: wraps `claude plugin`
// ABOUTME: for install/uninstall, fetches catalog from pace.tools/api.

import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline';

const MARKETPLACE_ID = 'pace';
const REPO = 'GoldenBerry-SO/Pace';
const SITE = 'https://pace.tools';

function which(bin) {
  const r = spawnSync('command', ['-v', bin], { shell: true });
  return r.status === 0;
}

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((r) => rl.question(question, (ans) => { rl.close(); r(ans.trim().toLowerCase()); }));
}

function ensureClaude() {
  if (!which('claude')) {
    console.error(`Pace plugins install through Claude Code, but the \`claude\` CLI was not found on PATH.

Install it first:
  https://docs.claude.com/en/docs/claude-code/quickstart#install

Then re-run this command.`);
    process.exit(1);
  }
}

function runClaude(args, opts = {}) {
  const r = spawnSync('claude', args, { stdio: 'inherit', ...opts });
  return r.status ?? 1;
}

function captureClaude(args) {
  const r = spawnSync('claude', args, { encoding: 'utf8' });
  return { status: r.status ?? 1, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

async function isMarketplaceRegistered() {
  const r = captureClaude(['plugin', 'marketplace', 'list']);
  if (r.status !== 0) return false;
  return r.stdout.split('\n').some((l) => /\bpace\b/.test(l));
}

async function fetchCatalog() {
  try {
    const res = await fetch(`${SITE}/api/marketplace`);
    if (res.ok) return await res.json();
  } catch {
    // fall through
  }
  // Fallback: fetch the marketplace.json directly from the Pages deploy
  try {
    const res = await fetch(`${SITE}/.claude-plugin/marketplace.json`);
    if (res.ok) return await res.json();
  } catch {
    // fall through
  }
  // Last resort: fetch from GitHub raw
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${REPO}/main/.claude-plugin/marketplace.json`);
    if (res.ok) return await res.json();
  } catch {
    // fall through
  }
  return null;
}

// ─── list ────────────────────────────────────────────────────────────────

async function cmdList() {
  const mp = await fetchCatalog();
  if (!mp || !Array.isArray(mp.plugins)) {
    console.error('Could not load the Pace catalog. Check your network or visit https://pace.tools/plugins');
    process.exit(1);
  }
  const plugins = mp.plugins;
  console.log(`\n  Pace marketplace — ${plugins.length} plugins\n`);
  const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length));
  const w = Math.min(28, Math.max(...plugins.map((p) => (p.name || '').length)));
  for (const p of plugins) {
    const name = pad(p.name ?? '', w);
    const desc = (p.description ?? '').replace(/\s+/g, ' ').slice(0, 80);
    console.log(`  ${name}  ${desc}`);
  }
  console.log(`\n  Install one with:  npx pace-tools install <name>`);
  console.log(`  Browse the catalog:  https://pace.tools/plugins\n`);
}

// ─── marketplace ─────────────────────────────────────────────────────────

async function cmdMarketplace(args) {
  const verb = args[0] ?? 'add';
  ensureClaude();
  if (verb === 'add') {
    if (await isMarketplaceRegistered()) {
      console.log('Pace marketplace is already registered.');
      return;
    }
    console.log(`Adding Pace marketplace (clones github.com/${REPO}) ...`);
    const code = runClaude(['plugin', 'marketplace', 'add', REPO]);
    if (code !== 0) {
      console.error('Failed to register Pace marketplace. See output above.');
      process.exit(code);
    }
    return;
  }
  if (verb === 'remove') {
    runClaude(['plugin', 'marketplace', 'remove', MARKETPLACE_ID]);
    return;
  }
  console.error(`Unknown marketplace verb: ${verb}. Try: add | remove.`);
  process.exit(1);
}

// ─── install ─────────────────────────────────────────────────────────────

async function cmdInstall(args) {
  ensureClaude();

  // Make sure the marketplace is registered before installing anything.
  if (!(await isMarketplaceRegistered())) {
    console.log(`Pace marketplace is not registered yet. Registering...`);
    const code = runClaude(['plugin', 'marketplace', 'add', REPO]);
    if (code !== 0) {
      console.error('\nFailed to register the marketplace. Aborting install.');
      process.exit(code);
    }
    console.log('');
  }

  if (args.includes('--all')) {
    const mp = await fetchCatalog();
    if (!mp || !Array.isArray(mp.plugins)) {
      console.error('Could not load catalog to enumerate plugins.');
      process.exit(1);
    }
    const names = mp.plugins.map((p) => p.name).filter(Boolean);
    const a = await ask(`This will install all ${names.length} plugins. Continue? [y/N] `);
    if (a !== 'y' && a !== 'yes') {
      console.log('Cancelled.');
      return;
    }
    args = names;
  }

  const plugins = args.filter((a) => !a.startsWith('--'));
  if (plugins.length === 0) {
    console.error('Specify at least one plugin to install. Try: npx pace-tools list');
    process.exit(1);
  }

  let failed = 0;
  for (const name of plugins) {
    const ref = name.includes('@') ? name : `${name}@${MARKETPLACE_ID}`;
    console.log(`\nInstalling ${ref} ...`);
    const code = runClaude(['plugin', 'install', ref]);
    if (code !== 0) failed++;
  }

  if (failed > 0) {
    console.error(`\n${failed} install(s) failed. See output above.`);
    process.exit(1);
  }
  console.log(`\nDone. Open Claude Code and type / to see your new commands.`);
}

// ─── uninstall ───────────────────────────────────────────────────────────

async function cmdUninstall(args) {
  ensureClaude();
  if (args.length === 0) {
    console.error('Specify at least one plugin to uninstall.');
    process.exit(1);
  }
  for (const name of args) {
    runClaude(['plugin', 'uninstall', name]);
  }
}

// ─── status ──────────────────────────────────────────────────────────────

async function cmdStatus() {
  ensureClaude();
  console.log('Registered marketplaces:');
  runClaude(['plugin', 'marketplace', 'list']);
  console.log('\nInstalled plugins:');
  runClaude(['plugin', 'list']);
}

// ─── teams ───────────────────────────────────────────────────────────────

const TEAM_STARTER_SETS = {
  sales: ['sales', 'apollo', 'common-room', 'productivity'],
  marketing: ['marketing', 'brand-voice', 'productivity'],
  engineering: ['engineering', 'data'],
  data: ['data'],
  product: ['product-management', 'data'],
  design: ['design'],
  finance: ['finance'],
  legal: ['legal'],
  operations: ['operations', 'productivity'],
  people: ['human-resources', 'productivity'],
  'customer-support': ['customer-support', 'productivity'],
  productivity: ['productivity', 'enterprise-search'],
};

async function cmdTeams(args) {
  const team = args[0];
  if (team && TEAM_STARTER_SETS[team]) {
    const plugins = TEAM_STARTER_SETS[team];
    console.log(`\n${team} starter set: ${plugins.join(', ')}\n`);
    console.log(`Install all of them with:\n  npx pace-tools install ${plugins.join(' ')}\n`);
    return;
  }
  console.log('\nPer-role starter sets:\n');
  const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length));
  for (const [t, plugins] of Object.entries(TEAM_STARTER_SETS)) {
    console.log(`  ${pad(t, 18)}  ${plugins.join(', ')}`);
  }
  console.log(`\nInstall a set with:  npx pace-tools install <plugin> [<plugin> ...]`);
  console.log(`Full role guides:    https://pace.tools/docs/teams\n`);
}

// ─── open ────────────────────────────────────────────────────────────────

async function cmdOpen() {
  const url = SITE;
  const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  spawnSync(opener, [url], { stdio: 'inherit', shell: process.platform === 'win32' });
}

// ─── dispatch ────────────────────────────────────────────────────────────

export async function run(command, args) {
  switch (command) {
    case 'list':        return cmdList();
    case 'install':     return cmdInstall(args);
    case 'uninstall':   return cmdUninstall(args);
    case 'status':      return cmdStatus();
    case 'marketplace': return cmdMarketplace(args);
    case 'teams':       return cmdTeams(args);
    case 'open':        return cmdOpen();
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}
