# skill-creator-goal-prompt

Print portable goal prompts for creating reusable agent capabilities across coding agents and IDEs.

It works as plain Markdown for tools such as Codex, Kiro CLI, Claude Code, Cursor, Gemini CLI, Aider, Continue, and other chat-based coding agents. The default output is agent-neutral; use `--agent` for tool-specific wording.

Run from GitHub with:

```bash
npx github:leonardwongly/skill-creator-goal-prompt
```

Use a preset:

```bash
npx github:leonardwongly/skill-creator-goal-prompt --agent kiro-cli
npx github:leonardwongly/skill-creator-goal-prompt --agent codex
npx github:leonardwongly/skill-creator-goal-prompt --agent cursor
```

Print the compact version with:

```bash
npx github:leonardwongly/skill-creator-goal-prompt --compact
```

Fill in task details:

```bash
npx github:leonardwongly/skill-creator-goal-prompt \
  --agent kiro-cli \
  --task "create a repeatable API migration review workflow" \
  --example "Review this migration for backwards compatibility" \
  --example "Create a reusable checklist for API schema changes"
```

Use with Kiro CLI:

```bash
kiro-cli chat "$(npx github:leonardwongly/skill-creator-goal-prompt --agent kiro-cli --compact)"
```

Show usage:

```bash
npx github:leonardwongly/skill-creator-goal-prompt --help
```

List supported presets:

```bash
npx github:leonardwongly/skill-creator-goal-prompt --list-agents
```
