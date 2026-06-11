// ABOUTME: Generates /.well-known/agent-skills/index.json and /.well-known/api-catalog
// ABOUTME: by walking SKILL.md files, computing sha256 digests, and writing JSON output.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const publicDir = path.join(repoRoot, 'site/public');
const wellKnown = path.join(publicDir, '.well-known');

const SITE = 'https://pace.tools';
const GITHUB_RAW = 'https://raw.githubusercontent.com/GoldenBerry-SO/Pace/main';

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fm = {};
  const lines = m[1].split('\n');
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (/^\s/.test(line)) continue;
    const i = line.indexOf(':');
    if (i === -1) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (v === '>' || v === '|' || v === '>-' || v === '|-') {
      // YAML block scalar: collect indented continuation lines.
      const parts = [];
      while (idx + 1 < lines.length && /^\s+/.test(lines[idx + 1])) {
        parts.push(lines[++idx].trim());
      }
      const join = v.startsWith('>') ? ' ' : '\n';
      v = parts.join(join);
    } else if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    fm[k] = v;
  }
  return fm;
}

function normalizeName(raw) {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function collectSkills() {
  const entries = [];

  const paceSkill = path.join(repoRoot, 'skill/SKILL.md');
  if (fs.existsSync(paceSkill)) {
    entries.push({ file: paceSkill, rel: 'skill/SKILL.md', plugin: 'pace', slug: 'pace' });
  }

  function walkPlugins(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir).sort()) {
      const p = path.join(dir, name);
      if (!fs.statSync(p).isDirectory()) continue;
      const skillsDir = path.join(p, 'skills');
      if (fs.existsSync(skillsDir) && fs.statSync(skillsDir).isDirectory()) {
        const pluginId = prefix ? `${prefix}-${name}` : name;
        function walkSkills(dir, slugParts = []) {
          const file = path.join(dir, 'SKILL.md');
          if (fs.existsSync(file)) {
            entries.push({
              file,
              rel: path.relative(repoRoot, file).split(path.sep).join('/'),
              plugin: pluginId,
              slug: slugParts.join('-'),
            });
          }
          for (const child of fs.readdirSync(dir).sort()) {
            const cp = path.join(dir, child);
            if (fs.statSync(cp).isDirectory()) walkSkills(cp, [...slugParts, child]);
          }
        }
        for (const slug of fs.readdirSync(skillsDir).sort()) {
          const sp = path.join(skillsDir, slug);
          if (fs.statSync(sp).isDirectory()) walkSkills(sp, [slug]);
        }
      } else {
        // Container directory (e.g. plugins/partner-built/), recurse one level.
        walkPlugins(p, prefix ? `${prefix}-${name}` : name);
      }
    }
  }

  walkPlugins(path.join(repoRoot, 'plugins'));
  return entries;
}

const skills = [];
const seen = new Set();

for (const entry of collectSkills()) {
  const buf = fs.readFileSync(entry.file);
  const fm = parseFrontmatter(buf.toString('utf8'));
  const baseName = entry.plugin === 'pace' && entry.slug === 'pace'
    ? 'pace'
    : `${entry.plugin}-${entry.slug}`;
  let name = normalizeName(baseName);
  let i = 2;
  while (seen.has(name)) {
    name = normalizeName(`${baseName}-${i++}`);
  }
  seen.add(name);

  const description = (fm.description || '').slice(0, 1024);
  skills.push({
    name,
    type: 'skill-md',
    description,
    url: `${GITHUB_RAW}/${entry.rel}`,
    digest: `sha256:${sha256(buf)}`,
  });
}

const skillsIndex = {
  $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
  skills,
};

fs.mkdirSync(path.join(wellKnown, 'agent-skills'), { recursive: true });
fs.writeFileSync(
  path.join(wellKnown, 'agent-skills/index.json'),
  JSON.stringify(skillsIndex, null, 2) + '\n'
);
console.log(`✓ Wrote ${skills.length} skills to /.well-known/agent-skills/index.json`);

const apiCatalog = {
  linkset: [
    {
      anchor: `${SITE}/`,
      'service-doc': [
        { href: `${SITE}/docs`, type: 'text/html', title: 'Pace documentation' },
        { href: `${SITE}/docs/skills`, type: 'text/html', title: 'Skill catalog' },
        { href: `${SITE}/plugins`, type: 'text/html', title: 'Plugin catalog' },
      ],
      'service-desc': [
        {
          href: `${SITE}/.claude-plugin/marketplace.json`,
          type: 'application/json',
          title: 'Pace marketplace manifest',
        },
        {
          href: `${SITE}/.well-known/agent-skills/index.json`,
          type: 'application/json',
          title: 'Agent skills discovery index',
        },
      ],
    },
  ],
};

fs.writeFileSync(
  path.join(wellKnown, 'api-catalog'),
  JSON.stringify(apiCatalog, null, 2) + '\n'
);
console.log('✓ Wrote /.well-known/api-catalog');
