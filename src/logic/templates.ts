/** Built-in starter profiles — Terraform-for-agent-context defaults */

export const DEFAULT_AGENTS_MD = `# AGENTS.md

> Managed by **agentsync** — do not edit by hand in leaf repos.
> Source of truth: agentsync.config.json

## Project

- **Name:** {{project_name}}
- **Org:** {{org}}
- **Stack:** {{stack}}

## Agent instructions

{{agent_instructions}}

## Commands

\`\`\`bash
{{dev_commands}}
\`\`\`

## Boundaries

- Prefer changes under \`{{code_root}}\`
- Do not commit secrets
- Run tests before claiming done: \`{{test_command}}\`
`;

export const DEFAULT_CLAUDE_MD = `# CLAUDE.md

> Managed by **agentsync**. Mirror of shared agent context for Claude Code.

{{agent_instructions}}

## Repo map

Primary code: \`{{code_root}}\`

## Verification

{{test_command}}
`;

export const DEFAULT_MCP_JSON = `{
  "mcpServers": {
    "{{mcp_server_name}}": {
      "command": "{{mcp_command}}",
      "args": {{mcp_args_json}}
    }
  }
}
`;

export const DEFAULT_SKILLS_README = `# Skills ({{org}})

Managed by agentsync for **{{project_name}}**.

Place project-specific skills here. Shared skills are synced from the monorepo
source of truth when you run \`agentsync generate\`.

## Active stack

{{stack}}
`;

export function defaultConfig(): import("./types.js").AgentsyncConfig {
  return {
    version: 1,
    vars: {
      org: "acme",
      project_name: "my-app",
      stack: "typescript",
      code_root: "src/",
      test_command: "pnpm test",
      dev_commands: "pnpm install\\npnpm dev",
      agent_instructions:
        "You are a careful senior engineer. Prefer small diffs, match existing style, and explain tradeoffs briefly.",
      mcp_server_name: "filesystem",
      mcp_command: "npx",
      mcp_args_json: '["-y", "@modelcontextprotocol/server-filesystem", "."]',
    },
    profiles: {
      default: {
        description: "Standard TS app agent context",
        files: {
          "AGENTS.md": DEFAULT_AGENTS_MD,
          "CLAUDE.md": DEFAULT_CLAUDE_MD,
          ".mcp.json": DEFAULT_MCP_JSON,
          ".agents/README.md": DEFAULT_SKILLS_README,
        },
      },
      minimal: {
        description: "AGENTS.md only",
        files: {
          "AGENTS.md": DEFAULT_AGENTS_MD,
        },
      },
    },
    targets: [
      {
        path: ".",
        profile: "default",
      },
    ],
  };
}
