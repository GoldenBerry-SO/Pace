// ABOUTME: The rules that turn a Claude Code engineering skill into a GitHub Copilot one.
// ABOUTME: Pure functions over text; copilot/build.mjs applies them, copilot/test/transform.test.mjs pins them.

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/;

// Copilot skills carry a name and a description; the other Claude Code fields
// (argument-hint, disable-model-invocation, user-invokable, args) have no meaning there.
export function transformSkill(text, name) {
  const match = text.match(FRONTMATTER);
  if (!match) throw new Error(`${name}/SKILL.md has no frontmatter`);
  const description = match[1].split('\n').find((l) => l.startsWith('description:'))?.slice('description:'.length).trim();
  if (!description) throw new Error(`${name}/SKILL.md has no description`);
  const body = text.slice(match[0].length);
  return `---\nname: ${name}\ndescription: ${description}\n---\n${transformBody(body)}`;
}

// Order matters: the specific phrases go first, the single-word swaps last.
const RULES = [
  // Sub-agents: Copilot's agents may or may not offer them, so say so.
  ['the Agent tool with `subagent_type=Explore`', 'a sub-agent if your agent offers one, otherwise explore it yourself,'],
  ['Spawn 3+ sub-agents in parallel using the Agent tool.', 'Produce three or more proposals, in parallel sub-agents if your agent offers them, otherwise one after another.'],
  ["the Agent tool's `model` parameter: `haiku`, `sonnet`, `opus`, or `fable`", 'the model your tool lets you pick: small, standard, large, or largest'],
  ['the Agent tool', 'a sub-agent'],
  // Model tiers: keep the idea, drop the product names.
  [/(S|s)witch via `\/model` \/ `claude --model`/g, (_, s) => `${s === 'S' ? 'P' : 'p'}ick the model in your tool`],
  [/\bhaiku\b/g, 'small'],
  [/\bsonnet\b/g, 'standard'],
  [/\bopus\b/g, 'large'],
  [/\bfable\b/g, 'largest'],
  // Tools and placeholders that only exist in Claude Code.
  ['AskUserQuestion', 'a question in chat'],
  [/@\$1\b|\$ARGUMENTS\b|\$1\b/g, 'the argument passed with the command'],
  [/\/engineering:/g, '/'],
  // The connectors file sits beside the skills folder rather than two levels up.
  ['](../../CONNECTORS.md)', '](../CONNECTORS.md)'],
];

export function transformBody(text) {
  let out = text;
  for (const [from, to] of RULES) {
    out = typeof from === 'string' ? out.split(from).join(to) : out.replace(from, to);
  }
  return out;
}

// A prompt file is the slash command; it reads the skill and applies it to what the user typed.
export function promptFor(name, description) {
  return `---\ndescription: ${description}\nmode: agent\n---\n\nRead \`.github/skills/${name}/SKILL.md\` and follow it exactly. Apply it to what follows this line.\n`;
}
