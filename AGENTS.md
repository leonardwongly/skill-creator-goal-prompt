# Agent Instructions

This repo contains a small Node.js CLI that prints portable Markdown prompts for creating reusable agent capabilities across coding agents and IDEs.

## Working Rules

- Keep the package zero-dependency unless there is a strong reason to add a runtime dependency.
- Preserve GitHub-backed `npx` usage: `npx github:leonardwongly/skill-creator-goal-prompt`.
- Keep prompts model- and IDE-neutral by default.
- Add agent-specific behavior as explicit presets behind `--agent`.
- Avoid hardcoded user-specific absolute paths in default output.
- Keep generated prompt text safe to paste into chat-based tools.
- Do not add production side effects, credential access, telemetry, or network calls to the CLI.

## Validation

Run before handoff:

```bash
npm test
npm pack --dry-run
```

When changing CLI flags, also run at least one direct command for the affected preset, for example:

```bash
node bin/skill-creator-goal-prompt.js --agent kiro-cli --compact
```
