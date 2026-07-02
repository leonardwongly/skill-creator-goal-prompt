#!/usr/bin/env node

const VERSION = "1.1.0";

const AGENTS = {
  generic: {
    label: "Generic coding agent or IDE",
    outputName: "reusable agent capability",
    outputTypes:
      "skills, prompts, powers, rules, custom agents, workflow packs, or project instructions",
    location:
      "Use the target agent's normal reusable-instruction location. If none exists, create a portable Markdown prompt in the current repo.",
    notes: [
      "Keep the artifact plain Markdown unless the target agent requires frontmatter, JSON, or a named config file.",
      "Avoid hardcoding user-specific absolute paths unless the user explicitly requests them."
    ]
  },
  codex: {
    label: "Codex",
    outputName: "Codex skill",
    outputTypes: "Codex skills with SKILL.md plus optional scripts, references, assets, and agents/openai.yaml",
    location:
      "Default to ${CODEX_HOME:-$HOME/.codex}/skills. Use a repo-local folder only when the user requests project-scoped work.",
    notes: [
      "Use the skill-creator workflow if available, then initialize with init_skill.py for new skills.",
      "Validate with quick_validate.py before handoff."
    ]
  },
  "kiro-cli": {
    label: "Kiro CLI",
    outputName: "Kiro-compatible reusable prompt or agent capability",
    outputTypes:
      "plain Markdown prompts, steering instructions, custom agent instructions, or Kiro powers when the target environment supports them",
    location:
      "Prefer a plain Markdown prompt for maximum CLI and IDE portability. For Kiro CLI custom agents, use the user's Kiro agent configuration location when requested.",
    notes: [
      "Make the output usable as the positional input to kiro-cli chat or as a saved reusable Kiro prompt.",
      "Do not assume trusted tool permissions; ask before requiring broad tool access."
    ]
  },
  cursor: {
    label: "Cursor",
    outputName: "Cursor-compatible rule or prompt",
    outputTypes: "project rules, reusable prompts, or agent instructions",
    location:
      "Prefer project-local rules/instructions when the workflow is repo-specific, otherwise emit portable Markdown.",
    notes: [
      "Keep repo conventions and validation commands explicit so Cursor can apply them in context."
    ]
  },
  "claude-code": {
    label: "Claude Code",
    outputName: "Claude Code-compatible instruction prompt",
    outputTypes: "Markdown instructions, command prompts, or repo guidance",
    location:
      "Prefer portable Markdown unless the user asks for a Claude-specific project instruction file.",
    notes: [
      "Include exact commands and validation gates; avoid assuming hidden local context."
    ]
  },
  "gemini-cli": {
    label: "Gemini CLI",
    outputName: "Gemini CLI-compatible instruction prompt",
    outputTypes: "Markdown prompts or project instructions",
    location:
      "Prefer portable Markdown unless the user asks for a Gemini-specific instruction file.",
    notes: [
      "Make file paths and shell commands explicit, and keep the prompt independent of agent-specific memory."
    ]
  },
  aider: {
    label: "Aider",
    outputName: "Aider-compatible instruction prompt",
    outputTypes: "Markdown prompts, repo conventions, or task instructions",
    location:
      "Prefer portable Markdown that can be pasted into chat or saved with project notes.",
    notes: [
      "Specify expected files to edit and validation commands so changes stay scoped."
    ]
  },
  continue: {
    label: "Continue",
    outputName: "Continue-compatible assistant prompt",
    outputTypes: "Markdown prompts or custom assistant instructions",
    location:
      "Prefer portable Markdown unless the user asks for a Continue-specific assistant configuration.",
    notes: [
      "Keep the artifact model-agnostic and explicit about repo context gathering."
    ]
  }
};

const aliases = new Map([
  ["kiro", "kiro-cli"],
  ["kirocli", "kiro-cli"],
  ["claude", "claude-code"],
  ["claude_code", "claude-code"],
  ["gemini", "gemini-cli"]
]);

