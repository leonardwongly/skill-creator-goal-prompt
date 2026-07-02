#!/usr/bin/env node

const help = `Usage:
  npx github:leonardwongly/skill-creator-goal-prompt
  npx github:leonardwongly/skill-creator-goal-prompt --compact

Prints a reusable Codex goal prompt for the skill-creator skill.`;

const fullPrompt = `Use the skill-creator skill at /Users/leonardwongly/.codex/skills/.system/skill-creator/SKILL.md to create or update a Codex skill end-to-end.

Goal:
Create a concise, validated, auto-discoverable skill that helps Codex perform the following recurring task:

[TASK / DOMAIN / WORKFLOW DESCRIPTION]

Expected usage examples:
1. [Example user request that should trigger the skill]
2. [Example user request that should trigger the skill]
3. [Example user request that should trigger the skill]

Skill requirements:
- Skill name: [preferred-name-or-let-codex-propose]
- Skill location: \${CODEX_HOME:-$HOME/.codex}/skills unless I specify otherwise
- Include only resources that directly improve repeatable execution.
- Prefer a lean SKILL.md with progressive disclosure.
- Add scripts only when deterministic repeatability or reliability is useful.
- Add references only for domain/API/schema/workflow details that should not bloat SKILL.md.
- Add assets only when the skill needs reusable templates or files in outputs.
- Create or refresh agents/openai.yaml according to the skill-creator instructions.
- Do not create README, changelog, installation guide, or other auxiliary docs inside the skill.

Workflow:
1. Clarify only the minimum missing details needed to avoid building the wrong skill.
2. Derive concrete trigger examples and reusable resources.
3. Initialize the skill with init_skill.py if it does not already exist.
4. Implement SKILL.md and any scripts/references/assets.
5. Test any added scripts by running them.
6. Validate the skill with quick_validate.py.
7. Iterate until validation passes.
8. Forward-test with a subagent when the skill is complex enough to justify it, unless that would be slow, risky, or externally side-effecting; ask first in those cases.

Final handoff:
Report:
- Skill path
- Files created or changed
- Validation command and result
- Script test commands and results, if scripts were added
- Any assumptions
- Any remaining risks or follow-ups
`;

const compactPrompt = `Use the skill-creator skill at /Users/leonardwongly/.codex/skills/.system/skill-creator/SKILL.md.

Create or update a Codex skill for: [describe workflow].

Use these example trigger requests:
- [example 1]
- [example 2]
- [example 3]

Default location: \${CODEX_HOME:-$HOME/.codex}/skills.
Follow the skill-creator process: understand examples, plan reusable resources, initialize with init_skill.py if new, implement only necessary SKILL.md/scripts/references/assets, generate agents/openai.yaml, test scripts, run quick_validate.py, iterate until valid, and forward-test if warranted.

Keep the skill concise, use progressive disclosure, avoid auxiliary docs inside the skill, and provide a final handoff with path, changed files, validation results, assumptions, and remaining risks.
`;

const args = new Set(process.argv.slice(2));

if (args.has("--help") || args.has("-h")) {
  process.stdout.write(`${help}\n`);
} else if (args.has("--compact") || args.has("-c")) {
  process.stdout.write(`${compactPrompt}\n`);
} else {
  process.stdout.write(`${fullPrompt}\n`);
}
