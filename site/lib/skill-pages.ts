// ABOUTME: Enumerates engineering plugin skills + parses each SKILL.md into
// ABOUTME: structured fields for the /docs/skills/[skill] dynamic route.

import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

export interface SkillPage {
  slug: string;
  name: string;
  description: string;
  argumentHint: string | null;
  plugin: string;
  pluginDisplay: string;
  category: string;
  title: string;
  lead: string;
  bodyHtml: string;
  pairsWith: string[];
  sourcePath: string;
  sourceUrl: string;
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
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    fm[key] = value;
  }
  return { fm, body: match[2] };
}

function extractTitleAndLead(body: string): { title: string; lead: string; rest: string } {
  const lines = body.split('\n');
  let title = '';
  let leadLines: string[] = [];
  let restStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!title && line.startsWith('# ')) {
      title = line.replace(/^#\s+/, '');
      restStart = i + 1;
      continue;
    }
    if (title && !leadLines.length && line.startsWith('## ')) {
      // No lead paragraph between H1 and first H2
      restStart = i;
      break;
    }
    if (title && line && !line.startsWith('#') && !line.startsWith('---')) {
      leadLines.push(line);
      restStart = i + 1;
      continue;
    }
    if (title && !line && leadLines.length) {
      // blank line after lead — stop collecting lead
      restStart = i + 1;
      break;
    }
  }

  return {
    title,
    lead: leadLines.join(' '),
    rest: lines.slice(restStart).join('\n'),
  };
}