function parseArgs(argv) {
  const options = {
    agent: "generic",
    compact: false,
    examples: []
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const [flag, inlineValue] = arg.split("=", 2);
    const nextValue = () => {
      if (inlineValue !== undefined) return inlineValue;
      index += 1;
      if (index >= argv.length) {
        throw new Error(`${flag} requires a value`);
      }
      return argv[index];
    };

    switch (flag) {
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--version":
      case "-v":
        options.version = true;
        break;
      case "--compact":
      case "-c":
        options.compact = true;
        break;
      case "--list-agents":
        options.listAgents = true;
        break;
      case "--agent":
      case "-a":
        options.agent = normalizeAgent(nextValue());
        break;
      case "--task":
      case "-t":
        options.task = nextValue();
        break;
      case "--skill-name":
      case "--name":
      case "-n":
        options.skillName = nextValue();
        break;
      case "--skill-path":
      case "--path":
      case "-p":
        options.skillPath = nextValue();
        break;
      case "--example":
      case "-e":
        options.examples.push(nextValue());
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!AGENTS[options.agent]) {
    throw new Error(`Unsupported agent: ${options.agent}`);
  }

  return options;
}

function normalizeAgent(value) {
  const key = value.trim().toLowerCase();
  return aliases.get(key) || key;
}

function helpText() {
  return `Usage:
  npx github:leonardwongly/skill-creator-goal-prompt [options]

Options:
  -a, --agent <name>       Agent preset: ${Object.keys(AGENTS).join(", ")}
  -c, --compact            Print a shorter prompt
  -t, --task <text>        Fill in the target workflow or domain
  -n, --skill-name <name>  Fill in the preferred artifact name
  -p, --skill-path <path>  Fill in an existing source skill/instruction path
  -e, --example <text>     Add a trigger example; repeat for multiple examples
      --list-agents        List supported agent presets
  -v, --version            Print version
  -h, --help               Show this help

Examples:
  npx github:leonardwongly/skill-creator-goal-prompt
  npx github:leonardwongly/skill-creator-goal-prompt --agent kiro-cli --compact
  npx github:leonardwongly/skill-creator-goal-prompt --agent codex --task "create a PDF workflow"

Kiro CLI:
  kiro-cli chat "$(npx github:leonardwongly/skill-creator-goal-prompt --agent kiro-cli --compact)"`;
}

function listAgents() {
  return Object.entries(AGENTS)
    .map(([name, preset]) => `${name}\t${preset.label}`)
    .join("\n");
}

function exampleLines(options) {
  const examples = options.examples.length
    ? options.examples
    : [
        "[Example user request that should trigger this capability]",
        "[Second realistic trigger request]",
        "[Third realistic trigger request]"
      ];

  return examples.map((example, index) => `${index + 1}. ${example}`).join("\n");
}

function compactExamples(options) {
  const examples = options.examples.length
    ? options.examples
    : ["[example 1]", "[example 2]", "[example 3]"];

  return examples.map((example) => `- ${example}`).join("\n");
}

function buildPrompt(options) {
  const preset = AGENTS[options.agent];
  const task = options.task || "[TASK / DOMAIN / WORKFLOW DESCRIPTION]";
  const name = options.skillName || "[preferred-name-or-let-the-agent-propose]";
  const sourceInstruction = options.skillPath
    ? `Start from the existing source instructions at ${options.skillPath}.`
    : "If a source skill, rule, prompt, or instruction file is provided in context, read it before changing behavior. Otherwise derive the reusable workflow from the examples below.";

  if (options.compact) {
    return `Create or update a ${preset.outputName} for: ${task}

Target agent or IDE: ${preset.label}
Preferred artifact name: ${name}
Source instructions: ${sourceInstruction}

Trigger examples:
${compactExamples(options)}

Make the result portable across coding agents where possible. Use the target agent's native format only when it adds real value or is required. Keep the main instructions concise, split large details into references, add scripts only for deterministic repeatability, and avoid auxiliary docs unless the target ecosystem requires them.

Validate before handoff: run syntax/config checks, execute any added scripts, and test the generated artifact with at least one realistic prompt when practical.

Final handoff: report artifact path, changed files, validation commands and results, assumptions, and remaining risks.`;
  }

  return `Create or update a ${preset.outputName} end-to-end.

Target agent or IDE:
${preset.label}

Goal:
Create a concise, validated, reusable agent capability that helps an AI coding agent perform this recurring task:

${task}

Preferred artifact name:
${name}

Source instructions:
${sourceInstruction}

Expected usage examples:
${exampleLines(options)}

Target output:
- Supported artifact types: ${preset.outputTypes}.
- Location guidance: ${preset.location}
- Prefer portable Markdown unless the target agent requires a stricter format.
- Avoid user-specific absolute paths, secrets, machine-local assumptions, and production side effects.

Quality requirements:
- Include only instructions and resources that directly improve repeatable execution.
- Keep the main instruction file lean and use progressive disclosure for detailed references.
- Add scripts only when deterministic repeatability, validation, or reliability is useful.
- Add references only for domain, API, schema, or workflow details that should not bloat the main prompt.
- Add assets only when reusable templates or files are needed in outputs.
- Do not create README, changelog, installation guide, or other auxiliary docs inside the generated capability unless the target agent ecosystem requires them.

Workflow:
1. Clarify only the minimum missing details needed to avoid building the wrong artifact.
2. Derive concrete trigger examples and reusable resources.
3. Inspect the target repo or workspace conventions before choosing file formats or locations.
4. Implement the smallest useful capability in the target agent's native format, or in portable Markdown when native format is unnecessary.
5. Test any added scripts by running them.
6. Validate syntax, schema, frontmatter, JSON, executable permissions, and naming rules where applicable.
7. Run at least one realistic usage check when practical.
8. Iterate until validation passes.

Agent-specific notes:
${preset.notes.map((note) => `- ${note}`).join("\n")}

Final handoff:
Report:
- Artifact path
- Files created or changed
- Validation command and result
- Script test commands and results, if scripts were added
- Usage command or paste target for ${preset.label}
- Any assumptions
- Any remaining risks or follow-ups
`;
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));

    if (options.help) {
      process.stdout.write(`${helpText()}\n`);
      return;
    }

    if (options.version) {
      process.stdout.write(`${VERSION}\n`);
      return;
    }

    if (options.listAgents) {
      process.stdout.write(`${listAgents()}\n`);
      return;
    }

    process.stdout.write(`${buildPrompt(options)}\n`);
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n\n${helpText()}\n`);
    process.exitCode = 1;
  }
}

main();
