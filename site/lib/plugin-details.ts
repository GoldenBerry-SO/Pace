// ABOUTME: Reads plugin manifests, skill files, and connector configs from
// ABOUTME: the plugins/ directory at build time. Used by /plugins/[slug].astro.

import fs from 'node:fs';
import path from 'node:path';

export interface PluginEntry {
  name: string;
  displayName?: string;
  description?: string;
  author?: { name?: string };
  source?: string | { source?: string; url?: string };
  category?: string;
}

export interface Skill {
  name: string;
  description: string;
  bodyPreview: string;
}

export interface ConnectorEntry {
  name: string;
  url?: string;
  type?: string;
}

export interface PluginDetail {
  slug: string;
  manifest: {
    name: string;
    version?: string;
    description?: string;
    author?: { name?: string; email?: string };
  };
  displayName: string;
  marketplaceDescription: string;
  marketplaceAuthor: string;
  pluginDir: string;
  skills: Skill[];
  connectors: ConnectorEntry[];
  readmeExcerpt: string | null;
  hasConnectorsDoc: boolean;
  isPartner: boolean;
}

function parseFrontmatter(content: string): { fm: Record<string, string>; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { fm: {}, body: content };
  const fm: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    fm[key] = value;
  }
  return { fm, body: match[2] };
}

export function readPluginDetail(
  slug: string,
  pluginPath: string,
  mp: PluginEntry | null,
  isPartner: boolean,
  repoRoot: string,
): PluginDetail | null {
  const manifestPath = path.join(pluginPath, '.claude-plugin', 'plugin.json');
  if (!fs.existsSync(manifestPath)) return null;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  // Read skills
  const skillsDir = path.join(pluginPath, 'skills');
  const skills: Skill[] = [];
  if (fs.existsSync(skillsDir)) {
    for (const entry of fs.readdirSync(skillsDir).sort()) {
      const skillMd = path.join(skillsDir, entry, 'SKILL.md');
      if (!fs.existsSync(skillMd)) continue;
      const raw = fs.readFileSync(skillMd, 'utf-8');
      const { fm, body } = parseFrontmatter(raw);
      const bodyPreview = body
        .split('\n')
        .filter((l) => l.trim() && !l.startsWith('#') && !l.startsWith('---'))
        .slice(0, 2)
        .join(' ')
        .slice(0, 200);
      skills.push({
        name: fm.name ?? entry,
        description: fm.description ?? '',
        bodyPreview,
      });
    }
  }

  // Read connectors
  const mcpPath = path.join(pluginPath, '.mcp.json');
  const connectors: ConnectorEntry[] = [];
  if (fs.existsSync(mcpPath)) {
    try {
      const mcp = JSON.parse(fs.readFileSync(mcpPath, 'utf-8'));
      const servers = mcp.mcpServers ?? {};
      for (const [name, cfg] of Object.entries(servers)) {
        connectors.push({
          name,
          url: (cfg as { url?: string }).url,
          type: (cfg as { type?: string }).type,
        });
      }
    } catch {
      // skip
    }
  }

  // Read README excerpt
  const readmePath = path.join(pluginPath, 'README.md');
  let readmeExcerpt: string | null = null;
  if (fs.existsSync(readmePath)) {
    const raw = fs.readFileSync(readmePath, 'utf-8');
    const lines = raw.split('\n');
    const firstParagraphLines: string[] = [];
    let inFirst = false;
    for (const line of lines) {
      if (line.startsWith('#')) {
        if (firstParagraphLines.length > 0) break;
        continue;
      }
      if (line.trim() === '') {
        if (firstParagraphLines.length > 0) break;
        continue;
      }
      firstParagraphLines.push(line);
      inFirst = true;
      if (inFirst && firstParagraphLines.join(' ').length > 320) break;
    }
    if (firstParagraphLines.length > 0) {
      readmeExcerpt = firstParagraphLines.join(' ').slice(0, 360);
    }
  }

  const hasConnectorsDoc = fs.existsSync(path.join(pluginPath, 'CONNECTORS.md'));

  return {
    slug,
    manifest,
    displayName: mp?.displayName ?? manifest.name,
    marketplaceDescription: mp?.description ?? manifest.description ?? '',
    marketplaceAuthor: mp?.author?.name ?? manifest.author?.name ?? 'Anthropic',
    pluginDir: path.relative(repoRoot, pluginPath),
    skills,
    connectors,
    readmeExcerpt,
    hasConnectorsDoc,
    isPartner,
  };
}

export function enumeratePlugins(
  repoRoot: string,
  marketplacePlugins: PluginEntry[],
): Array<{ slug: string; detail: PluginDetail }> {
  const pluginsDir = path.join(repoRoot, 'plugins');
  const results: Array<{ slug: string; detail: PluginDetail }> = [];

  if (!fs.existsSync(pluginsDir)) return results;

  // First-party at plugins/<name>/
  for (const entry of fs.readdirSync(pluginsDir)) {
    const full = path.join(pluginsDir, entry);
    if (!fs.statSync(full).isDirectory()) continue;
    if (entry === 'partner-built') continue;
    if (!fs.existsSync(path.join(full, '.claude-plugin', 'plugin.json'))) continue;
    const mp =
      marketplacePlugins.find(
        (p) => typeof p.source === 'string' && p.source === `./plugins/${entry}`,
      ) ?? null;
    const detail = readPluginDetail(entry, full, mp, false, repoRoot);
    if (detail) results.push({ slug: entry, detail });
  }

  // Partner-built at plugins/partner-built/<name>/
  const partnerDir = path.join(pluginsDir, 'partner-built');
  if (fs.existsSync(partnerDir)) {
    for (const entry of fs.readdirSync(partnerDir)) {
      const full = path.join(partnerDir, entry);
      if (!fs.statSync(full).isDirectory()) continue;
      if (!fs.existsSync(path.join(full, '.claude-plugin', 'plugin.json'))) continue;
      const mp =
        marketplacePlugins.find(
          (p) =>
            typeof p.source === 'string' && p.source === `./plugins/partner-built/${entry}`,
        ) ?? null;
      const detail = readPluginDetail(entry, full, mp, true, repoRoot);
      if (detail) results.push({ slug: entry, detail });
    }
  }

  return results;
}