function extractPairsWith(body: string): string[] {
  // Look for a "## Pairs with" or "## Related" section and pull out skill refs.
  const match = body.match(/##\s+(Pairs with|Related|See also)[\s\S]*?(?=\n##\s|\n*$)/i);
  if (!match) return [];
  const section = match[0];
  const refs = new Set<string>();
  // Patterns: `/engineering:foo`, `/foo`, `<code>foo</code>`
  for (const m of section.matchAll(/`\/(?:engineering:)?([a-z0-9-]+)`/g)) {
    refs.add(m[1]);
  }
  return Array.from(refs);
}

// Categorize engineering skills into logical groups for the index page + sidebar.
const SKILL_CATEGORIES: Record<string, string> = {
  // Stacked-PR workflow
  spec: 'workflow',
  implement: 'workflow',
  review: 'workflow',
  topr: 'workflow',
  next: 'workflow',

  // Code quality + review
  'code-review': 'quality',
  'careful-review': 'quality',
  'codex-review': 'quality',
  'security-review': 'quality',
  'find-missing-tests': 'quality',

  // Testing
  tdd: 'testing',
  'testing-strategy': 'testing',
  'e2e-test': 'testing',

  // Disciplines (deep thinking)
  diagnose: 'discipline',
  prototype: 'discipline',
  'grill-me': 'discipline',
  'grill-with-docs': 'discipline',
  'zoom-out': 'discipline',
  'improve-codebase-architecture': 'discipline',

  // Planning + triage
  'to-prd': 'planning',
  'to-issues': 'planning',
  triage: 'planning',

  // Setup + tooling
  'setup-engineering-skills': 'setup',
  'setup-pre-commit': 'setup',
  'git-guardrails-claude-code': 'setup',
  'ship-pr': 'setup',

  // Original Pace engineering skills (Anthropic upstream)
  architecture: 'design',
  'system-design': 'design',
  debug: 'operations',
  'deploy-checklist': 'operations',
  'incident-response': 'operations',
  documentation: 'operations',
  standup: 'operations',
  'tech-debt': 'discipline',
};

export const SKILL_CATEGORY_ORDER = [
  'workflow',
  'quality',
  'testing',
  'design',
  'discipline',
  'planning',
  'operations',
  'setup',
] as const;

export const SKILL_CATEGORY_LABELS: Record<string, string> = {
  workflow: 'Stacked-PR workflow',
  quality: 'Code review & quality',
  testing: 'Testing',
  design: 'Architecture & design',
  discipline: 'Engineering disciplines',
  planning: 'Planning & triage',
  operations: 'Operations',
  setup: 'Setup & tooling',
};

export const SKILL_CATEGORY_BLURBS: Record<string, string> = {
  workflow: 'The stacked-PR workflow: spec a feature, implement it as a chain of small PRs, address review comments, rebase the next PR on top, repeat.',
  quality: 'Catch problems before they ship. Multiple review lenses (general, fresh-eyes, security, second-opinion) and a coverage-gap survey.',
  testing: 'Test-first development with real signal, plus end-to-end smoke testing of the deployed app.',
  design: 'Architectural decisions and system design at the start of a feature. Different from refactoring an existing codebase.',
  discipline: 'Habits for hard problems: disciplined diagnosis, throwaway prototypes, getting grilled on a plan, zooming out, finding deepening opportunities in the codebase.',
  planning: 'Turn conversations into PRDs, PRDs into issues, and route issues through a triage state machine.',
  operations: 'The day-to-day mechanics: debug, deploy checklist, incident response, standups, docs.',
  setup: 'One-time scaffolding for a repo: domain docs, pre-commit hooks, git guardrails, shipping flow.',
};

function loadSkillsFromPlugin(repoRoot: string, pluginSlug: string, pluginDisplay: string): SkillPage[] {
  const skillsDir = path.join(repoRoot, 'plugins', pluginSlug, 'skills');
  if (!fs.existsSync(skillsDir)) return [];
  const skills: SkillPage[] = [];
  for (const entry of fs.readdirSync(skillsDir).sort()) {
    const skillDir = path.join(skillsDir, entry);
    const skillMd = path.join(skillDir, 'SKILL.md');
    if (!fs.existsSync(skillMd)) continue;
    const raw = fs.readFileSync(skillMd, 'utf-8');
    const { fm, body } = parseFrontmatter(raw);
    const { title, lead, rest } = extractTitleAndLead(body);
    const slug = fm.name ?? entry;
    const description = fm.description ?? '';
    const argumentHint = fm['argument-hint'] ?? fm['argumentHint'] ?? null;
    const pairsWith = extractPairsWith(body);

    const sourcePath = `plugins/${pluginSlug}/skills/${entry}/SKILL.md`;
    const sourceDir = `plugins/${pluginSlug}/skills/${entry}`;
    const sourceUrl = `https://github.com/GoldenBerry-SO/Pace/blob/main/${sourcePath}`;
    const sourceDirUrl = `https://github.com/GoldenBerry-SO/Pace/blob/main/${sourceDir}`;

    // Rewrite relative .md links in the body to point at the GitHub source.
    // The SKILL.md often references supporting files in the same skill dir
    // (e.g. tdd/SKILL.md links to tests.md, mocking.md) which 404 if rendered
    // as-is on /docs/skills/<slug>.
    const rewrittenBody = (rest || body).replace(
      /\]\(([^)\s]+\.md)\)/g,
      (full, target: string) => {
        if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('/')) {
          return full;
        }
        return `](${sourceDirUrl}/${target})`;
      },
    );

    // Render the rest of the body (after title + lead) as HTML.
    let bodyHtml = '';
    try {
      bodyHtml = marked.parse(rewrittenBody, { async: false }) as string;
    } catch {
      bodyHtml = `<pre>${rewrittenBody}</pre>`;
    }

    skills.push({
      slug,
      name: slug,
      description,
      argumentHint,
      plugin: pluginSlug,
      pluginDisplay,
      category: SKILL_CATEGORIES[slug] ?? 'operations',
      title: title || slug,
      lead,
      bodyHtml,
      pairsWith,
      sourcePath,
      sourceUrl,
    });
  }
  return skills;
}

export function getAllSkillPages(repoRoot: string): SkillPage[] {
  // For v1 we only ship per-skill pages for the engineering plugin.
  // The route + lib generalizes: add more (pluginSlug, displayName) tuples here
  // to expand coverage to other plugins.
  return loadSkillsFromPlugin(repoRoot, 'engineering', 'Engineering');
}

export function getSkillsByCategory(repoRoot: string): Record<string, SkillPage[]> {
  const all = getAllSkillPages(repoRoot);
  const grouped: Record<string, SkillPage[]> = {};
  for (const cat of SKILL_CATEGORY_ORDER) grouped[cat] = [];
  for (const s of all) {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  }
  return grouped;
}
