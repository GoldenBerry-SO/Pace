// ABOUTME: Unit tests for the rules that turn a Claude Code engineering skill into a GitHub Copilot one.
// ABOUTME: Each rule from copilot/README.md has a case here; a skill with nothing to change passes through.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transformSkill, transformBody, promptFor } from '../transform.mjs';

const skill = (front, body) => `---\n${front}\n---\n\n${body}\n`;

test('frontmatter keeps only name and description', () => {
  const out = transformSkill(skill('name: tdd\ndescription: Test first.\nargument-hint: "<file>"\ndisable-model-invocation: true\nuser-invokable: true\nargs: x', 'Body.'), 'tdd');
  assert.equal(out, '---\nname: tdd\ndescription: Test first.\n---\n\nBody.\n');
});

test('a skill with only name and description passes through unchanged', () => {
  const src = skill('name: grill-me\ndescription: Interview me.', 'Ask one question at a time.');
  assert.equal(transformSkill(src, 'grill-me'), src);
});

test('plugin-namespaced commands lose the engineering prefix', () => {
  assert.equal(transformBody('run `/engineering:setup-engineering-skills` first'), 'run `/setup-engineering-skills` first');
});

test('the Agent tool becomes a sub-agent if available', () => {
  assert.equal(
    transformBody('Then use the Agent tool with `subagent_type=Explore` to walk the codebase.'),
    'Then use a sub-agent if your agent offers one, otherwise explore it yourself, to walk the codebase.',
  );
  assert.equal(
    transformBody('Spawn 3+ sub-agents in parallel using the Agent tool. Each must produce'),
    'Produce three or more proposals, in parallel sub-agents if your agent offers them, otherwise one after another. Each must produce',
  );
  assert.equal(transformBody("(the Agent tool's `model` parameter: `haiku`, `sonnet`, `opus`, or `fable`)"), '(the model your tool lets you pick: small, standard, large, or largest)');
});

test('model tiers lose their product names but keep the idea', () => {
  const src = '- **haiku** — mechanical work\n- **sonnet** — standard work\n- **opus** — complex slices\n- **fable** — the hardest slices\n`<haiku | sonnet | opus | fable>` — reason. Switch via `/model` / `claude --model` before starting.';
  const out = transformBody(src);
  assert.equal(out, '- **small** — mechanical work\n- **standard** — standard work\n- **large** — complex slices\n- **largest** — the hardest slices\n`<small | standard | large | largest>` — reason. Pick the model in your tool before starting.');
  for (const name of ['haiku', 'sonnet', 'opus', 'fable', 'claude --model']) assert.ok(!out.includes(name), name);
});

test('the question tool becomes asking in chat', () => {
  assert.equal(transformBody('Use AskUserQuestion to confirm.'), 'Use a question in chat to confirm.');
});

test('argument placeholders become plain words', () => {
  assert.equal(transformBody('Review the provided code changes: @$1'), 'Review the provided code changes: the argument passed with the command');
  assert.equal(transformBody('Start from $ARGUMENTS.'), 'Start from the argument passed with the command.');
});

test('the connectors link points beside the skills folder', () => {
  assert.equal(transformBody('see [CONNECTORS.md](../../CONNECTORS.md).'), 'see [CONNECTORS.md](../CONNECTORS.md).');
});

test('connector placeholders and everything else pass through', () => {
  const src = 'Post to ~~chat and open a ~~source control PR.';
  assert.equal(transformBody(src), src);
});

test('a prompt file delegates to its skill', () => {
  const out = promptFor('grill-me', 'Interview me relentlessly.');
  assert.match(out, /^---\ndescription: Interview me relentlessly\.\nmode: agent\n---\n/);
  assert.match(out, /`\.github\/skills\/grill-me\/SKILL\.md`/);
});
